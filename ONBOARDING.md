# Adding research to the Mobile SDK project

Hi Eilon — this is competitive research on the mobile in-app SDK landscape. It produces
two things from one dataset:

- an HTML dashboard (`dist/dashboard.html`, opens straight from Finder)
- a [Google Slides deck](https://docs.google.com/presentation/d/1PmdbNEmJlYcKwoWPClwgiyzqB8_ynNuiwTWVOVKazx0/edit) — you already have Editor on it

**You never edit the deck or the HTML by hand.** They're both generated. Edit the data,
run one command, and both rebuild. Anything you type directly into Slides gets overwritten
on the next publish.

## One-time setup

```bash
git clone https://github.com/yanivmualem-hash/mobile-sdk-market-research.git
cd mobile-sdk-market-research
npm install
gcloud auth login --enable-gdrive-access --update-adc
```

That last line matters: `--enable-gdrive-access` is what lets you push to the deck. A plain
`gcloud auth login` has no Drive scope and publishing will fail. The token lasts days, not
months — when publishing starts failing, run it again.

## The loop

```bash
git checkout -b add-<vendor>      # work on a branch
# edit data/research.json
./build.sh --local                # rebuild locally, don't touch the live deck
open dist/dashboard.html          # check your work
git commit -am "Add <vendor>" && git push -u origin HEAD
# open a PR, get it merged
git checkout main && git pull
./build.sh                        # now update the live deck
```

**Publish from `main` only.** There's one shared Slides file and publishing overwrites it
whole, so pushing from a branch would wipe out whatever's live with your unmerged copy. The
script refuses to let you:

```
publish         refusing: you are on 'add-vendor', not 'main'.
```

`./build.sh --local` is the one you'll use most — it rebuilds everything without touching
the deck, so use it freely.

## Adding a vendor

Everything lives in `data/research.json`. Copy an existing entry in `sdks[]` and fill it in:

```jsonc
{
  "id": "acme-sdk",                    // unique, kebab-case
  "order": 13,
  "name": "Acme SDK",                  // shown on the dashboard card
  "category": "Mediation SDK",         // must match one in categories[] exactly
  "palette": "blue",                   // must match that category's palette
  "tier": "challenger",                // flywheel | challenger | adjacent — picks the deck slide

  "coreDifferentiator": "The one thing it does that nobody else does.",
  "structuralWeakness": "The thing that undercuts it. Optional but usually the most useful line.",

  // the twelve profile fields — these fill the dashboard's detail modal
  "adFormats": "...", "integrationModel": "...", "platforms": "...",
  "sdkSize": "...", "reporting": "...", "privacy": "...",
  "positioning": "...", "pricing": "...", "demandNetwork": "...",
  "proprietaryTech": "...", "marketShare": "...", "sources": "...",

  // shorter copy, used on the slides where space is tight
  "deck": {
    "name": "Acme",                    // keep short, it's a card heading
    "tag": "Mediation SDK",            // goes in a pill, ~34 chars max
    "blurb": "...",                    // ~320 chars max
    "risk": "..."                      // ~190 chars max, the red watch-out box
  },

  // did the VENDOR publish this, in their own docs or filings?
  "disclosure": {
    "adFormats": true, "reporting": true, "sdkSize": false, "takeRate": false
  }
}
```

### The one field to be strict about

`disclosure` is four booleans meaning **"the vendor itself published this"** — not "a
comparison site says so," not "an analyst estimated it." These counts are the entire basis
of the deck's strongest slide ("2 of 12 vendors publish their own take rate"). If you mark
a third-party estimate as `true`, that finding quietly weakens and nobody will notice.

When in doubt: if you can't link to the vendor's own documentation or SEC filing, it's
`false`, and the actual number goes in the `pricing` or `sdkSize` text field with a note
about where it came from.

## Adding a problem

Append to `problems[]`:

```jsonc
{
  "order": 10,
  "status": "open",                    // solved | partial | open
  "title": "Full title for the dashboard",
  "note": "A sentence or two of explanation.",
  "solvedBy": "Who addresses it, or 'None of the 12'",
  "shortTitle": "Compressed title",    // ~34 chars, for the deck's 3x3 scorecard
  "shortSolvedBy": "Compressed"        // a few words
}
```

## What updates itself

Nothing hardcodes a count. Add a vendor and the SDK total, category tallies, the
"N of M disclosed" bars, the coverage tiles and the title slide all move on their own.
Add a problem and the scorecard re-tallies. If a status ends up with more than three
problems, or a tier with more than four vendors, the deck grows an extra slide rather
than overflowing — so don't worry about running out of room.

## If something breaks

`./build.sh` validates the data first and tells you exactly what's wrong:

```
validate        2 problems in data/research.json:
                  • sdks[12] (Acme SDK): tier "challenge" is not one of flywheel, challenger, adjacent
                  • sdks[12] (Acme SDK): disclosure."adFormats" must be true or false, got "yes"
```

A JSON syntax error is almost always a trailing comma after the last item in a list.

## Two more things

- **Don't commit `dist/`.** It's generated and gitignored — a regenerated 50KB HTML file
  would conflict on every merge.
- **Merge conflicts in `research.json`** are normal if you and Yaniv touch the same vendor.
  The file is formatted one field per line so git can usually merge it. After resolving one,
  run `./build.sh --local` before committing — JSON that merged cleanly can still be invalid.

Full reference is in `README.md`.
