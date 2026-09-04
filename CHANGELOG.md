# Changelog

## Unreleased

### Added

- Added `STATUS.md` as the concise current-state reference for humans and AI agents.
- Added `CLAUDE.md` as a compatibility entry point that imports `AGENTS.md`.

### Changed

- Updated `AGENTS.md` to serve as the primary repository-orientation entry point.
- Documented when agents should consult `ARCHITECTURE.md`, `STATUS.md`, `TODO.md`, and `CHANGELOG.md`.

## [1.0.0] - 2026-08-27

### Added

- Added Vite-based frontend application.
- Added TypeScript dictionary viewer.
- Added language loading from `public/data/languages.json` (defaults to last entry / Vietnamese on startup).
- Added dictionary category navigation.
- Added checked/total counters for dictionary categories.
- Added dictionary search by key and English.
- Added key selection and previous/next navigation with modified entry indicator (`✏️`).
- Added display of dictionary translation, notes and AI/translation fields.
- Added display of dictionary verification status, editor and date.
- Added edit mode activation with required name attribution dialog.
- Added in-place editing for TEXT and NOTES textareas with full-width stretching and height presets.
- Added interactive "Checked" toggle in header metadata (auto-checks on edit, manually toggleable).
- Added multi-entry edit persistence across navigation and category changes within the active language.
- Added "Preview Changes" modal with key-grouped diffs displaying only modified fields.
- Added "Preview timeline" dummy button between "Preview Changes" and "Submit Changes".
- Added "Submit Changes" modal with Cloudflare Worker proxy integration for automated GitHub Issue creation.

### Changed

- Frontend styling moved from the Python-generated HTML into `src/style.css`.
- Frontend application logic moved from generated HTML into `src/main.ts`.
- Vite 8.2.2 is now used as the frontend build system.
- TypeScript 7.0.2 is used for the frontend.
- Reorganized edit controls into a full-width 100% CSS grid layout (4 equal columns on desktop, 2x2 grid across 2 rows on mobile).
- Expanded desktop maximum interface width from 600px to 800px.
- Renamed "EDIT" button to "Enable editing" / "Exit Edit Mode".

### Future Roadmap

- Timeline rendering logic for the "Preview timeline" button.
- Native Cloudflare Turnstile bot protection widget integration.
