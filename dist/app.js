import { startFeatureShow } from './feature-show.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let featureShow = null;
const storage = {
  get(key, session = false) { try { return (session ? sessionStorage : localStorage).getItem(key); } catch { return null; } },
  set(key, value, session = false) { try { (session ? sessionStorage : localStorage).setItem(key, value); } catch { /* Storage is optional. */ } },
};

// A single preference controls decorative motion; system reduced motion takes priority.
let paused = storage.get('trashtrack-motion') === 'playing' ? false : reducedMotion.matches || storage.get('trashtrack-motion') === 'paused';
function syncMotion() {
  root.classList.toggle('motion-paused', paused);
  root.classList.toggle('motion-enabled', !paused);
  $('#motion-toggle').setAttribute('aria-pressed', String(paused));
  $('#motion-toggle span').textContent = paused ? 'Enable motion' : 'Pause motion';
  $('#motion-toggle use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  featureShow?.setMotion(paused);
}
syncMotion();
$('#motion-toggle').addEventListener('click', () => {
  paused = !paused;
  storage.set('trashtrack-motion', paused ? 'paused' : 'playing');
  syncMotion();
  requestUpdate();
});
reducedMotion.addEventListener('change', () => {
  paused = storage.get('trashtrack-motion') === 'playing' ? false : reducedMotion.matches || storage.get('trashtrack-motion') === 'paused';
  syncMotion();
  if (paused) closeIntro();
});

// A short, cancellable opening with a keyboard-safe skip action.
const intro = $('#intro');
let introTimers = [];
let introReturnFocus;
let introOpen = false;
let introGeneration = 0;
let automaticArrival = false;
function later(callback, delay) {
  const timer = setTimeout(callback, delay);
  introTimers.push(timer);
  return timer;
}
function closeIntro() {
  if (!introOpen) return;
  introOpen = false;
  introGeneration++;
  introTimers.forEach(clearTimeout);
  introTimers = [];
  intro.classList.add('departing');
  $('#site-content').inert = false;
  document.body.classList.remove('intro-active');
  featureShow?.setArrival(false);
  root.classList.remove('arrival-pending');
  if (automaticArrival && (!location.hash || location.hash === '#home')) window.scrollTo({ top: 0, behavior: 'instant' });
  if (introReturnFocus?.isConnected) introReturnFocus.focus({ preventScroll: true });
  else $('.site-header .brand').focus({ preventScroll: true });
  setTimeout(() => { if (!introOpen) intro.hidden = true; }, paused ? 0 : 800);
}
function showIntro(replay = false) {
  introTimers.forEach(clearTimeout);
  introTimers = [];
  const generation = ++introGeneration;
  introReturnFocus = replay ? document.activeElement : null;
  automaticArrival = !replay;
  introOpen = true;
  intro.hidden = false;
  intro.classList.remove('departing', 'is-running');
  // Restart only the opening scene's animations when replaying.
  if (replay) {
    $$('.intro-scene, .intro-truck, .intro-loading', intro).forEach(element => {
      element.style.animation = 'none';
      void element.offsetWidth;
      element.style.animation = '';
    });
  }
  $('#site-content').inert = true;
  document.body.classList.add('intro-active');
  featureShow?.setArrival(true);
  root.classList.remove('arrival-pending');
  $('#typed-intro').textContent = '';
  $('#intro-line').classList.remove('visible');
  $('#intro-progress').textContent = '01 / 03';
  $('#skip-intro').focus({ preventScroll: true });
  const message = 'Welcome to Balete.';
  if (paused) {
    $('#typed-intro').textContent = message;
    $('#intro-line').classList.add('visible');
    later(closeIntro, 1400);
    return;
  }
  let started = false;
  function begin() {
    if (started || !introOpen || generation !== introGeneration) return;
    started = true;
    intro.classList.add('is-running');
    [...message].forEach((character, index) => later(() => {
      $('#typed-intro').textContent += character;
    }, 350 + index * 77));
    later(() => { $('#intro-progress').textContent = '02 / 03'; }, 1400);
    later(() => { $('#intro-line').classList.add('visible'); }, 1950);
    later(() => { $('#intro-progress').textContent = '03 / 03'; }, 3000);
    later(closeIntro, 4200);
  }
  const backdrop = new Image();
  backdrop.src = 'assets/balete-cinematic.webp';
  if (backdrop.complete && backdrop.naturalWidth) begin();
  else { backdrop.decode().then(begin, begin); later(begin, 1100); }
}
$('#skip-intro').addEventListener('click', closeIntro);
function replayArrival() {
  if (paused) { paused = false; storage.set('trashtrack-motion', 'playing'); syncMotion(); }
  showIntro(true);
  layoutRoads();
}
$('#replay-intro').addEventListener('click', replayArrival);
$$('[data-replay]').forEach(button => button.addEventListener('click', replayArrival));
document.addEventListener('keydown', event => {
  if (!introOpen) return;
  if (event.key === 'Escape') closeIntro();
  if (event.key === 'Tab') { event.preventDefault(); $('#skip-intro').focus(); }
});

// The SVG roads scale with their containers, including on small phones.
function layoutRoads() {
  const heroRoad = $('.hero-road');
  const w = heroRoad.clientWidth / 1440;
  const h = heroRoad.clientHeight / 210;
  $('.hero-truck').style.offsetPath = `path('M${-80*w} ${170*h}C${220*w} ${220*h} ${295*w} ${38*h} ${620*w} ${94*h}S${1090*w} ${224*h} ${1510*w} ${83*h}')`;
  $('.hero-truck').style.offsetAnchor = '50% 100%';
  const introRoad = $('.intro-road');
  // Hidden intros have no box; the replay calls this after making them visible.
  const iw = (introRoad.clientWidth || innerWidth * 1.1) / 1440;
  const ih = (introRoad.clientHeight || 190) / 190;
  $('.intro-truck').style.offsetPath = `path('M${-100*iw} ${180*ih}C${200*iw} ${210*ih} ${260*iw} ${40*ih} ${650*iw} ${103*ih}S${1080*iw} ${210*ih} ${1540*iw} ${40*ih}')`;
  $('.intro-truck').style.offsetAnchor = '50% 100%';
}

// Passive input and a single animation frame keep parallax work bounded.
let ticking = false;
let pointerX = 0;
let pointerY = 0;
function updateScene() {
  ticking = false;
  const y = window.scrollY;
  $('#header').classList.toggle('scrolled', y > 70);
  if (paused) return;
  const hero = $('.hero');
  if (y < hero.offsetHeight + 100) {
    hero.style.setProperty('--landscape-y', `${Math.min(y * .14, 110) + pointerY * 4}px`);
    hero.style.setProperty('--phone-y', `${Math.min(y * .055, 45) + pointerY * -5}px`);
    hero.style.setProperty('--foreground-y', `${Math.max(-y * .065, -65) + pointerY * -7}px`);
    hero.style.setProperty('--road-y', `${Math.max(-y * .025, -25)}px`);
    hero.style.setProperty('--atmosphere-x', `${pointerX * 5}px`);
  }
  const journeyRect = $('#journey').getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (innerHeight - journeyRect.top) / (innerHeight + journeyRect.height)));
  $('#journey').style.setProperty('--journey-progress', String(progress));
}
function requestUpdate() {
  if (!ticking) { ticking = true; requestAnimationFrame(updateScene); }
}
addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', () => { layoutRoads(); requestUpdate(); }, { passive: true });
if (matchMedia('(pointer: fine)').matches) {
  $('.hero').addEventListener('pointermove', event => {
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
    requestUpdate();
  }, { passive: true });
  $('.hero').addEventListener('pointerleave', () => { pointerX = pointerY = 0; requestUpdate(); });
}
document.addEventListener('visibilitychange', () => {
  root.classList.toggle('tab-inactive', document.hidden);
  if (!document.hidden) requestUpdate();
});

