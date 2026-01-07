const fs = require("fs");
const path = require("path");

/**
 * Αφαιρεί duplicate CSS selectors
 * Κρατάει ΠΑΝΤΑ το πρώτο block
 * Δεν δημιουργεί backup
 */

const ROOT_DIR = path.join(
  __dirname,
  "app/src/main/resources/static/assets/css"
);

function getCssFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getCssFiles(fullPath));
    } else if (entry.name.endsWith(".css")) {
      results.push(fullPath);
    }
  }

  return results;
}

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

// RUN
const files = getCssFiles(ROOT_DIR);
files.forEach(dedupeCssFile);

console.log("\n✅ Duplicate CSS selectors removed successfully.");
