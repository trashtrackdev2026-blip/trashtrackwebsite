import { startFeatureShow } from './feature-show.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const localPreview = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
let featureShow = null;
let paused = !localPreview && reducedMotion.matches;
function syncMotion() {
  root.classList.toggle('motion-paused', paused);
  root.classList.toggle('motion-enabled', !paused);
  featureShow?.setMotion(paused);
}
syncMotion();
reducedMotion.addEventListener('change', () => {
  if (localPreview) return;
  paused = reducedMotion.matches;
  syncMotion();
  if (paused) closeIntro();
  requestUpdate();
});

// A short, cancellable opening with a keyboard-safe skip action.
const intro = $('#intro');
const introActions = [$('#skip-intro'), $('#explore-intro')];
const truckTravel = $('#arrival-travel');
const arrivalDuration = 4200;
intro.style.setProperty('--arrival-duration', `${arrivalDuration}ms`);
let introTimers = [];
let introOpen = false;
let introGeneration = 0;
let materializeTimer;
function clearMaterialization() {
  clearTimeout(materializeTimer);
  document.body.classList.remove('landing-materializing');
}
function later(callback, delay) {
  const timer = setTimeout(callback, delay);
  introTimers.push(timer);
  return timer;
}
function showLandingTop() {
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function closeIntro({ skip = false } = {}) {
  if (!introOpen) return;
  introOpen = false;
  const generation = ++introGeneration;
  introTimers.forEach(clearTimeout);
  introTimers = [];
  const materialize = !paused && !skip;
  if (materialize) {
    document.body.classList.add('landing-materializing');
    materializeTimer = setTimeout(clearMaterialization, 2040);
  }
  intro.classList.add('departing');
  intro.inert = true;
  $('#site-content').inert = false;
  document.body.classList.remove('intro-active');
  featureShow?.setArrival(false);
  root.classList.remove('arrival-pending');
  showLandingTop();
  $('#hero-title').focus({ preventScroll: true });
  requestUpdate();
  setTimeout(() => { if (generation === introGeneration) intro.hidden = true; }, paused ? 0 : materialize ? 720 : 540);
}
function showIntro() {
  clearMaterialization();
  introTimers.forEach(clearTimeout);
  introTimers = [];
  const generation = ++introGeneration;
  introOpen = true;
  intro.hidden = false;
  intro.inert = false;
  intro.classList.remove('departing', 'is-running', 'route-running');
  $('#site-content').inert = true;
  document.body.classList.add('intro-active');
  featureShow?.setArrival(true);
  root.classList.remove('arrival-pending');
  introActions[0].focus({ preventScroll: true });
  if (paused) {
    later(closeIntro, 1800);
    return;
  }
  let started = false;
  function begin() {
    if (started || !introOpen || generation !== introGeneration) return;
    started = true;
    intro.classList.add('is-running');
    if (typeof truckTravel?.beginElement === 'function') {
      truckTravel.setAttribute('dur', `${arrivalDuration}ms`);
      intro.classList.add('route-running');
      truckTravel.beginElement();
    }
    later(closeIntro, arrivalDuration);
  }
  const backdrop = new Image();
  backdrop.src = 'assets/balete-cinematic.webp';
  if (backdrop.complete && backdrop.naturalWidth) begin();
  else { backdrop.decode().then(begin, begin); later(begin, 1100); }
}
introActions[0].addEventListener('click', () => closeIntro({ skip: true }));
introActions[1].addEventListener('click', () => closeIntro());
document.addEventListener('keydown', event => {
  if (!introOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); closeIntro({ skip: true }); }
  if (event.key === 'Tab') {
    event.preventDefault();
    const current = introActions.indexOf(document.activeElement);
    const next = current === -1 ? (event.shiftKey ? 1 : 0) : 1 - current;
    introActions[next].focus({ preventScroll: true });
  }
});

