import csv
import json
import os
import sys
import webbrowser
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string
import requests

app = Flask(__name__)

DATA_DIR = 'data'
DOCS_DIR = 'docs'
EN_DICT_PATH = os.path.join(DATA_DIR, 'dictionary_en.csv')

# Global variables to store state
target_lang = 'de'
target_dict_path = ''
entries = []

def get_wikipedia_url(en_url, lang):
    if not en_url or 'wikipedia.org/wiki/' not in en_url:
        return None

    en_title = en_url.split('/wiki/')[-1]
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "prop": "langlinks",
        "titles": en_title,
        "lllang": lang,
        "format": "json"
    }
    headers = {
        'User-Agent': 'UpdateWikiScript/1.0 (https://github.com/kreier/dictionary)'
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        pages = data.get("query", {}).get("pages", {})
        for page_id in pages:
            langlinks = pages[page_id].get("langlinks", [])
            if langlinks:
                target_title = langlinks[0].get("*")
                return f"https://{lang}.wikipedia.org/wiki/{target_title.replace(' ', '_')}"
    except Exception as e:
        print(f"Error fetching Wikipedia link for {en_title}: {e}")

    return None

def load_data(lang):
    global target_lang, target_dict_path, entries
    target_lang = lang
    target_dict_path = os.path.join(DATA_DIR, f'dictionary_{lang}.csv')

    en_entries = {}
    with open(EN_DICT_PATH, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('tag') == 'wiki':
                en_entries[row['key']] = row

    target_entries = []
    if os.path.exists(target_dict_path):
        with open(target_dict_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('tag') == 'wiki':
                    key = row['key']
                    en_row = en_entries.get(key, {})
                    entry = {
                        'key': key,
                        'text': row.get('text', ''),
                        'english': row.get('english', ''),
                        'notes': row.get('notes', '').strip(),
                        'en_notes': en_row.get('notes', '').strip()
                    }
                    # Prefetch target wiki URL
                    entry['target_wiki_url'] = get_wikipedia_url(entry['en_notes'], lang)
                    target_entries.append(entry)

    entries = target_entries
    return entries

@app.route('/')
def index():
    return render_template_string(open(os.path.join(DOCS_DIR, 'update_wiki.html')).read(), lang=target_lang)

@app.route('/api/entries')
def get_entries():
    return jsonify(entries)

@app.route('/api/save', methods=['POST'])
def save_entry():
    data = request.json
    key = data.get('key')
    new_text = data.get('text')
    new_notes = data.get('notes')

    # Read all rows from the target CSV
    rows = []
    fieldnames = []
    with open(target_dict_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            if row['key'] == key:
                row['text'] = new_text
                row['notes'] = new_notes
                row['checked_by'] = 'matthias'
                row['date'] = datetime.now().strftime('%Y-%m-%d')
                row['checked'] = 'True'
            rows.append(row)

    # Write back to CSV
    with open(target_dict_path, mode='w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Update in-memory entries
    for entry in entries:
        if entry['key'] == key:
            entry['text'] = new_text
            entry['notes'] = new_notes
            entry['target_wiki_url'] = new_notes  # Ensure manual edits are reflected in Open Wiki
            break

    return jsonify({"status": "success"})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 update_wiki.py <lang>")
        sys.exit(1)

    lang = sys.argv[1]
    print(f"Loading data for language: {lang}...")
    load_data(lang)

    from threading import Timer

    def open_browser():
        try:
            webbrowser.open(f"http://127.0.0.1:5000")

            # Open first entry wiki pages
            if entries:
                first = entries[0]
                if first.get('en_notes'):
                    webbrowser.open(first['en_notes'], new=2, autoraise=True)
                if first.get('target_wiki_url'):
                    webbrowser.open(first['target_wiki_url'], new=2, autoraise=True)
        except Exception as e:
            print(f"Webbrowser error: {e}")

    # Open UI in browser after a short delay to ensure Flask is running
    Timer(1.5, open_browser).start()

    app.run(port=5000, host='0.0.0.0')
