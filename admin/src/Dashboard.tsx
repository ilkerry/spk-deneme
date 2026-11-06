import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api, shortId, slugify } from './api';
import { ImportDialog } from './ImportDialog';
import { supabase } from './supabase';
import type { CardRow, LessonRow, SectionRow, Tint } from './types';

const TINTS: { value: Tint; label: string }[] = [
  { value: 'primary', label: 'Turuncu' },
  { value: 'lilac', label: 'Lila' },
  { value: 'sky', label: 'Mavi' },
  { value: 'pink', label: 'Pembe' },
  { value: 'known', label: 'Yeşil' },
  { value: 'review', label: 'Kırmızı' },
];

/** `**kalın**` işaretli metni gösterir; hidden=true ise kalın kısımlar boşluk olur */
export function RichText({ text, hidden }: { text: string; hidden?: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <mark key={i} className={hidden ? 'blank' : ''}>
            {p.slice(2, -2)}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

function boldBalanced(text: string) {
  return (text.match(/\*\*/g)?.length ?? 0) % 2 === 0;
}

export function Dashboard({ email }: { email: string }) {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonRow | 'new' | null>(null);
  const [editingSection, setEditingSection] = useState<SectionRow | 'new' | null>(null);
  const [editingCard, setEditingCard] = useState<CardRow | 'new' | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState('');

  const flash = (text: string, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg(null), error ? 6000 : 2500);
  };

  const run = useCallback(async (fn: () => Promise<unknown>, ok?: string) => {
    try {
      await fn();
      if (ok) flash(ok);
      return true;
    } catch (e) {
      flash((e as Error).message, true);
      return false;
    }
  }, []);

  const loadLessons = useCallback(() => run(async () => setLessons(await api.lessons())), [run]);
  const loadSections = useCallback(
    () => run(async () => setSections(lessonId ? await api.sections(lessonId) : [])),
    [run, lessonId],
  );
  const loadCards = useCallback(
    () => run(async () => setCards(sectionId ? await api.cards(sectionId) : [])),
    [run, sectionId],
  );

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);
  useEffect(() => {
    setSectionId(null);
    loadSections();
  }, [loadSections]);
  useEffect(() => {
    setEditingCard(null);
    loadCards();
  }, [loadCards]);

  const lesson = lessons.find((l) => l.id === lessonId);
  const section = sections.find((s) => s.id === sectionId);
  const visibleCards = useMemo(
    () => (query ? cards.filter((c) => c.text.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')) || String(c.number) === query) : cards),
    [cards, query],
  );

  const move = async <T extends { id: string; sort: number }>(
    table: 'lessons' | 'sections' | 'cards',
    list: T[],
    index: number,
    dir: -1 | 1,
    reload: () => Promise<unknown>,
  ) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    await run(async () => {
      // Aynı sort değerleri varsa önce düzgün numarala
      if (new Set(list.map((x) => x.sort)).size !== list.length) {
        await api.renumber(table, list);
        list = list.map((x, i) => ({ ...x, sort: i }));
      }
      await api.swap(table, list[index], list[j]);
    });
    reload();
  };

  return (
    <div className="app">
      <header>
        <h1>🎓 LisansQuiz Admin</h1>
        <div className="row">
          <span className="muted small">{email}</span>
          <button className="ghost small" onClick={() => supabase.auth.signOut()}>
            Çıkış
          </button>
        </div>
      </header>

      {msg && <div className={`toast ${msg.error ? 'error' : ''}`}>{msg.text}</div>}

      <main className="columns">
        {/* ——— DERSLER ——— */}
        <section className="pane">
          <div className="pane-head">
            <h2>Dersler</h2>
            <div className="row">
              <button className="small ghost" onClick={() => setImportOpen(true)} title="PDF betiğinin JSON çıktısını yükle">
                ⬆ JSON
              </button>
              <button className="small" onClick={() => setEditingLesson('new')}>
                + Ders
              </button>
            </div>
          </div>
          {editingLesson && (
            <LessonForm
              initial={editingLesson === 'new' ? undefined : editingLesson}
              nextSort={lessons.length}
              existingIds={lessons.map((l) => l.id)}
              onCancel={() => setEditingLesson(null)}
              onSave={async (l) => {
                if (await run(() => api.saveLesson(l), 'Ders kaydedildi')) {
                  setEditingLesson(null);
                  await loadLessons();
                  setLessonId(l.id);
                }
              }}
            />
          )}
          <ul className="list">
            {lessons.map((l, i) => (
              <li key={l.id} className={l.id === lessonId ? 'active' : ''} onClick={() => setLessonId(l.id)}>
                <span className="emoji">{l.emoji}</span>
                <div className="grow">
                  <div className="title">{l.title}</div>
                  <div className="muted small">
                    {l.code && `Ders ${l.code} · `}
                    {l.coming_soon ? 'Yakında' : l.id}
                  </div>
                </div>
                <Actions
                  onUp={() => move('lessons', lessons, i, -1, loadLessons)}
                  onDown={() => move('lessons', lessons, i, 1, loadLessons)}
                  onEdit={() => setEditingLesson(l)}
                  onDelete={async () => {
                    if (!confirm(`"${l.title}" dersi, tüm bölümleri ve kartlarıyla silinsin mi? Bu geri alınamaz.`)) return;
                    if (await run(() => api.deleteLesson(l.id), 'Ders silindi')) {
                      if (lessonId === l.id) setLessonId(null);
                      loadLessons();
                    }
                  }}
                />
              </li>
            ))}
            {lessons.length === 0 && <li className="empty">Henüz ders yok. "+ Ders" ya da "⬆ JSON" ile başlayın.</li>}
          </ul>
        </section>

        {/* ——— BÖLÜMLER ——— */}
        <section className="pane">
          <div className="pane-head">
            <h2>{lesson ? `${lesson.emoji} Bölümler` : 'Bölümler'}</h2>
            {lesson && (
              <button className="small" onClick={() => setEditingSection('new')}>
                + Bölüm
              </button>
            )}
          </div>
          {!lesson && <p className="empty">Soldan bir ders seçin.</p>}
          {lesson && editingSection && (
            <SectionForm
              initial={editingSection === 'new' ? undefined : editingSection}
              lessonId={lesson.id}
              nextSort={sections.length ? Math.max(...sections.map((s) => s.sort)) + 1 : 1}
              onCancel={() => setEditingSection(null)}
              onSave={async (s) => {
                if (await run(() => api.saveSection(s), 'Bölüm kaydedildi')) {
                  setEditingSection(null);
                  await loadSections();
                  setSectionId(s.id);
                }
              }}
            />
          )}
          <ul className="list">
            {lesson &&
              sections.map((s, i) => (
                <li key={s.id} className={s.id === sectionId ? 'active' : ''} onClick={() => setSectionId(s.id)}>
                  <span className="badge">{i + 1}</span>
                  <span className="emoji">{s.emoji}</span>
                  <div className="grow title">{s.title}</div>
                  <Actions
                    onUp={() => move('sections', sections, i, -1, loadSections)}
                    onDown={() => move('sections', sections, i, 1, loadSections)}
                    onEdit={() => setEditingSection(s)}
                    onDelete={async () => {
                      if (!confirm(`"${s.title}" bölümü ve tüm kartları silinsin mi? Bu geri alınamaz.`)) return;
                      if (await run(() => api.deleteSection(s.id), 'Bölüm silindi')) {
                        if (sectionId === s.id) setSectionId(null);
                        loadSections();
                      }
                    }}
                  />
                </li>
              ))}
            {lesson && sections.length === 0 && <li className="empty">Bu derste bölüm yok.</li>}
          </ul>
        </section>

        {/* ——— KARTLAR ——— */}
        <section className="pane wide">
          <div className="pane-head">
            <h2>{section ? `${section.emoji} ${section.title}` : 'Kartlar'}</h2>
            {section && (
              <div className="row">
                <input
                  className="search"
                  placeholder="Kartlarda ara…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="small" onClick={() => setEditingCard('new')}>
                  + Kart
                </button>
              </div>
            )}
          </div>
          {!section && <p className="empty">Bir bölüm seçin.</p>}
          {section && (
            <p className="muted small">
              {cards.length} kart · {cards.filter((c) => !c.active).length} pasif. Metinde <code>**kalın**</code> yazılan
              kısımlar uygulamada boşluk doldurma modunda gizlenir.
            </p>
          )}
          {section && editingCard === 'new' && lesson && (
            <CardEditor
              lessonId={lesson.id}
              sectionId={section.id}
              nextSort={cards.length ? Math.max(...cards.map((c) => c.sort)) + 1 : 0}
              onCancel={() => setEditingCard(null)}
              onSave={async (c) => {
                if (await run(() => api.saveCard(c), `#${c.number} eklendi`)) {
                  setEditingCard(null);
                  loadCards();
                }
              }}
            />
          )}
          <ul className="cards">
            {section &&
              visibleCards.map((c) => {
                const i = cards.indexOf(c);
                if (editingCard !== 'new' && editingCard?.id === c.id && lesson)
                  return (
                    <li key={c.id} className="editing">
                      <CardEditor
                        initial={c}
                        lessonId={lesson.id}
                        sectionId={section.id}
                        nextSort={c.sort}
                        onCancel={() => setEditingCard(null)}
                        onSave={async (u) => {
                          if (await run(() => api.saveCard(u), `#${u.number} kaydedildi`)) {
                            setEditingCard(null);
                            loadCards();
                          }
                        }}
                      />
                    </li>
                  );
                return (
                  <li key={c.id} className={c.active ? '' : 'inactive'}>
                    <span className="badge">#{String(c.number).padStart(3, '0')}</span>
                    <div className="grow card-text" onDoubleClick={() => setEditingCard(c)}>
                      <RichText text={c.text} />
                      {!boldBalanced(c.text) && <div className="error small">⚠ ** işaretleri eşleşmiyor</div>}
                    </div>
                    <label className="switch" title={c.active ? 'Uygulamada görünüyor' : 'Gizli (pasif)'}>
                      <input
                        type="checkbox"
                        checked={c.active}
                        onChange={async () => {
                          await run(() => api.saveCard({ ...c, active: !c.active }), c.active ? 'Kart gizlendi' : 'Kart yayında');
                          loadCards();
                        }}
                      />
                      {c.active ? 'Açık' : 'Pasif'}
                    </label>
                    <Actions
                      onUp={query ? undefined : () => move('cards', cards, i, -1, loadCards)}
                      onDown={query ? undefined : () => move('cards', cards, i, 1, loadCards)}
                      onEdit={() => setEditingCard(c)}
                      onDelete={async () => {
                        if (!confirm(`#${c.number} kartı silinsin mi?`)) return;
                        if (await run(() => api.deleteCard(c.id), 'Kart silindi')) loadCards();
                      }}
                    />
                  </li>
                );
              })}
            {section && cards.length === 0 && <li className="empty">Bu bölümde kart yok.</li>}
          </ul>
        </section>
      </main>

      {importOpen && (
        <ImportDialog
          nextSort={lessons.length}
          onClose={() => setImportOpen(false)}
          onDone={async (id) => {
            setImportOpen(false);
            await loadLessons();
            setLessonId(id);
            flash('İçe aktarma tamamlandı');
          }}
        />
      )}
    </div>
  );
}

function Actions(p: { onUp?: () => void; onDown?: () => void; onEdit: () => void; onDelete: () => void }) {
  const stop = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };
  return (
    <div className="actions">
      {p.onUp && (
        <button className="icon" title="Yukarı" onClick={stop(p.onUp)}>
          ↑
        </button>
      )}
      {p.onDown && (
        <button className="icon" title="Aşağı" onClick={stop(p.onDown)}>
          ↓
        </button>
      )}
      <button className="icon" title="Düzenle" onClick={stop(p.onEdit)}>
        ✎
      </button>
      <button className="icon danger" title="Sil" onClick={stop(p.onDelete)}>
        🗑
      </button>
    </div>
  );
}

