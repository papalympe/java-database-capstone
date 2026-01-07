// dedupe-css.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');

function normalizeSelector(sel) {
  // collapse whitespace, remove newlines, trim
  return sel.replace(/\s+/g, ' ').trim();
}

// pattern για όλα τα css αρχεία
const pattern = 'app/src/main/resources/static/assets/css/**/*.css';
const files = glob.sync(pattern, { nodir: true });

if (files.length === 0) {
  console.log(`No CSS files found for pattern: ${pattern}`);
  process.exit(0);
}

let totalRemoved = 0;

files.forEach(file => {
  const src = fs.readFileSync(file, 'utf8');
  const root = postcss.parse(src, { parser: safeParser });

  const seen = new Set();
  let removedInFile = 0;

  // walk all rules (top-level & inside at-rules)
  root.walkRules(rule => {
    // rule.selector may be e.g. ".a, .b"
    // normalize the full selector string
    const selectorStr = normalizeSelector(rule.selector || '');
    if (!selectorStr) return;

    if (seen.has(selectorStr)) {
      // remove duplicate rule
      rule.remove();
      removedInFile++;
    } else {
      seen.add(selectorStr);
    }
  });

  if (removedInFile > 0) {
    fs.writeFileSync(file, root.toString(), 'utf8');
    console.log(`Updated ${file} — removed ${removedInFile} duplicate rule(s).`);
    totalRemoved += removedInFile;
  } else {
    console.log(`No duplicates in ${file}.`);
  }
});

console.log(`Done. Total duplicate rules removed: ${totalRemoved}`);
