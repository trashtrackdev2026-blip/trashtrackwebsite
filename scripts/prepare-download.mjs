import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const release = JSON.parse(await readFile(path.join(root, 'android-release.json'), 'utf8'));

export async function prepareDownload(source = path.resolve(root, '..', release.source)) {
  const apk = await readFile(source);
  const sha256 = createHash('sha256').update(apk).digest('hex');
  assert.equal(apk.length, release.bytes, 'APK size must match the verified release');
  assert.equal(sha256, release.sha256, 'Use the exact tested Android release');
  const directory = path.join(root, 'dist/downloads');
  await mkdir(directory, { recursive: true });
  const parts = [], chunkSize = 16 * 1024 * 1024;
  for (let offset = 0; offset < apk.length; offset += chunkSize) {
    const name = `trashtrack-${parts.length + 1}.bin`;
    const buffer = apk.subarray(offset, Math.min(offset + chunkSize, apk.length));
    await writeFile(path.join(directory, name), buffer);
    parts.push({ url: `downloads/${name}`, bytes: buffer.length });
  }
  const manifest = { filename: release.filename, version: release.version, channel: 'Android preview build',
    minAndroid: '7.0', bytes: apk.length, sha256, parts };
  await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ version: release.version, apkBytes: apk.length, apkParts: parts.length, sha256 }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareDownload(process.argv[2]);
}
