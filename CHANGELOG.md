# Changelog

## Unreleased

### Added

- Added split view layout for `BIBLE`, `A6`, `B9`, and `WIKI` categories (English reference on left, translated text on right).
- Added web reference link cards below the split view for `jw.org` bible verses, Appendix A6, Appendix B9, and Wikipedia pages.
- Added universal `jw.org/finder` link generation for all 56 supported languages, dynamically resolving book paths, chapters, and verses.
- Added side-by-side inline scripture context cards for the `BIBLE` category displaying verse texts in English and target language.
- Added smart word highlighting in scripture context boxes for both English terms and target language translations (handling diacritics and NWT pronunciation marks).
- Added German (`de`), Spanish (`es`), and French (`fr`) Bible scriptures cache into `public/data/scriptures.json`.
- Generalized `scripts/generate-scriptures.py` to fetch verses for any language on demand via the universal finder endpoint.
- Added dedicated "Confirm Translation" button and interactive verification checkbox in edit mode.
- Synchronized with authoritative `kreier/timeline` commit `5aebe65a83e25ac6ba14eb6c08e5f703e90fc69e` with updated references for Haggai, Malachi, Ruth, Ezra, Nehemiah, Esther, Job, Jacob2, and Sarah.
- Cached verses for Haggai 1 and all referenced footnote chapters in `public/data/scriptures.json` (1,891 verses total).

### Changed

- Updated `scripts/generate-data.py` to merge authoritative notes and tags from `dictionary_reference.csv` into all 56 language JSON files.
- Removed italics from scripture context text, styling verses in crisp black text with blue verse references.
- Removed redundant "Key" display box since the key is already shown in the dropdown selector.
- Regenerated all `public/data/*.json` files from authoritative Timeline source CSVs.

## [1.1.0] - 2026-09-04

### Added

- Added `tsconfig.json` configuring standard Vite TypeScript bundling, browser DOM libraries, and strict type checking.
- Added `npm run typecheck` script (`tsc --noEmit`) to `package.json`.
- Modularized `src/main.ts` into discrete modules: `src/types.ts`, `src/template.ts`, `src/diff.ts`, `src/turnstile.ts`, and `src/api.ts`.
- Added `STATUS.md` as the concise current-state reference for humans and AI agents.
- Added `CLAUDE.md` as a compatibility entry point that imports `AGENTS.md`.

### Removed

- Removed unused dependency `jose` from `package.json` and synchronized `package-lock.json`.
- Removed obsolete placeholder scripts (`scripts/update_bing.py`, `scripts/update_chatgpt.py`, `scripts/update_claude.py`, and `scripts/update_gemini.py`).

### Changed

- Updated `README.md` to describe the live Vite web application, responsive mobile layout, and GitHub Pages production deployment.
- Updated `TODO.md` and `STATUS.md` to reflect completed GitHub Pages deployment and codebase housekeeping.
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
