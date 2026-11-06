import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Card, Lesson, Section } from '@/data/content';
import { addDays, currentStreak, dayKey } from '@/lib/dates';
import { loadJSON, saveJSON, StorageKeys } from '@/lib/storage';

import { evaluateAchievements } from './achievements';
import { useContent } from './content';
import { useSettings, type AutoReview } from './settings';

/**
 * Kullanıcı ilerlemesi — yalnızca cihazda saklanır.
 *
 * Kart durumları:
 *  - (kayıt yok)  yeni kart
 *  - review       "Tekrar et" denildi → tekrar destesinde
 *  - known        "Biliyorum" denildi. Otomatik tekrar açıksa dueAt gününde tekrar karşısına çıkar
 *  - mastered     otomatik tekrarda da "Biliyorum" denildi → kalıcı ezber, bir daha otomatik gelmez
 */
export type CardStatus = 'review' | 'known' | 'mastered';

export type CardProgress = {
  status: CardStatus;
  /** Toplam kaç kez kaydırıldı */
  seen: number;
  lastSeen: string;
  /** Otomatik tekrar günü (dayKey) */
  dueAt?: string;
};

export type DayLog = { swipes: number; known: number; review: number };

/** Başarımlar için kaydırma anında tutulan ek bilgiler */
export type SwipeStats = {
  /** Tekrar destesinden / otomatik tekrardan yapılan kaydırma sayısı */
  reviewSwipes: number;
  nightSwipe: boolean;
  earlySwipe: boolean;
};

export type ProgressData = {
  cards: Record<string, CardProgress>;
  days: Record<string, DayLog>;
  stats: SwipeStats;
  /** Açılan başarımlar: id → açılma zamanı */
  achievements: Record<string, string>;
};

/** Geri alma için kaydırma öncesi durum */
export type SwipeUndo = { cardId: string; prev?: CardProgress; day: string; dir: 'left' | 'right' };

type ProgressContextValue = ProgressData & {
  swipe: (cardId: string, dir: 'left' | 'right', autoReview: AutoReview) => SwipeUndo;
  undo: (u: SwipeUndo) => void;
  /** Ezberlenmiş kartı elle tekrar destesine geri gönderir */
  requeue: (cardId: string) => void;
  reset: () => void;
  /** Yeni açılan, henüz kutlanmamış başarımlar */
  unlockQueue: string[];
  dismissUnlock: () => void;
};

