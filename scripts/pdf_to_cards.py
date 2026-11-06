"""
Hap ezber notu PDF'ini kart verisine (JSON) çevirir.

Kullanım:
  python3 scripts/pdf_to_cards.py <pdf> <ders-id> <ders-kodu> "<Ders adı>" <çıktı.json>

PDF yapısı: her sayfa bir bölüm (başlık 18pt), notlar 3 haneli numarayla başlar,
not metni 10.4pt Arial; kalın (Arial-Bold) kısımlar ezberlenecek anahtar bilgidir
ve çıktıda **...** ile işaretlenir.
"""
import json
import re
import sys

import pdfplumber

BODY_SIZE = 10.4
TITLE_SIZE = 18.0


def is_bold(ch):
    return 'Bold' in ch['fontname']


def lines_of(chars, tol=2.5):
    """Karakterleri satırlara gruplar (yukarıdan aşağı, soldan sağa)."""
    chars = sorted(chars, key=lambda c: (c['top'], c['x0']))
    lines = []
    for c in chars:
        if lines and abs(lines[-1][0]['top'] - c['top']) <= tol:
            lines[-1].append(c)
        else:
            lines.append([c])
    return [sorted(l, key=lambda c: c['x0']) for l in lines]


def line_segments(line):
    """Bir satırı [(metin, kalın_mı)] parçalarına çevirir; harf aralıklarından boşluk çıkarır."""
    segs = []
    prev = None
    for c in line:
        text = c['text']
        bold = is_bold(c)
        if prev is not None and c['x0'] - prev['x1'] > c['size'] * 0.15:
            # Boşluk, iki taraf da kalınsa kalın sayılır (ifade bölünmesin)
            segs.append([' ', bold and is_bold(prev)])
        segs.append([text, bold])
        prev = c
    return segs


def to_markup(segs):
    """[(metin, kalın)] parçalarını **kalın** işaretli tek metne çevirir."""
    runs = []  # [metin, kalın]
    for text, bold in segs:
        if text == ' ':
            bold = runs[-1][1] if runs else False
        if runs and runs[-1][1] == bold:
            runs[-1][0] += text
        else:
            runs.append([text, bold])
    out = ''
    for text, bold in runs:
        if not bold:
            out += text
            continue
        core = text.strip()
        if not core:
            out += ' '
            continue
        lead = text[: len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()):]
        out += f'{lead}**{core}**{trail}'
    out = re.sub(r'\*\*(\s*)\*\*', r'\1', out)  # bitişik kalın blokları birleştir
    return re.sub(r'\s+', ' ', out).strip()


def parse(pdf_path):
    sections = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            title_chars = [c for c in page.chars if abs(c['size'] - TITLE_SIZE) < 0.5]
            title = (
                ''.join(t for t, _ in line_segments(lines_of(title_chars)[0])) if title_chars else f'Bölüm {page_no}'
            )

            body = [c for c in page.chars if abs(c['size'] - BODY_SIZE) < 0.3]
            # Not numaraları: solda, kalın, 3 hane
            markers = []
            for w in page.extract_words(extra_attrs=['size']):
                if w['x0'] < 55 and re.fullmatch(r'\d{3}', w['text']):
                    markers.append((w['top'], int(w['text'])))
            markers.sort()

            cards = {}
            for line in lines_of(body):
                top = line[0]['top']
                owner = None
                for mt, num in markers:
                    if mt <= top + 6:
                        owner = num
                if owner is None:
                    raise SystemExit(f'Sayfa {page_no}: numarasız satır: {"".join(c["text"] for c in line)}')
                cards.setdefault(owner, []).extend(line_segments(line) + [[' ', False]])

            sections.append({
                'order': page_no,
                'title': title.strip(),
                'cards': [{'number': n, 'text': to_markup(segs)} for n, segs in sorted(cards.items())],
            })
    return sections


def main():
    pdf_path, lesson_id, code, title, out = sys.argv[1:6]
    sections = parse(pdf_path)
    numbers = [c['number'] for s in sections for c in s['cards']]
    assert numbers == list(range(1, len(numbers) + 1)), 'Not numaraları eksik/atlamalı'
    data = {'id': lesson_id, 'code': code, 'title': title, 'sections': sections}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'{len(sections)} bölüm, {len(numbers)} kart -> {out}')


if __name__ == '__main__':
    main()
