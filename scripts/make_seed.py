"""
Uygulamadaki içerik JSON'larından Supabase'e yüklenecek seed.sql üretir.

Kullanım:
  python3 scripts/make_seed.py src/data/content/ticaret-hukuku.json > supabase/seed.sql

Var olan kayıtları günceller (upsert); admin panelinde yaptığın değişiklikleri
EZER. Yalnızca ilk kurulumda çalıştır.
"""
import json
import sys


def q(s):
    return "'" + str(s).replace("'", "''") + "'"


def main():
    out = ['-- Otomatik üretildi: scripts/make_seed.py', 'begin;']
    for lesson_sort, path in enumerate(sys.argv[1:]):
        d = json.load(open(path, encoding='utf-8'))
        out.append(
            'insert into public.lessons (id, code, title, emoji, color, coming_soon, sort) values '
            f"({q(d['id'])}, {q(d.get('code', ''))}, {q(d['title'])}, {q(d.get('emoji', '📘'))}, "
            f"{q(d.get('color', 'primary'))}, false, {lesson_sort}) "
            'on conflict (id) do update set code = excluded.code, title = excluded.title, '
            'emoji = excluded.emoji, color = excluded.color, sort = excluded.sort;'
        )
        for s in d['sections']:
            out.append(
                'insert into public.sections (id, lesson_id, title, emoji, sort) values '
                f"({q(s['id'])}, {q(d['id'])}, {q(s['title'])}, {q(s.get('emoji', '📄'))}, {s['order']}) "
                'on conflict (id) do update set title = excluded.title, emoji = excluded.emoji, sort = excluded.sort;'
            )
            rows = ',\n  '.join(
                f"({q(c['id'])}, {q(s['id'])}, {c['number']}, {q(c['text'])}, {i})" for i, c in enumerate(s['cards'])
            )
            out.append(
                'insert into public.cards (id, section_id, number, text, sort) values\n  '
                + rows
                + '\non conflict (id) do update set text = excluded.text, number = excluded.number, sort = excluded.sort;'
            )
    out.append('commit;')
    print('\n'.join(out))


if __name__ == '__main__':
    main()
