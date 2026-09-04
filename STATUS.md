# Current Status

This document records the current implementation state of the dictionary project.
It is intentionally separate from `CHANGELOG.md` (historical changes) and
`TODO.md` (the longer-term task list).

## Current phase

The project is in the Vite frontend migration and editing/submission phase.
The read-only viewer and local editing workflow are implemented. The remaining
major frontend work is timeline visualization.

## Completed recently

- Vite-based static frontend deployed to GitHub Pages
- TypeScript dictionary viewer
- Language and category navigation
- Dictionary search and entry navigation
- Translation and verification metadata display
- Local edit mode for Text, Notes, and Checked status
- Multi-entry edit persistence
- Key-grouped change preview
- Cloudflare Worker submission integration
- Timeline `/approve` action workflow in the Timeline repository
- Frontend modularization (`src/types.ts`, `src/template.ts`, `src/diff.ts`, `src/turnstile.ts`, `src/api.ts`)
- TypeScript compiler configuration (`tsconfig.json`) and typecheck verification
- Housekeeping: removed unused dependencies and obsolete placeholder scripts
- Release v1.1
- Multi-verse scripture reference support: ranges (`Numbers 20:14-17`), comma lists (`Judges 4:7, 17`), and multi-scriptures (`Genesis 5:12; Luke 3:37`)
- Full range deep linking to `jw.org/finder` (`#v4020014-v4020017` / `bible=04020014-04020017`)
- Footnote (`_fn`) tribe name extraction and multi-term highlighting across EN, DE, and VI
- Comma-separated name highlighting (e.g., `Barak, Deborah, Jael`)
- Complete audit of `dictionary_reference.csv` (199 Bible/footnote entries verified)
- Synchronized dictionary JSONs and cache with authoritative Timeline commit `73e62e1`
- Split view layout for BIBLE, A6, B9, and WIKI with English & Translation side-by-side
- Web reference link cards with universal `jw.org/finder` resolution for all 56 languages
- Inline scripture context cards for BIBLE category entries with smart word highlighting
- Removed italics from scripture context, styled in crisp plain text with clear blue references
- German, Vietnamese, Spanish, and French scripture context caching
- Interactive "Checked" verification button and direct checkbox toggle in edit mode
- Removed redundant "Key" display box

## Current next step

Implement the timeline visualization logic for the `Preview timeline` button.

## Important architecture

- `kreier/timeline/db/` is the authoritative dictionary source.
- `public/data/*.json` is generated read-optimized data and must not be treated
  as permanent source data.
- `scripts/generate-data.py` generates the JSON data.
- The frontend is a Vite + vanilla TypeScript application.
- Production is intended to run under `/dictionary/` on GitHub Pages.
- Browser code must never contain credentials capable of modifying the Timeline
  repository directly.

## Documentation map

- `AGENTS.md` — repository-wide instructions and rules for AI agents and humans
- `ARCHITECTURE.md` — system architecture and design decisions
- `STATUS.md` — current implementation state
- `TODO.md` — outstanding and planned work
- `CHANGELOG.md` — historical project changes

## Keeping this file current

Update this document when the project's current implementation phase or major
next step changes. Do not use it as a diary or detailed history; put historical
changes in `CHANGELOG.md` instead.
