// Generates dist/working-deck.pptx — a WORKING document, one chapter per tab of
// the research spreadsheet, one slide per competitor in chapter one.
//
// Deliberately NOT wired into build.sh's publish path. This deck is meant to be
// edited by people in Google Slides; regenerating it would destroy their work.
// Run it by hand (`node src/build-workingdeck.js`) only when a fresh scaffold is
// genuinely wanted, and publish to a NEW file rather than over the live one.

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const T = require("./theme");

const ROOT = path.resolve(__dirname, "..");
const D = require("./data").load();
const W_ = D.narrative.workingDeck;

const { RISE, INK, MUTED, FAINT, GHOST, BORDER, FILL, FILL2, CALM, WHITE, PAIRS, HFONT, BFONT } = T;
const pal = (k) => PAIRS[k] || PAIRS.gray;
const catPair = (name) => pal((D.categories.find((c) => c.name === name) || {}).palette);
const EDGE_PAL = { technology: "blue", relationships: "orange", both: "gray" };
const EDGE_LABEL = { technology: "Technology", relationships: "Relationships", both: "Both" };

const R_CARD = 0.125, R_ROW = 0.104, R_IN = 0.083;
const W = 13.3, H = 7.5, M = 0.7, CW = W - 2 * M;

const FOCUS = ["cloudx", "mobilefuse", "digital-turbine", "bidmachine",
               "magnite", "pubmatic-openwrap", "inmobi", "nimbus"];

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = D.meta.owner;
pres.title = "In-app SDK — working document";

// ---------- primitives ----------
const light = () => { const s = pres.addSlide(); s.background = { color: WHITE }; return s; };
const blue  = () => { const s = pres.addSlide(); s.background = { color: RISE };  return s; };

function card(s, x, y, w, h, o) {
  o = o || {};
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: o.radius || R_CARD,
    fill: { color: o.fill || WHITE },
    line: { color: o.line || BORDER, width: 1, dashType: o.dash ? "dash" : "solid" },
  });
}
function pill(s, x, y, w, h, pair, text, size) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: h / 2,
    fill: { color: pair.bg }, line: { color: pair.bg, width: 0.5 } });
  s.addText(text, { x, y, w, h, isTextBox: true, margin: 0, fontFace: BFONT,
    fontSize: size || 9, bold: true, color: pair.fg, align: "center", valign: "middle" });
}
const pillW = (t, sz) => Math.max(0.7, String(t).length * (sz || 9) * 0.0084 + 0.34);

function fitSize(text, w, h, maxPt, minPt) {
  const EM = 0.52, LEAD = 1.3;
  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    const cpl = Math.max(1, Math.floor(w / (EM * pt / 72)));
    if (Math.ceil(String(text).length / cpl) * (LEAD * pt / 72) <= h) return pt;
  }
  return minPt;
}
function heading(s, eyebrow, title, sub) {
  if (eyebrow) s.addText(String(eyebrow).toUpperCase(), { x: M, y: 0.42, w: CW, h: 0.24,
    isTextBox: true, margin: 0, fontFace: BFONT, fontSize: 10.5, bold: true, charSpacing: 1.6, color: RISE });
  s.addText(title, { x: M, y: 0.68, w: CW, h: 0.6, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 28, bold: true, color: INK, charSpacing: -0.4, valign: "top" });
  if (sub) s.addText(sub, { x: M, y: 1.28, w: CW - 0.5, h: 0.42, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 12.5, color: MUTED, valign: "top" });
}
// dashed placeholder — signals "this is yours to fill in"
function todo(s, x, y, w, h, label) {
  card(s, x, y, w, h, { fill: FILL2, line: GHOST, dash: true, radius: R_ROW });
  s.addText(label, { x: x + 0.2, y, w: w - 0.4, h, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 10, italic: true, color: GHOST, valign: "middle" });
}
function chapter(n, c) {
  const s = blue();
  s.addText("CHAPTER " + n, { x: M, y: 2.6, w: 6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2.2, color: CALM });
  s.addText(c.title, { x: M, y: 3.02, w: 10.5, h: 0.9, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 38, bold: true, color: WHITE, charSpacing: -0.7, valign: "top" });
  s.addText(c.sub, { x: M, y: 4.1, w: 9, h: 0.6, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 14, color: CALM, lineSpacing: 21, valign: "top" });
}

