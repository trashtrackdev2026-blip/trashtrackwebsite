import { createRequire } from 'node:module';
import { copyFile, mkdir } from 'node:fs/promises';
import { prepareDownload } from './prepare-download.mjs';
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

await prepareDownload();
console.log(JSON.stringify({ images: jobs.length }));