const empty: ProgressData = {
  cards: {},
  days: {},
  stats: { reviewSwipes: 0, nightSwipe: false, earlySwipe: false },
  achievements: {},
};
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [unlockQueue, setUnlockQueue] = useState<string[]>([]);
  const { dailyGoal } = useSettings();
  const { lessons } = useContent();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Geri alma bilgisini anında hesaplayabilmek için verinin güncel kopyası
  const dataRef = useRef<ProgressData>(empty);
  if (data) dataRef.current = data;

  useEffect(() => {
    loadJSON(StorageKeys.progress, empty).then(setData);
  }, []);

  // Her değişiklikten sonra yeni kazanılan başarımları kontrol et
  useEffect(() => {
    if (!data) return;
    const earned = evaluateAchievements(data, dailyGoal, lessons).filter((id) => !data.achievements[id]);
    if (earned.length === 0) return;
    const now = new Date().toISOString();
    setData((d) => {
      if (!d) return d;
      const achievements = { ...d.achievements };
      for (const id of earned) achievements[id] = achievements[id] ?? now;
      return { ...d, achievements };
    });
    setUnlockQueue((q) => [...q, ...earned.filter((id) => !q.includes(id))]);
  }, [data, dailyGoal, lessons]);

  // Değişiklikleri kısa bir gecikmeyle diske yaz
  useEffect(() => {
    if (!data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJSON(StorageKeys.progress, data), 300);
  }, [data]);

  // Uygulama arka plana geçerken bekleyen kaydı hemen yaz (kapanırsa kaybolmasın)
  const latest = useRef(data);
  latest.current = data;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && latest.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveJSON(StorageKeys.progress, latest.current);
      }
    });
    return () => sub.remove();
  }, []);

  const swipe = useCallback((cardId: string, dir: 'left' | 'right', autoReview: AutoReview): SwipeUndo => {
    const today = dayKey();
    const undo: SwipeUndo = { cardId, prev: dataRef.current.cards[cardId], day: today, dir };
    setData((d) => {
      const cur = d ?? empty;
      const prev = cur.cards[cardId];

      let next: CardProgress;
      if (dir === 'left') {
        next = { status: 'review', seen: (prev?.seen ?? 0) + 1, lastSeen: new Date().toISOString() };
      } else {
        const wasDueReview = prev?.status === 'known' && !!prev.dueAt && prev.dueAt <= today;
        const status: CardStatus = wasDueReview || prev?.status === 'mastered' ? 'mastered' : 'known';
        next = {
          status,
          seen: (prev?.seen ?? 0) + 1,
          lastSeen: new Date().toISOString(),
          dueAt: status === 'known' && autoReview !== 'off' ? addDays(today, Number(autoReview)) : undefined,
        };
      }

      const log = cur.days[today] ?? { swipes: 0, known: 0, review: 0 };
      const hour = new Date().getHours();
      const fromReview = prev?.status === 'review' || (prev?.status === 'known' && !!prev.dueAt && prev.dueAt <= today);
      return {
        ...cur,
        stats: {
          reviewSwipes: cur.stats.reviewSwipes + (fromReview ? 1 : 0),
          nightSwipe: cur.stats.nightSwipe || hour >= 23 || hour < 4,
          earlySwipe: cur.stats.earlySwipe || (hour >= 4 && hour < 7),
        },
        cards: { ...cur.cards, [cardId]: next },
        days: {
          ...cur.days,
          [today]: {
            swipes: log.swipes + 1,
            known: log.known + (dir === 'right' ? 1 : 0),
            review: log.review + (dir === 'left' ? 1 : 0),
          },
        },
      };
    });
    return undo;
  }, []);

  const undo = useCallback((u: SwipeUndo) => {
    setData((d) => {
      const cur = d ?? empty;
      const cards = { ...cur.cards };
      if (u.prev) cards[u.cardId] = u.prev;
      else delete cards[u.cardId];
      const log = cur.days[u.day];
      const days = log
        ? {
            ...cur.days,
            [u.day]: {
              swipes: Math.max(0, log.swipes - 1),
              known: Math.max(0, log.known - (u.dir === 'right' ? 1 : 0)),
              review: Math.max(0, log.review - (u.dir === 'left' ? 1 : 0)),
            },
          }
        : cur.days;
      return { ...cur, cards, days };
    });
  }, []);

  const requeue = useCallback((cardId: string) => {
    setData((d) => {
      const cur = d ?? empty;
      const prev = cur.cards[cardId];
      return {
        ...cur,
        cards: {
          ...cur.cards,
          [cardId]: { status: 'review', seen: prev?.seen ?? 0, lastSeen: prev?.lastSeen ?? new Date().toISOString() },
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    setData(empty);
    setUnlockQueue([]);
  }, []);

  const dismissUnlock = useCallback(() => setUnlockQueue((q) => q.slice(1)), []);

  const value = useMemo(
    () => (data ? { ...data, swipe, undo, requeue, reset, unlockQueue, dismissUnlock } : null),
    [data, swipe, undo, requeue, reset, unlockQueue, dismissUnlock],
  );

  // Veriler yüklenene kadar hiçbir şey çizme (açılış ekranı görünür kalır)
  if (!value) return null;
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress, ProgressProvider içinde kullanılmalı');
  return ctx;
}

// ——— Hesaplamalar ———

export function isLearned(p?: CardProgress) {
  return p?.status === 'known' || p?.status === 'mastered';
}

export function sectionStats(section: Section, cards: Record<string, CardProgress>) {
  let fresh = 0;
  let review = 0;
  let known = 0;
  for (const c of section.cards) {
    const p = cards[c.id];
    if (!p) fresh++;
    else if (p.status === 'review') review++;
    else known++;
  }
  return { fresh, review, known, total: section.cards.length };
}

export function lessonKnown(lesson: Lesson, cards: Record<string, CardProgress>) {
  return lesson.sections.reduce((sum, s) => sum + s.cards.filter((c) => isLearned(cards[c.id])).length, 0);
}

export type StudyFilter = 'all' | 'review' | 'new' | 'unlearned' | 'due';

/** Çalışma ekranına gidecek kartları seçer */
export function filterCards(list: Card[], filter: StudyFilter, cards: Record<string, CardProgress>, today = dayKey()) {
  switch (filter) {
    case 'review':
      return list.filter((c) => cards[c.id]?.status === 'review');
    case 'new':
      return list.filter((c) => !cards[c.id]);
    case 'unlearned':
      return list.filter((c) => !isLearned(cards[c.id]));
    case 'due':
      return list.filter((c) => isDue(cards[c.id], today));
    default:
      return list;
  }
}

export function isDue(p: CardProgress | undefined, today = dayKey()) {
  return p?.status === 'known' && !!p.dueAt && p.dueAt <= today;
}

export function useDerivedStats() {
  const { cards, days } = useProgress();
  return useMemo(() => {
    const today = dayKey();
    const active = new Set(Object.keys(days).filter((k) => days[k].swipes > 0));
    const values = Object.values(cards);
    return {
      today,
      todayCount: days[today]?.swipes ?? 0,
      streak: currentStreak(active, today),
      knownTotal: values.filter(isLearned).length,
      masteredTotal: values.filter((p) => p.status === 'mastered').length,
      reviewTotal: values.filter((p) => p.status === 'review').length,
    };
  }, [cards, days]);
}
