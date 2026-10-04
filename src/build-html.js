// Generates dist/dashboard.html from data/research.json, styled with Rise tokens.
// Output is a single standalone file — it opens over file:// with no server.

const fs = require("fs");
const path = require("path");
const T = require("./theme");

const ROOT = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data/research.json"), "utf8"));
const h = T.hex;

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---- derived numbers (never hardcode a count) ----
const n = data.sdks.length;
const byStatus = (st) => data.problems.filter((p) => p.status === st);
const disclosureCounts = data.narrative.disclosure.bars.map((b) => ({
  label: b.label,
  count: data.sdks.filter((s) => s.disclosure[b.key]).length,
}));
const catCounts = data.categories.map((c) => ({
  ...c,
  count: data.sdks.filter((s) => s.category === c.name).length,
}));

const pairCss = Object.entries(T.PAIRS)
  .map(([k, v]) => `  --pair-${k}-bg: ${h(v.bg)};\n  --pair-${k}-fg: ${h(v.fg)};`)
  .join("\n");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@400;500&display=swap');
:root {
  --rise: ${h(T.RISE)};
  --ink: ${h(T.INK)};
  --muted: ${h(T.MUTED)};
  --faint: ${h(T.FAINT)};
  --ghost: ${h(T.GHOST)};
  --border: ${h(T.BORDER)};
  --fill: ${h(T.FILL)};
  --fill2: ${h(T.FILL2)};
  --fill3: ${h(T.FILL3)};
  --calm: ${h(T.CALM)};
${pairCss}
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--fill3);
  color: var(--ink);
  font-family: '${T.BFONT}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px; line-height: 1.5;
  padding: 24px 16px 64px;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, .num { font-family: '${T.HFONT}', sans-serif; letter-spacing: -0.01em; margin: 0; }

/* the whole app lives in one rounded card */
.shell {
  max-width: 1280px; margin: 0 auto; background: #fff;
  border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
}

/* Rise Blue header band: logo mark + product name + meta */
.band {
  background: var(--rise); color: #fff; padding: 22px 24px;
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
}
.band .mark {
  width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,.16);
  display: grid; place-items: center; font-family: '${T.HFONT}'; font-weight: 600; font-size: 14px; flex: none;
}
.band-left { display: flex; align-items: center; gap: 12px; }
.band h1 { font-size: 19px; font-weight: 600; }
.band .sub { font-size: 12.5px; color: var(--calm); margin-top: 2px; max-width: 640px; }
.band .chip {
  font-size: 12px; font-weight: 500; color: #fff; background: rgba(255,255,255,.16);
  border-radius: 999px; padding: 6px 14px; white-space: nowrap;
}

.body { padding: 24px; }

/* toolbar */
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px; }
.search { flex: 1 1 260px; position: relative; }
.search input {
  width: 100%; padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px;
  background: #fff; color: var(--ink); font-size: 13.5px; font-family: inherit;
  transition: box-shadow .15s ease, border-color .15s ease;
}
.search input::placeholder { color: var(--ghost); }
.search input:focus { outline: none; border-color: var(--rise); box-shadow: 0 0 0 3px rgba(2,43,190,.15); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip-btn {
  padding: 7px 14px; border-radius: 999px; border: 1px solid transparent;
  font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap;
  transition: filter .15s ease;
}
.chip-btn:hover { filter: brightness(0.97); }
.chip-btn[aria-pressed="true"] { background: var(--rise) !important; color: #fff !important; }
.chip-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(2,43,190,.15); }

/* generic card */
.card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.panel-title { font-size: 15px; font-weight: 600; }
.panel-sub { color: var(--faint); font-size: 12px; margin: 3px 0 14px; }

/* synthesis */
.synthesis { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
.theme-row { display: flex; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--border); }
.theme-row:last-child { border-bottom: none; }
.theme-num {
  flex: none; width: 22px; height: 22px; border-radius: 999px; margin-top: 1px;
  background: var(--pair-blue-bg); color: var(--pair-blue-fg);
  font-family: '${T.HFONT}'; font-weight: 600; font-size: 11px; display: grid; place-items: center;
}
.theme-row h4 { font-size: 13px; font-weight: 600; }
.theme-row .who { color: var(--rise); font-weight: 500; font-size: 11.5px; margin: 2px 0 3px; }
.theme-row p { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.45; }

.prob-row { padding: 11px 0; border-bottom: 1px solid var(--border); }
.prob-row:last-child { border-bottom: none; }
.prob-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.prob-row h4 { font-size: 13px; font-weight: 600; flex: 1; }
.prob-row p { margin: 4px 0 0; font-size: 12px; color: var(--muted); line-height: 1.45; }
.prob-row .by { font-size: 11.5px; color: var(--faint); margin-top: 3px; }

/* Rise badge */
.badge {
  display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 10px;
  font-size: 11px; font-weight: 500; white-space: nowrap; font-family: '${T.BFONT}';
}

/* layout */
.layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 12px; }

