# Mobile In-App SDK Market Research

One research dataset, two outputs that stay in sync:

| Output | Where it lands |
|---|---|
| Rise-themed HTML dashboard | `dist/dashboard.html` — standalone, opens from Finder |
| Rise-themed Google Slides deck | [docs.google.com/presentation/d/1Pmdb…](https://docs.google.com/presentation/d/1PmdbNEmJlYcKwoWPClwgiyzqB8_ynNuiwTWVOVKazx0/edit) — updated **in place**, so the shared link never changes |
| Google Sheet comparison table | created on first publish, then updated in place; its id lives in `meta.sheetFileId` |

## Adding research

Edit **`data/research.json`** — that's the only file with content in it — then:

```bash
./build.sh
```

That regenerates both outputs and pushes the deck to Google Slides.

| Command | What it does |
|---|---|
| `./build.sh` | rebuild both, publish the deck |
| `./build.sh --local` | rebuild both, don't touch Google Slides |
| `./build.sh --verify` | rebuild, publish, then re-export from Google and confirm slide/notes counts |
| `./build.sh --watch` | rebuild locally on every change to `data/` or `src/` (needs `brew install fswatch`) |
| `./build.sh --force` | publish even when the branch guard objects (see *Working with someone else*) |

First time on a new machine: `npm install`, plus `python3 -m pip install openpyxl`
for the comparison sheet (or set `PYTHON=` to an interpreter that has it).

## What updates automatically

Nothing in either output hardcodes a count. Add a vendor and the SDK total, the
category tallies, the "N of M disclosed" bars, the coverage tiles and the title-slide
stats all move on their own. Add a problem and the scorecard re-tallies; if a status
ends up with more than three problems the deck grows an extra slide rather than
overflowing. Same for vendors: more than four in a tier and that tier paginates.

## `data/research.json`

| Key | Feeds |
|---|---|
| `meta` | titles, snapshot date, and `slidesFileId` (the deck to update) |
| `categories` | category pills and their colour, everywhere both outputs show one |
| `sdks[]` | dashboard cards + detail modals, the deck's tier slides, and every row of the comparison sheet |
| `valueThemes[]` | "Added value at a glance", both outputs |
| `problems[]` | problem panel, scorecard matrix, detail slides |
| `notes[]` | research notes in the dashboard sidebar |
| `narrative` | the deck's prose slides (tier intros, whitespace, method) |

### Adding a vendor

Copy an existing entry in `sdks[]` and fill in:

- the twelve profile fields listed in `fields` — these drive the dashboard's detail modal
- `category` — must match one in `categories`
- `tier` — `flywheel`, `challenger`, or `adjacent`; decides which deck slide it lands on
- `deck.name` / `deck.tag` / `deck.blurb` / `deck.risk` — the shorter copy used on slides
- `disclosure` — four booleans: did the vendor itself publish this, or did it come from a
  third party? These are what the disclosure chart counts, so be strict
- `openStack` — `{prebid, openSource, note}`. `prebid` means the vendor ships or documents a
  Prebid Mobile integration, not merely that it bids into someone else's Prebid auction
- `edge` — `{basis, note}` where basis is `technology`, `relationships` or `both`: does the
  offering win on technology a rival would have to rebuild, or on commercial access a rival
  would have to negotiate? This is the analytical column of the comparison sheet

### Adding a problem

Append to `problems[]` with `status` of `solved`, `partial`, or `open`. `title` and `note`
go in the dashboard; `shortTitle` and `shortSolvedBy` are the compressed versions for the
deck's 3×3 scorecard, so keep them to a few words.

## Working with someone else

Three separate things have to be shared, and they're easy to half-do:

1. **This repo** — on GitHub, under the `risecodes` org.
2. **The Google Slides deck** — the collaborator needs **Editor**, not Viewer. Without it
   their `./build.sh` fails with a 404 on a file they can plainly see.
3. **Their own Drive credentials** — see *Publishing prerequisites* below. Credentials are
   per-person; nothing in this repo carries them.

### One shared deck, so publish from `main`

`src/publish-slides.js` overwrites the whole Slides file. Two people publishing from two
branches would silently clobber each other — whoever ran last wins, with no conflict and
no warning. So the publisher refuses to run unless you're on the default branch:

```
publish         refusing: you are on 'add-vendor', not 'main'.
```

The intended loop is: branch → edit `data/research.json` → `./build.sh --local` to check
your work → PR → merge → `./build.sh` from `main` to update the live deck. `--force`
overrides the guard if you genuinely mean to publish a branch.

### Editing the data at the same time

`data/research.json` is pretty-printed one field per line specifically so git can merge it.
Two people adding *different* vendors merge cleanly. Two people editing the *same* vendor
conflict like any other file — resolve it, then run `./build.sh --local` before committing,
because a JSON file that merged cleanly can still be invalid.

Don't commit `dist/`. It's generated and gitignored; a 50KB regenerated HTML file would
conflict on every single merge.

## Publishing prerequisites

The deck is pushed with the Drive API using the gcloud CLI's credentials. If
`./build.sh` reports no valid token:

```bash
gcloud auth login --enable-gdrive-access --update-adc
```

`--enable-gdrive-access` matters — a plain `gcloud auth login` has no Drive scope.

## Layout

```
data/research.json      the only file with content in it
src/theme.js            Rise design tokens, shared by both generators
src/build-html.js       → dist/dashboard.html
src/build-deck.js       → dist/*.pptx
src/build-sheet.py      → dist/comparison.xlsx (needs openpyxl)
src/publish-slides.js   pushes the .pptx into the existing Slides file
src/publish-sheet.js    pushes the .xlsx into the existing Sheet
archive/                the original hand-written dashboard, kept for reference
```

## Design

Both outputs use Rise tokens from the `rise-ui-kit` skill, centralised in `src/theme.js`:
Rise Blue `#022BBE` as the single accent, Poppins headings, Roboto body, borders rather
than shadows, and one semantic colour pair per category reused wherever that category
appears. Change a colour there and it moves in both outputs at once.

Two notes on fonts: Poppins and Roboto aren't installed on this Mac, so a local
LibreOffice/Keynote render of the deck will substitute them and mis-measure text fit.
Google Slides has both, so the trustworthy visual check is `./build.sh --verify` followed
by looking at the deck in Slides. The HTML pulls both from Google Fonts.
