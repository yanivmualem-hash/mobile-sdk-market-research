// Pushes dist/<title>.pptx into the existing Google Slides deck, in place,
// so the shared link never changes. Auth comes from the gcloud CLI, which must
// have Drive scope:  gcloud auth login --enable-gdrive-access --update-adc
//
// Usage:  node src/publish-slides.js [--verify]
//   --verify  re-exports the deck from Google and reports slide/notes counts

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "data/research.json"), "utf8"));
const FILE_ID = D.meta.slidesFileId;
const PPTX = path.join(ROOT, "dist", D.meta.title + ".pptx");
const MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

if (!FILE_ID) {
  console.error("publish         no meta.slidesFileId in data/research.json — skipping");
  process.exit(0);
}
if (!fs.existsSync(PPTX)) {
  console.error("publish         missing " + PPTX + " — run the deck build first");
  process.exit(1);
}

function token() {
  try {
    return execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" }).trim();
  } catch (e) {
    console.error(
      "publish         gcloud has no valid token.\n" +
      "                Run:  gcloud auth login --enable-gdrive-access --update-adc"
    );
    process.exit(1);
  }
}

const t = token();

const res = execFileSync("curl", [
  "-sS", "-X", "PATCH",
  "https://www.googleapis.com/upload/drive/v3/files/" + FILE_ID +
    "?uploadType=media&fields=id,name,modifiedTime,webViewLink",
  "-H", "Authorization: Bearer " + t,
  "-H", "Content-Type: " + MIME,
  "--data-binary", "@" + PPTX,
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

let out;
try { out = JSON.parse(res); } catch (e) { console.error("publish         unexpected response:\n" + res); process.exit(1); }
if (out.error) { console.error("publish         Drive API error: " + out.error.message); process.exit(1); }

console.log("publish         updated in place  →  https://docs.google.com/presentation/d/" + FILE_ID + "/edit");

if (process.argv.includes("--verify")) {
  const tmp = path.join(ROOT, "dist", ".verify.pptx");
  execFileSync("curl", [
    "-sS", "-L", "-H", "Authorization: Bearer " + t,
    "https://docs.google.com/presentation/d/" + FILE_ID + "/export/pptx", "-o", tmp,
  ], { maxBuffer: 64 * 1024 * 1024 });
  const zip = fs.readFileSync(tmp);
  const text = zip.toString("latin1");
  const slides = (text.match(/ppt\/slides\/slide\d+\.xml/g) || []).filter((v, i, a) => a.indexOf(v) === i).length;
  const notes = (text.match(/ppt\/notesSlides\/notesSlide\d+\.xml/g) || []).filter((v, i, a) => a.indexOf(v) === i).length;
  fs.unlinkSync(tmp);
  console.log("verify          Google reports " + slides + " slides, " + notes + " with speaker notes");
}
