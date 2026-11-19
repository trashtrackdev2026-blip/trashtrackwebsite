import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(path.resolve(root, '../trashtrack-web/package.json'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const lucide = require('lucide-react');
const file = path.join(root, 'dist/index.html');
const previous = await readFile(file, 'utf8');
let library = previous.match(/<svg class="svg-library"[\s\S]*?<\/svg>/)[0];
const map = { 'i-arrow':'ArrowUpRight', 'i-down':'Download', 'i-leaf':'Leaf', 'i-calendar':'CalendarDays', 'i-scan':'ScanLine', 'i-report':'MessageCircleWarning', 'i-people':'UsersRound', 'i-pin':'MapPin', 'i-play':'Play', 'i-pause':'Pause', 'i-close':'X', 'i-android':'Smartphone', 'i-check':'Check', 'bottle':'Milk', 'banana':'Banana', 'i-recycle':'Recycle', 'i-trash':'Trash2', 'i-route':'Route', 'i-chevron':'ChevronDown' };
Object.assign(map, {'i-home':'House','i-document':'FileText','i-user':'UserRound','i-camera':'Camera','i-bell':'Bell','i-clock':'Clock3','i-book':'BookOpen','i-qr':'QrCode','i-left':'ArrowLeft','i-right':'ChevronRight','i-image':'Image','i-send':'Send','i-target':'LocateFixed','i-search':'Search','i-settings':'Settings','i-help':'CircleHelp','i-info':'Info','i-logout':'LogOut','i-touch':'MousePointer2'});
Object.assign(map, {'i-forward':'ArrowRight','i-scroll':'ArrowDown'});
for (const [id, name] of Object.entries(map)) {
  const markup = renderToStaticMarkup(React.createElement(lucide[name], { strokeWidth:1.5 }));
  const inner = markup.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  const symbol = `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`;
  const pattern = new RegExp(`<symbol id="${id}"[\\s\\S]*?<\\/symbol>`);
  library = pattern.test(library) ? library.replace(pattern, symbol) : library.replace('</defs>', symbol+'</defs>');
}
const icon = (name, cls='') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const wordmark = '<img src="assets/logo.webp" alt="" width="44" height="44"><span>TrashTrack</span>';
const release = JSON.parse(await readFile(path.join(root, 'android-release.json'), 'utf8'));
const releaseSize = `${(release.bytes / (1024 * 1024)).toFixed(1)} MB`;
const installGuide = (await readFile(path.join(root, 'fragments/install-guide.html'), 'utf8'))
  .replaceAll('{{VERSION}}', release.version)
  .replaceAll('{{FILENAME}}', release.filename)
  .replaceAll('{{SIZE}}', releaseSize);
const privacyDialog = previous.match(/<dialog id="privacy-dialog"[\s\S]*?<\/dialog>/)[0]
  .replace('Motion preferences are saved on this device, and the arrival plays on each full page opening.', 'The arrival follows your device’s motion preference.')
  .replace('Its existing preview build is provided unchanged.', 'This website provides the Android preview and an installation guide.');
const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#142d27">
<title>TrashTrack — A little care. A greener Balete.</title>
<meta name="description" content="For the place we call home. Discover TrashTrack for Balete: collection schedules, waste guidance, reports and community events. Download the Android preview.">
<meta property="og:title" content="TrashTrack — A greener Balete"><meta property="og:description" content="A little care for the place we call home."><meta property="og:type" content="website">
<link rel="icon" type="image/webp" href="assets/logo.webp"><link rel="preload" href="assets/outfit.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="assets/balete-cinematic.webp" as="image" fetchpriority="high">
<link rel="stylesheet" href="styles.css"><script type="module" src="app.js"></script></head><body>
<a class="skip-link" href="#main">Skip to content</a>
${library}
<section id="intro" class="intro arrival" role="dialog" aria-modal="true" aria-labelledby="intro-title" hidden>
  <div class="arrival-camera" aria-hidden="true">
    <div class="arrival-photo"></div>
    <div class="arrival-wash"></div>
    <svg class="arrival-route" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
      <defs><path id="arrival-road" d="M717 800C864 783 900 758 933 714S990 628 1059 580 1104 545 1118 523"/></defs>
      <use class="arrival-dashes" href="#arrival-road"/>
      <g class="arrival-truck-still" transform="translate(950 693) rotate(-48)"><use href="#truck" x="-23" y="-19" width="46" height="23"/></g>
      <g class="arrival-truck-moving"><use href="#truck" x="-23" y="-19" width="46" height="23"/>
        <animateMotion id="arrival-travel" dur="4.2s" begin="indefinite" fill="freeze" rotate="auto"><mpath href="#arrival-road"/></animateMotion>
      </g>
    </svg>
  </div>
  <header class="landing-wrap arrival-header">
    <div class="brand">${wordmark}</div>
    <button id="skip-intro" class="arrival-skip" type="button">Skip intro ${icon('forward')}</button>
  </header>
  <div class="arrival-copy">
    <span class="eyebrow">Balete, Batangas</span>
    <h2 id="intro-title"><span>Welcome to</span><em>Balete.</em></h2>
  </div>
  <div class="landing-wrap arrival-footer">
    <span class="arrival-track" aria-hidden="true"></span>
    <button id="explore-intro" class="arrival-explore" type="button">Explore TrashTrack ${icon('forward')}</button>
  </div>
</section>
<div id="site-content">
<header class="site-header landing-header" id="header">
  <div class="header-inner landing-wrap">
    <a class="brand" href="#home" aria-label="TrashTrack home">${wordmark}</a>
    <div class="landing-header-tools">
      <nav class="desktop-nav" aria-label="Main navigation"><a href="#inside">Features</a><a href="#sorting">Try sorting</a><a href="#faq">FAQ</a></nav>
      <div class="header-actions"><a class="header-download" href="#download">Get the app ${icon('forward')}</a><button type="button" class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="#inside">Features</a><a href="#sorting">Try sorting</a><a href="#faq">FAQ</a><a href="#download">Download for Android</a></nav>
</header>
<main id="main">
<section id="home" class="hero landing-hero" aria-labelledby="hero-title">
  <div class="hero-landscape" aria-hidden="true"></div><div class="hero-shade" aria-hidden="true"></div>
  <div class="landing-wrap hero-inner">
    <div class="hero-copy">
      <span class="eyebrow hero-eyebrow">${icon('pin')}Balete, Batangas</span>
      <h1 id="hero-title" tabindex="-1"><span>A little care.</span><span>A greener</span><em>Balete.</em></h1>
      <p class="hero-description">See when waste is collected, report concerns, and find out what goes in each bin.</p>
      <a class="button button-primary" href="#download">${icon('down')}Get the Android app</a>
      <a class="hero-cue" href="#inside">${icon('scroll')}Scroll to explore</a>
    </div>
    <div class="hero-phone-area">
      <div class="phone hero-phone"><div class="phone-speaker" aria-hidden="true"></div><img src="assets/app-home.webp" alt="TrashTrack resident home screen with an illustrative collection schedule" width="660" height="1467" fetchpriority="high"></div>
      <span class="hero-place">${icon('pin')}Poblacion, Balete</span>
    </div>
  </div>
</section>
<section id="our-home" class="community-panorama" aria-labelledby="home-title">
  <div class="container" data-motion-reveal>
    <span class="eyebrow section-label">Community events</span>
    <h2 id="home-title">Care for Balete, <em>together.</em></h2>
    <p>Find local cleanups, workshops, and other activities you can join through TrashTrack.</p>
    <a class="text-link" href="#inside" data-feature-link="events">Explore community events</a>
  </div>
</section>
<section class="journey section-pad" id="journey" aria-labelledby="journey-title"><div class="container journey-layout"><div class="journey-heading reveal"><span class="eyebrow section-label"><span class="section-index">02 /</span> THE EVERYDAY JOURNEY</span><h2 id="journey-title">Small steps.<br>A better<br><em>everyday.</em></h2><p>A cleaner community starts close to home.<br>Here’s where a little care can take you.</p><a class="text-link" href="#inside">See how the app helps ${icon('arrow')}</a><div class="journey-signature">A little care goes a long way.<span>BALETE, BATANGAS</span></div></div><div class="journey-chapters"><div class="journey-rail" aria-hidden="true"><span class="journey-rail-progress"></span><span class="journey-marker">${icon('route')}</span></div>
  <article class="journey-stop reveal"><div class="chapter-top"><span class="eyebrow">01 — PREPARE</span>${icon('calendar')}</div><h3>Know what’s next.</h3><p>Find your barangay’s posted collection schedule. Check the notes, prepare your waste, and make collection day a little easier.</p><a href="#inside" data-feature-link="collections" class="chapter-link">Know your collection ${icon('arrow')}</a><span class="chapter-number" aria-hidden="true">01</span></article>
  <article class="journey-stop reveal"><div class="chapter-top"><span class="eyebrow">02 — UNDERSTAND</span>${icon('scan')}</div><h3>Give waste a better direction.</h3><p>A bottle, a peel, a little uncertainty. Scan an item or ask TrashTrack Assist for a little guidance on what to do next.</p><a href="#sorting" class="chapter-link">Try the waste guide ${icon('arrow')}</a><span class="chapter-number" aria-hidden="true">02</span></article>
  <article class="journey-stop reveal"><div class="chapter-top"><span class="eyebrow">03 — TAKE PART</span>${icon('report')}</div><h3>Care for your surroundings.</h3><p>Spot a waste concern? Share the details and follow updates in the app. Small observations can be the start of positive change.</p><a href="#inside" data-feature-link="reports" class="chapter-link">Explore community reporting ${icon('arrow')}</a><span class="chapter-number" aria-hidden="true">03</span></article>
</div></div></section>
<section class="inside section-pad" id="inside" aria-labelledby="inside-title"><div class="inside-watermark" aria-hidden="true">TrashTrack.</div><div class="container inside-layout"><div class="inside-copy reveal"><span class="eyebrow section-label"><span class="section-index">03 /</span> YOUR EVERYDAY COMPANION</span><h2 id="inside-title">A little help.<br>A little <em>head start.</em></h2><p class="inside-intro">Thoughtfully connected. Simply useful.<br>Explore the little things TrashTrack can help you do.</p><div class="feature-tabs" role="tablist" aria-label="Explore app features" aria-orientation="vertical">
${[['collections','calendar','Collection schedules','Your barangay. Your next collection.'],['assist','scan','Scan & learn','A little guidance for every item.'],['reports','report','Report a concern','Speak up for your surroundings.'],['events','people','Community events','Care is better when we do it together.']].map(([key,ico,title,sub],i)=>`<button id="tab-${key}" class="feature-tab${i===0?' active':''}" role="tab" aria-selected="${i===0}" aria-controls="feature-panel" ${i===0?'':'tabindex="-1"'} data-feature="${key}"><span class="feature-tab-index">0${i+1}</span>${icon(ico)}<span><strong>${title}</strong><small>${sub}</small></span>${icon('arrow','feature-arrow')}</button>`).join('')}
</div></div><div id="feature-panel" class="feature-panel reveal" role="tabpanel" tabindex="0" aria-labelledby="tab-collections"><div class="feature-stage"><span class="stage-caption">DESIGNED AROUND YOUR EVERYDAY</span><div class="stage-line" aria-hidden="true"></div><div class="phone feature-phone"><div class="phone-speaker" aria-hidden="true"></div><img id="feature-screen" src="assets/app-collections.webp" alt="TrashTrack collection schedule screen with illustrative preview data" width="660" height="1467" loading="lazy"></div><div class="feature-note"><span class="feature-note-number" id="feature-number">01 / 04</span><p id="feature-description">See posted dates, collection notes, and schedules for your barangay.</p></div></div><p class="demo-caption">Actual app screens · Illustrative preview data</p></div></div></section>
<section class="sorting section-pad" id="sorting" aria-labelledby="sorting-title"><div class="container sorting-layout"><div class="sorting-copy reveal"><span class="eyebrow section-label"><span class="section-index">04 /</span> A SMALL ACT, RIGHT NOW</span><h2 id="sorting-title">One little item.<br><em>A better choice.</em></h2><p>A little practice makes everyday sorting feel easier. Choose an item, then decide where you think it belongs.</p><div class="item-picker" role="group" aria-label="Choose an item to sort"><button class="item-choice active" type="button" data-item="bottle" aria-pressed="true"><svg aria-hidden="true"><use href="#bottle"/></svg>Plastic bottle</button><button class="item-choice" type="button" data-item="banana" aria-pressed="false"><svg aria-hidden="true"><use href="#banana"/></svg>Banana peel</button></div><p class="sorting-disclaimer">A simple learning example. Always follow your barangay’s collection and segregation guidance.</p></div><div class="sorting-playground reveal"><div class="guide-heading"><span class="eyebrow">THE WASTE GUIDE</span><span>TRY IT OUT ${icon('arrow')}</span></div><div class="sorting-object" aria-hidden="true"><svg id="sorting-item"><use href="#bottle"/></svg><span class="item-orbit"></span></div><span id="sorting-prompt" class="sorting-prompt">Where would you put a clean plastic bottle?</span><div class="bin-choices" role="group" aria-label="Choose a bin">${[['biodegradable','leaf','Biodegradable'],['recyclable','recycle','Recyclable'],['residual','trash','Residual']].map(([bin,ico,title])=>`<button class="bin-choice" type="button" data-bin="${bin}">${icon(ico)}<span>${title}</span><span class="bin-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div><div id="sorting-feedback" class="sorting-feedback" role="status" aria-live="polite">Small choices. Better habits. Give it a try.</div></div></div></section>
<section class="download download-montage" id="download" aria-labelledby="download-title">
  <div class="download-landscape" aria-hidden="true"></div>
  <div class="download-shade" aria-hidden="true"></div>
  <div class="container download-layout">
    <div class="download-copy" data-motion-reveal>
      <h2 id="download-title">Take TrashTrack <em>with you.</em></h2>
      <p>Check collection schedules, find sorting guidance, and follow local updates on your Android phone.</p>
    </div>
    <div class="download-actions">
      <button class="button button-primary download-open" type="button">${icon('down')}Get TrashTrack for Android</button>
      <span class="download-meta">Android 7.0+ · Version ${release.version} · Preview APK · ${releaseSize}</span>
    </div>
  </div>
</section>
<section class="faq section-pad" aria-labelledby="faq-title"><div class="container faq-layout"><div class="reveal"><span class="eyebrow section-label">THE LITTLE DETAILS</span><h2 id="faq-title">Good to <em>know.</em></h2><p>A few answers before you get started.</p></div><div class="faq-items reveal"><details><summary>Who is TrashTrack for?<span aria-hidden="true">+</span></summary><p>TrashTrack is designed for residents of Balete, Batangas. The app brings together barangay collection schedules, waste guidance, reporting and community events.</p></details><details><summary>How do I install the Android preview?<span aria-hidden="true">+</span></summary><p>Download the preview APK and open it on an Android 7.0 or newer device. Your phone may ask you to allow installation from your browser. This is a preview build distributed directly, rather than a Play Store release.</p></details><details><summary>Are the schedules shown here live?<span aria-hidden="true">+</span></summary><p>The website shows actual app screens with illustrative preview data. Open the app and check your barangay’s posted schedule for current collection information.</p></details><details><summary>Can I use TrashTrack on an iPhone?<span aria-hidden="true">+</span></summary><p>The download on this website is an Android APK. There is no iPhone download offered here.</p></details></div></div></section>
</main><footer class="footer"><div class="container footer-top"><span>FOR THE PLACE WE CALL HOME.</span><a href="#home">Back to the top ${icon('arrow')}</a></div><div class="container footer-wordmark" aria-hidden="true">TrashTrack<span>.</span></div><div class="container footer-bottom"><span>Made with care for Balete, Batangas.</span><div><button id="privacy-open" type="button">About this website</button></div></div></footer></div>
${installGuide}
${privacyDialog}
<noscript><div class="noscript-note">Enable JavaScript for the animated journey, interactive app preview and Android download.</div></noscript></body></html>`;
const phoneDemo = (await readFile(path.join(root, 'fragments/phone-demo.html'), 'utf8')).replace(/\{\{([\w-]+)\}\}/g, (_,name)=>icon(name));
const film = (await readFile(path.join(root, 'fragments/feature-film.html'), 'utf8')).replace('<!--PHONE_DEMO-->',phoneDemo);
const outputHtml = html.replace(/<section class="inside section-pad" id="inside"[\s\S]*?<\/section>/, '')
  .replace('<section id="our-home"', film + '\n<section id="our-home"')
  .replace('href="styles.css">','href="styles.css"><link rel="stylesheet" href="demo.css"><link rel="stylesheet" href="app-ui.css"><link rel="stylesheet" href="montage.css"><link rel="stylesheet" href="landing.css">')
  .replace('The website shows actual app screens with illustrative preview data. Open the app and check your barangay’s posted schedule for current collection information.','The interactive phone uses example data. Open the Android app and check your barangay’s posted schedule for current collection information.')
  .replace('App screens contain illustrative preview data; they do not display live resident records.','The interactive phone uses example data and does not display live resident records. Reports and event joins in the demo stay in this page.')
  .replace('This is a preview build distributed directly, rather than a Play Store release.</p>', 'This is a preview APK.</p><button type="button" class="text-link download-open">Open the installation guide</button>')
  .replace('the intro is remembered for the current browser session','the arrival plays on each full page opening')
  .replace('<section class="faq section-pad"', '<section id="faq" class="faq section-pad"')
  .replace('<link rel="stylesheet"', '<script>document.documentElement.classList.add("arrival-pending");setTimeout(()=>document.documentElement.classList.remove("arrival-pending"),8000);</script><link rel="stylesheet"');
await writeFile(file, outputHtml);
await copyFile(require.resolve('lucide-react/LICENSE'), path.join(root, 'dist/assets/Lucide-LICENSE.txt')).catch(()=>{});
console.log('Redesigned markup, consistent Lucide symbols, and cinematic landscape prepared.');
