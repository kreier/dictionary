# Changelog

## [Unreleased]

### Added

- Added Vite-based frontend application.
- Added TypeScript dictionary viewer.
- Added language loading from `public/data/languages.json`.
- Added dictionary category navigation.
- Added checked/total counters for dictionary categories.
- Added dictionary search by key and English.
- Added key selection and previous/next navigation.
- Added display of dictionary translation, notes and AI/translation fields.
- Added display of dictionary verification status, editor and date.

### Changed

- Frontend styling moved from the Python-generated HTML into
  `src/style.css`.
- Frontend application logic moved from generated HTML into `src/main.ts`.
- Vite 8.2.2 is now used as the frontend build system.
- TypeScript 7.0.2 is used for the frontend.

### Removed

- None yet.

### Not yet migrated

- Dictionary editing functionality remains to be migrated from the old
  `webview.py` implementation.
- GitHub Pages deployment still uses the old deployment mechanism.