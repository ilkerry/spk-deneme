/**
 * Uygulama içeriği: Ders → Bölüm → Kart.
 *
 * Şimdilik içerik uygulamanın içine gömülü JSON dosyalarından gelir
 * (scripts/pdf_to_cards.py ile PDF'ten üretildi). 7. aşamada içerik
 * admin panelinden (Supabase) çekilip cihazda önbelleğe alınacak; bu
 * dosyadaki fonksiyonların imzası aynı kalacak.
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

function fromJson(json: LessonJson): Lesson {
  return {
    ...json,
    color: json.color as TintKey,
    sections: json.sections
      .map((s) => ({ ...s, lessonId: json.id }))
      .sort((a, b) => a.order - b.order),
  };
}

export const lessons: Lesson[] = [
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

// Hızlı erişim için dizinler
const sectionById = new Map<string, Section>();
const cardById = new Map<string, { card: Card; section: Section }>();
for (const l of lessons) {
  for (const s of l.sections) {
    sectionById.set(s.id, s);
    for (const c of s.cards) cardById.set(c.id, { card: c, section: s });
  }
}

export function getLesson(id: string | undefined) {
  return lessons.find((l) => l.id === id);
}

export function getSection(id: string | undefined) {
  return id ? sectionById.get(id) : undefined;
}

export function getCard(id: string) {
  return cardById.get(id);
}

export function lessonCardCount(lesson: Lesson) {
  return lesson.sections.reduce((sum, s) => sum + s.cards.length, 0);
}

/** Uygulamadaki toplam kart sayısı */
export const totalCardCount = lessons.reduce((sum, l) => sum + lessonCardCount(l), 0);
