// dedupe-and-clean-css.js
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');

const CSS_DIR = path.join(__dirname, 'app/src/main/resources/static/assets/css');

function getCssFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getCssFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      results.push(full);
    }
  }
  return results;
}

function parentScopeKey(node) {
  // Build a key that describes the parent scope chain (e.g. @media print { ... })
  let cur = node.parent;
  const parts = [];
  while (cur && cur.type !== 'root') {
    if (cur.type === 'atrule') {
      // include at-rule name and params
      parts.unshift(`@${cur.name} ${cur.params}`.trim());
    }
    cur = cur.parent;
  }
  return parts.length ? parts.join(' | ') : 'root';
}

function normalizeSelectorStr(selector) {
  // Normalize a selector string: split selectors by comma, trim and collapse spaces,
  // then rejoin with ", " preserving order.
  return selector
    .split(',')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(', ');
}

function processFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(src, { parser: safeParser });

  const seen = new Map(); // key = scopeKey + '||' + normalizedSelector -> rule node kept
  let removedCount = 0;
  let emptyRemoved = 0;

  // Walk rules deeply (includes inside at-rules)
  root.walkRules(rule => {
    // Skip rules without selector (defensive)
    if (!rule.selector) return;

    const scope = parentScopeKey(rule);
    const normalized = normalizeSelectorStr(rule.selector);

    // If rule has no declarations (or only comments / empty), remove it
    const hasDecl = rule.nodes && rule.nodes.some(n => n.type === 'decl' && String(n.prop).trim() !== '');
    const hasNonEmptyChild = hasDecl || (rule.nodes && rule.nodes.some(n => n.type === 'rule' || n.type === 'atrule'));
    if (!hasNonEmptyChild) {
      rule.remove();
      emptyRemoved++;
      return;
    }

    const key = `${scope}||${normalized}`;

    if (seen.has(key)) {
      // Duplicate within same scope -> remove this rule
      rule.remove();
      removedCount++;
    } else {
      seen.set(key, true);
    }
  });

  // Write back only if changed
  const out = root.toString();
  if (out !== src) {
    fs.writeFileSync(filePath, out, 'utf8');
  }

  return { removedCount, emptyRemoved };
}

// Run
const files = getCssFiles(CSS_DIR);
let totalRemoved = 0;
let totalEmpty = 0;

if (files.length === 0) {
  console.log('No CSS files found at', CSS_DIR);
  process.exit(0);
}

files.forEach(f => {
  const { removedCount, emptyRemoved } = processFile(f);
  if (removedCount || emptyRemoved) {
    console.log(`Updated ${path.relative(process.cwd(), f)} — duplicates removed: ${removedCount}, empty blocks removed: ${emptyRemoved}`);
  } else {
    console.log(`No change: ${path.relative(process.cwd(), f)}`);
  }
  totalRemoved += removedCount;
  totalEmpty += emptyRemoved;
});

console.log(`\nDone. Total duplicate rules removed: ${totalRemoved}. Total empty blocks removed: ${totalEmpty}.`);
