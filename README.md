# TrashTrack · Balete Journey

A standalone, buildless introduction and Android download website. The existing Android app and administrative dashboards are separate projects.

Run `npm run dev`, then open http://127.0.0.1:4317. Run `npm run check` for source and download integrity checks. `dist/` contains the complete deployable site.

The opening types “Welcome to Balete.”, glides through the supplied landscape, and drives a separate SVG collection truck along a curved road. It is skippable, replayable, keyboard accessible, and suppressed for reduced motion. The site remembers the intro for the current browser session. Pause motion is available in the footer. Clouds, leaves, the lake shimmer, phone, truck and parallax scenery move independently.

App feature tabs show the existing Soft World app screenshots. Screen data is illustrative. The sorting exercise is a browser-local learning example with a reminder to follow barangay guidance.

The Android download is the unchanged `output/TrashTrack-Soft-World.apk` preview, version 1.0.2, 67,309,420 bytes. It is distributed in five small static files, reassembled in the browser, and checked against SHA-256 `5b5560bab0d8172f37c46f125a401f3fb7d1d99c635fc31062b333efc1091c8f` before saving as one APK. This is a debug/preview distribution, not a Play Store release. The existing app service configuration is preserved.

`scripts/prepare-assets.mjs` creates optimized WebP assets from the existing workspace references and copies the original preview APK into parts. It uses the workspace's existing Sharp installation, and is unnecessary for serving the checked-in `dist/` output. Landscape attribution and the original artwork prompt are in `../output/soft-world-ui/ARTWORK-SOURCES.md`. The supplied TrashTrack logo is preserved. Outfit's SIL license is included in `dist/assets/Outfit-OFL.txt`.

The website collects no form submissions or resident records. Optional browser storage remembers motion preferences and the current session's intro. Hosting access is configured independently in Sites.
