import argparse
import csv
import json
from pathlib import Path


CATEGORIES = {
    "text": ["text"],
    "bible": ["bible"],
    "A6": ["A6-A", "A6-B"],
    "B9": ["B9"],
    "wiki": ["wiki"],
    "other": ["scripture", "span_bc", "span_bce", "span_ce"],
}

EXCLUDE_TAGS = ["timespan", "float", "deprecated"]


def process_dictionaries(source_dir: Path, output_dir: Path):
    """Convert dictionary CSV files into JSON files for the web interface."""

    output_dir.mkdir(parents=True, exist_ok=True)

    supported_lang_file = source_dir / "supported_languages.csv"

    languages = []

    with supported_lang_file.open(
        mode="r",
        encoding="utf-8-sig",
        newline=""
    ) as f:
        reader = csv.DictReader(f)

        for row in reader:
            if row["dict"].upper() == "TRUE":
                languages.append({
                    "key": row["key"],
                    "language_str": row["language_str"],
                })

    for lang in languages:
        lang_key = lang["key"]
        dict_file = source_dir / f"dictionary_{lang_key}.csv"

        if not dict_file.exists():
            print(f"Warning: {dict_file} not found.")
            continue

        entries = []

        with dict_file.open(
            mode="r",
            encoding="utf-8-sig",
            newline=""
        ) as f:
            reader = csv.DictReader(f)

            for row in reader:
                tag = row.get("tag", "").strip()

                if tag in EXCLUDE_TAGS:
                    continue

                category = None

                for cat_name, tags in CATEGORIES.items():
                    if tag in tags:
                        category = cat_name
                        break

                if category:
                    row["category"] = category
                    entries.append(row)

        output_file = output_dir / f"{lang_key}.json"

        with output_file.open("w", encoding="utf-8") as f:
            json.dump(
                entries,
                f,
                ensure_ascii=False,
                indent=2,
            )

        print(
            f"Generated {output_file} "
            f"({len(entries)} entries)"
        )

    languages_file = output_dir / "languages.json"

    with languages_file.open("w", encoding="utf-8") as f:
        json.dump(
            languages,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(
        f"Generated {languages_file} "
        f"({len(languages)} languages)"
    )

    return languages


def main():
    parser = argparse.ArgumentParser(
        description="Generate dictionary JSON files from CSV data."
    )

    parser.add_argument(
        "--source",
        type=Path,
        default=Path("data"),
        help=(
            "Directory containing supported_languages.csv "
            "and dictionary_*.csv"
        ),
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/data"),
        help="Directory where JSON files will be generated",
    )

    args = parser.parse_args()

    process_dictionaries(
        source_dir=args.source,
        output_dir=args.output,
    )


if __name__ == "__main__":
    main()