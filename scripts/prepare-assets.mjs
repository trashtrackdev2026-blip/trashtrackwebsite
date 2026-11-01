import { createRequire } from 'node:module';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const workspace = path.resolve(root, '..');
const require = createRequire(path.join(workspace, 'trashtrack-web/package.json'));
const sharp = require('sharp');
const assets = path.join(root, 'dist/assets');
await mkdir(assets, { recursive: true });
const jobs = [
  ['output/soft-world-ui/balete-soft-world-master.png', 'balete-landscape.webp', 1920, 88],
  ['resident-app/branding/trashtrack-logo-transparent.png', 'logo.webp', 160, 90],
  ['trashtrack-web/public/images/signin-corner-foliage.webp', 'foliage.webp', 1000, 88],
  ['output/soft-world-ui/soft-world-home.png', 'app-home.webp', 660, 88],
  ['output/soft-world-ui/soft-world-collections.png', 'app-collections.webp', 660, 88],
  ['output/soft-world-ui/soft-world-chat-conversation.png', 'app-assist.webp', 660, 88],
  ['output/soft-world-ui/soft-world-report.png', 'app-report.webp', 660, 88],
  ['output/soft-world-ui/soft-world-events.png', 'app-events.webp', 660, 88],
];
await Promise.all(jobs.map(async ([source, name, width, quality]) => {
  await sharp(path.join(workspace, source)).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(path.join(assets, name));
}));
await copyFile(path.join(workspace, 'trashtrack-web/src/app/fonts/Outfit-Latin.woff2'), path.join(assets, 'outfit.woff2'));
await copyFile(path.join(workspace, 'output/soft-world-ui/Outfit-OFL.txt'), path.join(assets, 'Outfit-OFL.txt'));

// Small parts keep the existing APK within static-host per-file limits.
// The browser verifies and reassembles the exact original APK before saving it.
const apk = await readFile(path.join(workspace, 'output/TrashTrack-Soft-World.apk'));
const downloadDir = path.join(root, 'dist/downloads');
await mkdir(downloadDir, { recursive: true });
const chunkSize = 16 * 1024 * 1024;
const parts = [];
for (let offset = 0; offset < apk.length; offset += chunkSize) {
  const name = `trashtrack-${parts.length + 1}.bin`;
  const buffer = apk.subarray(offset, Math.min(offset + chunkSize, apk.length));
  await writeFile(path.join(downloadDir, name), buffer);
  parts.push({ url: `downloads/${name}`, bytes: buffer.length });
}
const manifest = {
  filename: 'TrashTrack-Soft-World-preview.apk',
  version: '1.0.2',
  channel: 'Android preview build',
  minAndroid: '7.0',
  bytes: apk.length,
  sha256: createHash('sha256').update(apk).digest('hex'),
  parts,
};
await writeFile(path.join(downloadDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ images: jobs.length, apkBytes: apk.length, apkParts: parts.length, sha256: manifest.sha256 }));
