#!/usr/bin/env python3
"""Validate dictionary CSV files and normalize dictionary column structure."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pandas as pd


DATA_DIR_NAME = "data"
REFERENCE_FILE = "dictionary_reference.csv"
SUPPORTED_FILE = "supported_languages.csv"
DICTIONARY_PATTERN = re.compile(r"^dictionary_(?P<code>.+)\.csv$")

REQUIRED_DICTIONARY_COLUMNS = [
    "key",
    "text",
    "english",
    "notes",
    "tag",
    "checked",
    "checked_by",
    "date",
    "google",
    "chatgpt",
    "gemini",
    "glaude",
    "bing",
]


class ValidationError(Exception):
    pass


def parse_bool(value: str) -> bool:
    normalized = (value or "").strip().upper()
    if normalized == "TRUE":
        return True
    if normalized == "FALSE":
        return False
    raise ValidationError(f"Expected TRUE/FALSE but found '{value}'")


def load_csv(path: Path) -> pd.DataFrame:
    try:
        return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    except FileNotFoundError as exc:
        raise ValidationError(f"Missing required file: {path}") from exc
    except pd.errors.EmptyDataError as exc:
        raise ValidationError(f"{path.name}: empty CSV") from exc


def ensure_dictionary_columns(path: Path, problems: list[str], notes: list[str]) -> pd.DataFrame | None:
    try:
        df = load_csv(path)
    except ValidationError as err:
        problems.append(str(err))
        return None

    missing_columns = [col for col in REQUIRED_DICTIONARY_COLUMNS if col not in df.columns]

    if missing_columns:
        for col in missing_columns:
            df[col] = ""

        ordered_columns = REQUIRED_DICTIONARY_COLUMNS + [
            col for col in df.columns if col not in REQUIRED_DICTIONARY_COLUMNS
        ]
        df = df[ordered_columns]
        df.to_csv(path, index=False, encoding="utf-8-sig")
        notes.append(f"{path.name}: added missing columns: {', '.join(missing_columns)}")

    return df


def find_duplicate_values(values: list[str]) -> list[str]:
    counts = pd.Series(values).value_counts()
    return sorted([value for value, count in counts.items() if value and count > 1])


def first_order_mismatch(expected: list[str], actual: list[str]) -> tuple[int, str, str] | None:
    for idx, (left, right) in enumerate(zip(expected, actual), start=1):
        if left != right:
            return idx, left, right
    if len(expected) != len(actual):
        idx = min(len(expected), len(actual)) + 1
        left = expected[idx - 1] if idx - 1 < len(expected) else "<end>"
        right = actual[idx - 1] if idx - 1 < len(actual) else "<end>"
        return idx, left, right
    return None


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    data_dir = repo_root / DATA_DIR_NAME
    reference_path = data_dir / REFERENCE_FILE
    supported_path = data_dir / SUPPORTED_FILE

    problems: list[str] = []
    notes: list[str] = []

    try:
        reference_df = load_csv(reference_path)
    except ValidationError as err:
        print(f"ERROR: {err}")
        return 2

    if "key" not in reference_df.columns:
        print(f"ERROR: {REFERENCE_FILE} missing required 'key' column")
        return 2

    reference_keys = reference_df["key"].astype(str).str.strip().tolist()
    if not reference_keys:
        problems.append(f"{REFERENCE_FILE} has no data rows.")

    reference_duplicates = find_duplicate_values(reference_keys)
    if reference_duplicates:
        problems.append(
            f"{REFERENCE_FILE} contains duplicate keys: {', '.join(reference_duplicates[:10])}"
        )

    try:
        supported_df = load_csv(supported_path)
    except ValidationError as err:
        print(f"ERROR: {err}")
        return 2

    required_supported_cols = ["key", "dict"]
    missing_supported_cols = [col for col in required_supported_cols if col not in supported_df.columns]
    if missing_supported_cols:
        print(f"ERROR: {SUPPORTED_FILE} missing required columns: {', '.join(missing_supported_cols)}")
        return 2

    supported_codes: set[str] = set()

    for row_index, row in enumerate(supported_df.to_dict(orient="records"), start=2):
        code = str(row.get("key", "")).strip()
        raw_dict_value = str(row.get("dict", ""))

        if not code:
            problems.append(f"{SUPPORTED_FILE}:{row_index} has empty 'key' value")
            continue

        if code in supported_codes:
            problems.append(f"{SUPPORTED_FILE}:{row_index} duplicate language code '{code}'")
            continue

        supported_codes.add(code)

        try:
            should_exist = parse_bool(raw_dict_value)
        except ValidationError as err:
            problems.append(f"{SUPPORTED_FILE}:{row_index} {err}")
            continue

        dictionary_path = data_dir / f"dictionary_{code}.csv"
        exists = dictionary_path.exists()

        if should_exist and not exists:
            problems.append(
                f"{SUPPORTED_FILE}:{row_index} expects dictionary_{code}.csv (dict=TRUE) but file is missing"
            )
            continue

        if not should_exist and exists:
            problems.append(
                f"{SUPPORTED_FILE}:{row_index} says dict=FALSE but dictionary_{code}.csv exists"
            )

        if not exists:
            continue

        dictionary_df = ensure_dictionary_columns(dictionary_path, problems, notes)
        if dictionary_df is None:
            continue

        if "key" not in dictionary_df.columns:
            problems.append(f"{dictionary_path.name} missing required 'key' column")
            continue

        dictionary_keys = dictionary_df["key"].astype(str).str.strip().tolist()

        duplicate_keys = find_duplicate_values(dictionary_keys)
        if duplicate_keys:
            problems.append(
                f"{dictionary_path.name} contains duplicate keys: {', '.join(duplicate_keys[:10])}"
            )

        ref_set = set(reference_keys)
        dict_set = set(dictionary_keys)

        missing_keys = [key for key in reference_keys if key not in dict_set]
        extra_keys = [key for key in dictionary_keys if key not in ref_set]

        if missing_keys:
            preview = ", ".join(missing_keys[:10])
            suffix = " ..." if len(missing_keys) > 10 else ""
            problems.append(
                f"{dictionary_path.name} missing {len(missing_keys)} key(s): {preview}{suffix}"
            )

        if extra_keys:
            preview = ", ".join(extra_keys[:10])
            suffix = " ..." if len(extra_keys) > 10 else ""
            problems.append(
                f"{dictionary_path.name} has {len(extra_keys)} unexpected key(s): {preview}{suffix}"
            )

        if not missing_keys and not extra_keys and dictionary_keys != reference_keys:
            mismatch = first_order_mismatch(reference_keys, dictionary_keys)
            if mismatch:
                idx, expected_key, actual_key = mismatch
                problems.append(
                    f"{dictionary_path.name} key order mismatch at line {idx + 1}: expected '{expected_key}', found '{actual_key}'"
                )
            else:
                problems.append(f"{dictionary_path.name} key order mismatch")

    dictionary_files = sorted(
        path for path in data_dir.glob("dictionary_*.csv") if path.name != REFERENCE_FILE
    )

    for path in dictionary_files:
        match = DICTIONARY_PATTERN.match(path.name)
        if not match:
            notes.append(f"Skipped file with unexpected name format: {path.name}")
            continue
        code = match.group("code")
        if code not in supported_codes:
            problems.append(
                f"{path.name} exists but language code '{code}' is missing from {SUPPORTED_FILE}"
            )

    print(f"Reference keys: {len(reference_keys)}")
    print(f"Supported language rows: {len(supported_df)}")
    print(f"Dictionary files found: {len(dictionary_files)}")

    if notes:
        print("\nNotes:")
        for note in notes:
            print(f"- {note}")

    if problems:
        print("\nValidation failed with the following issue(s):")
        for issue in problems:
            print(f"- {issue}")
        return 1

    print("\nValidation passed: all dictionaries match reference keys and supported_languages.csv.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
