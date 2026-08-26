# TODO

## Vite migration

- [ ] Move the application HTML structure from `webview.py` into `index.html`.
- [ ] Move JavaScript functionality from `webview.py` into `src/main.ts`.
- [ ] Move CSS from `webview.py` into `src/style.css`.
- [ ] Remove HTML generation from `webview.py`.
- [ ] Rename/remove `webview.py` once migration is complete.
- [ ] Load language information from `public/data/languages.json`.
- [ ] Test with `npm run dev`.
- [ ] Test production build with `npm run build`.
- [ ] Test with `npm run preview`.

## GitHub Pages

- [ ] Replace the existing `docs/` Pages deployment with Vite build output.
- [ ] Verify `/dictionary/` base path.
- [ ] Verify JSON loading on GitHub Pages.
- [ ] Verify all supported languages.

## Data synchronization

- [x] Move source CSV files out of the main data path.
- [x] Create `scripts/generate-data.py`.
- [x] Move generated JSON files to `public/data/`.
- [x] Create Timeline synchronization GitHub Action.
- [x] Track Timeline commit SHA.
- [ ] Test automatic synchronization after a Timeline change.
- [ ] Consider triggering synchronization from Timeline rather than polling.

## Editing

- [ ] Design edit UI.
- [ ] Add verification / bot protection.
- [ ] Show proposed changes before submission.
- [ ] Implement Cloudflare Worker.
- [ ] Implement GitHub authentication.
- [ ] Create pull request against `Kreier/timeline`.
- [ ] Never modify Timeline directly from the browser.
- [ ] Handle concurrent edits.