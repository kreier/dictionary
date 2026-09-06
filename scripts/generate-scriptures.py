#!/usr/bin/env python3
"""
Generate or update scripture JSON files in public/data/scriptures/ by fetching
and extracting Bible verses from jw.org for chapters referenced in the dictionary.

Each language is stored in a separate JSON file (e.g. public/data/scriptures/bg.json).
English (public/data/scriptures/en.json) serves as the master index containing verse
metadata (reference, book, chapter, verse, text).

Uses jw.org universal finder endpoint:
https://www.jw.org/finder?locale={lang}&bible={book_num:02d}{chapter:03d}000
"""

import argparse
import concurrent.futures
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

# Chapters referenced by dictionary Bible entries
CHAPTERS = [
    # Genesis
    ('genesis', 1, 4),
    ('genesis', 1, 5),
    ('genesis', 1, 10),
    ('genesis', 1, 11),
    ('genesis', 1, 15),
    ('genesis', 1, 16),
    ('genesis', 1, 19),
    ('genesis', 1, 21),
    ('genesis', 1, 22),
    ('genesis', 1, 24),
    ('genesis', 1, 25),
    ('genesis', 1, 26),
    ('genesis', 1, 28),
    ('genesis', 1, 34),
    ('genesis', 1, 35),
    ('genesis', 1, 36),
    ('genesis', 1, 37),
    ('genesis', 1, 41),
    # Exodus
    ('exodus', 2, 2),
    ('exodus', 2, 17),
    # Numbers
    ('numbers', 4, 13),
    ('numbers', 4, 20),
    ('numbers', 4, 31),
    # Deuteronomy
    ('deuteronomy', 5, 23),
    # Joshua
    ('joshua', 6, 9),
    ('joshua', 6, 12),
    ('joshua', 6, 13),
    ('joshua', 6, 15),
    # Judges
    ('judges', 7, 3),
    ('judges', 7, 4),
    ('judges', 7, 6),
    ('judges', 7, 7),
    ('judges', 7, 10),
    ('judges', 7, 11),
    ('judges', 7, 12),
    ('judges', 7, 13),
    # Ruth
    ('ruth', 8, 1),
    # 1 Samuel
    ('1-samuel', 9, 1),
    ('1-samuel', 9, 9),
    ('1-samuel', 9, 15),
    ('1-samuel', 9, 16),
    # 1 Kings
    ('1-kings', 11, 2),
    # 2 Kings
    ('2-kings', 12, 11),
    ('2-kings', 12, 19),
    # 1 Chronicles
    ('1-chronicles', 13, 1),
    # Ezra
    ('ezra', 15, 1),
    ('ezra', 15, 4),
    ('ezra', 15, 7),
    # Nehemiah
    ('nehemiah', 16, 1),
    # Esther
    ('esther', 17, 1),
    ('esther', 17, 2),
    # Job
    ('job', 18, 1),
    ('job', 18, 42),
    # Psalms
    ('psalms', 19, 90),
    ('psalms', 19, 105),
    # Isaiah
    ('isaiah', 23, 51),
    # Ezekiel
    ('ezekiel', 26, 27),
    # Hosea
    ('hosea', 28, 12),
    # Zechariah
    ('zechariah', 38, 9),
    # Haggai
    ('haggai', 37, 1),
    # Malachi
    ('malachi', 39, 1),
    # Luke
    ('luke', 42, 2),
    ('luke', 42, 3),
    # Acts
    ('acts', 44, 11),
]

FOOTNOTE_MARKERS = [
    'Chú thích', 'Footnotes', 'Fußnoten', 'Notas', 'Notes', 'Сноски', 'Примечания',
    'Voetnoten', 'Note in calce', 'Notas de rodapé', 'Przypisy', 'الحواشي', 'حواشٍ',
    'পাদটীকা', 'পাদটিকা', 'Бележки под линия', 'Бележки', 'Footnote'
]

def format_book_display(book_slug: str) -> str:
    return ' '.join(w.capitalize() for w in book_slug.split('-'))

