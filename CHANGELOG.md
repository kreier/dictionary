# Changelog

## Unreleased

### Changed

- Improved responsive header layout for desktop and mobile users: widened the
  desktop interface, grouped search/language/key navigation controls, tightened
  verification metadata spacing, and kept mobile controls stacked.
- Moved verification metadata above the category selectors and made the search
  control icon-based with an expandable search field.
- Reduced spacing between content boxes and visually distinguished the
  `TRANSLATED TEXT` field with a light blue background (`#e6edfc`).

### Added

- Added Appendix A6 kings & prophets side-by-side context view for all 55 entries across A6-A (Kings of Judah) and A6-B (Kings of Israel).
- Added Appendix B9 World Powers Foretold by Daniel context cards, localized JW.org
  caches for English, German, Russian, Spanish, French, and Vietnamese, and
  explicit Arabic and Bengali unavailable placeholders.
- Added `scripts/generate-b9.py` to refresh the Appendix B9 cache from JW.org.
- Refreshed the Appendix A6 cache for all 56 listed languages (90 available
  A6-A/A6-B sections and 22 explicit unavailable sections) and the Appendix B9
  cache for all 56 listed languages,
  preserving explicit unavailable placeholders where JW.org has no page.
- Added explicit unavailable Appendix A6 records so missing JW.org pages are
  shown as unavailable rather than being mistaken for an unrefreshed cache.
- Added structured Appendix A6 cache in `public/data/appendix_a6.json` for English (`en`), German (`de`), Vietnamese (`vi`), and Russian (`ru`).
- Added Appendix A6 generator script `scripts/generate-a6.py` with multi-language parsing and CLI support.
- Added smart multilingual name highlighting for Kings and Prophets with auto-scroll centering active items in both left (English) and right (target language) panels.
- Added direct localized JW.org web reference links for 45 languages for both Appendix A6-A (`kings-of-judah`) and A6-B (`kings-of-israel`) in `src/links.ts`.

### Fixed

- Removed book (`📖`) and globe (`🌐`) icons from the online reference cards to prevent text overflow and clipping on long titles and URLs.
- Fixed browser freeze when selecting Appendix A6 caused by a recursive microtask loop inside `showEntry()`; implemented in-flight promise caching for `loadA6Data()` and `loadScriptures()`.

- Synchronized dictionary data and reference with authoritative `kreier/timeline` commit `e4782b404d538e1a179fa4f00b468532f861fcb2` (updated Barak to `Judges 4:9, 17`, Keturah's sons to `Genesis 25:2`, Mizraim to `Genesis 10:13`, and Hazarmaveth key update across all 56 languages).
- Added Bengali (`bn`) scriptures cache into `public/data/scriptures.json` for all available online Bible books in Bengali NWT.
- Added Bengali script (`\u0980-\u09ff`) and combining signs (`\u0981-\u09cd\u09d7`) in `buildTermPattern` for word highlighting in Bengali.
- Omitted hardcoded `&pub=nwt` in universal `finder` URLs to support languages/books hosted under other editions (such as Bengali Christian Greek scriptures).
- Added multi-verse scripture reference parsing and rendering:
  - Verse ranges (e.g., `Numbers 20:14-17` rendering all 4 verses 14, 15, 16, 17 with jw.org range deep links `#v4020014-v4020017` and `bible=04020014-04020017`).
  - Comma-separated verse lists (e.g., `Judges 4:7, 17`, `Joshua 9:3, 7`, `Genesis 28:8, 9`).
  - Semicolon-separated multi-scripture references (e.g., `Genesis 5:12; Luke 3:37`, `Genesis 36:12; 1 Chronicles 1:36`).
  - Trailing commentary parsing (e.g., `Malachi 1:1; bible book`, `Luke 3:34; Jacob/Israel 1858-1711 – 147 years`).
- Added footnote (`_fn`) tribe name extraction and highlighting:
  - Parses pattern `^\d+\)\s*([^:]+):` across English, German, and Vietnamese.
  - Highlights primary tribe names and bracketed aliases (e.g., `Hivites [Gibeon]`, `Ethiopian [Cushite]`).
  - Multi-name comma splitting (e.g., `Barak, Deborah, Jael` highlighting all three persons).
  - Normalizes and matches across German umlauts, diacritics, and pronunciation dots.
- Audited `dictionary_reference.csv` (199 Bible & `_fn` entries, 100% valid scripture references).
- Expanded scripture cache in `public/data/scriptures.json` to 1,908 verses across 41 chapters.
- Added split view layout for `BIBLE`, `A6`, `B9`, and `WIKI` categories (English reference on left, translated text on right).
- Added web reference link cards below the split view for `jw.org` bible verses, Appendix A6, Appendix B9, and Wikipedia pages.
- Added universal `jw.org/finder` link generation for all 56 supported languages, dynamically resolving book paths, chapters, and verses.
- Added side-by-side inline scripture context cards for the `BIBLE` category displaying verse texts in English and target language.
- Added smart word highlighting in scripture context boxes for both English terms and target language translations (handling diacritics and NWT pronunciation marks).
- Added Russian (`ru`) and Arabic (`ar`) Bible scriptures cache into `public/data/scriptures.json`.
- Added Cyrillic and Arabic text support in smart scripture highlighting (handling Russian stress accents, noun declensions, and Arabic harakat/tashkeel).
- Added locale redirection verification in `scripts/generate-scriptures.py` (e.g., detecting that Belarusian `be` has no online NWT on JW.org and preventing fallback data corruption).
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
