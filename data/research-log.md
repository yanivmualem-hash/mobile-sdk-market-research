# Research log

What each pass checked, changed, and deliberately left out. The point of the "rejected"
entries is so a later pass does not re-tread the same ground — if you disagree with a past
rejection, say so in the PR body rather than silently reversing it.

Newest first.

---

## 2026-10-07 — Nimbus, and the tech-vs-relationships axis

**Added:** Nimbus (Ads by Nimbus). Charges demand partners nothing and takes no cut of CPM
from either side, passing the net CPM to the publisher — so `disclosure.takeRate` is `true`,
taking that count to 4 of 20. Built inside Timehop in 2017, opened to third parties. 50+
demand partners; Prebid demand went live on it in 2026.

**Added field:** `edge` on every vendor — `technology`, `relationships` or `both`. Across 20
vendors: 7 / 8 / 5.

**Also:** a generated Google Sheet comparison (`src/build-sheet.py`).

---

## 2026-10-04 — seven vendors

**Added:** PubMatic (OpenWrap), Ogury, Magnite, Verve, Smaato, Moloco, Mintegral.

Two kinds of gap were being closed: companies the dataset already *named* without profiling
(Moloco, Mintegral, Magnite), and companies covered in the Session 1 memo that never reached
the dashboard (PubMatic, Ogury).

**Notable calls:**
- `Header Bidding` category renamed `SSP / Header Bidding` once five SSPs joined Amazon in it.
- Moloco classified `tier: flywheel` — it added its own publisher SDK, so CARA now trains on
  supply it owns. Same architecture as Liftoff/Vungle.
- Smaato cross-referenced with Verve, which has owned it since 2021 ($170M, via MGI).
  Profiling them as independent would double-count one corporate position.
- Problems 1, 2 and 3 had their `solvedBy` lists updated for the new entrants. **No status
  was changed** — problem 3 (brand demand locked out) is now contested by six vendors and
  arguably no longer "partial", but that call was left to a human.

**Rejected / deferred:**
- **Pangle (ByteDance)** — 380,000+ apps, 2.9B daily users, launched a global programmatic
  exchange Feb 2026. Deliberately deferred by Yaniv: a walled-garden demand source rather
  than a comparable to an SSP building an SDK. **Revisit if** Pangle's exchange starts
  carrying meaningful third-party supply, which would make it a direct competitor.
- **Meta Audience Network** — bidding-only since 2024 and present in every mediation stack
  tracked here. Deferred for the same reason as Pangle.
- **TopOn, TradPlus, Appodeal, Admost** — real mediation platforms, but thinly documented;
  most fields would come back "not disclosed". Low value per row.
- **MoPub** — dead since 2022, referenced only historically via CloudX.
- **Fyber, AdColony, Tapjoy** — absorbed into Digital Turbine and Unity, already covered by
  those entries.

---

## 2026-09-24 — initial dataset

Twelve vendors lifted out of the original hand-written dashboard into `data/research.json`:
AppLovin MAX, Unity LevelPlay, Google AdMob, Digital Turbine, Chartboost, Vungle, MobileFuse,
CloudX, InMobi, Amazon APS, LoopMe, Liftoff.

Nine industry problems scored 3 solved / 3 partial / 3 open. Six value themes.