/* sdk card */
.sdk { display: flex; flex-direction: column; gap: 9px; }
.sdk-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.sdk-top h3 { font-size: 15.5px; font-weight: 600; }
.sdk .diff { font-size: 12.5px; color: var(--muted); line-height: 1.45; margin: 0; }
.sdk .weak {
  font-size: 12px; line-height: 1.45; margin: 0; border-radius: 8px; padding: 8px 10px;
  background: var(--pair-red-bg); color: var(--pair-red-fg);
}
.sdk-foot {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border);
}
.sdk-foot .tier { font-size: 11px; color: var(--faint); }
.link-btn {
  background: none; border: none; color: var(--rise); font-family: '${T.HFONT}'; font-weight: 500;
  font-size: 12.5px; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background .15s ease;
}
.link-btn:hover { background: var(--fill); }
.link-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(2,43,190,.15); }

/* stat tiles */
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tile { background: var(--fill2); border-radius: 10px; padding: 11px 12px; }
.tile .lbl { font-size: 10.5px; color: var(--faint); }
.tile .num { font-size: 22px; font-weight: 600; color: var(--rise); line-height: 1.2; }
.stat-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12.5px; padding: 7px 0; border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-row .n { font-family: '${T.HFONT}'; font-weight: 600; }

/* disclosure bars */
.bar-row { margin: 9px 0; }
.bar-label { display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px; }
.bar-label .v { font-family: '${T.HFONT}'; font-weight: 600; }
.track { height: 7px; border-radius: 999px; background: var(--fill); overflow: hidden; }
.track > div { height: 100%; border-radius: 999px; }

.note { font-size: 12px; border-left: 2px solid var(--border); padding-left: 11px; margin-bottom: 12px; }
.note:last-child { margin-bottom: 0; }
.note p { margin: 0 0 3px; white-space: pre-wrap; color: var(--ink); line-height: 1.45; }
.note .who { color: var(--faint); font-size: 11px; }

.empty {
  grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--ghost);
  border: 1px dashed var(--border); border-radius: 12px; font-size: 13px;
}

