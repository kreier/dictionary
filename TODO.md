# TODO

## Vite migration

- [x] Create Vite project structure.
- [x] Move generated JSON from `docs/data/` to `public/data/`.
- [x] Create `index.html` application shell.
- [x] Move frontend CSS to `src/style.css`.
- [x] Create TypeScript frontend in `src/main.ts`.
- [x] Load languages from `public/data/languages.json`.
- [x] Load dictionary JSON files from `public/data/`.
- [x] Implement language selection.
- [x] Implement dictionary categories.
- [x] Implement checked/total counters.
- [x] Implement search by key and English.
- [x] Implement key selection.
- [x] Implement previous/next navigation.
- [x] Display dictionary fields.
- [x] Display checked status, editor and date.
- [ ] Implement edit interface.
- [ ] Remove HTML generation from `webview.py`.
- [ ] Remove obsolete frontend code from `webview.py`.

## Local development

- [x] `npm run dev` starts the Vite development server.
- [ ] Verify all supported languages.
- [ ] Verify all dictionary categories.
- [ ] Verify mobile layout.
- [ ] Run `npm run build`.
- [ ] Run `npm run preview`.

## GitHub Pages

- [ ] Configure Vite production build for GitHub Pages.
- [ ] Replace the old `docs/` deployment.
- [ ] Deploy `dist/` through GitHub Actions.
- [ ] Verify `/dictionary/` base path in production.
- [ ] Verify JSON loading on GitHub Pages.

## Data synchronization

- [x] Move source CSV files out of the main data path.
- [x] Create `scripts/generate-data.py`.
- [x] Generate JSON into `public/data/`.
- [x] Create Timeline synchronization GitHub Action.
- [x] Track Timeline commit SHA.
- [ ] Test automatic synchronization after a Timeline change.
- [ ] Consider event-driven synchronization from Timeline instead of polling.

## Editing

- [ ] Add EDIT button.
- [ ] Add edit modal.
- [ ] Populate edit form from current entry.
- [ ] Validate edits.
- [ ] Show proposed changes before submission.
- [ ] Add Cloudflare verification / bot protection.
- [ ] Implement Cloudflare Worker.
- [ ] Implement secure GitHub API access.
- [ ] Create pull request against `kreier/timeline`.
- [ ] Handle concurrent edits.
- [ ] Handle rejected or closed pull requests.