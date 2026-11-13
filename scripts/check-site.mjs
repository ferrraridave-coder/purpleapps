import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { STAMPED, assetHash } from './stamp-assets.mjs';

const root = process.cwd();
const htmlFiles = [];
const problems = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (entry.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}

function isExternal(value) {
  return /^(https?:|mailto:|tel:|#|javascript:)/i.test(value);
}

function stripFragment(value) {
  // Drop #fragments and ?query strings (e.g. styles.css?v=2) before checking the file exists.
  return value.split('#')[0].split('?')[0];
}

// Resolve a local href/src the way Cloudflare's static assets do:
// "/x" is relative to the site root, "/" and "dir/" serve index.html, and an
// extensionless path like "/voxium" serves voxium.html.
function resolveLocal(file, value) {
  const base = value.startsWith('/') ? join(root, value) : join(dirname(file), value);
  const candidates = [base];
  if (value.endsWith('/')) candidates.push(join(base, 'index.html'));
  else if (!/\.[a-z0-9]+$/i.test(value)) candidates.push(base + '.html', join(base, 'index.html'));
  return candidates.map(c => normalize(c)).find(c => existsSync(c) && statSync(c).isFile());
}

function checkRef(file, attr, rawValue) {
  const value = stripFragment(rawValue.trim());
  if (!value || isExternal(value)) return;
  if (value.startsWith('//')) return; // protocol-relative URL: external

  const resolved = resolveLocal(file, value);
  if (!resolved) {
    problems.push(`${file.replace(root + '/', '')}: missing ${attr}="${rawValue}"`);
  }
}

walk(root);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const attrPattern = /\b(href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    checkRef(file, match[1], match[2]);
  }
}

// styles.css and main.js are cached for a year (see _headers), so every
// reference must carry the current content hash. Fix: node scripts/stamp-assets.mjs
const hashes = Object.fromEntries(STAMPED.map(f => [f, assetHash(join(root, f))]));
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="\/?(styles\.css|main\.js)(\?v=[^"]*)?"/g)) {
    if (m[2] !== `?v=${hashes[m[1]]}`) {
      problems.push(`${file.replace(root + '/', '')}: ${m[1]} reference "${m[0]}" is not stamped with ?v=${hashes[m[1]]} (run node scripts/stamp-assets.mjs)`);
    }
  }
}

if (problems.length) {
  console.error(`Found ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML file(s); all local references exist and styles.css/main.js references carry the current hash.`);
