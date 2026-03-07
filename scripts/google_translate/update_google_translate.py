#!/usr/bin/env python3
"""Populate/update the google column in dictionary_<lang>.csv via Google Translate."""

from __future__ import annotations

import argparse
import asyncio
import html
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


DATA_DIR_NAME = "data"
SUPPORTED_FILE = "supported_languages.csv"
DICTIONARY_PREFIX = "dictionary_"
DICTIONARY_SUFFIX = ".csv"
TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2"
PUBLIC_TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single"


class ScriptError(Exception):
    """Raised for input/data/API errors that should stop execution cleanly."""


@dataclass
class Mismatch:
    dataframe_index: int
    row_number: int
    key: str
    existing_value: str
    suggested_value: str


def load_csv(path: Path) -> pd.DataFrame:
    try:
        return pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    except FileNotFoundError as exc:
        raise ScriptError(f"Missing file: {path}") from exc
    except pd.errors.EmptyDataError as exc:
        raise ScriptError(f"CSV is empty: {path}") from exc


def parse_bool(value: str) -> bool:
    normalized = (value or "").strip().upper()
    if normalized == "TRUE":
        return True
    if normalized == "FALSE":
        return False
    raise ScriptError(f"Expected TRUE/FALSE but found '{value}'")


def resolve_language_row(supported_df: pd.DataFrame, lang_code: str) -> dict[str, str]:
    if "key" not in supported_df.columns or "dict" not in supported_df.columns:
        raise ScriptError(f"{SUPPORTED_FILE} must contain 'key' and 'dict' columns")

    rows = supported_df.to_dict(orient="records")
    exact_matches = [row for row in rows if str(row.get("key", "")).strip() == lang_code]
    if exact_matches:
        return exact_matches[0]

    lower_target = lang_code.lower()
    casefold_matches = [
        row for row in rows if str(row.get("key", "")).strip().lower() == lower_target
    ]
    if len(casefold_matches) == 1:
        return casefold_matches[0]

    raise ScriptError(f"Language '{lang_code}' not found in {SUPPORTED_FILE}")


