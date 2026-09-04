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
