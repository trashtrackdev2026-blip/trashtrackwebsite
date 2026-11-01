# Automatic feature playback and interactive phone

The user’s reference video inspired the feature presentation. Following feedback about scroll lag and small text, the current version replaces the pinned scroll timeline with a normal-flow, time-based player.

The four chapters hold for 11, 12, 12.5 and 11 seconds. Headlines remain fully readable during each demonstration. Chapter transitions use a short opacity transition with a small vertical movement; scrolling does not control animation progress or chapter selection. Only the visible player runs. Background tabs and offscreen playback freeze their elapsed time, so returning never skips through chapters.

The phone renders interactive HTML that mirrors the existing Android app, using its Soft World reference screens. Home has the scenic Maria greeting, collection details, two action cards and learning materials. The schedule opens as a modal with All outcomes / Active / Completed / Unfinished filters. Assist uses the native Chat/Scan segments and conversation bubbles. Reports has all four categories, description, attachment and location previews. Events has Upcoming / My Participation / Archive, working search and registration previews. The five bottom tabs follow the native order: Home, Reports, Assist, Events, You. The Android source is unchanged.

Example actions open a schedule and filter outcomes, scan a preselected item and continue to Chat, type and review a concern, and open and join a community event. These actions use local example data. There is no live camera, AI request, report submission or registration request. Manually trying the phone pauses automatic chapter changes; Play demo and Replay feature restart the current demonstration.

The automatic arrival on every full page opening is preserved. Playback waits while the arrival is open. Motion preferences remain respected, with a short static arrival and manual feature controls when motion is paused.

Readability is improved across feature copy, controls, navigation, informational labels, forms, FAQs and footnotes. The phone uses crisp native text at its displayed size. On mobile, the copy has reserved space so chapter changes do not move the device vertically.

Source: `dist/feature-show.js`, `dist/show-clock.js`, `dist/phone-demo.js`, `dist/demo.css`, `dist/app-ui.css`, `fragments/feature-film.html` and `fragments/phone-demo.html`. The scene clock has no scroll-position input. Timing tests cover ordered looping, offscreen/user pauses, direct selection, delayed frames, complete demo sequences and stable scan/report states.

Browser validation covered 1440px desktop, 390px mobile and 320px compact mobile; automatic collection modal and chapter progression; manual collection filters, scan-to-chat, report category/details/review/completion, event filters/search/registration, and profile navigation. No browser errors were recorded. Static checks validate local assets, unique IDs, anchors, JavaScript syntax and the unchanged APK checksum.
