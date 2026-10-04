// Generates dist/<title>.pptx from data/research.json, styled with Rise tokens.
// Slide count adapts to the data: tier slides are driven by each SDK's `tier`,
// and every "N of M" figure is derived, never typed.

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const T = require("./theme");

const ROOT = path.resolve(__dirname, "..");
const D = require("./data").load();
const N = D.narrative;

const { RISE, INK, MUTED, FAINT, BORDER, FILL, FILL2, CALM, WHITE, PAIRS, HFONT, BFONT } = T;
const pal = (k) => PAIRS[k] || PAIRS.gray;
const catPair = (name) => pal((D.categories.find((c) => c.name === name) || {}).palette);
const statusPair = (st) => pal(T.STATUS[st]);

const R_CARD = 0.125, R_ROW = 0.104, R_IN = 0.083;
const W = 13.3, H = 7.5, M = 0.7, CW = W - 2 * M;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = D.meta.owner;
pres.title = D.meta.title;

// ---------- primitives ----------
const lightSlide = () => { const s = pres.addSlide(); s.background = { color: WHITE }; return s; };
const riseSlide  = () => { const s = pres.addSlide(); s.background = { color: RISE };  return s; };

function card(s, x, y, w, h, o) {
  o = o || {};
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: o.radius || R_CARD,
    fill: { color: o.fill || WHITE }, line: { color: o.line || BORDER, width: 1 },
  });
}
function pill(s, x, y, w, h, pair, text, size) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: h / 2,
    fill: { color: pair.bg }, line: { color: pair.bg, width: 0.5 },
  });
  s.addText(text, {
    x, y, w, h, isTextBox: true, margin: 0, fontFace: BFONT, fontSize: size || 10,
    bold: true, color: pair.fg, align: "center", valign: "middle",
  });
}
// pill sized to its label (Roboto bold caps ≈ 0.075in per char at 9pt)
const pillW = (text, size) => Math.max(0.7, text.length * (size || 9) * 0.0084 + 0.34);

// Largest point size at which `text` still fits a w x h inch box. Column widths
// shrink as vendors are added, so picking this per card is what keeps the deck
// from clipping copy the way a fixed size would.
function fitSize(text, w, h, maxPt, minPt) {
  const CHAR_EM = 0.52;   // mean Roboto advance width, slightly conservative
  const LEAD = 1.3;       // line height multiple
  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    const charsPerLine = Math.max(1, Math.floor(w / (CHAR_EM * pt / 72)));
    const lines = Math.ceil(String(text).length / charsPerLine);
    if (lines * (LEAD * pt / 72) <= h) return pt;
  }
  return minPt;
}

function heading(s, eyebrow, title, sub) {
  if (eyebrow) s.addText(String(eyebrow).toUpperCase(), {
    x: M, y: 0.44, w: CW, h: 0.24, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 10.5, bold: true, charSpacing: 1.6, color: RISE,
  });
  s.addText(title, {
    x: M, y: eyebrow ? 0.7 : 0.52, w: CW, h: 0.6, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 30, bold: true, color: INK, charSpacing: -0.4, valign: "top",
  });
  if (sub) s.addText(sub, {
    x: M, y: eyebrow ? 1.32 : 1.14, w: CW - 0.6, h: 0.42, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 13, color: MUTED, valign: "top",
  });
}
function footnote(s, text, onBlue) {
  if (!text) return;
  s.addText(text, {
    x: M, y: H - 0.6, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 9.5, italic: true, color: onBlue ? CALM : FAINT,
  });
}
function divider(part, title, sub, notes) {
  const s = riseSlide();
  s.addText(String(part).toUpperCase(), {
    x: M, y: 2.55, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2.2, color: CALM,
  });
  s.addText(title, {
    x: M, y: 3.0, w: 9.6, h: 1.5, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 38, bold: true, color: WHITE, charSpacing: -0.7, lineSpacing: 44, valign: "top",
  });
  s.addText(sub, {
    x: M, y: 4.66, w: 8.6, h: 0.8, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 14, color: CALM, lineSpacing: 21, valign: "top",
  });
  if (notes) s.addNotes(notes);
}