// Measure on input and ease each layer toward its new position across frames.
let sceneFrame = 0;
let measureScene = true;
let lastFrame = 0;
let pointerY = 0;
const hero = $('.landing-hero');
const montage = $('.montage-scene');
const journey = $('#journey');
const header = $('#header');
const layers = [
  { element: hero, property: '--landscape-y', current: 0, target: 0 },
  { element: hero, property: '--phone-y', current: 0, target: 0 },
  { element: montage, property: '--montage-panorama-y', current: 0, target: 0 },
  { element: montage, property: '--montage-leaves-y', current: 0, target: 0 },
];
function measureParallax() {
  const y = Math.max(0, window.scrollY);
  const journeyRect = journey.getBoundingClientRect();
  const scene = montage.getBoundingClientRect();
  const depth = Math.max(0, Math.min(1, (innerHeight - scene.top) / (innerHeight + scene.height))) - .5;
  header.classList.toggle('scrolled', y > 70);
  if (!paused) {
    layers[0].target = Math.min(y * .10, 72) + pointerY * 3;
    layers[1].target = Math.min(y * .047, 32) - pointerY * 4;
    layers[2].target = depth * 86;
    layers[3].target = depth * -115;
    const progress = Math.max(0, Math.min(1, (innerHeight - journeyRect.top) / (innerHeight + journeyRect.height)));
    journey.style.setProperty('--journey-progress', String(progress));
  }
}
function updateScene(timestamp) {
  sceneFrame = 0;
  if (document.hidden) { lastFrame = 0; return; }
  if (measureScene) { measureScene = false; measureParallax(); }
  const elapsed = lastFrame ? Math.min(timestamp - lastFrame, 50) : 16;
  const amount = 1 - Math.exp(-elapsed / 90);
  let moving = false;
  for (const layer of layers) {
    const target = paused ? 0 : layer.target;
    const distance = target - layer.current;
    if (distance) {
      layer.current = paused || Math.abs(distance) < .1 ? target : layer.current + distance * amount;
      layer.element.style.setProperty(layer.property, `${layer.current.toFixed(2)}px`);
      moving ||= layer.current !== target;
    }
  }
  lastFrame = moving ? timestamp : 0;
  if (moving) sceneFrame = requestAnimationFrame(updateScene);
}
function requestUpdate() {
  measureScene = true;
  if (!sceneFrame) sceneFrame = requestAnimationFrame(updateScene);
}
addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', requestUpdate, { passive: true });
if (matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', event => {
    pointerY = (event.clientY / innerHeight - .5) * 2;
    requestUpdate();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerY = 0; requestUpdate(); });
}
document.addEventListener('visibilitychange', () => {
  root.classList.toggle('tab-inactive', document.hidden);
  if (!document.hidden) requestUpdate();
});

// Content remains visible if observation is unsupported or motion is reduced.
if ('IntersectionObserver' in window && !paused) {
  root.classList.add('js-reveals');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  $$('.reveal').forEach(element => observer.observe(element));
}

// Animate visible headings on entry. Keep the copy visible when motion is off
// or observation is unavailable.
if ('IntersectionObserver' in window) {
  const textObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.classList.toggle('motion-visible', entry.isIntersecting);
    }
  }, { threshold: 0, rootMargin: '0px 0px -18px 0px' });
  $$('[data-motion-reveal]').forEach(element => textObserver.observe(element));
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
featureShow = startFeatureShow({ paused });
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
const stepButtons = $$('[data-install-step]', downloadDialog);
const stepPanels = stepButtons.map(button => document.getElementById(button.getAttribute('aria-controls')));
const previousStep = $('#install-previous');
const nextStep = $('#install-next');
const playInstall = $('#install-play');
const installDevice = $('.install-device', downloadDialog);
const installScreens = $$('[data-install-screen]', installDevice);
const previewActions = installScreens.map(screen => $('[data-preview-action]', screen));
const previewMessages = installScreens.map(screen => $('.install-phone-feedback', screen));
const installer = $('.install-phone-installer', installDevice);
const welcome = $('.install-phone-welcome', installDevice);
const originalFilename = previewMessages[0].textContent;
const finalInstallStep = stepPanels.length - 1;
const walkthroughReadingTime = [3400, 2100, 5300, 2100];
let installStep = 0;
let previewPhase = 'ready';
let walkthroughPlaying = false;
let previewTimer;

function showInstallPhone(phase) {
  previewPhase = phase;
  installDevice.dataset.previewPhase = phase;
  const busy = phase === 'working';
  const complete = phase === 'complete';
  const action = previewActions[installStep];
  const message = previewMessages[installStep];
  action.setAttribute('aria-disabled', String(busy || (complete && installStep < 2)));
  if (installStep === 0) {
    action.textContent = busy ? 'Saving…' : complete ? 'APK downloaded' : 'Download APK';
    message.textContent = complete ? 'Saved to Downloads' : originalFilename;
  } else if (installStep === 1) {
    message.textContent = complete ? 'APK opened' : '';
  } else if (installStep === 2) {
    action.setAttribute('aria-checked', String(complete));
    message.textContent = complete ? 'Go back to the APK to continue.' : '';
  } else {
    action.textContent = busy ? 'Installing…' : complete ? 'Open' : 'Install';
    message.textContent = complete ? 'App installed' : 'Install this app?';
    installer.hidden = phase === 'welcome';
    welcome.hidden = !installer.hidden;
  }
}

