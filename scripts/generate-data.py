#!/usr/bin/env python3

import argparse
import csv
import json
import shutil
from pathlib import Path


def read_csv(path: Path) -> list[dict[str, str]]:
    """Read a CSV file using UTF-8 and return its rows as dictionaries."""
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def get_category(row: dict[str, str]) -> str:
    """Determine the web dictionary category for a dictionary entry."""

    tag = (row.get("tag") or "").strip().lower()

    if tag == "bible":
        return "bible"

    if tag == "a6":
        return "A6"

    if tag == "b9":
        return "B9"

    if tag == "wiki":
        return "wiki"

    if tag == "text":
        return "text"

    return "other"


def should_include(row: dict[str, str]) -> bool:
    """Return True if the entry should be included in the web dictionary."""

    tag = (row.get("tag") or "").strip().lower()

    excluded_tags = {
        "timespan",
        "float",
        "deprecated",
    }

    return tag not in excluded_tags


def generate_language(
    language: str,
    source_dir: Path,
    output_dir: Path,
) -> None:
    """Convert one dictionary CSV into its web JSON representation."""

    source_file = source_dir / f"dictionary_{language}.csv"

    if not source_file.exists():
        print(f"Warning: {source_file} does not exist")
        return

    rows = read_csv(source_file)

    entries = []

    for row in rows:
        if not should_include(row):
            continue

        entry = dict(row)
        entry["category"] = get_category(row)

        entries.append(entry)

    output_file = output_dir / f"{language}.json"

    with output_file.open("w", encoding="utf-8") as f:
        json.dump(
            entries,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(
        f"{language}: "
        f"{len(entries):,} entries → {output_file}"
    )


def generate(
    source_dir: Path,
    output_dir: Path,
) -> None:
    """Generate all web dictionary JSON files."""

    supported_languages_file = source_dir / "supported_languages.csv"

    if not supported_languages_file.exists():
        raise FileNotFoundError(
            f"Could not find {supported_languages_file}"
        )

    output_dir.mkdir(parents=True, exist_ok=True)

    languages = read_csv(supported_languages_file)

    for language in languages:
        if (
            language.get("dict") or ""
        ).strip().upper() != "TRUE":
            continue

        code = (language.get("language") or "").strip()

        if not code:
            print("Warning: language entry has no language code")
            continue

        generate_language(
            language=code,
            source_dir=source_dir,
            output_dir=output_dir,
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Generate dictionary JSON files from "
            "the Timeline database."
        )
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
        help="Directory in which to write JSON files",
    )

    args = parser.parse_args()

    generate(
        source_dir=args.source,
        output_dir=args.output,
    )


if __name__ == "__main__":
    main()