// ---------- derived figures ----------
const n = D.sdks.length;
const problems = D.problems.slice().sort((a, b) => a.order - b.order);
const themes = D.valueThemes.slice().sort((a, b) => a.order - b.order);
const STATUS_ORDER = ["solved", "partial", "open"];
const byStatus = (st) => problems.filter((p) => p.status === st);
const tierMembers = (id) => D.sdks.filter((s) => s.tier === id);
const disclosed = (key) => D.sdks.filter((s) => s.disclosure[key]).length;
const catCount = (name) => D.sdks.filter((s) => s.category === name).length;

// =====================================================================
// 1 — TITLE
// =====================================================================
{
  const s = riseSlide();
  s.addText(("Market research snapshot  ·  " + D.meta.snapshotDate).toUpperCase(), {
    x: M, y: 1.6, w: 10, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2.2, color: CALM,
  });
  s.addText(D.meta.title, {
    x: M, y: 2.04, w: 9.6, h: 1.9, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, charSpacing: -0.8, lineSpacing: 50, valign: "top",
  });
  s.addText(D.meta.subtitle, {
    x: M, y: 3.98, w: 8.6, h: 0.7, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 14.5, color: CALM, lineSpacing: 22, valign: "top",
  });
  const chips = [
    [n, "SDKs profiled"],
    [D.categories.length, "categories"],
    [problems.length, "industry problems"],
    [themes.length, "value themes"],
  ];
  chips.forEach((c, i) => {
    const x = M + i * 2.42;
    s.addText(String(c[0]), {
      x, y: 5.2, w: 2.2, h: 0.62, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 36, bold: true, color: WHITE, charSpacing: -0.6,
    });
    s.addText(c[1], {
      x, y: 5.86, w: 2.2, h: 0.3, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 11.5, color: CALM,
    });
  });
  s.addText(D.meta.owner, {
    x: M, y: H - 0.72, w: 6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 10.5, color: CALM, charSpacing: 1,
  });
  s.addNotes("Static snapshot taken " + D.meta.snapshotDate + ". " + n + " vendors across " +
    D.categories.length + " structural categories.");
}

// =====================================================================
// 2 — COVERAGE
// =====================================================================
{
  const s = lightSlide();
  heading(s, "Orientation", "What this snapshot covers",
    n + " vendors, profiled on the same " + D.fields.length +
    " technical fields — formats, integration model, footprint, reporting, privacy, pricing, demand access and proprietary tech.");

  let y = 2.05;
  const rowH = Math.min(0.82, (5.0 - 0.12 * (D.categories.length - 1)) / D.categories.length);
  D.categories.forEach((c) => {
    const pair = pal(c.palette);
    const members = D.sdks.filter((x) => x.category === c.name).map((x) => x.name).join(" · ");
    card(s, M, y, CW, rowH, { radius: R_ROW });
    pill(s, M + 0.22, y + rowH / 2 - 0.17, 1.92, 0.34, pair, c.name.toUpperCase(), 9);
    s.addText(String(catCount(c.name)), {
      x: M + 2.3, y: y + rowH / 2 - 0.21, w: 0.5, h: 0.42, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 20, bold: true, color: RISE, valign: "middle",
    });
    s.addText(members, {
      x: M + 2.95, y: y + rowH / 2 - 0.21, w: CW - 3.2, h: 0.42, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 12, color: MUTED, valign: "middle",
    });
    y += rowH + 0.12;
  });
  footnote(s, "Several vendors operate in more than one layer and are classified by their primary role.");
  s.addNotes("Comparing market share across these categories is not apples-to-apples.");
}

