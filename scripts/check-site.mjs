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
  return value.split('#')[0];
}

function checkRef(file, attr, rawValue) {
  const value = stripFragment(rawValue.trim());
  if (!value || isExternal(value)) return;
  if (value.startsWith('/')) return;

  const resolved = normalize(join(dirname(file), value));
  if (!existsSync(resolved)) {
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