function setWalkthroughPlaying(playing) {
  clearTimeout(previewTimer);
  walkthroughPlaying = playing;
  $('span', playInstall).textContent = playing ? 'Stop walkthrough' : 'Play walkthrough';
  $('use', playInstall).setAttribute('href', playing ? '#i-pause' : '#i-play');
}

function showInstallStep(index, moveFocus = false) {
  installStep = index;
  stepPanels.forEach((panel, step) => {
    panel.hidden = step !== index;
    installScreens[step].hidden = panel.hidden;
    if (step === index) stepButtons[step].setAttribute('aria-current', 'step');
    else stepButtons[step].removeAttribute('aria-current');
  });
  previousStep.hidden = index === 0;
  nextStep.textContent = index === finalInstallStep ? 'Done' : 'Next';
  $('#install-progress-label').textContent = `Step ${index + 1} of ${stepPanels.length}`;
  showInstallPhone('ready');
  if (moveFocus) $('h3', stepPanels[index]).focus();
}

function selectInstallStep(index, moveFocus = false) {
  setWalkthroughPlaying(false);
  showInstallStep(index, moveFocus);
}

function runInstallPreviewAction(after = () => {}) {
  const complete = () => {
    showInstallPhone('complete');
    after();
  };
  if (installStep === 0 || installStep === finalInstallStep) {
    showInstallPhone('working');
    previewTimer = setTimeout(complete, paused ? 300 : 850);
  } else {
    complete();
  }
}

function playInstallStep(index) {
  showInstallStep(index);
  previewTimer = setTimeout(() => runInstallPreviewAction(() => {
    previewTimer = setTimeout(() => {
      if (index < finalInstallStep) {
        playInstallStep(index + 1);
      } else {
        showInstallPhone('welcome');
        setWalkthroughPlaying(false);
      }
    }, walkthroughReadingTime[index]);
  }), 950);
}

function startInstallWalkthrough() {
  setWalkthroughPlaying(true);
  playInstallStep(0);
}

playInstall.addEventListener('click', () => {
  if (walkthroughPlaying) {
    setWalkthroughPlaying(false);
    if (previewPhase === 'working') showInstallPhone('ready');
    return;
  }
  startInstallWalkthrough();
  installDevice.scrollIntoView?.({ block: 'nearest', behavior: paused ? 'instant' : 'smooth' });
});
previewActions.forEach((action, index) => action.addEventListener('click', () => {
  if (index !== installStep || action.getAttribute('aria-disabled') === 'true') return;
  setWalkthroughPlaying(false);
  if (previewPhase === 'complete') {
    if (index === finalInstallStep) {
      showInstallPhone('welcome');
      $('#install-welcome-title').focus();
    } else {
      showInstallPhone('ready');
    }
  } else {
    runInstallPreviewAction();
  }
}));
$$('.download-open').forEach(button => button.addEventListener('click', () => {
  downloadDialog.showModal();
  startInstallWalkthrough();
}));
stepButtons.forEach((button, index) => button.addEventListener('click', () => selectInstallStep(index, true)));
previousStep.addEventListener('click', () => selectInstallStep(installStep - 1, true));
nextStep.addEventListener('click', () => {
  if (installStep === finalInstallStep) downloadDialog.close();
  else selectInstallStep(installStep + 1, true);
});
$$('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
}));
$('#privacy-open').addEventListener('click', () => $('#privacy-dialog').showModal());

// Reassemble and verify the published Android build before saving.
let downloadController;
let downloadObjectUrl;
let activeDownload = false;
function saveDownload() {
  const link = $('#download-save');
  link.click();
}
async function startDownload() {
  if (activeDownload) return;
  setWalkthroughPlaying(false);
  showInstallPhone('ready');
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
    status.textContent = 'Preparing the APK…';
    const response = await fetch('downloads/manifest.json', { signal, cache: 'no-cache' });
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
    status.textContent = 'Your verified APK is ready. Choose Next for help opening the file.';
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
downloadDialog.addEventListener('close', () => {
  setWalkthroughPlaying(false);
  if (activeDownload) downloadController?.abort();
});
addEventListener('pagehide', () => {
  downloadController?.abort();
  if (downloadObjectUrl) {
    URL.revokeObjectURL(downloadObjectUrl);
    downloadObjectUrl = null;
    $('#download-save').hidden = true;
    $('#download-start span').textContent = 'Download APK';
  }
});

// Every full opening starts at the homepage. Anchors work once it is visible.
history.scrollRestoration = 'manual';
showLandingTop();
showIntro();
requestUpdate();
