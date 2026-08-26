# AGENTS.md

## Project

This repository contains the web interface for the Kreier dictionary.

The production website is:

https://kreier.github.io/dictionary/

The dictionary data is maintained in the separate repository:

https://github.com/kreier/timeline

## Source of truth

The authoritative dictionary data is stored in:

kreier/timeline/db/

The CSV files in this repository's `archive/data/` directory are historical
copies only and must not be treated as the source of truth.

Do not modify `archive/data/` to make dictionary changes.

## Generated data

The web application consumes JSON files in:

public/data/

These files are generated from the CSV files in `kreier/timeline/db/` by:

scripts/generate-data.py

Do not manually edit the generated JSON files.

The file:

public/data/.source.json

records the Timeline Git commit from which the JSON data was generated.

## Application architecture

The application is being migrated from a Python-generated HTML page to Vite.

The intended architecture is:

Timeline CSV
    ↓
scripts/generate-data.py
    ↓
public/data/*.json
    ↓
Vite
    ↓
dist/
    ↓
GitHub Pages

The frontend should contain no dictionary data directly in TypeScript.

## Development

Install dependencies:

    npm install

Start the development server:

    npm run dev

Build the production application:

    npm run build

Preview the production build:

    npm run preview

Generate dictionary JSON locally:

    python scripts/generate-data.py --source archive/data

When testing against Timeline:

    python scripts/generate-data.py --source ../timeline/db

## GitHub Actions

The workflow:

.github/workflows/update-dictionary-data.yml

periodically checks the HEAD commit of `kreier/timeline`.

If the Timeline commit has not changed since the JSON files were generated,
the workflow should not modify the repository.

If Timeline has changed, the workflow regenerates the JSON files and commits
them to this repository.

Generated-data commits should use a descriptive message such as:

    Update dictionary data from Timeline (<short-sha>)

## Important rules

- Do not make Timeline CSV files in this repository the source of truth.
- Do not manually modify generated JSON files.
- Do not put secrets or GitHub credentials into frontend code.
- Do not give the browser direct write access to the Timeline repository.
- User edits must eventually go through a controlled backend/Cloudflare Worker
  and result in a pull request.
- Preserve the `/dictionary/` GitHub Pages base path.
- Keep data generation separate from frontend application code.