// =====================================================================
// 3 — ADDED VALUE
// =====================================================================
{
  const s = lightSlide();
  heading(s, "Synthesis", "Added value at a glance",
    "What each cluster of SDKs actually contributes, grouped by the kind of value it adds.");
  const cols = 2;
  const cw = (CW - 0.36) / cols;
  const rows = Math.ceil(themes.length / cols);
  const ch = Math.min(1.52, (4.8 - 0.22 * (rows - 1)) / rows);
  themes.forEach((t, i) => {
    const x = M + (i % cols) * (cw + 0.36);
    const y = 2.0 + Math.floor(i / cols) * (ch + 0.22);
    card(s, x, y, cw, ch);
    pill(s, x + 0.22, y + 0.22, 0.34, 0.34, PAIRS.blue, String(i + 1), 11);
    s.addText(t.title, {
      x: x + 0.66, y: y + 0.2, w: cw - 0.88, h: 0.3, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 13, bold: true, color: INK, valign: "top",
    });
    s.addText(t.who, {
      x: x + 0.66, y: y + 0.52, w: cw - 0.88, h: 0.26, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, bold: true, color: RISE,
    });
    s.addText(t.note, {
      x: x + 0.66, y: y + 0.8, w: cw - 0.88, h: ch - 0.88, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, color: MUTED, lineSpacing: 13.5, valign: "top",
    });
  });
  s.addNotes("Only two of these — verifiable auction trust and brand demand access — are genuinely contested whitespace.");
}

// =====================================================================
// 4 — DIVIDER
// =====================================================================
divider("Part one", "Industry problems:\nwhat's already solved",
  problems.length + " known pain points in in-app mediation, scored against what the " + n + " tracked SDKs actually deliver.",
  STATUS_ORDER.map((st) => byStatus(st).length + " " + T.STATUS_LABEL[st].toLowerCase()).join(", ") + ".");

// =====================================================================
// 5 — SCORECARD MATRIX
// =====================================================================
{
  const s = lightSlide();
  const counts = STATUS_ORDER.map((st) => byStatus(st).length);
  heading(s, "Scorecard",
    counts[0] + " solved, " + counts[1] + " partial, " + counts[2] + " open",
    problems.length + " pain points scored against the " + n + " SDKs tracked in this snapshot.");

  const rowH = 1.32, tileW = 2.9, tileGap = 0.2, tileX0 = 3.5, perRow = 3;
  STATUS_ORDER.forEach((st, r) => {
    const pair = statusPair(st);
    const items = byStatus(st);
    const y = 2.2 + r * (rowH + 0.1);
    pill(s, M, y + 0.34, 1.66, 0.32, pair, T.STATUS_LABEL[st].toUpperCase(), 9.5);
    s.addText(items.length + " of " + problems.length + " problems", {
      x: M, y: y + 0.74, w: 2.6, h: 0.26, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 11, color: FAINT,
    });
    items.slice(0, perRow).forEach((p, c) => {
      const x = tileX0 + c * (tileW + tileGap);
      card(s, x, y, tileW, rowH, { fill: pair.bg, line: pair.bg });
      pill(s, x + 0.2, y + 0.2, 0.32, 0.32, { bg: pair.fg, fg: WHITE }, String(p.order), 11);
      s.addText(p.shortTitle, {
        x: x + 0.62, y: y + 0.2, w: tileW - 0.84, h: 0.52, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: 11.5, bold: true, color: INK, valign: "top",
      });
      s.addText(p.shortSolvedBy, {
        x: x + 0.2, y: y + 0.82, w: tileW - 0.4, h: 0.38, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 9.5, color: pair.fg, lineSpacing: 12, valign: "top",
      });
    });
    if (items.length > perRow) {
      s.addText("+" + (items.length - perRow) + " more on the detail slide", {
        x: tileX0, y: y + rowH - 0.02, w: 4, h: 0.2, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 8.5, italic: true, color: FAINT,
      });
    }
  });
  footnote(s, "Each tile is expanded on the following slides. \"Solved\" means at least one tracked vendor ships a credible answer, not that the market has adopted it.");
  s.addNotes("Solved = at least one vendor genuinely does it. Partial = attempts exist, nothing at scale. Open = nobody in the set addresses it.");
}

