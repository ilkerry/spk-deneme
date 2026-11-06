import { supabase } from './supabase';
import type { CardRow, LessonRow, SectionRow } from './types';

/** Supabase hatasını Türkçe ve anlaşılır bir mesaja çevirip fırlatır */
function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    const m = res.error.message;
    if (m.includes('row-level security')) throw new Error('Yetki yok: bu hesap admin listesinde değil.');
    if (m.includes('duplicate key')) throw new Error('Bu kimlik (id) zaten kullanılıyor.');
    throw new Error(m);
  }
  return res.data;
}

export const api = {
  async isAdmin() {
    const { data, error } = await supabase.rpc('is_admin');
    return !error && data === true;
  },

  // Dersler
  lessons: async () => check(await supabase.from('lessons').select('*').order('sort').order('title')) as LessonRow[],
  saveLesson: async (l: LessonRow) => check(await supabase.from('lessons').upsert(l).select().single()) as LessonRow,
  deleteLesson: async (id: string) => check(await supabase.from('lessons').delete().eq('id', id)),

  // Bölümler
  sections: async (lessonId: string) =>
    check(await supabase.from('sections').select('*').eq('lesson_id', lessonId).order('sort').order('title')) as SectionRow[],
  saveSection: async (s: SectionRow) => check(await supabase.from('sections').upsert(s).select().single()) as SectionRow,
  deleteSection: async (id: string) => check(await supabase.from('sections').delete().eq('id', id)),

  // Kartlar
  cards: async (sectionId: string) =>
    check(await supabase.from('cards').select('*').eq('section_id', sectionId).order('sort').order('number')) as CardRow[],
  saveCard: async (c: CardRow) => check(await supabase.from('cards').upsert(c).select().single()) as CardRow,
  deleteCard: async (id: string) => check(await supabase.from('cards').delete().eq('id', id)),
  maxCardNumber: async (lessonId: string) => {
    const secs = check(await supabase.from('sections').select('id').eq('lesson_id', lessonId)) as { id: string }[];
    if (secs.length === 0) return 0;
    const rows = check(
      await supabase
        .from('cards')
        .select('number')
        .in(
          'section_id',
          secs.map((s) => s.id),
        )
        .order('number', { ascending: false })
        .limit(1),
    ) as { number: number }[];
    return rows[0]?.number ?? 0;
  },

  /** Sıralama: iki kaydın sort değerini değiştirir */
  async swap<T extends { id: string; sort: number }>(table: 'lessons' | 'sections' | 'cards', a: T, b: T) {
    check(await supabase.from(table).update({ sort: b.sort }).eq('id', a.id));
    check(await supabase.from(table).update({ sort: a.sort }).eq('id', b.id));
  },

  /** Listeyi 0..n olarak yeniden numaralar (aynı sort değerleri varsa) */
  async renumber(table: 'lessons' | 'sections' | 'cards', items: { id: string }[]) {
    for (let i = 0; i < items.length; i++) check(await supabase.from(table).update({ sort: i }).eq('id', items[i].id));
  },

  // Toplu içe aktarma
  bulkSections: async (rows: SectionRow[]) => check(await supabase.from('sections').upsert(rows)),
  bulkCards: async (rows: CardRow[]) => {
    for (let i = 0; i < rows.length; i += 200) check(await supabase.from('cards').upsert(rows.slice(i, i + 200)));
  },
};

/** "Ticaret Hukuku" → "ticaret-hukuku" */
export function slugify(s: string) {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function shortId() {
  return Math.random().toString(36).slice(2, 8);
}
