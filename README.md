# RealmForge

A hex-tile realm builder with football-playbook battle planning, played in the browser.

## Play

Open **`dist/realmforge-chalcolithic.html`** in Chrome or Firefox. That one file is the whole game. Saves live in your browser.

The finished Neolithic era is in **`locked/realmforge-neolithic-v1.0-LOCKED.html`**. It is frozen and isn't edited.

## How the code is laid out

```
src/shell.html        page skeleton (header, tabs) with @@CSS@@ and @@JS@@ slots
src/css/game.css      all styles
src/js/NN-*.js        the game, in order: core, cards, hex grid, terrain art, elevation,
                      land use, water, fort works, match, tutorial, battles, art, UI, events
tools/build.py        stitches src/ back into dist/realmforge-chalcolithic.html
tests/                Playwright playtests (smoke, tutorial, walls, mobs, land use, fort UI, waterfalls)
locked/               finished eras, never edited
```

The files in `src/js` are pieces of one script, joined in filename order. They are not separate modules.

## Build and test

```
python tools/build.py --test       # rebuild dist/ (and the test copy)
npm install                        # once, installs Playwright
npx playwright install chromium    # once, downloads the test browser
node tests/smoke.test.js           # quick check: every tab opens, no errors
node tests/tutorial.test.js        # full tutorial run, about 12 minutes
```
