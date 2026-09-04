#!/usr/bin/env python3
"""
Generate or update public/data/scriptures.json by fetching and extracting Bible verses
from jw.org for chapters referenced in the dictionary across supported languages.

Uses jw.org universal finder endpoint:
https://www.jw.org/finder?locale={lang}&pub=nwt&bible={book_num:02d}{chapter:03d}000
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
    'পাদটীকা', 'পাদটিকা'
]

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

def process_language(lang: str, existing_data: dict, workers: int = 5):
    print(f'=== Fetching scriptures for language: {lang} ===')
    
    needed = []
    for book, bnum, ch in CHAPTERS:
        sample_key = f'{book.title()} {ch}:1'
        if sample_key in existing_data and existing_data[sample_key].get(lang):
            continue
        needed.append((book, bnum, ch))

    if not needed:
        print(f'All {len(CHAPTERS)} chapters already populated for {lang}.')
        return

    print(f'Need to fetch {len(needed)} chapters for {lang} using {workers} workers...')

    def fetch_task(item):
        book, bnum, ch = item
        verses = fetch_chapter(lang, bnum, ch)
        return book, ch, verses

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(fetch_task, item) for item in needed]
        for f in concurrent.futures.as_completed(futures):
            book, ch, verses = f.result()
            print(f'[{lang}] {book} {ch}: fetched {len(verses)} verses')
            for vnum, text in verses.items():
                ref_key = f'{book.title()} {ch}:{vnum}'
                if ref_key not in existing_data:
                    existing_data[ref_key] = {
                        'reference': ref_key,
                        'book': book,
                        'chapter': ch,
                        'verse': vnum,
                    }
                existing_data[ref_key][lang] = text

def main():
    parser = argparse.ArgumentParser(description='Generate or update scriptures.json')
    parser.add_argument('--lang', default='de', help='Comma-separated language codes to fetch (e.g. de,es,fr)')
    parser.add_argument('--output', default='public/data/scriptures.json', help='Output JSON path')
    parser.add_argument('--workers', type=int, default=5, help='Concurrent fetch workers')
    args = parser.parse_args()

    out_file = Path(args.output)
    existing_data = {}
    if out_file.exists():
        try:
            with out_file.open('r', encoding='utf-8') as f:
                existing_data = json.load(f)
            print(f'Loaded {len(existing_data)} existing verse entries from {out_file}.')
        except Exception as e:
            print(f'Warning: Failed to load existing {out_file}: {e}')
            existing_data = {}

    languages = [l.strip() for l in args.lang.split(',') if l.strip()]
    for lang in languages:
        process_language(lang, existing_data, workers=args.workers)

    out_file.parent.mkdir(parents=True, exist_ok=True)
    with out_file.open('w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)

    print(f'\nDone! Total verses in {out_file}: {len(existing_data)}')

if __name__ == '__main__':
    main()
