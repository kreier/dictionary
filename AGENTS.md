# AGENTS.md

This file is the primary entry point for humans and AI agents working on the
`kreier/dictionary` repository.

## Repository orientation

Before making significant changes, orient yourself using the repository
documentation and the actual source code.

Read these documents as appropriate:

- `ARCHITECTURE.md` — system architecture and design decisions
- `STATUS.md` — current implementation state and immediate next step
- `TODO.md` — outstanding and planned work
- `CHANGELOG.md` — recent changes and historical context

For a substantial feature or architectural change, read all of the above
before proposing an implementation.

Do not assume documentation is more current than the source code. If
documentation and implementation disagree, identify the discrepancy and
resolve it deliberately.

When the user gives a task, first understand the existing implementation and
its architectural constraints before proposing changes. Prefer modifying the
existing architecture over introducing new patterns unless there is a clear
reason to do so.

## Project purpose

This repository provides a web interface for browsing dictionary data.

The production website is:

    https://kreier.github.io/dictionary/

The frontend is a static web application. It does not require a backend
server for normal dictionary browsing.

The eventual goal is to allow users to propose dictionary corrections
through a controlled edit workflow that creates pull requests against the
`kreier/timeline` repository.

---

## Source of truth

The authoritative dictionary source data is maintained in:

    https://github.com/kreier/timeline

particularly in:

    timeline/db/

The CSV files historically used by this repository are no longer the
authoritative source.

The `archive/data/` directory contains local/historical source copies and
should not be treated as the production source of truth.

Do not modify generated JSON files manually to make permanent dictionary
changes.

Permanent dictionary changes belong in the Timeline repository.

---

## Data flow

