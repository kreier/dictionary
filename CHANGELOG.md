# Changelog

## [Unreleased]

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
- Added "Submit Changes" modal with Cloudflare Worker proxy configuration and submission handling.

### Changed

- Frontend styling moved from the Python-generated HTML into
  `src/style.css`.
- Frontend application logic moved from generated HTML into `src/main.ts`.
- Vite 8.2.2 is now used as the frontend build system.
- TypeScript 7.0.2 is used for the frontend.
- Reorganized edit controls into a single horizontal row on the left ("Enable editing", "Preview Changes", "Preview timeline", "Submit Changes").
- Renamed "EDIT" button to "Enable editing" / "Exit Edit Mode".

### Removed

- None yet.

### Not yet migrated

- Timeline rendering logic for the "Preview timeline" button.
- Cloudflare Worker deployment and `/approve` Action workflow in `kreier/timeline`.
- GitHub Pages deployment still uses the old deployment mechanism.