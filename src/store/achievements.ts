import { lessons } from '@/data/content';
import { longestStreak } from '@/lib/dates';

import type { ProgressData } from './progress';

/**
 * Başarımların açılma koşulları. Tanımlar (başlık, emoji) src/data/achievements.ts içinde.
 * Kazanılan başarım geri alınmaz (geri alma / tekrar destesine gönderme rozeti silmez).
 */
export function evaluateAchievements(data: ProgressData, dailyGoal: number): string[] {
  const active = new Set(Object.keys(data.days).filter((k) => data.days[k].swipes > 0));
  const totalSwipes = Object.values(data.days).reduce((s, d) => s + d.swipes, 0);
  const learned = (id: string) => {
    const st = data.cards[id]?.status;
    return st === 'known' || st === 'mastered';
  };
  const knownTotal = Object.keys(data.cards).filter(learned).length;
  const best = longestStreak(active);
  const allSections = lessons.flatMap((l) => l.sections);

  const checks: Record<string, boolean> = {
    'first-card': totalSwipes >= 1,
    'streak-3': best >= 3,
    'streak-5': best >= 5,
    'streak-7': best >= 7,
    'streak-30': best >= 30,
    'known-50': knownTotal >= 50,
    'known-100': knownTotal >= 100,
    'known-250': knownTotal >= 250,
    'daily-goal': Object.values(data.days).some((d) => d.swipes >= dailyGoal),
    'section-done': allSections.some((s) => s.cards.length > 0 && s.cards.every((c) => learned(c.id))),
    'lesson-done': lessons.some(
      (l) => l.sections.length > 0 && l.sections.every((s) => s.cards.every((c) => learned(c.id))),
    ),
    'night-owl': data.stats.nightSwipe,
    'early-bird': data.stats.earlySwipe,
    'review-master': data.stats.reviewSwipes >= 50,
  };

  return Object.keys(checks).filter((id) => checks[id]);
}

/** Kilitli başarımlar için ilerleme: id → [şu an, hedef] */
export function achievementProgress(data: ProgressData, dailyGoal: number): Record<string, [number, number]> {
  const active = new Set(Object.keys(data.days).filter((k) => data.days[k].swipes > 0));
  const best = longestStreak(active);
  const knownTotal = Object.values(data.cards).filter((c) => c.status === 'known' || c.status === 'mastered').length;
  const bestDay = Math.max(0, ...Object.values(data.days).map((d) => d.swipes));
  return {
    'streak-3': [best, 3],
    'streak-5': [best, 5],
    'streak-7': [best, 7],
    'streak-30': [best, 30],
    'known-50': [knownTotal, 50],
    'known-100': [knownTotal, 100],
    'known-250': [knownTotal, 250],
    'daily-goal': [bestDay, dailyGoal],
    'review-master': [data.stats.reviewSwipes, 50],
  };
}