The intended data flow is:

    kreier/timeline/db/*.csv
             |
             v
    scripts/generate-data.py
             |
             v
    public/data/*.json
             |
             v
       Vite application
             |
             v
          dist/
             |
             v
       GitHub Pages

The JSON files are generated, read-optimized representations of the
dictionary data.

---

## Generated JSON

Generated dictionary data is stored in:

    public/data/

For example:

    public/data/de.json
    public/data/vi.json
    public/data/languages.json

The file:

    public/data/.source.json

records the Timeline revision from which the generated data was produced.

Do not manually edit generated JSON files unless specifically debugging
the generation process.

If the generated JSON is wrong, investigate:

    scripts/generate-data.py

and/or the source data in:

    kreier/timeline/db/

---

## Data generation

The data-generation script is:

    scripts/generate-data.py

It accepts the source directory as a command-line argument.

For example:

    python scripts/generate-data.py --source archive/data

The same script is intended to be used by the GitHub Action when generating
production data from the Timeline repository.

The generator:

1. reads the supported-language information;
2. identifies languages that have dictionary data;
3. reads the corresponding dictionary CSV files;
4. excludes entries with excluded tags;
5. assigns dictionary categories;
6. writes JSON files to `public/data/`;
7. writes the language list;
8. records the source revision in `public/data/.source.json`.

The source directory should be supplied explicitly rather than hard-coded.

---

## Dictionary categories

Dictionary entries are currently grouped into:

    TEXT
    BIBLE
    A6
    B9
    WIKI
    OTHER

The category mapping originates from the data-generation logic.

The frontend should not silently invent new categories. If the category
system changes, update the generator and frontend together.

---

## Frontend architecture

The frontend uses:

- Vite
- vanilla TypeScript
- CSS
- static JSON data

It does not currently use React, Vue, Svelte, or another frontend
framework.

The main files are:

    index.html
    src/main.ts
    src/style.css
    vite.config.ts

`index.html` is deliberately a small application shell.

The application UI is created by `src/main.ts`.

Do not move the complete application markup back into generated HTML or
introduce Python-based HTML generation for the Vite frontend.

---

## Vite base path

The production website is hosted under:

    /dictionary/

rather than at the domain root.

URLs to files in `public/` must therefore use:

    import.meta.env.BASE_URL

For example:

    fetch(`${import.meta.env.BASE_URL}data/languages.json`)

Do not use:

    fetch("/data/languages.json")

because that will work incorrectly when the application is hosted below
the domain root.

---

## Current frontend functionality

The Vite frontend currently implements the read-only dictionary viewer.

It supports:

- language selection;
- loading `languages.json`;
- loading language-specific dictionary JSON;
- TEXT category;
- BIBLE category;
- A6 category;
- B9 category;
- WIKI category;
- OTHER category;
- checked/total counters;
- search by dictionary key;
- search by English text;
- key selection;
- previous-entry navigation using `<`;
- next-entry navigation using `>`;
- display of the dictionary key;
- display of the translated text;
- display of English;
- display of notes;
- display of Google translation;
- display of ChatGPT translation;
- display of Gemini translation;
- display of Claude translation;
- display of DeepL translation;
- display of checked status;
- display of checker/editor;
- display of checking date.

The navigation intentionally follows the old `webview.py` interface:

    <    [ key ]    >

Do not replace this with a different navigation model without a deliberate
design decision.

---

## Current TypeScript data model

Dictionary entries currently contain fields including:

    key
    text
    english
    notes
    google
    chatgpt
    gemini
    claude
    deepl
    checked
    checked_by
    date
    tag
    category

Not every optional translation field necessarily contains a value.

When the source CSV schema changes, update the generator and TypeScript
interface together.

---

## Development

Install dependencies with:

    npm install

Start the development server with:

    npm run dev

The development server normally serves the application at:

    http://localhost:5173/dictionary/

Create a production build with:

    npm run build

Preview the production build locally with:

    npm run preview

The `dist/` directory is a generated build artifact and must not be
committed.

---

## Dependencies

`package.json` defines the project's dependency requirements.

`package-lock.json` is part of the repository and must be committed.

Do not add `package-lock.json` to `.gitignore`.

For CI, prefer:

    npm ci

rather than:

    npm install

because the committed lock file should determine the dependency tree.

---

## GitHub Actions

GitHub Actions are used for automated data synchronization and will also
be used for the production frontend deployment.

The Timeline synchronization process should:

1. obtain the current Timeline source;
2. determine its revision/SHA;
3. compare it with `public/data/.source.json`;
4. regenerate JSON only when the source revision has changed;
5. commit generated changes to this repository;
6. use a descriptive commit message.

The synchronization should support both scheduled execution and manual
execution.

An hourly or daily schedule is acceptable unless there is a later
requirement for near-real-time synchronization.

---

## GitHub Pages

The intended production deployment is:

    npm run build

followed by deployment of:

    dist/

The old Python-generated `docs/index.html` implementation is being
replaced by the Vite application.

The migration should not be considered complete until GitHub Pages serves
the Vite-generated application correctly.

---

## Editing architecture

The dictionary edit and submission workflow is structured as follows:

    User
      │
      ▼
    Dictionary web interface
      │
      ▼
    Cloudflare Turnstile bot verification
      │
      ▼
    Cloudflare Worker (`dictionary-submissions`)
      │
      ▼
    GitHub API (Issue created in `kreier/timeline`)
      │
      ▼
    Review on GitHub (Maintainer comments `/approve`)
      │
      ▼
    GitHub Action (`approve-translation.yml`) in `kreier/timeline`
      │
      ▼
    Direct update to `db/dictionary_<lang>.csv` on `main`
      │
      ▼
    Dictionary data synchronization
      │
      ▼
    `public/data/*.json`

The browser must never contain a GitHub token or other credential that
allows arbitrary modification of the Timeline repository.

The edit interface:

1. allows the user to modify Text, Notes, and Checked verification;
2. preserves edits across navigation and category filters within the active language;
3. shows a clear key-grouped before/after diff preview of modified fields;
4. performs Turnstile verification;
5. submits the proposed change via Cloudflare Worker;
6. creates an issue in `kreier/timeline` ready for `/approve` action processing.

Do not implement direct browser-to-GitHub repository writes.

---

## Editing status

The local edit interface has been implemented in the Vite application with
in-place editing of Text, Notes, and verification status, multi-entry session
persistence, editor attribution, change detection, and a key-grouped preview modal.

Current status:

    Step 3B: read-only dictionary viewer — complete
    Step 3C: edit interface (local UI & change preview) — complete

Next major frontend / integration steps:

    Step 3D: timeline rendering logic (Preview timeline button)
    Step 3E: Cloudflare Worker deployment & kreier/timeline /approve action bot

The edit workflow is currently integrated with the submission dialog and
awaits Cloudflare Worker and Timeline action deployment.

---

## Legacy webview.py

`webview.py` is the historical implementation of the dictionary web
interface.

It remains useful as a behavioral reference during the Vite migration.

When migrating functionality from it:

- preserve useful existing behavior;
- do not blindly copy its HTML-generation architecture;
- move application behavior into TypeScript;
- move styling into `src/style.css`;
- keep generated data generation in `scripts/generate-data.py`.

Once the Vite application completely replaces the old implementation,
obsolete frontend-generation code in `webview.py` can be removed after
verification.

---

## Documentation

Important project documentation includes:

    AGENTS.md
    ARCHITECTURE.md
    STATUS.md
    TODO.md
    CHANGELOG.md

When making a significant architectural change:

1. update `ARCHITECTURE.md` if the architecture changes;
2. update `STATUS.md` if the current implementation phase or immediate next step changes;
3. update `CHANGELOG.md` for user-visible or significant technical changes;
4. update `TODO.md` when tasks are completed or added;
5. update `AGENTS.md` when development rules or architectural assumptions change.

Do not update documentation merely to create noise for trivial changes.

---

## General development rules

- Prefer small, testable changes.
- Preserve working functionality while migrating from `webview.py`.
- Do not change the source-of-truth architecture without documenting it.
- Do not manually modify generated production JSON as a substitute for
  changing source data.
- Keep the frontend framework-free unless there is a deliberate decision
  to introduce a framework.
- Use TypeScript types for dictionary data rather than `any`.
- Keep production credentials out of the frontend.
- Test locally with `npm run dev` before making deployment changes.
- Run `npm run build` before considering a frontend change complete.
- Avoid unrelated refactoring while implementing a specific migration step.