// =====================================================================
// 6..n — PROBLEM DETAIL, one slide per status (paginated at 3 per slide)
// =====================================================================
const DETAIL_COPY = {
  solved:  { eyebrow: "Solved", title: "Solved — but usually by one vendor", sub: "Where the snapshot shows a genuine, shipped answer.",
             foot: "\"Solved\" here means at least one tracked vendor ships a credible answer — not that the market has adopted it." },
  partial: { eyebrow: "Partially solved", title: "Partially solved — attempts exist, scale doesn't", sub: "Live, recent attempts at real problems, none yet proven at market scale.", foot: null },
  open:    { eyebrow: "Open gaps", title: "Open gaps — nobody has solved these", sub: "The clearest whitespace in the category as of this snapshot.", foot: null },
};
const PER_SLIDE = 3;

STATUS_ORDER.forEach((st) => {
  const items = byStatus(st);
  if (!items.length) return;
  const pair = statusPair(st);
  const copy = DETAIL_COPY[st];
  for (let page = 0; page * PER_SLIDE < items.length; page++) {
    const slice = items.slice(page * PER_SLIDE, (page + 1) * PER_SLIDE);
    const s = lightSlide();
    heading(s, copy.eyebrow, copy.title + (page ? " (cont.)" : ""), copy.sub);
    let y = 2.1;
    slice.forEach((p) => {
      card(s, M, y, CW, 1.36);
      pill(s, M + 0.24, y + 0.22, 0.4, 0.4, { bg: pair.fg, fg: WHITE }, String(p.order), 12);
      s.addText(p.title, {
        x: M + 0.86, y: y + 0.19, w: CW - 2.6, h: 0.3, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: 13.5, bold: true, color: INK,
      });
      pill(s, W - M - 1.72, y + 0.2, 1.5, 0.3, pair, T.STATUS_LABEL[st].toUpperCase(), 9);
      s.addText(p.note, {
        x: M + 0.86, y: y + 0.5, w: CW - 1.14, h: 0.42, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 11, color: MUTED, lineSpacing: 14, valign: "top",
      });
      s.addText([
        { text: "Addressed by:  ", options: { bold: true, color: RISE } },
        { text: p.solvedBy, options: { color: FAINT } },
      ], {
        x: M + 0.86, y: y + 0.97, w: CW - 1.14, h: 0.28, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 10.5,
      });
      y += 1.5;
    });
    footnote(s, copy.foot);
    if (N.problemNotes && N.problemNotes[st]) s.addNotes(N.problemNotes[st]);
  }
});

// =====================================================================
// SELF-PREFERENCING
// =====================================================================
{
  const c = N.selfPreferencing;
  const s = lightSlide();
  heading(s, c.eyebrow, c.title, c.sub);
  const bw = (CW - 1.4) / c.steps.length;
  c.steps.forEach((b, i) => {
    const x = M + i * (bw + 0.7);
    card(s, x, 2.15, bw, 1.75);
    pill(s, x + 0.26, 2.38, 0.36, 0.36, PAIRS.blue, String(i + 1), 12);
    s.addText(b[0], {
      x: x + 0.26, y: 2.9, w: bw - 0.52, h: 0.3, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 13.5, bold: true, color: INK,
    });
    s.addText(b[1], {
      x: x + 0.26, y: 3.24, w: bw - 0.52, h: 0.56, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 11, color: MUTED, lineSpacing: 14, valign: "top",
    });
    if (i < c.steps.length - 1) s.addShape(pres.ShapeType.rightArrow, {
      x: x + bw + 0.16, y: 2.93, w: 0.38, h: 0.2, fill: { color: CALM },
    });
  });
  s.addText("Who this applies to", {
    x: M, y: 4.2, w: 5, h: 0.3, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 13, bold: true, color: INK,
  });
  const ww = (CW - 0.36) / 2;
  c.who.forEach((r, i) => {
    const x = M + (i % 2) * (ww + 0.36);
    const y = 4.6 + Math.floor(i / 2) * 0.82;
    card(s, x, y, ww, 0.72, { fill: FILL2, radius: R_ROW });
    s.addText(r[0], {
      x: x + 0.24, y: y + 0.09, w: ww - 0.48, h: 0.26, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 12, bold: true, color: INK,
    });
    s.addText(r[1], {
      x: x + 0.24, y: y + 0.37, w: ww - 0.48, h: 0.28, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, color: MUTED,
    });
  });
  footnote(s, c.footnote);
  s.addNotes("The AI advantage and the conflict of interest are the same fact viewed from two sides.");
}

