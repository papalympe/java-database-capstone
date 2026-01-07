const fs = require("fs");
const path = require("path");

// Root φάκελος project
const ROOT_DIR = path.resolve(__dirname, ".");

// Regex για camelCase → kebab-case
function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Διαλέγουμε αρχεία που θα επεξεργαστούμε
function getFiles(dir, exts = [".css", ".html", ".js"]) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, exts));
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

// Αντικατάσταση camelCase IDs και keyframes
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // IDs & class references (#idName, .className)
  content = content.replace(/([#.]?)([a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)/g, (match, prefix, name) => {
    return prefix + camelToKebab(name);
  });

  // keyframes / animation names
  content = content.replace(/@keyframes\s+([a-zA-Z][a-zA-Z0-9]*)/g, (match, name) => {
    return `@keyframes ${camelToKebab(name)}`;
  });

  content = content.replace(/animation\s*:\s*([a-zA-Z][a-zA-Z0-9]*)/g, (match, name) => {
    return `animation: ${camelToKebab(name)}`;
  });

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Updated:", filePath);
}

// Εκτέλεση
const files = getFiles(ROOT_DIR);
files.forEach(processFile);

console.log("✅ Όλα τα αρχεία έχουν μετατραπεί σε kebab-case.");
