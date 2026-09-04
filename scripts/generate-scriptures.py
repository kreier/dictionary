#!/usr/bin/env python3
"""
Generate public/data/scriptures.json by fetching and extracting Bible verses
for English and Vietnamese from jw.org for chapters referenced in the dictionary.
"""

import json
import re
import urllib.request
from pathlib import Path

CHAPTER_URLS = {
    # Genesis
    ('genesis', 4): ('library/bible/nwt/books/genesis/4/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/4/'),
    ('genesis', 5): ('library/bible/nwt/books/genesis/5/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/5/'),
    ('genesis', 10): ('library/bible/nwt/books/genesis/10/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/10/'),
    ('genesis', 11): ('library/bible/nwt/books/genesis/11/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/11/'),
    ('genesis', 16): ('library/bible/nwt/books/genesis/16/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/16/'),
    ('genesis', 19): ('library/bible/nwt/books/genesis/19/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/19/'),
    ('genesis', 21): ('library/bible/nwt/books/genesis/21/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/21/'),
    ('genesis', 22): ('library/bible/nwt/books/genesis/22/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/22/'),
    ('genesis', 24): ('library/bible/nwt/books/genesis/24/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/24/'),
    ('genesis', 25): ('library/bible/nwt/books/genesis/25/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/25/'),
    ('genesis', 26): ('library/bible/nwt/books/genesis/26/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/26/'),
    ('genesis', 28): ('library/bible/nwt/books/genesis/28/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/28/'),
    ('genesis', 34): ('library/bible/nwt/books/genesis/34/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/34/'),
    ('genesis', 35): ('library/bible/nwt/books/genesis/35/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/35/'),
    ('genesis', 36): ('library/bible/nwt/books/genesis/36/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/36/'),
    ('genesis', 37): ('library/bible/nwt/books/genesis/37/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/37/'),
    ('genesis', 41): ('library/bible/nwt/books/genesis/41/', 'thu-vien/kinh-thanh/nwt/cac-sach/S%C3%A1ng-th%E1%BA%BF/41/'),
    # Exodus
    ('exodus', 2): ('library/bible/nwt/books/exodus/2/', 'thu-vien/kinh-thanh/nwt/cac-sach/Xu%E1%BA%A5t-Ai-C%E1%BA%ADp/2/'),
    ('exodus', 17): ('library/bible/nwt/books/exodus/17/', 'thu-vien/kinh-thanh/nwt/cac-sach/Xu%E1%BA%A5t-Ai-C%E1%BA%ADp/17/'),
    # Numbers
    ('numbers', 13): ('library/bible/nwt/books/numbers/13/', 'thu-vien/kinh-thanh/nwt/cac-sach/D%C3%A2n-s%E1%BB%91/13/'),
    # Judges
    ('judges', 3): ('library/bible/nwt/books/judges/3/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/3/'),
    ('judges', 4): ('library/bible/nwt/books/judges/4/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/4/'),
    ('judges', 7): ('library/bible/nwt/books/judges/7/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/7/'),
    ('judges', 10): ('library/bible/nwt/books/judges/10/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/10/'),
    ('judges', 11): ('library/bible/nwt/books/judges/11/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/11/'),
    ('judges', 12): ('library/bible/nwt/books/judges/12/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/12/'),
    ('judges', 13): ('library/bible/nwt/books/judges/13/', 'thu-vien/kinh-thanh/nwt/cac-sach/Quan-x%C3%A9t/13/'),
    # 1 Samuel
    ('1-samuel', 1): ('library/bible/nwt/books/1-samuel/1/', 'thu-vien/kinh-thanh/nwt/cac-sach/1-Sa-mu-%C3%AAn/1/'),
    ('1-samuel', 9): ('library/bible/nwt/books/1-samuel/9/', 'thu-vien/kinh-thanh/nwt/cac-sach/1-Sa-mu-%C3%AAn/9/'),
    ('1-samuel', 16): ('library/bible/nwt/books/1-samuel/16/', 'thu-vien/kinh-thanh/nwt/cac-sach/1-Sa-mu-%C3%AAn/16/'),
    # 1 Kings
    ('1-kings', 2): ('library/bible/nwt/books/1-kings/2/', 'thu-vien/kinh-thanh/nwt/cac-sach/1-C%C3%A1c-vua/2/'),
    # 2 Kings
    ('2-kings', 11): ('library/bible/nwt/books/2-kings/11/', 'thu-vien/kinh-thanh/nwt/cac-sach/2-C%C3%A1c-vua/11/'),
    # 1 Chronicles
    ('1-chronicles', 1): ('library/bible/nwt/books/1-chronicles/1/', 'thu-vien/kinh-thanh/nwt/cac-sach/1-S%E1%BB%AD-k%C3%BD/1/'),
    # Esther
    ('esther', 1): ('library/bible/nwt/books/esther/1/', 'thu-vien/kinh-thanh/nwt/cac-sach/%C3%8A-x%C6%A1-t%C3%AA/1/'),
    # Isaiah
    ('isaiah', 51): ('library/bible/nwt/books/isaiah/51/', 'thu-vien/kinh-thanh/nwt/cac-sach/%C3%8A-sai/51/'),
    # Luke
    ('luke', 2): ('library/bible/nwt/books/luke/2/', 'thu-vien/kinh-thanh/nwt/cac-sach/lu-ca/2/'),
    ('luke', 3): ('library/bible/nwt/books/luke/3/', 'thu-vien/kinh-thanh/nwt/cac-sach/lu-ca/3/'),
    # Acts
    ('acts', 11): ('library/bible/nwt/books/acts/11/', 'thu-vien/kinh-thanh/nwt/cac-sach/C%C3%B4ng-v%E1%BB%A5/11/'),
}

def parse_chapter(url: str) -> dict:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f'Error fetching {url}: {e}')
        return {}

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
        if 'Chú thích' in c:
            c = c.split('Chú thích')[0].strip()
        if 'Footnotes' in c:
            c = c.split('Footnotes')[0].strip()
        c = re.sub(r',([^\s])', r', \1', c).strip()
        verses[vid] = c
    return verses

def main():
    out_file = Path('public/data/scriptures.json')
    existing_data = {}
    if out_file.exists():
        try:
            with out_file.open('r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception:
            existing_data = {}

    total = len(CHAPTER_URLS)
    for idx, ((book, ch), (en_path, vi_path)) in enumerate(CHAPTER_URLS.items(), 1):
        sample_key = f'{book.title()} {ch}:1'
        if sample_key in existing_data:
            print(f'[{idx}/{total}] Skipping {book} {ch} (already present)')
            continue

        print(f'[{idx}/{total}] Fetching {book} {ch}...')
        en_verses = parse_chapter(f'https://www.jw.org/en/{en_path}')
        vi_verses = parse_chapter(f'https://www.jw.org/vi/{vi_path}')

        for vnum, en_text in en_verses.items():
            vi_text = vi_verses.get(vnum, '')
            ref_key = f'{book.title()} {ch}:{vnum}'
            existing_data[ref_key] = {
                'reference': ref_key,
                'book': book,
                'chapter': ch,
                'verse': vnum,
                'en': en_text,
                'vi': vi_text,
            }

    out_file.parent.mkdir(parents=True, exist_ok=True)
    with out_file.open('w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)

    print(f'Done! Total verses in {out_file}: {len(existing_data)}')

if __name__ == '__main__':
    main()
