const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

/**
 * Αφαιρεί duplicate selectors κρατώντας το ΠΡΩΤΟ block
 * Λειτουργεί μόνο σε .css αρχεία
 */

const CSS_GLOB = "app/src/main/resources/static/assets/css/**/*.css";

function dedupeCssFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n");
  const seen = new Set();
  const output = [];

  let buffer = [];
  let currentSelector = null;

  function flush() {
    if (!currentSelector) {
      output.push(...buffer);
    } else if (!seen.has(currentSelector)) {
      seen.add(currentSelector);
      output.push(...buffer);
    }
    buffer = [];
    currentSelector = null;
  }

  for (const line of lines) {
    const selectorMatch = line.match(/^([^{]+)\s*\{/);

    if (selectorMatch) {
      flush();
      currentSelector = selectorMatch[1].trim();
    }

    buffer.push(line);

    if (line.includes("}")) {
      flush();
    }
  }

  flush();

  fs.writeFileSync(filePath, output.join("\n"), "utf8");
  console.log("✔ Deduped:", filePath);
}

const files = fg.sync(CSS_GLOB);

files.forEach(dedupeCssFile);

console.log("\n✅ CSS duplicate selectors removed successfully.");
