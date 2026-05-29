import pandas as pd
from deep_translator import GoogleTranslator
import os

def is_purely_numeric(val):
    if pd.isna(val):
        return False
    s = str(val).strip()
    try:
        float(s)
        return True
    except ValueError:
        return False

def translate_csv(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    # Read CSV
    # The user mentioned it might have BOM, but wants it saved without BOM.
    # pandas read_csv with encoding='utf-8-sig' can handle BOM if present.
    try:
        df = pd.read_csv(file_path, encoding='utf-8-sig')
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    translator = GoogleTranslator(source='en', target='de')

    stats = {
        'translated': 0,
        'skipped_existing': 0,
        'skipped_tag': 0,
        'skipped_numeric': 0,
        'skipped_error': 0
    }

    for index, row in df.iterrows():
        english_text = row.get('english')
        google_val = row.get('google')
        tag_val = row.get('tag')

        # Check if already has a value
        if pd.notna(google_val) and str(google_val).strip() != "":
            stats['skipped_existing'] += 1
            continue

        # Skip specific tags
        if tag_val in ['float', 'timespan']:
            stats['skipped_tag'] += 1
            continue

        # Skip purely numeric
        if is_purely_numeric(english_text):
            stats['skipped_numeric'] += 1
            continue

        if pd.isna(english_text) or str(english_text).strip() == "":
            stats['skipped_numeric'] += 1 # Or just empty skip
            continue

        # Translate
        try:
            translation = translator.translate(str(english_text))
            df.at[index, 'google'] = translation
            stats['translated'] += 1
            print(f"Translated [{index}]: {english_text} -> {translation}")
        except Exception as e:
            print(f"Error translating row {index} ({english_text}): {e}")
            stats['skipped_error'] += 1

    # Save CSV
    try:
        df.to_csv(file_path, index=False, encoding='utf-8')
        print(f"\nSuccessfully updated {file_path}")
    except Exception as e:
        print(f"Error saving CSV: {e}")

    # Print summary
    print("\nSummary:")
    print(f"  Translated:        {stats['translated']}")
    print(f"  Skipped (existing): {stats['skipped_existing']}")
    print(f"  Skipped (tag):      {stats['skipped_tag']}")
    print(f"  Skipped (numeric):  {stats['skipped_numeric']}")
    print(f"  Skipped (error):    {stats['skipped_error']}")

if __name__ == "__main__":
    csv_path = 'scripts/test/2026-05-29/example.csv'
    translate_csv(csv_path)
