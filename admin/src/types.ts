export type Tint = 'primary' | 'lilac' | 'sky' | 'pink' | 'known' | 'review';

export type LessonRow = {
  id: string;
  code: string;
  title: string;
  emoji: string;
  color: Tint;
  coming_soon: boolean;
  sort: number;
};

export type SectionRow = {
  id: string;
  lesson_id: string;
  title: string;
  emoji: string;
  sort: number;
};

export type CardRow = {
  id: string;
  section_id: string;
  number: number;
  text: string;
  sort: number;
  active: boolean;
};
