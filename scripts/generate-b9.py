#!/usr/bin/env python3
"""Generate the Appendix B9 (World Powers Foretold by Daniel) cache.

The JW.org page is a diagram, so the useful text is stored as an ordered list
of paragraphs.  The generated shape intentionally matches ``appendix_a6.json``
so the frontend can render both appendices with the same split-view component.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

DEFAULT_LANGUAGES = ["en", "de", "ru", "es", "fr", "vi", "ar", "bn"]
B9_BASE_URL = "https://www.jw.org/en/library/bible/nwt/appendix-b/daniel-2-image/"
UNAVAILABLE_LANGUAGES = {"ar", "bn"}


class BodyParser(HTMLParser):
    """Extract visible B9 paragraphs from the page's bodyTxt container."""

    def __init__(self) -> None:
        super().__init__()
        self.in_body = False
        self.body_depth = 0
        self.current_tag: str | None = None
        self.current_class = ""
        self.current_text: list[str] = []
        self.items: list[dict[str, Any]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "div":
            if self.in_body:
                self.body_depth += 1
            elif attributes.get("class") == "bodyTxt":
                self.in_body = True
                self.body_depth = 1
            return

        if self.in_body and tag == "p" and self.current_tag is None:
            self.current_tag = tag
            self.current_class = attributes.get("class") or ""
            self.current_text = []

    def handle_endtag(self, tag: str) -> None:
        if self.current_tag == tag:
            text = re.sub(r"\s+", " ", html.unescape("".join(self.current_text))).strip()
            if text:
                classes = set(self.current_class.split())
                item_type = "h3" if "ss" in classes else "p"
                self.items.append({"type": item_type, "text": text})
            self.current_tag = None
            self.current_class = ""
            self.current_text = []

        if tag == "div" and self.in_body:
            self.body_depth -= 1
            if self.body_depth == 0:
                self.in_body = False

    def handle_data(self, data: str) -> None:
        if self.current_tag is not None:
            self.current_text.append(data)


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def fetch_alternate_links(url: str) -> dict[str, str]:
    source = fetch(url)
    return dict(
        re.findall(
            r'<link rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"',
            source,
        )
    )


def parse_page(source: str) -> list[dict[str, Any]]:
    parser = BodyParser()
    parser.feed(source)
    return parser.items


def page_title(source: str) -> str:
    match = re.search(r"<h1[^>]*>(.*?)</h1>", source, re.DOTALL)
    if not match:
        return "World Powers Foretold by Daniel"
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html.unescape(match.group(1)))).strip()


def unavailable_section(lang: str) -> dict[str, Any]:
    return {
        "title": "World Powers Foretold by Daniel",
        "url": "",
        "items": [],
        "unavailable": True,
        "message": f"Translation unavailable for {lang.upper()}",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate public/data/appendix_b9.json")
    parser.add_argument(
        "--languages",
        default=",".join(DEFAULT_LANGUAGES),
        help="Comma-separated language codes (default: en,de,ru,es,fr,vi,ar,bn)",
    )
    parser.add_argument(
        "--output",
        default="public/data/appendix_b9.json",
        help="Target output file path",
    )
    args = parser.parse_args()

    languages = [value.strip().lower() for value in args.languages.split(",") if value.strip()]
    output = Path(args.output)
    data: dict[str, dict[str, Any]] = {}
    if output.exists():
        try:
            data = json.loads(output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            data = {}

    try:
        alternate_urls = fetch_alternate_links(B9_BASE_URL)
    except Exception as error:
        print(f"Could not fetch B9 alternate links: {error}", file=sys.stderr)
        alternate_urls = {}

    for lang in languages:
        if lang in UNAVAILABLE_LANGUAGES:
            data[lang] = {"B9": unavailable_section(lang)}
            print(f"{lang}: translation unavailable (placeholder written)")
            continue

        url = alternate_urls.get(lang)
        if not url:
            data[lang] = {"B9": unavailable_section(lang)}
            print(f"{lang}: no JW.org page found (placeholder written)")
            continue

        try:
            source = fetch(url)
            items = parse_page(source)
            if not items:
                raise ValueError("no article paragraphs found")
            data[lang] = {
                "B9": {
                    "title": page_title(source),
                    "url": url,
                    "items": items,
                }
            }
            print(f"{lang}: extracted {len(items)} items")
        except Exception as error:
            data[lang] = {"B9": unavailable_section(lang)}
            print(f"{lang}: failed to fetch ({error}); placeholder written")
        time.sleep(0.5)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
