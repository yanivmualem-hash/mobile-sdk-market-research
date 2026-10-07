// Pushes dist/comparison.xlsx into Google Drive as a Google Sheet.
//
// First run creates the sheet and records its id in data/research.json as
// meta.sheetFileId; every run after that updates that same file in place, so
// the shared link never changes. Auth is the gcloud CLI with Drive scope:
//   gcloud auth login --enable-gdrive-access --update-adc

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data/research.json");
const D = JSON.parse(fs.readFileSync(FILE, "utf8"));
const XLSX = path.join(ROOT, "dist", "comparison.xlsx");
const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const SHEET_NAME = "In-App SDK Comparison — Rise Market Research";

if (!fs.existsSync(XLSX)) {
  console.error("sheet           missing dist/comparison.xlsx — run the sheet build first");
  process.exit(1);
}

function token() {
  try {
    return execFileSync("gcloud", ["auth", "print-access-token"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch (e) {
    console.error(
      "sheet           gcloud has no valid token.\n" +
      "                Run:  gcloud auth login --enable-gdrive-access --update-adc"
    );
    process.exit(1);
  }
}

function curl(args) {
  const out = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  let j;
  try { j = JSON.parse(out); } catch (e) {
    console.error("sheet           unexpected response:\n" + out.slice(0, 400));
    process.exit(1);
  }
  if (j.error) { console.error("sheet           Drive API error: " + j.error.message); process.exit(1); }
  return j;
}

const t = token();
const id = D.meta.sheetFileId;

if (id) {
  curl([
    "-sS", "-X", "PATCH",
    "https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=media&fields=id,modifiedTime",
    "-H", "Authorization: Bearer " + t,
    "-H", "Content-Type: " + MIME,
    "--data-binary", "@" + XLSX,
  ]);
  console.log("sheet           updated in place  →  https://docs.google.com/spreadsheets/d/" + id + "/edit");
} else {
  const meta = path.join(ROOT, "dist", ".sheet-meta.json");
  fs.writeFileSync(meta, JSON.stringify({ name: SHEET_NAME, mimeType: "application/vnd.google-apps.spreadsheet" }));
  const res = curl([
    "-sS", "-X", "POST",
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    "-H", "Authorization: Bearer " + t,
    "-F", "metadata=@" + meta + ";type=application/json;charset=UTF-8",
    "-F", "file=@" + XLSX + ";type=" + MIME,
  ]);
  fs.unlinkSync(meta);
  // record it so later runs update rather than creating a second sheet
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
  raw.meta.sheetFileId = res.id;
  fs.writeFileSync(FILE, JSON.stringify(raw, null, 2) + "\n");
  console.log("sheet           created  →  https://docs.google.com/spreadsheets/d/" + res.id + "/edit");
  console.log("                recorded meta.sheetFileId in data/research.json — commit that");
}