def translate_text_cloud(text: str, target_lang: str, api_key: str) -> str:
    payload = urllib.parse.urlencode(
        {
            "q": text,
            "target": target_lang,
            "source": "en",
            "format": "text",
            "key": api_key,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        TRANSLATE_ENDPOINT,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ScriptError(
            f"Google Translate API HTTP {exc.code}: {detail[:500]}"
        ) from exc
    except urllib.error.URLError as exc:
        raise ScriptError(f"Google Translate API request failed: {exc}") from exc

    try:
        response_json = json.loads(body)
        translated = response_json["data"]["translations"][0]["translatedText"]
    except (json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
        raise ScriptError(f"Unexpected API response: {body[:500]}") from exc

    return html.unescape(str(translated))


def translate_text_public(text: str, target_lang: str) -> str:
    query = urllib.parse.urlencode(
        {
            "client": "gtx",
            "sl": "en",
            "tl": target_lang,
            "dt": "t",
            "q": text,
        }
    )
    url = f"{PUBLIC_TRANSLATE_ENDPOINT}?{query}"
    request = urllib.request.Request(url, method="GET")

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ScriptError(
            f"Public Google Translate endpoint HTTP {exc.code}: {detail[:500]}"
        ) from exc
    except urllib.error.URLError as exc:
        raise ScriptError(f"Public Google Translate request failed: {exc}") from exc

    try:
        response_json = json.loads(body)
        chunks = response_json[0]
        translated = "".join(str(chunk[0]) for chunk in chunks if chunk and chunk[0] is not None)
    except (json.JSONDecodeError, IndexError, TypeError, ValueError) as exc:
        raise ScriptError(f"Unexpected public endpoint response: {body[:500]}") from exc

    return html.unescape(str(translated))


async def translate_many_public(
    dictionary_df: pd.DataFrame,
    indices: list[int],
    target_lang: str,
    concurrency: int,
) -> dict[int, str]:
    semaphore = asyncio.Semaphore(max(1, concurrency))
    results: dict[int, str] = {}

    async def worker(index: int) -> None:
        english_text = str(dictionary_df.at[index, "english"])
        if not english_text.strip():
            return
        async with semaphore:
            translated_text = await asyncio.to_thread(
                translate_text_public, english_text, target_lang
            )
        results[index] = translated_text

    await asyncio.gather(*(worker(index) for index in indices))
    return results


def confirm_apply_mismatches(mismatches: list[Mismatch]) -> bool:
    print("\nMismatches found where existing 'google' differs from API result:")
    for item in mismatches:
        print(
            f"- row {item.row_number}, key='{item.key}'\n"
            f"  existing: {item.existing_value}\n"
            f"  api:      {item.suggested_value}"
        )

    answer = input("\nApply these mismatch updates? [y/N]: ").strip().lower()
    return answer in {"y", "yes"}


def run(lang_code_input: str, provider: str, concurrency: int) -> int:
    repo_root = Path(__file__).resolve().parents[2]
    data_dir = repo_root / DATA_DIR_NAME
    supported_path = data_dir / SUPPORTED_FILE

    api_key = ""
    if provider == "cloud":
        api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY", "").strip()
        if not api_key:
            raise ScriptError(
                "Missing GOOGLE_TRANSLATE_API_KEY environment variable "
                "(or use --provider public for no-key mode)"
            )

    supported_df = load_csv(supported_path)
    row = resolve_language_row(supported_df, lang_code_input)

    lang_code = str(row.get("key", "")).strip()
    if not parse_bool(str(row.get("dict", ""))):
        raise ScriptError(
            f"Language '{lang_code}' has dict=FALSE in {SUPPORTED_FILE}; no dictionary update allowed"
        )

    dictionary_path = data_dir / f"{DICTIONARY_PREFIX}{lang_code}{DICTIONARY_SUFFIX}"
    if not dictionary_path.exists():
        raise ScriptError(f"Dictionary file not found: {dictionary_path}")

    dictionary_df = load_csv(dictionary_path)
    for col in ["key", "english", "tag", "google"]:
        if col not in dictionary_df.columns:
            raise ScriptError(f"{dictionary_path.name} missing required column '{col}'")

    text_rows = dictionary_df["tag"].astype(str).str.strip().str.lower() == "text"

    total_text_rows = int(text_rows.sum())
    if total_text_rows == 0:
        print("No rows with tag='text' found. Nothing to update.")
        return 0

    fill_updates = 0
    mismatch_updates = 0
    mismatches: list[Mismatch] = []

    print(f"Processing {total_text_rows} row(s) with tag='text' for language '{lang_code}'...")
    target_indices = [int(index) for index in dictionary_df.index[text_rows]]
    translations: dict[int, str] = {}

    if provider == "public":
        print(
            f"Using no-key public endpoint with async workers (concurrency={max(1, concurrency)})."
        )
        translations = asyncio.run(
            translate_many_public(dictionary_df, target_indices, lang_code, concurrency)
        )
    else:
        for index in target_indices:
            english_text = str(dictionary_df.at[index, "english"])
            if not english_text.strip():
                continue
            translations[index] = translate_text_cloud(english_text, lang_code, api_key)

    for index in target_indices:
        translated_text = translations.get(index, "")
        if not translated_text:
            continue
        current_google_value = str(dictionary_df.at[index, "google"])

        if not current_google_value.strip():
            dictionary_df.at[index, "google"] = translated_text
            fill_updates += 1
            continue

        if current_google_value != translated_text:
            mismatches.append(
                Mismatch(
                    dataframe_index=int(index),
                    row_number=int(index) + 2,
                    key=str(dictionary_df.at[index, "key"]),
                    existing_value=current_google_value,
                    suggested_value=translated_text,
                )
            )

    if mismatches:
        if confirm_apply_mismatches(mismatches):
            for item in mismatches:
                dictionary_df.at[item.dataframe_index, "google"] = item.suggested_value
            mismatch_updates = len(mismatches)
        else:
            print("Mismatch updates were skipped.")

    total_updates = fill_updates + mismatch_updates
    if total_updates == 0:
        print("No changes to write.")
        return 0

    dictionary_df.to_csv(dictionary_path, index=False, encoding="utf-8-sig")
    print(
        f"Updated {dictionary_path.name}: "
        f"{fill_updates} empty google cell(s) filled, "
        f"{mismatch_updates} mismatch cell(s) updated."
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Update data/dictionary_<lang>.csv google column from english text "
            "for rows where tag='text'."
        )
    )
    parser.add_argument("language", help="Language code in supported_languages.csv (key column)")
    parser.add_argument(
        "--provider",
        choices=["cloud", "public"],
        default="cloud",
        help=(
            "Translation backend: 'cloud' uses Google Cloud API (requires GOOGLE_TRANSLATE_API_KEY), "
            "'public' uses translate.googleapis.com (no key, unofficial)."
        ),
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=8,
        help="Max concurrent requests for --provider public (default: 8).",
    )
    args = parser.parse_args()

    try:
        return run(args.language, args.provider, args.concurrency)
    except ScriptError as exc:
        print(f"ERROR: {exc}")
        return 1
    except KeyboardInterrupt:
        print("\nCancelled.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
