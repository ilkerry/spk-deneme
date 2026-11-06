/**
 * Uygulama içeriği: Ders → Bölüm → Kart.
 *
 * Kaynaklar (öncelik sırasıyla):
 *  1. Supabase (admin panelinden girilen içerik) — ayarlıysa açılışta çekilir
 *  2. Cihazdaki önbellek (son başarılı çekim)
 *  3. Uygulamaya gömülü JSON (scripts/pdf_to_cards.py ile PDF'ten üretildi)
 *
 * İçerik değişebildiği için bileşenler `useContent()` (src/store/content.tsx) ile abone olur;
 * buradaki get* fonksiyonları her zaman güncel içeriği döndürür.
 *
 * Kart metninde **kalın** işaretli kısımlar ezberlenecek anahtar bilgidir.
 */
import type { TintKey } from '@/theme';

import ticaretHukuku from './content/ticaret-hukuku.json';

export type Card = {
  id: string;
  number: number;
  text: string;
};

export type Section = {
  id: string;
  lessonId: string;
  /** Ekranda gösterilen bölüm numarası (1'den başlar) */
  order: number;
  title: string;
  emoji: string;
  cards: Card[];
};

export type Lesson = {
  id: string;
  code: string;
  title: string;
  emoji: string;
  color: TintKey;
  comingSoon?: boolean;
  sections: Section[];
};

type LessonJson = Omit<Lesson, 'sections' | 'color'> & {
  color: string;
  sections: Omit<Section, 'lessonId'>[];
};

const TINTS: TintKey[] = ['primary', 'lilac', 'sky', 'pink', 'known', 'review'];
export function toTint(c: string | undefined): TintKey {
  return TINTS.includes(c as TintKey) ? (c as TintKey) : 'primary';
}

function fromJson(json: LessonJson): Lesson {
  return {
    ...json,
    color: toTint(json.color),
    sections: json.sections
      .map((s) => ({ ...s, lessonId: json.id }))
      .sort((a, b) => a.order - b.order),
  };
}

export const bundledLessons: Lesson[] = [
  fromJson(ticaretHukuku as LessonJson),
  {
    id: 'sp-mevzuati',
    code: '1001',
    title: 'Sermaye Piyasası Mevzuatı',
    emoji: '📈',
    color: 'lilac',
    comingSoon: true,
    sections: [],
  },
];

// ——— Güncel içerik ve hızlı erişim dizinleri ———

let current: Lesson[] = [];
let sectionById = new Map<string, Section>();
let cardById = new Map<string, { card: Card; section: Section }>();

/** İçeriği değiştirir (ContentProvider çağırır). */
export function setLessons(next: Lesson[]) {
  current = next;
  sectionById = new Map();
  cardById = new Map();
  for (const l of next) {
    for (const s of l.sections) {
      sectionById.set(s.id, s);
      for (const c of s.cards) cardById.set(c.id, { card: c, section: s });
    }
  }
}
setLessons(bundledLessons);

export function getLessons() {
  return current;
}

export function getLesson(id: string | undefined) {
  return current.find((l) => l.id === id);
}

export function getSection(id: string | undefined) {
  return id ? sectionById.get(id) : undefined;
}

export function getCard(id: string) {
  return cardById.get(id);
}

export function getAllCards() {
  return current.flatMap((l) => l.sections.flatMap((s) => s.cards));
}

export function lessonCardCount(lesson: Lesson) {
  return lesson.sections.reduce((sum, s) => sum + s.cards.length, 0);
}