// =====================================================================
// DIVIDER — PLAYERS
// =====================================================================
divider("Part two", "The players",
  "Three tiers: the AI flywheels that dominate, the challengers attacking transparency and weight, and the adjacent plays that aren't really mediation at all.",
  "The tiering matters more than the individual profiles — it says which competitive dynamic each vendor is in.");

// =====================================================================
// TIER SLIDES — driven by each SDK's `tier`
// =====================================================================
N.tiers.forEach((tier) => {
  const members = tierMembers(tier.id);
  if (!members.length) return;
  // balance the pages rather than filling the first: 5 members reads better
  // as 3 + 2 than as 4 + 1, which leaves a lone card on an empty slide
  const MAXC = 4;
  const pages = Math.ceil(members.length / MAXC);
  const per = Math.ceil(members.length / pages);
  for (let page = 0; page * per < members.length; page++) {
    const group = members.slice(page * per, (page + 1) * per);
    const s = lightSlide();
    heading(s, tier.eyebrow, tier.title + (page ? " (cont.)" : ""), tier.sub);
    const gap = 0.32;
    const cwid = (CW - gap * (group.length - 1)) / group.length;
    const dense = group.length >= 4;
    const textW = cwid - 0.52, riskW = cwid - 0.84;
    // size the body copy to the narrowest card on this slide, so all cards match
    const bodySize = Math.min.apply(null, group.map((p) =>
      fitSize(p.deck.blurb, textW, 1.5, dense ? 10 : 11, 8)));
    const lead = bodySize * 1.3;
    const riskSize = Math.min.apply(null, group.map((p) =>
      fitSize(p.deck.risk, riskW, 0.84, dense ? 9.5 : 10, 7.5)));
    group.forEach((p, i) => {
      const x = M + i * (cwid + gap);
      const pair = catPair(p.category);
      card(s, x, 2.05, cwid, 4.25);
      s.addText(p.deck.name, {
        x: x + 0.26, y: 2.3, w: cwid - 0.52, h: 0.44, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: dense ? 15.5 : 17, bold: true, color: INK, charSpacing: -0.3, valign: "top",
      });
      const tw = Math.min(cwid - 0.52, pillW(p.deck.tag, 8.5));
      pill(s, x + 0.26, 2.82, tw, 0.3, pair, p.deck.tag.toUpperCase(), 8.5);
      s.addText(p.deck.blurb, {
        x: x + 0.26, y: 3.28, w: cwid - 0.52, h: 1.5, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: bodySize, color: MUTED, lineSpacing: lead, valign: "top",
      });
      card(s, x + 0.26, 4.88, cwid - 0.52, 1.26, { fill: PAIRS.red.bg, line: PAIRS.red.bg, radius: R_IN });
      s.addText("WATCH-OUT", {
        x: x + 0.42, y: 5.0, w: cwid - 0.84, h: 0.22, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 8.5, bold: true, charSpacing: 1.1, color: PAIRS.red.fg,
      });
      s.addText(p.deck.risk, {
        x: x + 0.42, y: 5.24, w: riskW, h: 0.84, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: riskSize, color: PAIRS.red.fg, lineSpacing: riskSize * 1.3, valign: "top",
      });
    });
    footnote(s, tier.footnote);
    if (tier.notes) s.addNotes(tier.notes);
  }
});

