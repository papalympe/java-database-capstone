// convert-to-kebab.js
const fs = require("fs");
const path = require("path");

// Root φάκελος project
const rootDir = path.resolve(__dirname, ".");

// CamelCase → kebab-case
function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Παίρνει όλα τα αρχεία με συγκεκριμένα extensions
function getFiles(dir, exts = [".css"]) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath, exts));
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Επεξεργασία CSS αρχείου
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // IDs & classes
  content = content.replace(
    /([#.]?)([a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)/g,
    (_, prefix, name) => prefix + camelToKebab(name)
  );

  // @keyframes
  content = content.replace(
    /@keyframes\s+([a-zA-Z][a-zA-Z0-9]*)/g,
    (_, name) => `@keyframes ${camelToKebab(name)}`
  );

  // animation-name property
  content = content.replace(
    /animation\s*:\s*([a-zA-Z][a-zA-Z0-9]*)/g,
    (_, name) => `animation: ${camelToKebab(name)}`
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Updated:", filePath);
}

// Εκτέλεση μόνο σε CSS αρχεία
const cssFiles = getFiles(rootDir, [".css"]);
cssFiles.forEach(processFile);

console.log("✅ Όλα τα CSS αρχεία έχουν μετατραπεί σε kebab-case.");