// =====================================================================
// TITLE
// =====================================================================
{
  const s = blue();
  s.addText("WORKING DOCUMENT  ·  " + D.meta.snapshotDate, { x: M, y: 1.9, w: 10, h: 0.3,
    isTextBox: true, margin: 0, fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2.2, color: CALM });
  s.addText("In-app SDK\nmarket research", { x: M, y: 2.34, w: 10, h: 1.8, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, charSpacing: -0.8, lineSpacing: 50, valign: "top" });
  s.addText(W_.subtitle, { x: M, y: 4.3, w: 9.4, h: 0.9, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 14, color: CALM, lineSpacing: 21, valign: "top" });
  W_.chapters.forEach((c, i) => {
    s.addText((i + 1) + ".  " + c.title, { x: M + (i % 4) * 2.95, y: 5.5 + Math.floor(i / 4) * 0.42,
      w: 2.85, h: 0.34, isTextBox: true, margin: 0, fontFace: BFONT, fontSize: 11.5, color: WHITE });
  });
  s.addNotes("Working document. Chapters mirror the research spreadsheet tabs. This deck is not auto-regenerated — edits made here are safe.");
}

// =====================================================================
// CH 1 — COMPETITORS, one slide each
// =====================================================================
chapter(1, W_.chapters[0]);

FOCUS.forEach((id) => {
  const v = D.sdks.find((x) => x.id === id);
  const s = light();
  const cp = catPair(v.category);
  const ep = pal(EDGE_PAL[v.edge.basis]);

  s.addText(v.deck.name, { x: M, y: 0.44, w: 7.5, h: 0.56, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 28, bold: true, color: INK, charSpacing: -0.4, valign: "top" });
  pill(s, M, 1.06, Math.min(3, pillW(v.category, 9)), 0.3, cp, v.category.toUpperCase(), 9);
  pill(s, M + Math.min(3, pillW(v.category, 9)) + 0.14, 1.06,
       pillW("Edge: " + EDGE_LABEL[v.edge.basis], 9), 0.3, ep,
       ("Edge: " + EDGE_LABEL[v.edge.basis]).toUpperCase(), 9);

  // call status — the working-doc part
  const scheduled = (W_.callStatus || {})[id];
  const csW = 4.1;
  card(s, W - M - csW, 0.44, csW, 0.92, { fill: scheduled ? PAIRS.green.bg : FILL2,
    line: scheduled ? PAIRS.green.bg : GHOST, dash: !scheduled, radius: R_ROW });
  s.addText("CALL", { x: W - M - csW + 0.22, y: 0.54, w: csW - 0.44, h: 0.22, isTextBox: true,
    margin: 0, fontFace: BFONT, fontSize: 8.5, bold: true, charSpacing: 1.2,
    color: scheduled ? PAIRS.green.fg : GHOST });
  s.addText(scheduled || "Not scheduled", { x: W - M - csW + 0.22, y: 0.78, w: csW - 0.44, h: 0.46,
    isTextBox: true, margin: 0, fontFace: HFONT, fontSize: 13, bold: true,
    color: scheduled ? PAIRS.green.fg : GHOST, valign: "top" });

  s.addText(v.coreDifferentiator, { x: M, y: 1.52, w: CW, h: 0.62, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: fitSize(v.coreDifferentiator, CW, 0.62, 12.5, 10),
    color: MUTED, lineSpacing: 15.5, valign: "top" });

  // facts, two columns
  const facts = [
    ["What the SDK is based on", v.integrationModel],
    ["Scale", v.marketShare],
    ["Who it is for", v.positioning],
    ["Demand on the traffic", v.demandNetwork],
    ["Pricing / take rate", v.pricing],
    ["Edge — " + EDGE_LABEL[v.edge.basis], v.edge.note],
  ];
  const fw = (CW - 0.3) / 2;
  facts.forEach((f, i) => {
    const x = M + (i % 2) * (fw + 0.3);
    const y = 2.28 + Math.floor(i / 2) * 0.92;
    card(s, x, y, fw, 0.84, { fill: FILL2, radius: R_ROW });
    s.addText(f[0], { x: x + 0.2, y: y + 0.07, w: fw - 0.4, h: 0.22, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 9, bold: true, charSpacing: 0.8, color: RISE });
    s.addText(f[1], { x: x + 0.2, y: y + 0.29, w: fw - 0.4, h: 0.48, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(f[1], fw - 0.4, 0.48, 10, 7.5), color: MUTED,
      lineSpacing: 11.5, valign: "top" });
  });

  // watch-out + probe
  const bw = (CW - 0.3) / 2;
  [["WATCH-OUT", v.structuralWeakness, PAIRS.red],
   ["ASK THEM", D.narrative.interview.probes[id] || "", PAIRS.blue]].forEach((b, i) => {
    const x = M + i * (bw + 0.3);
    card(s, x, 5.08, bw, 0.92, { fill: b[2].bg, line: b[2].bg, radius: R_IN });
    s.addText(b[0], { x: x + 0.2, y: 5.16, w: bw - 0.4, h: 0.2, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 8.5, bold: true, charSpacing: 1.1, color: b[2].fg });
    s.addText(b[1], { x: x + 0.2, y: 5.36, w: bw - 0.4, h: 0.58, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(b[1], bw - 0.4, 0.58, 9.5, 7), color: b[2].fg,
      lineSpacing: 11, valign: "top" });
  });

  todo(s, M, 6.14, CW, 0.76, "Conversation notes — what they actually said, what they would not answer, what to follow up");
  s.addNotes("Fill the notes box after the call. Record refusals too: the pattern of what is sensitive is itself a finding.");
});

