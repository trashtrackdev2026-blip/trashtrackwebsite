# TrashTrack · Balete Journey, editorial redesign

A standalone, buildless introduction and Android download website. The existing Android app and administrative dashboards are separate projects.

Run `npm run dev`, then open http://127.0.0.1:4317. Run `npm run check` for source and download integrity checks. `dist/` contains the complete deployable site.

The design uses an edge-to-edge cinematic Balete panorama, deep forest greens, warm ivory, Outfit typography paired with editorial serif accents, consistent Lucide line icons, and numbered journey chapters. The hero uses an actual app screenshot; the feature showcase recreates the Android UI with working HTML controls.

The opening plays on every full page load and refresh, then reveals the top of the homepage. “Welcome to” and “Balete.” rise into view in sequence while a collection truck follows the road in the panorama. Skip intro opens the homepage immediately. The panorama is decoded before the animation starts, with a bounded fallback. The local preview runs the full effects for design review. The hosted site follows the visitor’s system motion preference.

Immediately after the hero, an automatic feature show presents collections, scan and learn, reporting, and community events. Each feature holds its complete headline while an interactive HTML phone demonstrates example actions. The chapter tabs select a feature and scrolling eases the panorama and foreground layers. Playback pauses offscreen, in a background tab, for reduced motion, and when the visitor interacts with the phone. See `AUTOMATIC-DEMO.md` for behavior and verification. `npm test` checks timing, pauses, chapter order, and completion of each phone sequence.

The interactive phone mirrors the existing Android app's Soft World UI: scenic home greeting, next collection card, collection schedule modal and outcome filters, Chat/Scan segments, four report categories, attachment/location previews, community event filters and search, and the five-tab Home/Reports/Assist/Events/You navigation. Profile panels use a sample resident. The automatic scan continues into a matching chat conversation. All demo records are illustrative; no reports or event registrations are sent. The Android app is unchanged. The sorting exercise remains a local learning example with a reminder to follow barangay guidance.

The device sits directly in the forest scene with a soft green glow and dark metallic frame. Tapping the phone lets visitors explore and keeps sample drafts, categories, attachments, location choices, event registrations, and search when changing phone tabs. Assist accepts typed questions with bounded local example replies. Reports can open an illustrative timeline after review. Screen transitions, button feedback, and the scanner respect system motion preferences. LinkeDOM is used only for development tests.

The Android download is the tested `output/report-photo-required/TrashTrack-1.0.16.apk` preview, version 1.0.16, 71,356,952 bytes. The browser reassembles the five versioned parts and checks the SHA-256 pinned in `android-release.json` before saving the APK. The download dialog guides the visitor through downloading, opening, allowing installation if prompted, and installing the preview on their Android phone.

`scripts/prepare-assets.mjs` creates optimized WebP assets from the existing workspace references and packages the verified preview APK. Run `node scripts/prepare-download.mjs` to update only the download. `android-release.json` pins the expected version, byte length and hash. `scripts/redesign-markup.mjs` recreates the current markup and Lucide symbols using existing workspace React dependencies. Neither is needed to serve the checked-in `dist/` output. The cinematic landscape is already packaged locally in `dist/assets/balete-cinematic.webp`; its built-in image-generation prompt is recorded in `ARTWORK.md`. Earlier landscape attribution is in `../output/soft-world-ui/ARTWORK-SOURCES.md`. The supplied TrashTrack logo is preserved. Outfit's SIL license and the Lucide license are included in `dist/assets/`.

The website collects no form submissions or resident records. Hosting access is configured independently in Sites.

## GitHub publication

The deployable website is in `dist/`. For a static hosting service, set its publish directory to `dist` and leave the build command empty. `npm ci`, `npm test` and `npm run check` validate a fresh checkout. This repository does not contain resident records or production service credentials.
