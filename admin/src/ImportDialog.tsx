import { useState } from 'react';

import { api, shortId, slugify } from './api';
import type { CardRow, LessonRow, SectionRow, Tint } from './types';

type ImportJson = {
  id?: string;
  code?: string;
  title: string;
  emoji?: string;
  color?: string;
  sections: { id?: string; order?: number; title: string; emoji?: string; cards: { id?: string; number: number; text: string }[] }[];
};

/** JSON'u doğrular ve satırlara çevirir. Hata varsa açıklayıcı mesaj fırlatır. */
function parse(raw: string, nextSort: number) {
  let d: ImportJson;
  try {
    d = JSON.parse(raw);
  } catch {
    throw new Error('Geçerli bir JSON değil.');
  }
  if (!d || typeof d.title !== 'string' || !Array.isArray(d.sections)) throw new Error('JSON içinde "title" ve "sections" olmalı.');
  const lessonId = d.id || slugify(d.title);
  const lesson: LessonRow = {
    id: lessonId,
    code: d.code ?? '',
    title: d.title,
    emoji: d.emoji ?? '📘',
    color: (d.color as Tint) ?? 'primary',
    coming_soon: false,
    sort: nextSort,
  };
  const sections: SectionRow[] = [];
  const cards: CardRow[] = [];
  d.sections.forEach((s, si) => {
    if (typeof s.title !== 'string' || !Array.isArray(s.cards)) throw new Error(`${si + 1}. bölümde "title" ya da "cards" eksik.`);
    const order = s.order ?? si + 1;
    const sectionId = s.id || `${lessonId}-${String(order).padStart(2, '0')}`;
    sections.push({ id: sectionId, lesson_id: lessonId, title: s.title, emoji: s.emoji ?? '📄', sort: order });
    s.cards.forEach((c, ci) => {
      if (typeof c.text !== 'string' || typeof c.number !== 'number') throw new Error(`"${s.title}" bölümündeki ${ci + 1}. kart hatalı.`);
      cards.push({
        id: c.id || `${lessonId}-${String(c.number).padStart(3, '0')}` || `${lessonId}-${shortId()}`,
        section_id: sectionId,
        number: c.number,
        text: c.text,
        sort: ci,
        active: true,
      });
    });
  });
  return { lesson, sections, cards };
}

export function ImportDialog({ nextSort, onClose, onDone }: { nextSort: number; onClose: () => void; onDone: (lessonId: string) => void }) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  let summary = '';
  try {
    if (raw.trim()) {
      const p = parse(raw, nextSort);
      summary = `“${p.lesson.title}” · ${p.sections.length} bölüm · ${p.cards.length} kart (kimlik: ${p.lesson.id})`;
    }
  } catch (e) {
    summary = '⚠ ' + (e as Error).message;
  }

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const p = parse(raw, nextSort);
      await api.saveLesson(p.lesson);
      await api.bulkSections(p.sections);
      await api.bulkCards(p.cards);
      onDone(p.lesson.id);
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2>⬆ JSON'dan içe aktar</h2>
        <p className="muted small">
          <code>scripts/pdf_to_cards.py</code> çıktısını (ya da <code>src/data/content/*.json</code>) seçin veya yapıştırın. Aynı
          kimlikli ders/bölüm/kartlar güncellenir, olmayanlar eklenir.
        </p>
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setRaw(await f.text());
          }}
        />
        <textarea rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{"title": "...", "sections": [...]}' />
        {summary && <p className={summary.startsWith('⚠') ? 'error small' : 'small'}>{summary}</p>}
        {error && <p className="error">{error}</p>}
        <div className="row end">
          <button className="ghost small" onClick={onClose}>
            Vazgeç
          </button>
          <button className="small" disabled={busy || !summary || summary.startsWith('⚠')} onClick={submit}>
            {busy ? 'Yükleniyor…' : 'İçe aktar'}
          </button>
        </div>
      </div>
    </div>
  );
}
