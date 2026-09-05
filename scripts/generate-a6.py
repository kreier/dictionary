#!/usr/bin/env python3
"""
Generate or update public/data/appendix_a6.json by fetching and parsing Appendix A6
(Kings of Judah and Israel, Parts 1 & 2) from jw.org across supported languages.

Default languages: en, de, vi, ru
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

DEFAULT_LANGUAGES = ["en", "de", "vi", "ru"]

# Direct JW.org URLs for Appendix A6-A (kings-of-judah) and A6-B (kings-of-israel)
A6_BASE_URLS = {
    "A6-A": "https://www.jw.org/en/library/bible/nwt/appendix-a/kings-of-judah/",
    "A6-B": "https://www.jw.org/en/library/bible/nwt/appendix-a/kings-of-israel/",
}


def unavailable_section(lang: str, tag: str) -> dict[str, object]:
    return {
        "title": f"Appendix {tag}",
        "url": "",
        "items": [],
        "unavailable": True,
        "message": f"Translation unavailable for {lang.upper()}",
    }


def fetch_alternate_links(url: str) -> dict[str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8")
    alts = dict(
        re.findall(
            r'<link rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"',
            html,
        )
    )
    return alts


def parse_body_elements(html: str) -> list[dict[str, any]]:
    m = re.search(r'<div class="bodyTxt">(.*?)</div>\s*<p', html, re.DOTALL)
    if not m:
        m = re.search(r"<article[^>]*>(.*?)</article>", html, re.DOTALL)
    if not m:
        return []

    content = m.group(1)
    items = []
    matches = re.finditer(r"<(h2|h3|p|ul)[^>]*>(.*?)</\1>", content, re.DOTALL)
    for match in matches:
        tag, inner = match.group(1), match.group(2)
        if tag == "ul":
            lis = re.findall(r"<li[^>]*>(.*?)</li>", inner, re.DOTALL)
            clean_lis = [re.sub(r"<[^>]+>", " ", li).strip() for li in lis]
            clean_lis = [re.sub(r"\s+", " ", li) for li in clean_lis if li]
            items.append({"type": "ul", "items": clean_lis})
        else:
            clean_text = re.sub(r"<[^>]+>", " ", inner).strip()
            clean_text = re.sub(r"\s+", " ", clean_text)
            if clean_text:
                items.append({"type": tag, "text": clean_text})
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate public/data/appendix_a6.json")
    parser.add_argument(
        "--languages",
        default=",".join(DEFAULT_LANGUAGES),
        help="Comma-separated language codes (default: en,de,vi,ru)",
    )
    parser.add_argument(
        "--output",
        default="public/data/appendix_a6.json",
        help="Target output file path",
    )
    args = parser.parse_args()

    langs = [lang.strip().lower() for lang in args.languages.split(",") if lang.strip()]
    out_path = Path(args.output)

    data: dict[str, dict[str, any]] = {}
    if out_path.exists():
        try:
            with open(out_path, encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}

    print("Fetching alternate URLs for A6-A and A6-B...")
    alt_urls = {
        "A6-A": fetch_alternate_links(A6_BASE_URLS["A6-A"]),
        "A6-B": fetch_alternate_links(A6_BASE_URLS["A6-B"]),
    }

    for lang in langs:
        if lang not in data:
            data[lang] = {}

        for tag in ["A6-A", "A6-B"]:
            url = alt_urls[tag].get(lang)
            if not url:
                print(f"Warning: No alternate link found for {lang} ({tag})")
                data[lang][tag] = unavailable_section(lang, tag)
                continue

            print(f"Fetching {lang} ({tag}): {url}")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    html = resp.read().decode("utf-8")

                items = parse_body_elements(html)
                if items:
                    title_match = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.DOTALL)
                    title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip() if title_match else f"Appendix {tag}"
                    data[lang][tag] = {
                        "title": title,
                        "url": url,
                        "items": items,
                    }
                    print(f"  -> Extracted {len(items)} items for {lang} {tag}")
                else:
                    print(f"  -> Failed to parse items for {lang} {tag}")
                    data[lang][tag] = unavailable_section(lang, tag)
            except Exception as e:
                print(f"  -> Error fetching {url}: {e}")
                data[lang][tag] = unavailable_section(lang, tag)

            time.sleep(0.5)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {out_path} with languages: {list(data.keys())}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
