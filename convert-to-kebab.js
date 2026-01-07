const fs = require("fs");
const path = require("path");

// Root project folder
const rootDir = path.resolve(__dirname, ".");

// CamelCase → kebab-case
function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Get all CSS files
function getCSSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getCSSFiles(filePath));
    } else if (path.extname(file) === ".css") {
      results.push(filePath);
    }
  });

  return results;
}

// Fix CSS content
function fixCSSContent(content) {
  // 1. CamelCase → kebab-case
  content = content.replace(
    /([#.]?)([a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)/g,
    (_, prefix, name) => prefix + camelToKebab(name)
  );

  content = content.replace(
    /@keyframes\s+([a-zA-Z][a-zA-Z0-9]*)/g,
    (_, name) => `@keyframes ${camelToKebab(name)}`
  );

  content = content.replace(
    /animation\s*:\s*([a-zA-Z][a-zA-Z0-9]*)/g,
    (_, name) => `animation: ${camelToKebab(name)}`
  );

  // 2. Add fallback generic font if missing
  content = content.replace(
    /font-family\s*:\s*([^;]+);/g,
    (_, fonts) => {
      if (!fonts.includes("sans-serif") && !fonts.includes("serif")) {
        return `font-family: ${fonts.trim()}, sans-serif;`;
      }
      return _;
    }
  );

  // 3. Fix transform properties
  content = content.replace(/transform\s*:\s*translate-x/gi, "transform: translateX");
  content = content.replace(/transform\s*:\s*translate-y/gi, "transform: translateY");

  // 4. Split multiple declarations in a single line
  content = content.replace(/;\s*(?=[^{}\n]*;)/g, ";\n  ");

  // 5. Remove duplicate selectors (keep first occurrence)
  const selectors = new Set();
  content = content.replace(/([^{]+){[^}]*}/g, (match, selector) => {
    const sel = selector.trim();
    if (selectors.has(sel)) return ""; // remove duplicate
    selectors.add(sel);
    return match;
  });

  return content;
}

// Process each CSS file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const fixedContent = fixCSSContent(content);
  fs.writeFileSync(filePath, fixedContent, "utf-8");
  console.log("Updated:", filePath);
}

// Run
const cssFiles = getCSSFiles(rootDir);
cssFiles.forEach(processFile);

console.log("✅ Όλα τα CSS αρχεία έχουν μετατραπεί και επιδιορθωθεί για Stylelint.");
