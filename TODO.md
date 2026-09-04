# TODO

## Vite migration

- [x] Create Vite project structure.
- [x] Move generated JSON from `docs/data/` to `public/data/`.
- [x] Create `index.html` application shell.
- [x] Move frontend CSS to `src/style.css`.
- [x] Create TypeScript frontend in `src/main.ts`.
- [x] Load languages from `public/data/languages.json`.
- [x] Load dictionary JSON files from `public/data/`.
- [x] Implement language selection (defaults to last entry / Vietnamese on startup).
- [x] Implement dictionary categories.
- [x] Implement checked/total counters.
- [x] Implement search by key and English.
- [x] Implement key selection.
- [x] Implement previous/next navigation.
- [x] Display dictionary fields.
- [x] Display checked status, editor and date.
- [x] Implement edit interface.
- [ ] Remove HTML generation from `webview.py`.
- [ ] Remove obsolete frontend code from `webview.py`.

## Local development

- [x] `npm run dev` starts the Vite development server.
- [ ] Verify all supported languages.
- [ ] Verify all dictionary categories.
- [ ] Verify mobile layout.
- [x] Run `npm run build`.
- [ ] Run `npm run preview`.

## GitHub Pages

- [x] Configure Vite production build for GitHub Pages.
- [x] Replace the old `docs/` deployment.
- [x] Deploy `dist/` through GitHub Actions.
- [x] Verify `/dictionary/` base path in production.
- [x] Verify JSON loading on GitHub Pages.

## Code quality & Housekeeping

- [x] Add `tsconfig.json` and `npm run typecheck` script.
- [x] Modularize `src/main.ts` into `types.ts`, `template.ts`, `diff.ts`, `turnstile.ts`, and `api.ts`.
- [x] Remove unused `jose` dependency from `package.json`.
- [x] Remove unneeded placeholder scripts (`update_*.py`).

## Data synchronization

- [x] Move source CSV files out of the main data path.
- [x] Create `scripts/generate-data.py`.
- [x] Generate JSON into `public/data/`.
- [x] Create Timeline synchronization GitHub Action.
- [x] Track Timeline commit SHA.
- [ ] Test automatic synchronization after a Timeline change.
- [ ] Consider event-driven synchronization from Timeline instead of polling.

## Editing & Submissions

- [x] Add Enable editing button in one row on the left.
- [x] Add edit activation modal with editor name attribution.
- [x] Enable in-place editing for TEXT and NOTES fields with full-width layout.
- [x] Add interactive "Checked" verification status toggle (auto-activates on edit).
- [x] Retain multi-entry edits across navigation and category changes within a language.
- [x] Show modified fields only, grouped by keys in Preview Changes modal.
- [x] Add Preview timeline dummy button.
- [x] Implement Submit Changes modal with Cloudflare Worker proxy integration.
- [x] Deploy Cloudflare Worker (`dictionary-submissions`) for Turnstile + GitHub Issue creation.
- [x] Add `.github/workflows/approve-translation.yml` in `kreier/timeline` for `/approve` bot action.
- [x] Add split view layout for BIBLE, A6, B9, and WIKI categories.
- [x] Add web reference link cards for jw.org bible verses, Appendix A6, Appendix B9, and Wikipedia.
- [x] Add localized Bible reference link generation for Vietnamese on jw.org.
- [x] Add inline side-by-side scripture context cards for BIBLE category entries.
- [x] Add dedicated "Confirm Translation" button and prominent checkbox toggle in edit mode.
- [x] Remove redundant "Key" display box.
- [x] Add inline side-by-side Appendix A6 kings & prophets context cards with name highlighting for EN, DE, VI, and RU.
- [x] Add direct localized JW.org link generation for Appendix A6 across 45 languages.
- [ ] Implement timeline visualization logic for dictionary entries.