// Checks data/research.json before anything is generated from it, so a typo
// produces a pointed error here rather than a broken slide or a silently
// missing card. Runs as the first step of build.sh.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data/research.json");

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(where + ": " + msg);
const warn = (where, msg) => warnings.push(where + ": " + msg);

let D;
try {
  D = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (e) {
  console.error("validate        data/research.json is not valid JSON.\n                " + e.message);
  console.error("                Tip: a trailing comma after the last item is the usual cause.");
  process.exit(1);
}

const SDK_FIELDS = [
  "id", "name", "category", "coreDifferentiator", "adFormats", "integrationModel",
  "platforms", "sdkSize", "reporting", "privacy", "positioning", "pricing",
  "demandNetwork", "proprietaryTech", "marketShare", "sources",
];
const DECK_FIELDS = ["name", "tag", "blurb", "risk"];
const DISCLOSURE_FIELDS = ["adFormats", "reporting", "sdkSize", "takeRate"];
const TIERS = ["flywheel", "challenger", "adjacent"];
const STATUSES = ["solved", "partial", "open"];
const PALETTES = ["blue", "orange", "green", "purple", "red", "gold", "teal", "gray"];

// ---- top level ----
["meta", "categories", "fields", "sdks", "valueThemes", "problems", "notes", "narrative"]
  .forEach((k) => { if (!D[k]) err("root", "missing \"" + k + "\""); });
if (errors.length) { report(); }

const catNames = D.categories.map((c) => c.name);
D.categories.forEach((c, i) => {
  if (!c.name) err("categories[" + i + "]", "missing \"name\"");
  if (PALETTES.indexOf(c.palette) < 0)
    err("category \"" + c.name + "\"", "palette \"" + c.palette + "\" is not one of " + PALETTES.join(", "));
});

// ---- sdks ----
const seenIds = {};
D.sdks.forEach((s, i) => {
  const where = "sdks[" + i + "]" + (s.name ? " (" + s.name + ")" : "");
  SDK_FIELDS.forEach((f) => {
    if (!s[f] || !String(s[f]).trim()) err(where, "missing or empty \"" + f + "\"");
  });
  if (s.id) {
    if (seenIds[s.id]) err(where, "duplicate id \"" + s.id + "\" — ids must be unique");
    seenIds[s.id] = true;
  }
  if (s.category && catNames.indexOf(s.category) < 0)
    err(where, "category \"" + s.category + "\" is not in categories[]. Valid: " + catNames.join(", "));
  if (TIERS.indexOf(s.tier) < 0)
    err(where, "tier \"" + s.tier + "\" is not one of " + TIERS.join(", ") + " — this decides which deck slide it lands on");

  // palette should track the category, so colours stay consistent everywhere
  const cat = D.categories.filter((c) => c.name === s.category)[0];
  if (cat && s.palette !== cat.palette)
    err(where, "palette \"" + s.palette + "\" disagrees with category \"" + s.category +
      "\" (expected \"" + cat.palette + "\") — one colour per category, reused everywhere");

  if (!s.deck) err(where, "missing \"deck\" block (name/tag/blurb/risk) used on the slides");
  else DECK_FIELDS.forEach((f) => {
    if (!s.deck[f] || !String(s.deck[f]).trim()) err(where, "deck.\"" + f + "\" is missing or empty");
  });

  if (!s.disclosure) err(where, "missing \"disclosure\" block — it drives the disclosure chart");
  else DISCLOSURE_FIELDS.forEach((f) => {
    if (typeof s.disclosure[f] !== "boolean")
      err(where, "disclosure.\"" + f + "\" must be true or false, got " + JSON.stringify(s.disclosure[f]));
  });

  if (s.deck && s.deck.blurb && s.deck.blurb.length > 320)
    warn(where, "deck.blurb is " + s.deck.blurb.length + " chars; over ~320 tends to overflow its card");
  if (s.deck && s.deck.risk && s.deck.risk.length > 190)
    warn(where, "deck.risk is " + s.deck.risk.length + " chars; over ~190 tends to overflow the watch-out box");
  if (s.deck && s.deck.tag && s.deck.tag.length > 34)
    warn(where, "deck.tag is " + s.deck.tag.length + " chars; long tags overrun the pill");
});

// ---- problems ----
const seenOrder = {};
D.problems.forEach((p, i) => {
  const where = "problems[" + i + "]" + (p.title ? " (" + p.title.slice(0, 40) + ")" : "");
  ["title", "note", "solvedBy", "shortTitle", "shortSolvedBy"].forEach((f) => {
    if (!p[f] || !String(p[f]).trim()) err(where, "missing or empty \"" + f + "\"");
  });
  if (STATUSES.indexOf(p.status) < 0)
    err(where, "status \"" + p.status + "\" is not one of " + STATUSES.join(", "));
  if (typeof p.order !== "number") err(where, "\"order\" must be a number");
  else if (seenOrder[p.order]) warn(where, "order " + p.order + " is used more than once");
  else seenOrder[p.order] = true;
  if (p.shortTitle && p.shortTitle.length > 34)
    warn(where, "shortTitle is " + p.shortTitle.length + " chars; the scorecard tile fits about 34");
});

// ---- value themes ----
D.valueThemes.forEach((t, i) => {
  const where = "valueThemes[" + i + "]" + (t.title ? " (" + t.title.slice(0, 40) + ")" : "");
  ["title", "who", "note"].forEach((f) => {
    if (!t[f] || !String(t[f]).trim()) err(where, "missing or empty \"" + f + "\"");
  });
  if (typeof t.order !== "number") err(where, "\"order\" must be a number");
});

// ---- meta ----
if (!D.meta.title) err("meta", "missing \"title\"");
if (!D.meta.snapshotDate) err("meta", "missing \"snapshotDate\"");
if (!D.meta.slidesFileId) warn("meta", "no slidesFileId — publishing will be skipped");

report();

function report() {
  warnings.forEach((w) => console.warn("validate        warn  " + w));
  if (errors.length) {
    console.error("validate        " + errors.length + " problem" + (errors.length > 1 ? "s" : "") + " in data/research.json:");
    errors.forEach((e) => console.error("                  • " + e));
    process.exit(1);
  }
  const counts = STATUSES.map((st) => D.problems.filter((p) => p.status === st).length);
  console.log("validate        ok  " + D.sdks.length + " SDKs · " + D.problems.length +
    " problems (" + counts.join("/") + ") · " + D.valueThemes.length + " themes" +
    (warnings.length ? "  (" + warnings.length + " warning" + (warnings.length > 1 ? "s" : "") + ")" : ""));
}