def parse_chapter_html(html: str) -> dict[int, str]:
    verses = {}
    pattern = (
        r'<span class=[\x22\x27]verse[\x22\x27] id=[\x22\x27]v(\d+)[\x22\x27]>(.*?)'
        r'(?=<span class=[\x22\x27]verse[\x22\x27]|<div class=[\x22\x27]groupFootnotes|<div class=[\x22\x27]footnote|\Z)'
    )
    for m in re.finditer(pattern, html, re.DOTALL):
        vid = int(m.group(1)) % 1000
        c = m.group(2)
        c = re.sub(r'<a class=[\x22\x27](?:footnoteLink|xrefLink)[^\x22\x27]*[\x22\x27][^>]*>.*?</a>', '', c)
        c = re.sub(r'<sup[^>]*>.*?</sup>', '', c)
        c = re.sub(r'<[^>]+>', '', c)
        c = re.sub(r'\s+', ' ', c).replace('+', '').replace('*', '').strip()
        for marker in FOOTNOTE_MARKERS:
            if marker in c:
                c = c.split(marker)[0].strip()
        c = re.sub(r',([^\s])', r', \1', c).strip()
        verses[vid] = c
    return verses

def fetch_chapter(lang: str, book_num: int, ch: int, retries: int = 2) -> dict[int, str]:
    bible_code = f'{book_num:02d}{ch:03d}000'
    url = f'https://www.jw.org/finder?locale={lang}&bible={bible_code}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                final_url = res.geturl()
                if f'/{lang}/' not in final_url and not final_url.startswith(f'https://www.jw.org/{lang}/'):
                    return {}
                html = res.read().decode('utf-8', errors='ignore')
                verses = parse_chapter_html(html)
                if verses:
                    return verses
        except Exception as e:
            if attempt == retries:
                print(f'[{lang}] Error fetching {book_num}:{ch} ({url}): {e}', file=sys.stderr)
            time.sleep(1)
    return {}

def process_language(lang: str, output_dir: Path, workers: int = 5):
    lang_file = output_dir / f'{lang}.json'
    existing_data = {}
    if lang_file.exists():
        try:
            with lang_file.open('r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f'[{lang}] Warning: Failed to load existing {lang_file}: {e}')
            existing_data = {}

    needed = []
    for book, bnum, ch in CHAPTERS:
        sample_key = f'{book}/{ch}/1'
        if sample_key in existing_data:
            continue
        needed.append((book, bnum, ch))

    if not needed:
        print(f'[{lang}] All {len(CHAPTERS)} chapters already cached ({len(existing_data)} verses).')
        return

    print(f'[{lang}] Fetching {len(needed)} missing chapters using {workers} workers...')

    def fetch_task(item):
        book, bnum, ch = item
        verses = fetch_chapter(lang, bnum, ch)
        return book, ch, verses

    new_verses_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(fetch_task, item) for item in needed]
        for f in concurrent.futures.as_completed(futures):
            book, ch, verses = f.result()
            if verses:
                print(f'[{lang}] {book} {ch}: fetched {len(verses)} verses')
                for vnum, text in verses.items():
                    verse_id = f'{book}/{ch}/{vnum}'
                    if lang == 'en':
                        existing_data[verse_id] = {
                            'reference': f'{format_book_display(book)} {ch}:{vnum}',
                            'book': book,
                            'chapter': ch,
                            'verse': vnum,
                            'text': text
                        }
                    else:
                        existing_data[verse_id] = text
                    new_verses_count += 1

    if existing_data:
        lang_file.parent.mkdir(parents=True, exist_ok=True)
        with lang_file.open('w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        print(f'[{lang}] Saved {len(existing_data)} verses to {lang_file}.')
    else:
        print(f'[{lang}] No verses found or NWT not available online.')

def main():
    parser = argparse.ArgumentParser(description='Generate or update per-language scripture JSON files')
    parser.add_argument('--lang', default='', help='Comma-separated language codes to fetch (e.g. bg,de,es)')
    parser.add_argument('--all', action='store_true', help='Fetch scriptures for all languages in languages.json')
    parser.add_argument('--dir', default='public/data/scriptures', help='Directory for per-language scripture JSON files')
    parser.add_argument('--workers', type=int, default=5, help='Concurrent fetch workers')
    args = parser.parse_args()

    out_dir = Path(args.dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.all:
        languages_file = Path('public/data/languages.json')
        if not languages_file.exists():
            print(f'Error: {languages_file} not found!', file=sys.stderr)
            sys.exit(1)
        with languages_file.open('r', encoding='utf-8') as f:
            languages = json.load(f)
        lang_codes = [l['key'] for l in languages]
    elif args.lang:
        lang_codes = [l.strip() for l in args.lang.split(',') if l.strip()]
    else:
        lang_codes = ['en']

    print(f'Processing {len(lang_codes)} language(s) into {out_dir}...')
    for code in lang_codes:
        process_language(code, out_dir, workers=args.workers)

    print('\nDone processing scriptures!')

if __name__ == '__main__':
    main()