// =====================================================================
// CH 2 — BUSINESS POTENTIAL
// =====================================================================
chapter(2, W_.chapters[1]);
{
  const b = W_.business;
  const s = light();
  heading(s, "Chapter 2", "What to research, in order", b.lead);
  const cw = (CW - 0.3) / 2;
  b.items.forEach((it, i) => {
    const x = M + (i % 2) * (cw + 0.3);
    const y = 2.22 + Math.floor(i / 2) * 0.96;
    card(s, x, y, cw, 0.88, { fill: FILL2, radius: R_ROW });
    pill(s, x + 0.18, y + 0.16, 0.3, 0.3, PAIRS.blue, String(i + 1), 10);
    s.addText(it[0], { x: x + 0.58, y: y + 0.12, w: cw - 0.78, h: 0.24, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 11.5, bold: true, color: INK });
    s.addText(it[1], { x: x + 0.58, y: y + 0.36, w: cw - 0.78, h: 0.46, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(it[1], cw - 0.78, 0.46, 9.5, 7), color: MUTED,
      lineSpacing: 11, valign: "top" });
  });
  let y = 2.22 + Math.ceil(b.items.length / 2) * 0.96;
  b.rules.forEach((r, i) => {
    s.addShape(pres.ShapeType.roundRect, { x: M, y: y + i * 0.5, w: CW, h: 0.44,
      rectRadius: R_IN, fill: { color: RISE }, line: { color: RISE, width: 1 } });
    s.addText(r, { x: M + 0.24, y: y + i * 0.5, w: CW - 0.48, h: 0.44, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(r, CW - 0.48, 0.44, 11, 8.5), color: WHITE, valign: "middle" });
  });
  s.addNotes("Do not open with TAM. The comparison case is 'not yet', not 'do nothing'.");
}

// =====================================================================
// CH 3 — PROS & CONS
// =====================================================================
chapter(3, W_.chapters[2]);
{
  const pc = W_.prosCons;
  const s = light();
  heading(s, "Chapter 3", "Pros & cons of having an SDK",
    "As the research currently supports it. Add to either column as the interviews land.");
  const cw = (CW - 0.3) / 2;
  // one size across both columns, or the longer column renders visibly smaller
  const bodyPt = Math.min.apply(null, pc.pros.concat(pc.cons)
    .map((it) => fitSize(it[1], cw - 0.4, 0.28, 9.5, 7)));
  [["PROS", pc.pros, PAIRS.green], ["CONS", pc.cons, PAIRS.red]].forEach((col, ci) => {
    const x = M + ci * (cw + 0.3);
    s.addText(col[0], { x, y: 2.0, w: cw, h: 0.24, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, bold: true, charSpacing: 1.4, color: col[2].fg });
    col[1].forEach((it, i) => {
      const y = 2.32 + i * 0.68;
      card(s, x, y, cw, 0.6, { fill: col[2].bg, line: col[2].bg, radius: R_IN });
      s.addText(it[0], { x: x + 0.2, y: y + 0.06, w: cw - 0.4, h: 0.22, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: 11, bold: true, color: INK });
      s.addText(it[1], { x: x + 0.2, y: y + 0.28, w: cw - 0.4, h: 0.28, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: bodyPt, color: col[2].fg,
        lineSpacing: bodyPt * 1.2, valign: "top" });
    });
  });
  s.addNotes("The strongest 'con' is that much of the value is reachable server-side with no client code at all.");
}

