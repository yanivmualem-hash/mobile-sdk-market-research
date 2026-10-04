// Rise design tokens, shared by the HTML dashboard and the slide deck.
// Source: the `rise-ui-kit` skill. Keep this file as the single place either
// output learns what "Rise blue" or "muted text" means.

const RISE   = "022BBE"; // Rise Blue — the one accent
const INK    = "1B1B1F"; // Carbon
const MUTED  = "5B6070";
const FAINT  = "8A8F98";
const GHOST  = "B7BAC2";
const BORDER = "ECEDF1";
const FILL   = "F1F2F5";
const FILL2  = "F7F8FA";
const FILL3  = "FAFAFB";
const CALM   = "CCD6F7";
const WHITE  = "FFFFFF";

// semantic bg/fg pairs — always used together, never fg alone on white
const PAIRS = {
  blue:   { bg: "E6ECFB", fg: "022BBE" },
  orange: { bg: "FDEFE5", fg: "B85C00" },
  green:  { bg: "E4F5EA", fg: "136B3A" },
  purple: { bg: "F1E6FB", fg: "6B2FA0" },
  red:    { bg: "FEEAEA", fg: "C0392B" },
  gold:   { bg: "FFF3D6", fg: "8A6D1D" },
  teal:   { bg: "DFF5F3", fg: "0E7C77" },
  gray:   { bg: "EEF0F4", fg: "3A3F4B" },
};

// one pair per problem status, reused wherever that status appears
const STATUS = { solved: "green", partial: "gold", open: "red" };
const STATUS_LABEL = { solved: "Solved", partial: "Partially solved", open: "Open gap" };

const HFONT = "Poppins"; // headings, buttons, stat numbers — 500/600
const BFONT = "Roboto";  // body, labels — 400/500

const hex = (c) => "#" + c; // for CSS; the pptx side wants the bare hex

module.exports = {
  RISE, INK, MUTED, FAINT, GHOST, BORDER, FILL, FILL2, FILL3, CALM, WHITE,
  PAIRS, STATUS, STATUS_LABEL, HFONT, BFONT, hex,
};