// =====================================================================
// ADJACENT PLAYS
// =====================================================================
{
  const all = tierMembers("adjacent");
  const MAXROWS = 6;             // past this the rows get too short for the copy
  const pageCount = Math.ceil(all.length / MAXROWS) || 1;
  const perPage = Math.ceil(all.length / pageCount);
  for (let page = 0; page * perPage < all.length; page++) {
    const members = all.slice(page * perPage, (page + 1) * perPage);
    if (!members.length) break;
    const c = N.adjacent;
    const s = lightSlide();
    heading(s, c.eyebrow, c.title + (page ? " (cont.)" : ""), c.sub);
    const avail = 4.7;
    const rowH = Math.min(0.86, (avail - 0.12 * (members.length - 1)) / members.length);
    // a continuation page holds fewer rows at full height, so centre the block
    // vertically rather than leaving all the slack at the bottom
    const used = members.length * rowH + 0.12 * (members.length - 1);
    let y = 2.02 + Math.max(0, (avail - used) / 2);
    members.forEach((p) => {
      const pair = catPair(p.category);
      card(s, M, y, CW, rowH, { radius: R_ROW });
      s.addText(p.deck.name, {
        x: M + 0.24, y: y + 0.13, w: 2.4, h: 0.28, isTextBox: true, margin: 0,
        fontFace: HFONT, fontSize: 12.5, bold: true, color: INK,
      });
      pill(s, M + 0.24, y + 0.45, 1.86, 0.28, pair, p.category.toUpperCase(), 8);
      s.addText(p.deck.blurb, {
        x: M + 2.5, y: y + 0.14, w: CW - 2.8, h: rowH - 0.24, isTextBox: true, margin: 0,
        fontFace: BFONT, fontSize: 10.5, color: MUTED, lineSpacing: 13.5, valign: "top",
      });
      y += rowH + 0.12;
    });
    footnote(s, c.footnote);
    if (c.notes) s.addNotes(c.notes);
  }
}

// =====================================================================
// DISCLOSURE
// =====================================================================
{
  const c = N.disclosure;
  const s = lightSlide();
  heading(s, c.eyebrow, c.title, "Of the " + n + " SDKs profiled, how many publish each attribute in their own materials.");

  const bars = c.bars.map((b) => ({ label: b.label, v: disclosed(b.key) }))
    .sort((a, b) => b.v - a.v);
  const trackX = 3.75, trackW = 4.05, unit = trackW / n, barH = 0.34;
  const step = Math.min(0.78, 3.2 / bars.length);
  bars.forEach((b, i) => {
    const y = 2.34 + i * step;
    const low = b.v <= n / 2;
    const col = low ? PAIRS.red.fg : RISE;
    s.addText(b.label, {
      x: M, y: y - 0.03, w: 2.9, h: 0.4, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 12, color: INK, align: "right", valign: "middle",
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: trackX, y, w: trackW, h: barH, rectRadius: barH / 2,
      fill: { color: FILL }, line: { color: FILL, width: 0.5 },
    });
    if (b.v > 0) s.addShape(pres.ShapeType.roundRect, {
      x: trackX, y, w: Math.max(unit * b.v, barH), h: barH, rectRadius: barH / 2,
      fill: { color: col }, line: { color: col, width: 0.5 },
    });
    s.addText(b.v + " / " + n, {
      x: trackX + trackW + 0.14, y: y - 0.03, w: 0.9, h: 0.4, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 12, bold: true, color: col, valign: "middle",
    });
  });
  s.addText("Vendors disclosing, out of the " + n + " profiled", {
    x: trackX, y: 5.5, w: 4.6, h: 0.28, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 10, italic: true, color: FAINT,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.7, y: 2.1, w: 3.9, h: 3.62, rectRadius: R_CARD,
    fill: { color: RISE }, line: { color: RISE, width: 1 },
  });
  s.addText(disclosed(c.calloutKey) + " of " + n, {
    x: 8.98, y: 2.42, w: 3.35, h: 0.78, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 38, bold: true, color: WHITE, charSpacing: -0.7,
  });
  s.addText(c.calloutLead, {
    x: 8.98, y: 3.22, w: 3.35, h: 0.6, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 13, color: WHITE, lineSpacing: 18, valign: "top",
  });
  s.addText(c.calloutBody, {
    x: 8.98, y: 3.96, w: 3.35, h: 1.6, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 11, color: CALM, lineSpacing: 15, valign: "top",
  });
  footnote(s, c.footnote);
  s.addNotes("Formats and reporting are well documented because they're sales material. Price and footprint are not, because they invite comparison.");
}