// =====================================================================
// CH 4 — IMPLEMENTATION
// =====================================================================
chapter(4, W_.chapters[3]);
{
  const s = light();
  heading(s, "Chapter 4", "The rule, and the three shapes",
    "“In-app bidding” describes the auction, not where the code lives. The question that matters is whether adding a partner costs the publisher an app release.");
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 2.08, w: CW, h: 0.72, rectRadius: R_CARD,
    fill: { color: RISE }, line: { color: RISE, width: 1 } });
  s.addText("Demand that needs partner code in the app costs the publisher an app release. Demand that does not costs a dashboard toggle.",
    { x: M + 0.3, y: 2.08, w: CW - 0.6, h: 0.72, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 13, color: WHITE, valign: "middle" });

  const rows = [
    ["Pure server-side", "No", "Partner’s OpenRTB endpoint, on server-relayed signals", "Host’s generic renderer", "Toggle", PAIRS.green],
    ["SDK bidding", "Yes", "Partner’s server, on richer device signals", "Partner’s renderer", "App release", PAIRS.gold],
    ["Waterfall adapter", "Yes", "Partner’s SDK, sequential request", "Partner’s renderer", "App release", PAIRS.red],
  ];
  const cols = [2.3, 1.5, 3.6, 2.4, 1.6];
  const heads = ["Shape", "Partner code in app?", "Who bids", "Who renders", "Cost to add"];
  let hx = M;
  heads.forEach((hd, i) => {
    s.addShape(pres.ShapeType.roundRect, { x: hx, y: 3.0, w: cols[i], h: 0.36, rectRadius: R_IN,
      fill: { color: RISE }, line: { color: RISE, width: 0.5 } });
    s.addText(hd, { x: hx + 0.12, y: 3.0, w: cols[i] - 0.24, h: 0.36, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 9, bold: true, color: WHITE, valign: "middle" });
    hx += cols[i] + 0.08;
  });
  rows.forEach((r, ri) => {
    let x = M; const y = 3.44 + ri * 0.76;
    for (let i = 0; i < 5; i++) {
      const isLast = i === 4;
      card(s, x, y, cols[i], 0.68, { fill: isLast ? r[5].bg : FILL2, line: isLast ? r[5].bg : BORDER, radius: R_IN });
      s.addText(r[i], { x: x + 0.12, y, w: cols[i] - 0.24, h: 0.68, isTextBox: true, margin: 0,
        fontFace: i === 0 ? HFONT : BFONT, fontSize: fitSize(r[i], cols[i] - 0.24, 0.68, i === 0 ? 11 : 9.5, 7),
        bold: i === 0 || isLast, color: isLast ? r[5].fg : (i === 0 ? INK : MUTED),
        lineSpacing: 11, valign: "middle" });
      x += cols[i] + 0.08;
    }
  });
  s.addText("A partner SDK does not run the auction. It collects device signal before the bid and renders the creative after the win — the auction resolves server-side in every modern setup.",
    { x: M, y: 5.86, w: CW, h: 0.44, isTextBox: true, margin: 0, fontFace: BFONT,
      fontSize: 11, italic: true, color: MUTED, valign: "top" });
  todo(s, M, 6.4, CW, 0.5, "Confirm on the calls: of your demand partners, how many are pure server-side vs require the partner SDK — and what is the measured performance gap?");
  s.addNotes("The signal premium from having client code is the number that decides whether Rise should build an SDK at all.");
}