// Content remains visible if observation is unsupported or motion is reduced.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  root.classList.add('js-reveals');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  $$('.reveal').forEach(element => observer.observe(element));
}

// Responsive navigation also closes after selecting an anchor or pressing Escape.
const menuButton = $('.menu-toggle');
function closeMenu() { $('#mobile-nav').hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('#mobile-nav').hidden = !open;
});
$$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#mobile-nav').hidden) { closeMenu(); menuButton.focus(); }
});
matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Automatic demonstrations advance by time, independently of scrolling.
featureShow = startFeatureShow({
  paused,
  enableMotion() { paused = false; storage.set('trashtrack-motion','playing'); syncMotion(); requestUpdate(); },
});
$$('[data-feature-link]').forEach(link => link.addEventListener('click',event=>{
  event.preventDefault();featureShow.select(link.dataset.featureLink,{scroll:true});
}));

// A bounded learning example, not an assertion about local collection policies.
let selectedItem = 'bottle';
const items = {
  bottle: { correct: 'recyclable', prompt: 'Where would you put a clean plastic bottle?', success: 'That’s the idea! A clean, empty plastic bottle is a common recyclable. Check which plastics your local collection accepts.' },
  banana: { correct: 'biodegradable', prompt: 'Where would you put a banana peel?', success: 'You’ve got it! A banana peel is biodegradable. Compost it where suitable, or follow your barangay’s organic-waste guidance.' },
};
$$('.item-choice').forEach(button => button.addEventListener('click', () => {
  selectedItem = button.dataset.item;
  $$('.item-choice').forEach(choice => { const active = choice === button; choice.classList.toggle('active', active); choice.setAttribute('aria-pressed', String(active)); });
  $('#sorting-item use').setAttribute('href', `#${selectedItem}`);
  $('#sorting-prompt').textContent = items[selectedItem].prompt;
  $('#sorting-feedback').textContent = 'Pick a bin below. A little practice goes a long way.';
  $('#sorting-feedback').className = 'sorting-feedback';
  $$('.bin-choice').forEach(bin => bin.classList.remove('correct-bin'));
  $('.sorting-playground').classList.remove('correct');
}));
$$('.bin-choice').forEach(button => button.addEventListener('click', () => {
  const correct = button.dataset.bin === items[selectedItem].correct;
  const feedback = $('#sorting-feedback');
  feedback.className = `sorting-feedback ${correct ? 'success' : 'retry'}`;
  if (correct) {
    feedback.textContent = items[selectedItem].success;
    $$('.bin-choice').forEach(bin => bin.classList.toggle('correct-bin', bin === button));
    $('.sorting-playground').classList.remove('correct');
    void $('.sorting-playground').offsetWidth;
    $('.sorting-playground').classList.add('correct');
  } else {
    feedback.textContent = selectedItem === 'bottle' ? 'Try again. Think about materials that can be collected and made into something new.' : 'Try again. Think about an item that can break down naturally.';
  }
}));