// =====================================================================
// WHITESPACE
// =====================================================================
{
  const c = N.whitespace;
  const s = riseSlide();
  s.addText(c.eyebrow.toUpperCase(), {
    x: M, y: 0.66, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2.2, color: CALM,
  });
  s.addText(c.title, {
    x: M, y: 1.06, w: 10.5, h: 0.7, isTextBox: true, margin: 0,
    fontFace: HFONT, fontSize: 32, bold: true, color: WHITE, charSpacing: -0.6,
  });
  s.addText(c.sub, {
    x: M, y: 1.86, w: 10.2, h: 0.6, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 14, color: CALM, lineSpacing: 21,
  });
  const pw = (CW - 0.5) / c.pillars.length;
  c.pillars.forEach((p, i) => {
    const x = M + i * (pw + 0.5);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.74, w: pw, h: 2.72, rectRadius: R_CARD,
      fill: { color: WHITE }, line: { color: WHITE, width: 1 },
    });
    s.addText(p[0], {
      x: x + 0.34, y: 2.96, w: 1.2, h: 0.5, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 26, bold: true, color: RISE, charSpacing: -0.5,
    });
    s.addText(p[1], {
      x: x + 0.34, y: 3.54, w: pw - 0.68, h: 0.58, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 17, bold: true, color: INK, charSpacing: -0.3, valign: "top",
    });
    s.addText(p[2], {
      x: x + 0.34, y: 4.2, w: pw - 0.68, h: 1.1, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 11.5, color: MUTED, lineSpacing: 15.5, valign: "top",
    });
  });
  s.addText(c.kicker, {
    x: M, y: 5.78, w: 11.4, h: 0.5, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 13, italic: true, color: CALM,
  });
  s.addNotes("Two defensible positions, both unclaimed, both structurally unavailable to the incumbents because of their own demand businesses.");
}

// =====================================================================
// METHOD
// =====================================================================
{
  const c = N.method;
  const s = lightSlide();
  heading(s, c.eyebrow, c.title, "Static as of " + D.meta.snapshotDate + ". " + c.sub);
  const iw = (CW - 0.36) / 2;
  c.items.forEach((it, i) => {
    const x = M + (i % 2) * (iw + 0.36);
    const y = 2.1 + Math.floor(i / 2) * 1.62;
    card(s, x, y, iw, 1.44);
    pill(s, x + 0.26, y + 0.28, 0.34, 0.34, pal(it[2]), String(i + 1), 11);
    s.addText(it[0], {
      x: x + 0.7, y: y + 0.26, w: iw - 0.94, h: 0.3, isTextBox: true, margin: 0,
      fontFace: HFONT, fontSize: 13, bold: true, color: INK,
    });
    s.addText(it[1], {
      x: x + 0.7, y: y + 0.6, w: iw - 0.94, h: 0.74, isTextBox: true, margin: 0,
      fontFace: BFONT, fontSize: 10.5, color: MUTED, lineSpacing: 13.5, valign: "top",
    });
  });
  s.addText([
    { text: "Primary sources include:  ", options: { bold: true, color: INK } },
    { text: c.sources, options: { color: FAINT } },
  ], {
    x: M, y: 5.55, w: CW, h: 0.9, isTextBox: true, margin: 0,
    fontFace: BFONT, fontSize: 10.5, lineSpacing: 14, valign: "top",
  });
  footnote(s, c.footnote);
  if (c.notes) s.addNotes(c.notes);
}

const outFile = path.join(ROOT, "dist", D.meta.title + ".pptx");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
pres.writeFile({ fileName: outFile }).then(() => {
  console.log("deck            " + pres.slides.length + " slides · " + n + " SDKs  →  dist/" +
    path.basename(outFile));
});
