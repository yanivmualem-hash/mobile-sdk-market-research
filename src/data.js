// Loads data/research.json and resolves {{placeholders}} in its prose, so a
// sentence like "undisclosed for {{undisclosed.takeRate}} of {{total}} SDKs"
// stays true after someone adds a vendor. Both generators load through here.
//
// Available placeholders:
//   {{total}}                number of SDKs
//   {{problems}}             number of problems
//   {{themes}}               number of value themes
//   {{categories}}           number of categories
//   {{disclosed.KEY}}        SDKs whose vendor publishes KEY
//   {{undisclosed.KEY}}      SDKs whose vendor does not
//   {{status.KEY}}           problems with status solved | partial | open
//     KEY for disclosed/undisclosed: adFormats, reporting, sdkSize, takeRate

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data/research.json");

function figures(d) {
  const f = { total: d.sdks.length, problems: d.problems.length,
              themes: d.valueThemes.length, categories: d.categories.length };
  const keys = ["adFormats", "reporting", "sdkSize", "takeRate"];
  keys.forEach((k) => {
    const yes = d.sdks.filter((s) => s.disclosure && s.disclosure[k]).length;
    f["disclosed." + k] = yes;
    f["undisclosed." + k] = d.sdks.length - yes;
  });
  ["solved", "partial", "open"].forEach((st) => {
    f["status." + st] = d.problems.filter((p) => p.status === st).length;
  });
  return f;
}

function interpolate(node, f, unknown) {
  if (typeof node === "string") {
    return node.replace(/\{\{\s*([A-Za-z.]+)\s*\}\}/g, (m, key) => {
      if (Object.prototype.hasOwnProperty.call(f, key)) return String(f[key]);
      unknown.push(key);
      return m;
    });
  }
  if (Array.isArray(node)) return node.map((x) => interpolate(x, f, unknown));
  if (node && typeof node === "object") {
    const out = {};
    Object.keys(node).forEach((k) => { out[k] = interpolate(node[k], f, unknown); });
    return out;
  }
  return node;
}

function load() {
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const f = figures(raw);
  const unknown = [];
  const resolved = interpolate(raw, f, unknown);
  if (unknown.length) {
    const uniq = unknown.filter((v, i, a) => a.indexOf(v) === i);
    console.error("data            unknown placeholder" + (uniq.length > 1 ? "s" : "") + ": " +
      uniq.map((u) => "{{" + u + "}}").join(", "));
    console.error("                known: " + Object.keys(f).join(", "));
    process.exit(1);
  }
  resolved.figures = f;
  return resolved;
}

module.exports = { load, figures, FILE, ROOT };