function LessonForm(p: {
  initial?: LessonRow;
  nextSort: number;
  existingIds: string[];
  onSave: (l: LessonRow) => void;
  onCancel: () => void;
}) {
  const [l, setL] = useState<LessonRow>(
    p.initial ?? { id: '', code: '', title: '', emoji: '📘', color: 'primary', coming_soon: false, sort: p.nextSort },
  );
  const isNew = !p.initial;
  const id = isNew ? l.id || slugify(l.title) : l.id;
  const idTaken = isNew && p.existingIds.includes(id);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!idTaken && id) p.onSave({ ...l, id });
      }}>
      <div className="row">
        <input className="emoji-input" value={l.emoji} onChange={(e) => setL({ ...l, emoji: e.target.value })} />
        <input placeholder="Ders adı" value={l.title} onChange={(e) => setL({ ...l, title: e.target.value })} required autoFocus />
      </div>
      <div className="row">
        <input placeholder="Kod (ör. 1010)" value={l.code} onChange={(e) => setL({ ...l, code: e.target.value })} />
        <select value={l.color} onChange={(e) => setL({ ...l, color: e.target.value as Tint })}>
          {TINTS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <label className="check">
        <input type="checkbox" checked={l.coming_soon} onChange={(e) => setL({ ...l, coming_soon: e.target.checked })} />
        "Yakında" olarak göster (kilitli)
      </label>
      {isNew && (
        <div className="muted small">
          Kimlik: <code>{id || '—'}</code> {idTaken && <span className="error">(zaten var)</span>}
        </div>
      )}
      <div className="row end">
        <button type="button" className="ghost small" onClick={p.onCancel}>
          Vazgeç
        </button>
        <button type="submit" className="small" disabled={!id || idTaken}>
          Kaydet
        </button>
      </div>
    </form>
  );
}

