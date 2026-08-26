# AGENTS.md

## Project

This repository contains the web interface for the kreier dictionary.

The production website is:

https://kreier.github.io/dictionary/

The dictionary data is maintained in the separate repository:

https://github.com/kreier/timeline

## Source of truth

The authoritative dictionary data is stored in:

kreier/timeline/db/

The CSV files in this repository's `archive/data/` directory are historical
copies only and must not be treated as the source of truth.

## Frontend implementation

The frontend is a Vite application using vanilla TypeScript.

The application entry point is:

    index.html

The application logic is in:

    src/main.ts

The styling is in:

    src/style.css

Do not introduce React, Vue, or another frontend framework unless the
architecture is explicitly reconsidered.

The frontend reads generated JSON from:

    public/data/

Use:

    import.meta.env.BASE_URL

when constructing URLs to files under `public/`.

Do not hard-code `/data/...` paths, because the production site is served
under the `/dictionary/` GitHub Pages base path.

The current frontend should preserve the functionality of the previous
`webview.py` implementation unless a change is explicitly requested.

The current read-only functionality includes:

- language selection;
- TEXT/BIBLE/A6/B9/WIKI/OTHER categories;
- checked/total counts;
- search;
- key selection;
- previous/next navigation;
- dictionary field display;
- verification status.

Editing functionality is intentionally being migrated separately.