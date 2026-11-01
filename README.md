# TrashTrack · Balete Journey, editorial redesign

A standalone, buildless introduction and Android download website. The existing Android app and administrative dashboards are separate projects.

Run `npm run dev`, then open http://127.0.0.1:4317. Run `npm run check` for source and download integrity checks. `dist/` contains the complete deployable site.

The design uses an edge-to-edge cinematic Balete panorama, deep forest greens, warm ivory, Outfit typography paired with editorial serif accents, consistent Lucide line icons, and numbered journey chapters. The app showcase uses actual native screenshots inside refined device frames.

The opening types “Welcome to Balete.” over a slow camera move, with a small independent collection truck following a fine route. It is skippable, replayable, keyboard accessible, and suppressed for reduced motion. The intro is remembered for the current browser session; the redesign uses a fresh session key. “Play the arrival” on the hero and “Take the journey again” near the download replay it. Pause motion is available in the footer. Sky, mist, leaves, lake reflections, device and route move at separate restrained speeds, with scroll-driven landscape parallax and a progress marker through the journey chapters.

App feature tabs show the existing Soft World app screenshots. Screen data is illustrative. The sorting exercise is a browser-local learning example with a reminder to follow barangay guidance.

The Android download is the unchanged `output/TrashTrack-Soft-World.apk` preview, version 1.0.2, 67,309,420 bytes. It is distributed in five small static files, reassembled in the browser, and checked against SHA-256 `5b5560bab0d8172f37c46f125a401f3fb7d1d99c635fc31062b333efc1091c8f` before saving as one APK. This is a debug/preview distribution, not a Play Store release. The existing app service configuration is preserved.

`scripts/prepare-assets.mjs` creates optimized WebP assets from the existing workspace references and copies the original preview APK into parts. `scripts/redesign-markup.mjs` recreates the current markup and Lucide symbols using existing workspace React dependencies. Neither is needed to serve the checked-in `dist/` output. The cinematic landscape is already packaged locally in `dist/assets/balete-cinematic.webp`; its built-in image-generation prompt is recorded in `ARTWORK.md`. Earlier landscape attribution is in `../output/soft-world-ui/ARTWORK-SOURCES.md`. The supplied TrashTrack logo is preserved. Outfit's SIL license and the Lucide license are included in `dist/assets/`.

The website collects no form submissions or resident records. Optional browser storage remembers motion preferences and the current session's intro. Hosting access is configured independently in Sites.