function SectionForm(p: {
  initial?: SectionRow;
  lessonId: string;
  nextSort: number;
  onSave: (s: SectionRow) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState<SectionRow>(
    p.initial ?? { id: `${p.lessonId}-${shortId()}`, lesson_id: p.lessonId, title: '', emoji: '📄', sort: p.nextSort },
  );
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        p.onSave(s);
      }}>
      <div className="row">
        <input className="emoji-input" value={s.emoji} onChange={(e) => setS({ ...s, emoji: e.target.value })} />
        <input placeholder="Bölüm adı" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} required autoFocus />
      </div>
      <div className="row end">
        <button type="button" className="ghost small" onClick={p.onCancel}>
          Vazgeç
        </button>
        <button type="submit" className="small">
          Kaydet
        </button>
      </div>
    </form>
  );
}

function CardEditor(p: {
  initial?: CardRow;
  lessonId: string;
  sectionId: string;
  nextSort: number;
  onSave: (c: CardRow) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(p.initial?.text ?? '');
  const [number, setNumber] = useState<number | ''>(p.initial?.number ?? '');
  const [hidden, setHidden] = useState(true);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Yeni kartta numarayı dersteki en büyük numaranın bir fazlası yap
  useEffect(() => {
    if (!p.initial) api.maxCardNumber(p.lessonId).then((n) => setNumber((cur) => (cur === '' ? n + 1 : cur)));
  }, [p.initial, p.lessonId]);

  const bold = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    if (a === b) return;
    const sel = text.slice(a, b).trim();
    const lead = text.slice(a, b).length - text.slice(a, b).trimStart().length;
    const next = `${text.slice(0, a + lead)}**${sel}**${text.slice(a + lead + sel.length)}`;
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + lead, a + lead + sel.length + 4);
    });
  };

  const valid = text.trim().length > 0 && boldBalanced(text) && number !== '';

  return (
    <form
      className="form card-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        p.onSave({
          id: p.initial?.id ?? `${p.lessonId}-${shortId()}`,
          section_id: p.sectionId,
          number: Number(number),
          text: text.trim(),
          sort: p.initial?.sort ?? p.nextSort,
          active: p.initial?.active ?? true,
        });
      }}>
      <div className="row">
        <label className="inline">
          No
          <input
            type="number"
            className="num"
            value={number}
            onChange={(e) => setNumber(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
        <button type="button" className="small ghost" onClick={bold} title="Seçili metni kalın (anahtar bilgi) yap">
          <b>K</b> Kalın yap
        </button>
        <span className="muted small grow">Metni seçip "Kalın yap"a basın ya da **iki yıldız** arasına yazın.</span>
      </div>
      <textarea
        ref={ref}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ör: Limitedde asgari sermaye **50.000 TL**'dir."
        autoFocus
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            bold();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') (e.currentTarget.form as HTMLFormElement).requestSubmit();
        }}
      />
      <div className="preview">
        <div className="row">
          <span className="muted small grow">Önizleme</span>
          <button type="button" className={`chip ${hidden ? 'on' : ''}`} onClick={() => setHidden(true)}>
            🧩 Boşluk
          </button>
          <button type="button" className={`chip ${!hidden ? 'on' : ''}`} onClick={() => setHidden(false)}>
            📖 Okuma
          </button>
        </div>
        <div className="preview-card">{text ? <RichText text={text} hidden={hidden} /> : <span className="muted">—</span>}</div>
        {!boldBalanced(text) && <div className="error small">⚠ ** işaretleri eşleşmiyor (her kalın kısım ** ile açılıp kapanmalı)</div>}
      </div>
      <div className="row end">
        <span className="muted small grow">Ctrl+B kalın · Ctrl+Enter kaydet</span>
        <button type="button" className="ghost small" onClick={p.onCancel}>
          Vazgeç
        </button>
        <button type="submit" className="small" disabled={!valid}>
          Kaydet
        </button>
      </div>
    </form>
  );
}
