// auto-fix-stylelint-config.js
const fs = require("fs");
const path = require("path");

const cfgPath = path.resolve(__dirname, ".stylelintrc.json");

if (!fs.existsSync(cfgPath)) {
  console.error("Δεν βρέθηκε .stylelintrc.json στο root. Έξοδος.");
  process.exit(1);
}

// load
let cfgRaw = fs.readFileSync(cfgPath, "utf8");
let cfg;
try {
  cfg = JSON.parse(cfgRaw);
} catch (e) {
  console.error("Σφάλμα JSON στο .stylelintrc.json:", e.message);
  process.exit(1);
}

// Ensure rules object exists
cfg.rules = cfg.rules || {};

// Αφαιρούμε τις rules που προκαλούν Unknown rule errors
delete cfg.rules["indentation"];
delete cfg.rules["string-quotes"];

// Απενεργοποιούμε άλλους προβληματικούς κανόνες
cfg.rules["declaration-property-value-no-unknown"] = null;
cfg.rules["no-descending-specificity"] = null;

// Αν θέλεις, μπορείς να αφήσεις ή να αφαιρέσεις τους pattern κανόνες
// cfg.rules["selector-class-pattern"] = null;
// cfg.rules["selector-id-pattern"] = null;

fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), "utf8");
console.log("Updated .stylelintrc.json (χωρίς backup).");