/* modal */
.backdrop {
  position: fixed; inset: 0; background: rgba(27,27,31,.45); z-index: 50;
  display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; overflow-y: auto;
}
.modal { background: #fff; border-radius: 16px; max-width: 680px; width: 100%; border: 1px solid var(--border); }
.modal-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
  padding: 20px 22px 14px; border-bottom: 1px solid var(--border);
}
.modal-head h3 { font-size: 20px; font-weight: 600; }
.modal-body { padding: 16px 22px 22px; }
.close-x {
  background: none; border: none; font-size: 20px; line-height: 1; color: var(--faint);
  cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background .15s ease, color .15s ease;
}
.close-x:hover { background: var(--fill); color: var(--rise); }
.modal dt { font-size: 11px; font-weight: 600; color: var(--faint); margin-top: 14px; text-transform: uppercase; letter-spacing: .04em; }
.modal dt:first-of-type { margin-top: 0; }
.modal dd { margin: 4px 0 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
.modal dl { margin: 0; }

.foot { margin-top: 20px; font-size: 11px; color: var(--ghost); text-align: center; }

@media (max-width: 980px) {
  .layout, .synthesis { grid-template-columns: 1fr; }
}
`;

const payload = {
  meta: data.meta,
  categories: catCounts,
  fields: data.fields,
  sdks: data.sdks,
  valueThemes: data.valueThemes.slice().sort((a, b) => a.order - b.order),
  problems: data.problems.slice().sort((a, b) => a.order - b.order),
  notes: data.notes,
  statusLabel: T.STATUS_LABEL,
  statusPair: T.STATUS,
  disclosure: disclosureCounts,
  total: n,
  statusCounts: { solved: byStatus("solved").length, partial: byStatus("partial").length, open: byStatus("open").length },
  generatedAt: new Date().toISOString().slice(0, 10),
};

const JS = `
(function () {
  "use strict";
  var D = window.__RESEARCH__;
  var state = { cats: new Set(), q: "" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function badge(pal, text) {
    return '<span class="badge" style="background:var(--pair-' + pal + '-bg);color:var(--pair-' + pal + '-fg)">' + esc(text) + '</span>';
  }
  function $(id) { return document.getElementById(id); }

  function renderChips() {
    $("chips").innerHTML = D.categories.map(function (c) {
      var on = state.cats.has(c.name);
      return '<button class="chip-btn" aria-pressed="' + on + '" data-cat="' + esc(c.name) + '"' +
        ' style="background:var(--pair-' + c.palette + '-bg);color:var(--pair-' + c.palette + '-fg)">' +
        esc(c.name) + ' · ' + c.count + '</button>';
    }).join("");
    Array.prototype.forEach.call($("chips").querySelectorAll(".chip-btn"), function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-cat");
        if (state.cats.has(c)) state.cats.delete(c); else state.cats.add(c);
        renderChips(); renderGrid();
      });
    });
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return D.sdks.filter(function (s) {
      if (state.cats.size && !state.cats.has(s.category)) return false;
      if (!q) return true;
      return [s.name, s.category, s.coreDifferentiator, s.proprietaryTech, s.positioning]
        .join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  var TIER_LABEL = { flywheel: "Tier 1 · AI flywheel", challenger: "Tier 2 · Challenger", adjacent: "Tier 3 · Adjacent play" };

  function renderGrid() {
    var list = filtered();
    $("count").textContent = list.length === D.sdks.length
      ? D.sdks.length + " SDKs"
      : list.length + " of " + D.sdks.length + " SDKs";
    if (!list.length) { $("grid").innerHTML = '<div class="empty">No SDKs match your filters.</div>'; return; }
    $("grid").innerHTML = list.map(function (s) {
      return '<article class="card sdk">' +
        '<div class="sdk-top"><h3>' + esc(s.name) + '</h3>' + badge(s.palette, s.category) + '</div>' +
        '<p class="diff">' + esc(s.coreDifferentiator) + '</p>' +
        (s.structuralWeakness ? '<p class="weak">' + esc(s.structuralWeakness) + '</p>' : '') +
        '<div class="sdk-foot"><span class="tier">' + esc(TIER_LABEL[s.tier] || "") + '</span>' +
        '<button class="link-btn" data-id="' + esc(s.id) + '">Details</button></div>' +
        '</article>';
    }).join("");
  }

  function renderThemes() {
    $("themes").innerHTML = D.valueThemes.map(function (t, i) {
      return '<div class="theme-row"><div class="theme-num">' + (i + 1) + '</div><div>' +
        '<h4>' + esc(t.title) + '</h4>' +
        '<div class="who">' + esc(t.who) + '</div>' +
        '<p>' + esc(t.note) + '</p></div></div>';
    }).join("");
  }

  function renderProblems() {
    $("problems").innerHTML = D.problems.map(function (p) {
      var pal = D.statusPair[p.status] || "gray";
      return '<div class="prob-row">' +
        '<div class="prob-head"><h4>' + esc(p.title) + '</h4>' + badge(pal, D.statusLabel[p.status]) + '</div>' +
        '<p>' + esc(p.note) + '</p>' +
        '<div class="by">Addressed by: ' + esc(p.solvedBy) + '</div></div>';
    }).join("");
  }

  function renderSide() {
    $("tiles").innerHTML =
      '<div class="tile"><div class="lbl">SDKs tracked</div><div class="num">' + D.total + '</div></div>' +
      '<div class="tile"><div class="lbl">Categories</div><div class="num">' + D.categories.length + '</div></div>' +
      '<div class="tile"><div class="lbl">Problems scored</div><div class="num">' + D.problems.length + '</div></div>' +
      '<div class="tile"><div class="lbl">Value themes</div><div class="num">' + D.valueThemes.length + '</div></div>';

    $("cats").innerHTML = D.categories.map(function (c) {
      return '<div class="stat-row"><span>' + badge(c.palette, c.name) + '</span><span class="n">' + c.count + '</span></div>';
    }).join("");

    $("bars").innerHTML = D.disclosure.map(function (b) {
      var pct = Math.round((b.count / D.total) * 100);
      var low = b.count <= D.total / 2;
      var col = low ? "var(--pair-red-fg)" : "var(--rise)";
      return '<div class="bar-row"><div class="bar-label"><span>' + esc(b.label) + '</span>' +
        '<span class="v" style="color:' + col + '">' + b.count + ' / ' + D.total + '</span></div>' +
        '<div class="track"><div style="width:' + pct + '%;background:' + col + '"></div></div></div>';
    }).join("");

    $("notes").innerHTML = D.notes.map(function (nt) {
      return '<div class="note"><p>' + esc(nt.text) + '</p><div class="who">' + esc(nt.authorName) + '</div></div>';
    }).join("");
  }

  function openDetail(id) {
    var s = D.sdks.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    var dl = D.fields.map(function (f) {
      return s[f[0]] ? '<dt>' + esc(f[1]) + '</dt><dd>' + esc(s[f[0]]) + '</dd>' : '';
    }).join("");
    var b = document.createElement("div");
    b.className = "backdrop";
    b.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(s.name) + '">' +
      '<div class="modal-head"><div><h3>' + esc(s.name) + '</h3><div style="margin-top:7px">' +
      badge(s.palette, s.category) + '</div></div>' +
      '<button class="close-x" aria-label="Close">&times;</button></div>' +
      '<div class="modal-body">' +
      (s.structuralWeakness ? '<p class="weak" style="margin-bottom:14px">' + esc(s.structuralWeakness) + '</p>' : '') +
      '<dl>' + dl + '</dl></div></div>';
    document.body.appendChild(b);
    function close() { b.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    b.addEventListener("click", function (e) { if (e.target === b) close(); });
    b.querySelector(".close-x").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    b.querySelector(".close-x").focus();
  }

  renderChips(); renderGrid(); renderThemes(); renderProblems(); renderSide();
  $("search").addEventListener("input", function () { state.q = this.value; renderGrid(); });
  $("grid").addEventListener("click", function (e) {
    var t = e.target.closest("[data-id]");
    if (t) openDetail(t.getAttribute("data-id"));
  });
})();
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(data.meta.title)} — Snapshot</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>${CSS}</style>
</head>
<body>
<div class="shell">
  <header class="band">
    <div class="band-left">
      <div class="mark">R</div>
      <div>
        <h1>${esc(data.meta.title)}</h1>
        <div class="sub">${esc(data.meta.subtitle)}</div>
      </div>
    </div>
    <span class="chip">Snapshot · ${esc(data.meta.snapshotDate)}</span>
  </header>

  <div class="body">
    <div class="toolbar">
      <div class="search">
        <input type="text" id="search" placeholder="Search SDKs, tech, or differentiators…" aria-label="Search SDKs">
      </div>
      <div class="chips" id="chips" role="group" aria-label="Filter by category"></div>
    </div>

    <div class="synthesis">
      <section class="card">
        <h2 class="panel-title">Added value at a glance</h2>
        <p class="panel-sub">What each cluster of SDKs contributes, grouped by the kind of value it adds.</p>
        <div id="themes"></div>
      </section>
      <section class="card">
        <h2 class="panel-title">Industry problems: what's already solved</h2>
        <p class="panel-sub">Known pain points in in-app mediation, and whether any tracked SDK actually solves them.</p>
        <div id="problems"></div>
      </section>
    </div>

    <div class="layout">
      <main>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
          <h2 class="panel-title">Vendor profiles</h2>
          <span id="count" style="font-size:12px;color:var(--faint)"></span>
        </div>
        <div class="grid" id="grid"></div>
      </main>
      <aside style="display:flex;flex-direction:column;gap:16px">
        <section class="card">
          <h2 class="panel-title">Coverage</h2>
          <p class="panel-sub">Snapshot taken ${esc(data.meta.snapshotDate)}.</p>
          <div class="tiles" id="tiles"></div>
          <div style="margin-top:14px" id="cats"></div>
        </section>
        <section class="card">
          <h2 class="panel-title">What vendors disclose</h2>
          <p class="panel-sub">Published in the vendor's own materials.</p>
          <div id="bars"></div>
        </section>
        <section class="card">
          <h2 class="panel-title">Research notes</h2>
          <p class="panel-sub">Edit these in <code>data/research.json</code>.</p>
          <div id="notes"></div>
        </section>
      </aside>
    </div>
  </div>
</div>
<p class="foot">Generated from data/research.json on ${esc(payload.generatedAt)} · ${esc(data.meta.owner)}</p>
<script>window.__RESEARCH__ = ${JSON.stringify(payload)};</script>
<script>${JS}</script>
</body>
</html>
`;

const out = path.join(ROOT, "dist/dashboard.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(
  "dashboard.html  " + n + " SDKs · " + data.problems.length + " problems · " +
  data.valueThemes.length + " themes  →  dist/dashboard.html"
);
