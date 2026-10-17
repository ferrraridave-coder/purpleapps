import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

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

if (problems.length) {
  console.error(`Found ${problems.length} missing local reference(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML file(s); all local references exist.`);
