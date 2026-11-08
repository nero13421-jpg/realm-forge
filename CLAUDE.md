# RealmForge: notes for working in this repo

- The game ships as ONE html file: `dist/realmforge-chalcolithic.html`, built from `src/` by `python tools/build.py`. Always rebuild after editing `src/`, and commit `src/` and the rebuilt `dist/realmforge-chalcolithic.html` together.
- `src/js/NN-*.js` are fragments of a single IIFE scope, concatenated in filename order. Top-level `var`/`function` in any file is visible to all. Keep the numeric prefixes; a new file gets a number that places it where it belongs (e.g. `17b-...` is fine, sorting is by filename).
- Vanilla JS, no libraries, no build tooling beyond the concatenation. State is `S` (saved to localStorage key `realmforge-chal-1`), session-only state is `UI`. Clicks go through `data-act` delegation in `33-events.js`; selects/inputs through `el.dataset.*` change handlers there too.
- `locked/` holds finished eras. Never edit them.
- Tests are plain Node + Playwright scripts. `python tools/build.py --test` also writes `dist/test-wrap.html`, which exposes `window.__ev(code)` to evaluate inside the game scope. Run `node tests/smoke.test.js` after any change; run `node tests/tutorial.test.js` (about 12 min) before publishing a chapter. Test output (screenshots) goes to `tests/out/`, which is git-ignored.
- Fixture realms for tests are in `tests/fixtures/` (`tut15.json`: post-tutorial realm; `fort.json`/`fort2.json`: walled hamlets).
- Art is drawn in code: 16x16 item/terrain sprites (`06`-`09`), the parchment pixel terrain painter (`10`), and 64x64 seven-heads-tall figures (`29-figures-64px.js`, `a64parts`). The art style is locked; match it.
- Work arrives in "chapters": a batch of features agreed one question at a time, then built, tested and published as one version.
