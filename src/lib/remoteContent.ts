import { toTint, type Lesson } from '@/data/content';

/**
 * Supabase'den içerik çekme (yalnızca okuma).
 * Ayarlar .env dosyasından gelir:
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 * Bu iki değer yoksa uygulama gömülü içerikle çalışır.
 * Ek kütüphane kullanmadan Supabase'in REST (PostgREST) arayüzüne istek atılır.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const remoteConfigured = !!URL && !!KEY;

type Row = {
  id: string;
  code: string | null;
  title: string;
  emoji: string | null;
  color: string | null;
  coming_soon: boolean | null;
  sections: {
    id: string;
    title: string;
    emoji: string | null;
    cards: { id: string; number: number; text: string }[];
  }[];
};

const SELECT =
  'select=id,code,title,emoji,color,coming_soon,sections(id,title,emoji,sort,cards(id,number,text,sort,active))' +
  '&order=sort.asc,title.asc' +
  '&sections.order=sort.asc,title.asc' +
  '&sections.cards.order=sort.asc,number.asc' +
  '&sections.cards.active=eq.true';

/** Supabase satırlarını uygulama tiplerine çevirir (boş/bozuk alanlara karşı korumalı). */
export function rowsToLessons(rows: Row[]): Lesson[] {
  return rows.map((l) => ({
    id: l.id,
    code: l.code ?? '',
    title: l.title,
    emoji: l.emoji || '📘',
    color: toTint(l.color ?? undefined),
    comingSoon: !!l.coming_soon,
    sections: (l.sections ?? []).map((s, i) => ({
      id: s.id,
      lessonId: l.id,
      order: i + 1,
      title: s.title,
      emoji: s.emoji || '📄',
      cards: (s.cards ?? [])
        .filter((c) => typeof c.text === 'string' && c.text.trim().length > 0)
        .map((c) => ({ id: c.id, number: c.number, text: c.text })),
    })),
  }));
}

/** İçeriği çeker. Ayarlı değilse ya da hata olursa null döner (uygulama elindekiyle devam eder). */
export async function fetchRemoteLessons(timeoutMs = 8000): Promise<Lesson[] | null> {
  if (!remoteConfigured) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${URL}/rest/v1/lessons?${SELECT}`, {
      // Eski tip anon anahtar (JWT, "eyJ..." ile başlar) Authorization'a da konur;
      // yeni tip "sb_publishable_..." anahtar yalnızca apikey başlığında gönderilir.
      headers: KEY!.startsWith('eyJ') ? { apikey: KEY!, Authorization: `Bearer ${KEY}` } : { apikey: KEY! },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Row[];
    if (!Array.isArray(rows)) return null;
    return rowsToLessons(rows);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