// =====================================================================
// CH 5 — VALUE PROPOSITION
// =====================================================================
chapter(5, W_.chapters[4]);
{
  const vp = W_.valueProp;
  const s = light();
  heading(s, "Chapter 5", "What Rise would credibly claim",
    "Split as the spreadsheet does — technical and commercial. Each needs evidence before it goes in front of a publisher.");
  const cw = (CW - 0.3) / 2;
  [["TECHNICAL", vp.technical, PAIRS.blue], ["BUSINESS", vp.business, PAIRS.teal]].forEach((col, ci) => {
    const x = M + ci * (cw + 0.3);
    s.addText(col[0], { x, y: 2.08, w: cw, h: 0.24, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, bold: true, charSpacing: 1.4, color: col[2].fg });
    col[1].forEach((it, i) => {
      const y = 2.42 + i * 1.08;
      card(s, x, y, cw, 0.96, { fill: col[2].bg, line: col[2].bg });
      s.addText(it[0], { x: x + 0.22, y: y + 0.1, w: cw - 0.44, h: 0.26, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: 12.5, bold: true, color: INK });
      s.addText(it[1], { x: x + 0.22, y: y + 0.38, w: cw - 0.44, h: 0.5, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: fitSize(it[1], cw - 0.44, 0.5, 10, 7.5), color: col[2].fg,
        lineSpacing: 12, valign: "top" });
    });
  });
  todo(s, M, 5.86, CW, 0.62, "What evidence do we have for each claim today, and what would we need to prove it to a publisher?");
}

// =====================================================================
// CH 6 — TEAM
// =====================================================================
chapter(6, W_.chapters[5]);
{
  const s = light();
  heading(s, "Chapter 6", "Roles required",
    "Knowledge each role needs. Headcount and cost are for the finance workstream to fill.");
  const rowH = 0.64;
  W_.team.forEach((t, i) => {
    const y = 2.1 + i * (rowH + 0.1);
    card(s, M, y, CW, rowH, { radius: R_ROW });
    s.addText(t[0], { x: M + 0.24, y, w: 1.9, h: rowH, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 12, bold: true, color: INK, valign: "middle" });
    s.addText(t[1], { x: M + 2.3, y, w: CW - 5.0, h: rowH, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(t[1], CW - 5.0, rowH, 10, 8), color: MUTED,
      lineSpacing: 11.5, valign: "middle" });
    todo(s, W - M - 2.4, y + 0.11, 2.2, rowH - 0.22, "Headcount / cost");
  });
  s.addNotes("Model year-3 run-rate, not year-1 build. The run cost is what gets missed.");
}

// =====================================================================
// CH 7 — PUBLISHERS
// =====================================================================
chapter(7, W_.chapters[6]);
{
  const s = light();
  heading(s, "Chapter 7", "Publisher conversations",
    "The other half of the picture. Competitors tell you how the market works; publishers tell you whether anyone would adopt it.");
  const cw = (CW - 0.3 * 2) / 3;
  W_.publishers.forEach((p, i) => {
    const x = M + (i % 3) * (cw + 0.3);
    const y = 2.2 + Math.floor(i / 3) * 1.3;
    card(s, x, y, cw, 1.16);
    s.addText(p, { x: x + 0.22, y: y + 0.14, w: cw - 0.44, h: 0.3, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 15, bold: true, color: INK });
    todo(s, x + 0.22, y + 0.52, cw - 0.44, 0.5, "Call? Notes");
  });
  const asks = [
    "How many SDKs are in your app today, and what would make you add another?",
    "Who decides — monetization, engineering, or exec? Who can veto?",
    "What would a new SDK have to be worth, in revenue terms, to justify a release?",
    "Have you ever removed an SDK? Why?",
  ];
  s.addText("What to ask publishers", { x: M, y: 4.86, w: 5, h: 0.26, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 13, bold: true, color: INK });
  asks.forEach((a, i) => {
    const x = M + (i % 2) * (CW / 2 + 0.15);
    const y = 5.2 + Math.floor(i / 2) * 0.56;
    card(s, x, y, CW / 2 - 0.15, 0.48, { fill: PAIRS.blue.bg, line: PAIRS.blue.bg, radius: R_IN });
    s.addText(a, { x: x + 0.2, y, w: CW / 2 - 0.55, h: 0.48, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: fitSize(a, CW / 2 - 0.55, 0.48, 10, 8), color: PAIRS.blue.fg,
      lineSpacing: 11.5, valign: "middle" });
  });
  s.addNotes("Publisher calls are the reality check on the distribution assumption, which is the single biggest risk in the model.");
}

const out = path.join(ROOT, "dist", "working-deck.pptx");
fs.mkdirSync(path.dirname(out), { recursive: true });
pres.writeFile({ fileName: out }).then(() => {
  console.log("working deck    " + pres.slides.length + " slides · " + FOCUS.length +
    " competitors · " + W_.chapters.length + " chapters  →  dist/working-deck.pptx");
});