// Native dialogs supply focus trapping and Escape support.
const downloadDialog = $('#download-dialog');
$$('.download-open').forEach(button => button.addEventListener('click', () => downloadDialog.showModal()));
$$('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
}));
$('#privacy-open').addEventListener('click', () => $('#privacy-dialog').showModal());

// Reassemble and verify the existing, unchanged preview build before saving.
let downloadController;
let downloadObjectUrl;
let activeDownload = false;
function saveDownload() {
  const link = $('#download-save');
  link.click();
}
async function startDownload() {
  if (activeDownload) return;
  if (downloadObjectUrl) { saveDownload(); return; }
  const start = $('#download-start');
  const status = $('#download-status');
  const progress = $('#download-progress');
  activeDownload = true;
  start.disabled = true;
  progress.hidden = false;
  progress.value = 0;
  $('#download-cancel').hidden = false;
  downloadController = new AbortController();
  const { signal } = downloadController;
  try {
    status.textContent = 'Preparing your Android preview…';
    const response = await fetch('downloads/manifest.json', { signal });
    if (!response.ok) throw new Error('The download is temporarily unavailable. Please try again.');
    const manifest = await response.json();
    let received = 0;
    const buffers = [];
    for (const part of manifest.parts) {
      const partResponse = await fetch(part.url, { signal });
      if (!partResponse.ok) throw new Error('The download was interrupted. Please try again.');
      const reader = partResponse.body.getReader();
      let partReceived = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffers.push(value);
        received += value.byteLength;
        partReceived += value.byteLength;
        progress.value = Math.round(received / manifest.bytes * 95);
        status.textContent = `Downloading… ${(received / 1048576).toFixed(1)} of ${(manifest.bytes / 1048576).toFixed(1)} MB`;
      }
      if (partReceived !== part.bytes) throw new Error('The download was incomplete. Please try again.');
    }
    if (received !== manifest.bytes) throw new Error('The download was incomplete. Please try again.');
    status.textContent = 'Checking your download…';
    const blob = new Blob(buffers, { type: 'application/vnd.android.package-archive' });
    const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    const actualHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (actualHash !== manifest.sha256) throw new Error('The file check did not pass. Please download again.');
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    downloadObjectUrl = URL.createObjectURL(blob);
    const link = $('#download-save');
    link.href = downloadObjectUrl;
    link.download = manifest.filename;
    link.hidden = false;
    progress.value = 100;
    status.textContent = 'Your verified APK is ready. Open the saved file on your Android phone to install. If it did not save, choose “Save APK again.”';
    $('#download-start span').textContent = 'Download again';
    saveDownload();
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'Download cancelled. You can start again whenever you’re ready.' : (error.message || 'Could not complete the download. Please try again.');
    progress.hidden = true;
  } finally {
    activeDownload = false;
    start.disabled = false;
    $('#download-cancel').hidden = true;
  }
}
$('#download-start').addEventListener('click', startDownload);
$('#download-cancel').addEventListener('click', () => downloadController?.abort());
downloadDialog.addEventListener('close', () => { if (activeDownload) downloadController?.abort(); });
addEventListener('pagehide', () => {
  downloadController?.abort();
  if (downloadObjectUrl) {
    URL.revokeObjectURL(downloadObjectUrl);
    downloadObjectUrl = null;
    $('#download-save').hidden = true;
    $('#download-start span').textContent = 'Download Android preview';
  }
});

// Every full page opening gets the arrival; same-page anchors do not restart it.
if (!location.hash || location.hash === '#home') {
  history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, behavior: 'instant' });
}
showIntro();
layoutRoads();
requestUpdate();
