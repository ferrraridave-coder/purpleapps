// Stamp every HTML reference to styles.css and main.js with ?v=<content hash>.
// Run after ANY edit to styles.css or main.js, before deploying:
//   node scripts/stamp-assets.mjs && node scripts/check-site.mjs
// _headers lets browsers cache these two files for a year (immutable), so a
// new hash in the URL is the only way visitors pick up a changed file.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

export const STAMPED = ['styles.css', 'main.js'];

export function assetHash(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
}

// Matches href="styles.css", href="/styles.css?v=anything", src="main.js" etc.
export const REF = /\b(href|src)="(\/?)(styles\.css|main\.js)(?:\?v=[^"]*)?"/g;

if (import.meta.url === `file://${process.argv[1]}`) {
  const hashes = Object.fromEntries(STAMPED.map(f => [f, assetHash(f)]));
  let changed = 0;
  for (const file of readdirSync('.').filter(f => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const next = html.replace(REF, (_, attr, slash, name) => `${attr}="${slash}${name}?v=${hashes[name]}"`);
    if (next !== html) { writeFileSync(file, next); changed++; }
  }
  console.log(`stamped ${changed} file(s):`, hashes);
}
