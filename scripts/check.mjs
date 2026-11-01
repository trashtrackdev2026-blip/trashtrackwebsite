import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const css = await readFile(path.join(dist, 'styles.css'), 'utf8');
const js = await readFile(path.join(dist, 'app.js'), 'utf8');
assert.equal([...html.matchAll(/<html(?:\s|>)/g)].length, 1, 'Exactly one HTML document');
assert.equal([...html.matchAll(/<\/html>/g)].length, 1, 'Exactly one closing HTML tag');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
for (const match of html.matchAll(/(?:href|aria-controls)="#?([^"\s]+)"/g)) {
  if (match[0].includes('href="#') || match[0].includes('aria-controls=')) assert(ids.includes(match[1]), `Missing target: ${match[1]}`);
}
for (const match of html.matchAll(/(?:src|href)="((?:assets\/[^"?#]+|[^"/?#]+\.(?:css|js)))"/g)) {
  assert((await stat(path.join(dist, match[1]))).isFile(), `Missing asset: ${match[1]}`);
}
assert(css.includes('prefers-reduced-motion'), 'Reduced motion must be supported');
assert(js.includes('AbortController'), 'Downloads must be cancellable');
assert(js.includes("digest('SHA-256'"), 'Downloads must be verified');
for (const name of await readdir(dist)) {
  if (name.endsWith('.js')) assert.equal(spawnSync(process.execPath, ['--check', path.join(dist, name)]).status, 0, `${name} syntax`);
}
const manifest = JSON.parse(await readFile(path.join(dist, 'downloads/manifest.json'), 'utf8'));
const hash = createHash('sha256');
let bytes = 0;
for (const part of manifest.parts) {
  const buffer = await readFile(path.join(dist, part.url));
  assert.equal(buffer.length, part.bytes);
  assert(buffer.length < 25 * 1024 * 1024, 'Static assets must stay small');
  hash.update(buffer); bytes += buffer.length;
}
assert.equal(bytes, manifest.bytes);
assert.equal(hash.digest('hex'), manifest.sha256);
assert.equal(manifest.sha256, '5b5560bab0d8172f37c46f125a401f3fb7d1d99c635fc31062b333efc1091c8f');
const hosting = JSON.parse(await readFile(path.join(root, '.openai/hosting.json'), 'utf8'));
assert.equal(hosting.static.directory, 'dist');
console.log(JSON.stringify({ result: 'passed', htmlIds: ids.length, apkBytes: bytes, downloadParts: manifest.parts.length, sha256: manifest.sha256, checks: ['asset references', 'anchor targets', 'unique ids', 'JavaScript syntax', 'motion support', 'APK integrity', 'hosting manifest'] }));
