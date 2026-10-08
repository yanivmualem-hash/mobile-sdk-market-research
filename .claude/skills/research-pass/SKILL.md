---
name: research-pass
description: Run a watch-for-changes research pass on the mobile in-app SDK dataset. Sweeps vendor newsrooms, filings and the trade press for material changes since the last pass, updates data/research.json, and opens a PR. Use when asked to check for market changes, refresh the research, or run the weekly pass — and when the weekly scheduled task fires.
---

# Research pass

A **watch-for-changes** pass over `data/research.json`. The aim is to catch things that
actually moved, not to rewrite the research. Most weeks the right answer is "nothing
material changed" and no PR.

## Hard limits

Stop and report rather than exceeding these in one pass:

- **At most 2 new vendors.**
- **At most 5 field updates** on existing vendors.
- **Never change a problem's `status`** (`solved` / `partial` / `open`). Propose it in the
  PR body and let a human decide — that is a strategic read, not a fact.
- **Never publish.** No `./build.sh` without `--local`, no `publish-slides.js`, no
  `publish-sheet.js`. The deck and sheet are updated by a human from `main`.
- **Never push to `main`.** Branch, PR, stop.

If a genuinely large change has happened (a major acquisition, a vendor shutting down),
say so in the PR body and still keep the diff within the caps.

## Steps

**1. Orient.** Read `README.md` for the schema and `data/research-log.md` for what previous
passes already considered and rejected. Do not re-propose something the log says was
deliberately deferred unless the stated reason no longer holds.

**2. Branch.** `git checkout main && git pull && git checkout -b research/YYYY-MM-DD`

**3. Sweep** for changes since the last log entry. Worth checking each pass:

- Vendor newsrooms and product blogs for the vendors already tracked
- SEC filings and earnings for the public ones (AppLovin, Unity, Magnite, PubMatic, Digital Turbine) and any S-1 traffic
- AdExchanger, ppc.land, Adweek, Mobile Dev Memo, ExchangeWire for acquisitions and launches
- prebid.org for new Prebid Mobile adopters — this drives the `openStack` field
- 42matters or similar for adapter-install share shifts

Material means: a new entrant with real scale, an acquisition or shutdown, a newly
**disclosed** figure, a shipped product that changes a vendor's position, or a claim in the
dataset that is now wrong. Not material: a rebrand, a funding round with no product change,
a partnership announcement with no mechanism behind it.

**4. Edit `data/research.json`.** Follow the schema in `README.md` exactly. For a new vendor
that means all twelve profile fields, `deck` copy, and the `disclosure`, `openStack` and
`edge` blocks.

**5. Validate and build locally.** `./build.sh --local`. It must pass clean. Fix anything the
validator names.

**6. Append to `data/research-log.md`** — the date, what you checked, what you changed, and
what you considered and rejected with the reason. This is how the next pass avoids
re-treading the same ground.

**7. Commit and open a PR** with `gh pr create`, using the body format below.

## The four fields that need a human

These carry the dataset's conclusions and are where an agent is most likely to be
confidently wrong. Set them to your best judgement, then **list every one you touched in the
PR body under "Needs your call"** with the evidence you used.

| Field | The trap |
|---|---|
| `disclosure.*` | Four booleans meaning **the vendor itself published this**. A comparison site, an analyst estimate or a journalist's figure is `false`. These four counts are the entire basis of the deck's take-rate slide — if you loosen them, that finding quietly dies. |
| `edge.basis` | `technology` means a rival would have to *rebuild* it; `relationships` means a rival would have to *negotiate* it. Easy to default to `technology` because vendors describe themselves that way. |
| `tier` | `flywheel` means the vendor owns both supply and demand and trains on the loop. Do not assign it just because a vendor has AI. |
| `category` | Sell side vs buy side is decided by **who the paying customer is**, not by how demand reaches the app. Both sides appear as adapters inside MAX. |

## PR body format

```
## What changed
- One line per change, each with its source link.

## Needs your call
- Every disclosure / edge / tier / category judgement made, with the evidence.
- Any problem status that arguably should move, and why. Do not change it.

## Considered and rejected
- What was looked at and left out, with the reason.

## Verification
- ./build.sh --local output (vendor count, slide count, validator result).
```

## If nothing material changed

Append a one-line entry to `data/research-log.md` saying so, commit that to `main` directly,
and report "no material change" without opening a PR. A quiet week is a real result.
