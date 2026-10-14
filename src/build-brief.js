// Generates dist/brief.md — a competitor briefing for the focus set, shaped for
// Google Docs' Markdown importer.
//
// Two importer rules learned the hard way, both load-bearing here:
//   * inline bold does NOT render inside table cells — it lands as literal
//     asterisks. So tables carry plain short strings only.
//   * inline bold DOES render in paragraphs. So per-vendor facts are labelled
//     paragraphs rather than a two-column table, which reads better anyway.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const D = require("./data").load();

// the focus set, in the order it was given
const FOCUS = ["cloudx", "mobilefuse", "digital-turbine", "bidmachine",
               "magnite", "pubmatic-openwrap", "inmobi", "nimbus"];

const EDGE_LABEL = { technology: "Technology", relationships: "Relationships", both: "Both" };
const PROBE = D.narrative.interview.probes;
const QUESTIONS = D.narrative.interview.sections;

const sdk = (id) => {
  const s = D.sdks.find((x) => x.id === id);
  if (!s) throw new Error("unknown sdk: " + id);
  return s;
};
// collapse newlines; escape pipes so a value is safe inside a table cell
const cell = (s) => String(s == null ? "" : s).replace(/\s*\n+\s*/g, " ").replace(/\|/g, "\\|").trim();
const flat = (s) => String(s == null ? "" : s).replace(/\s*\n+\s*/g, " ").trim();

const out = [];
const L = (s) => out.push(s == null ? "" : s);

L("# In-app SDK competitors — briefing");
L("");
L("_Eight vendors shortlisted for interview · snapshot " + D.meta.snapshotDate +
  " · generated from `data/research.json`_");
L("");
L("Reading copy of the competitor research. The working tracker — call scheduling, " +
  "conversation notes, publisher outreach — stays in the spreadsheet; nothing here writes back to it.");
L("");

// ---------- at a glance (short plain cells only) ----------
L("## At a glance");
L("");
L("| Vendor | Category | Edge | Open stack | Take rate published |");
L("| --- | --- | --- | --- | --- |");
FOCUS.forEach((id) => {
  const s = sdk(id);
  const o = s.openStack || {};
  const open = o.prebid && o.openSource ? "Prebid + source"
    : o.prebid ? "Prebid path" : o.openSource ? "Source published" : "Proprietary";
  L("| " + [cell(s.deck.name), cell(s.category), EDGE_LABEL[s.edge.basis], open,
            s.disclosure.takeRate ? "Yes" : "No"].join(" | ") + " |");
});
L("");
L("_“Edge” asks whether a rival would have to rebuild the thing (technology) or negotiate " +
  "for it (relationships). Across all " + D.figures.total + " vendors tracked, only " +
  D.figures["disclosed.takeRate"] + " publish a take rate at all._");
L("");

// ---------- per vendor (labelled paragraphs, so bold survives) ----------
L("## The eight");
FOCUS.forEach((id) => {
  const s = sdk(id);
  const o = s.openStack || {};
  const flags = [];
  if (o.prebid) flags.push("Prebid Mobile path");
  if (o.openSource) flags.push("publishes source");
  const openLine = flags.length
    ? flags.join(" + ").replace(/^./, (c) => c.toUpperCase()) + ". " + flat(o.note)
    : "Proprietary — no Prebid path, no published source.";

  L("");
  L("### " + flat(s.deck.name) + " — " + flat(s.category));
  L("");
  L(flat(s.coreDifferentiator));
  L("");
  [
    ["What the SDK is based on", s.integrationModel],
    ["Open stack", openLine],
    ["Scale", s.marketShare],
    ["Who it is for", s.positioning],
    ["Demand on the traffic", s.demandNetwork],
    ["Pricing / take rate", s.pricing],
    ["Edge — " + EDGE_LABEL[s.edge.basis], s.edge.note],
  ].forEach(([k, v]) => { L("**" + k + ".** " + flat(v)); L(""); });

  L("**Watch-out.** " + flat(s.structuralWeakness));
  if (PROBE[id]) { L(""); L("**Ask them.** " + flat(PROBE[id])); }
});

// ---------- questions ----------
L("");
L("## SDK interview questions");
L("");
L("Ask the first five of everyone, identically, so the answers compare. Then the company probe " +
  "above, then whatever else the conversation earns. Cap it at ten.");
QUESTIONS.forEach((sec) => {
  L("");
  L("### " + sec[0]);
  if (sec[2]) { L(""); L("_" + flat(sec[2]) + "_"); }
  L("");
  sec[1].forEach((q) => L("- " + flat(q).replace(/<\/?b>/g, "**")));
});
L("");
L("**Two notes.** Ask about the past, not the future — “how did you get your first fifty " +
  "publishers” gets the truth, “what’s your growth strategy” gets the website. " +
  "And record what they _won’t_ answer; the pattern of what is sensitive is itself a finding.");

const file = path.join(ROOT, "dist", "brief.md");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.join("\n") + "\n");
console.log("brief           " + FOCUS.length + " focus vendors · " +
  out.join("\n").length + " chars  →  dist/brief.md");
