# Automatic arrival and scroll features

The user supplied a 35.61-second 1920 × 1080 video as inspiration, explicitly allowing adaptation rather than an exact copy. It was inspected locally as a 16-frame storyboard. The reference alternates short title beats with UI reveals, floating feature icons, layered cards, and gentle spatial rotation. Its other product, data and wording are not used on this website. The video is not included in the deployed assets.

The implementation keeps TrashTrack's cinematic Balete identity and adapts the motion idea into four scroll-controlled chapters. A headline reveals first; the accompanying surface, device and small supporting card follow. Each actual app screen is preloaded. The scan chapter adds a subtle scan line. The user can scrub in either direction, select a feature directly, navigate with arrow keys, or continue beyond the sequence. No wheel or touch scrolling is intercepted.

The arrival now starts on every full page opening, including refresh and deep links. A normal homepage visit starts at the hero after the intro. Browser motion preferences and the explicit pause control remain supported: the arrival still appears automatically as a short static introduction when motion is paused. Same-page anchor navigation does not deliberately restart the arrival.

Timeline calculations are in `dist/motion-math.js`; native-scroll orchestration and the bounded image-decoding startup are in `dist/app.js`. `fragments/feature-film.html` is composed into `dist/index.html` by the existing markup helper. The background, APK, Firebase configuration, and actual Android app are unchanged.
