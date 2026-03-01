#!/usr/bin/env python3
"""Validate dictionary CSV files against dictionary_reference.csv and supported_languages.csv."""

from __future__ import annotations

import csv
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Iterable, List, Tuple


DATA_DIR_NAME = "data"
REFERENCE_FILE = "dictionary_reference.csv"
SUPPORTED_FILE = "supported_languages.csv"
DICTIONARY_PATTERN = re.compile(r"^dictionary_(?P<code>.+)\.csv$")


class ValidationError(Exception):
    pass


def parse_bool(value: str) -> bool:
    normalized = (value or "").strip().upper()
    if normalized == "TRUE":
        return True
    if normalized == "FALSE":
        return False
    raise ValidationError(f"Expected TRUE/FALSE but found '{value}'")


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames is None:
                raise ValidationError(f"{path.name}: missing CSV header")
            return list(reader)
    except FileNotFoundError as exc:
        raise ValidationError(f"Missing required file: {path}") from exc


def load_key_sequence(path: Path) -> list[str]:
    rows = load_csv_rows(path)
    if not rows:
        return []
    if "key" not in rows[0]:
        raise ValidationError(f"{path.name}: missing 'key' column")
    return [((row.get("key") or "").strip()) for row in rows]


def find_duplicate_keys(keys: Iterable[str]) -> list[str]:
    counts = Counter(keys)
    return sorted([key for key, count in counts.items() if count > 1 and key])


def first_order_mismatch(expected: List[str], actual: List[str]) -> Tuple[int, str, str] | None:
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
        reference_keys = load_key_sequence(reference_path)
    except ValidationError as err:
        print(f"ERROR: {err}")
        return 2

    if not reference_keys:
        problems.append(f"{REFERENCE_FILE} has no data rows.")

    reference_duplicates = find_duplicate_keys(reference_keys)
    if reference_duplicates:
        problems.append(
            f"{REFERENCE_FILE} contains duplicate keys: {', '.join(reference_duplicates[:10])}"
        )

    try:
        supported_rows = load_csv_rows(supported_path)
    except ValidationError as err:
        print(f"ERROR: {err}")
        return 2

    if not supported_rows:
        problems.append(f"{SUPPORTED_FILE} has no data rows.")

    header_columns = set(supported_rows[0].keys()) if supported_rows else set()
    missing_columns = [name for name in ("key", "dict") if name not in header_columns]
    if missing_columns:
        problems.append(
            f"{SUPPORTED_FILE} missing required columns: {', '.join(missing_columns)}"
        )
        # Cannot continue language-level checks reliably without required columns.
        for problem in problems:
            print(f"[ERROR] {problem}")
        return 1

    supported_codes: set[str] = set()

    for row_index, row in enumerate(supported_rows, start=2):
        code = (row.get("key") or "").strip()
        raw_dict_value = row.get("dict") or ""

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

        try:
            dictionary_keys = load_key_sequence(dictionary_path)
        except ValidationError as err:
            problems.append(str(err))
            continue

        duplicate_keys = find_duplicate_keys(dictionary_keys)
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

    dictionary_files = sorted(path for path in data_dir.glob("dictionary_*.csv") if path.name != REFERENCE_FILE)
    file_codes = set()

    for path in dictionary_files:
        match = DICTIONARY_PATTERN.match(path.name)
        if not match:
            notes.append(f"Skipped file with unexpected name format: {path.name}")
            continue
        code = match.group("code")
        file_codes.add(code)
        if code not in supported_codes:
            problems.append(
                f"{path.name} exists but language code '{code}' is missing from {SUPPORTED_FILE}"
            )

    print(f"Reference keys: {len(reference_keys)}")
    print(f"Supported language rows: {len(supported_rows)}")
    print(f"Dictionary files found: {len(dictionary_files)}")

    if notes:
        for note in notes:
            print(f"[NOTE] {note}")

    if problems:
        print("\nValidation failed with the following issue(s):")
        for issue in problems:
            print(f"- {issue}")
        return 1

    print("\nValidation passed: all dictionaries match reference keys and supported_languages.csv.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
