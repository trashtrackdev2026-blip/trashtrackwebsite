import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';

test('the preview animates with system motion off, lands on the hero, and guides installation', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const { document, window } = parseHTML(html);
  const url = new URL('http://127.0.0.1:4318/?preview=1#inside');
  const timers = new Map();
  const frames = new Map();
  const motion = { matches: true, addEventListener() {} };
  let nextHandle = 0;
  let focused;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, delay) => { const handle = ++nextHandle; timers.set(handle, { fn, delay }); return handle; };
  globalThis.clearTimeout = handle => timers.delete(handle);
  Object.assign(globalThis, {
    document, window, location: url, innerHeight: 800,
    history: {
      state: null,
      replaceState(_state, _title, address) { url.href = new URL(address, url).href; },
    },
    addEventListener: window.addEventListener.bind(window),
    matchMedia: query => query.includes('prefers-reduced-motion') ? motion : { matches: false, addEventListener() {} },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    Image: class { complete = true; naturalWidth = 1600; },
    requestAnimationFrame: fn => { const handle = ++nextHandle; frames.set(handle, fn); return handle; },
    cancelAnimationFrame: handle => frames.delete(handle),
  });
  window.scrollY = 680;
  window.scrollTo = ({ top }) => { window.scrollY = top; };
  window.HTMLElement.prototype.focus = function () { focused = this; };
  window.HTMLElement.prototype.scrollTo = function () {};
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: 900 - window.scrollY, height: 700, left: 0, right: 500, bottom: 1600 - window.scrollY };
  };
  const $ = selector => document.querySelector(selector);
  const dialog = $('#download-dialog');
  dialog.showModal = () => dialog.setAttribute('open', '');
  dialog.close = () => { dialog.removeAttribute('open'); dialog.dispatchEvent(new window.Event('close')); };
  const click = selector => $(selector).dispatchEvent(new window.Event('click', { bubbles: true }));
  const runTimer = delay => {
    const entry = [...timers].find(([, job]) => job.delay === delay);
    assert.ok(entry, `Expected a ${delay} ms timer`);
    timers.delete(entry[0]);
    entry[1].fn();
  };
  const frame = time => {
    const pending = [...frames.values()]; frames.clear();
    pending.forEach(fn => fn(time));
  };
  try {
    await import('../dist/app.js');
    assert.equal(document.documentElement.classList.contains('motion-enabled'), true);
    assert.equal(window.scrollY, 0);
    assert.equal(url.hash, '');
    assert.equal(url.search, '?preview=1');
    assert.equal($('#intro').classList.contains('is-running'), true);
    window.scrollY = 680;
    [...timers.values()].find(job => job.delay === 4200).fn();
    assert.equal(window.scrollY, 0);
    assert.equal(focused, $('#hero-title'));
    assert.equal(document.body.classList.contains('landing-materializing'), true);
    assert.equal($('#show-tour'), null);
    assert.equal($('[data-motion-toggle]'), null);

    click('.download-open');
    assert.equal(dialog.hasAttribute('open'), true);
    assert.equal($('#install-download').hidden, false);
    assert.equal($('#install-play span').textContent, 'Stop walkthrough');
    assert.match($('#dialog-title').parentElement.textContent, /Version 1\.0\.15/);
    click('#install-next');
    assert.equal($('#install-download').hidden, true);
    assert.equal($('#install-open').hidden, false);
    assert.equal(focused, $('#install-open-title'));
    assert.equal($('#install-play span').textContent, 'Play walkthrough');
    assert.ok(![...timers.values()].some(job => job.delay === 950));
    click('[data-install-step="3"]');
    assert.equal($('#install-next').textContent, 'Done');
    click('#install-previous');
    assert.equal($('#install-allow').hidden, false);
    assert.equal($('[data-install-step="2"]').getAttribute('aria-current'), 'step');
    click('#install-next');
    click('#install-next');
    assert.equal(dialog.hasAttribute('open'), false);

    const phone = $('.install-device');
    const welcome = $('.install-phone-welcome');
    const phoneAction = '[data-install-screen]:not([hidden]) [data-preview-action]';
    click('.download-open');
    click(phoneAction);
    assert.equal(phone.dataset.previewPhase, 'working');
    runTimer(850);
    assert.equal($(phoneAction).textContent, 'APK downloaded');
    assert.equal($('#download-progress').hidden, true);
    click('[data-install-step="2"]');
    click(phoneAction);
    assert.equal($(phoneAction).getAttribute('aria-checked'), 'true');
    click(phoneAction);
    assert.equal($(phoneAction).getAttribute('aria-checked'), 'false');
    click('[data-install-step="3"]');
    assert.equal(welcome.hidden, true);
    click(phoneAction);
    assert.equal($(phoneAction).textContent, 'Installing…');
    runTimer(850);
    assert.equal($(phoneAction).textContent, 'Open');
    click(phoneAction);
    assert.equal(welcome.hidden, false);
    assert.equal($('.install-phone-installer').hidden, true);
    assert.equal(focused, $('#install-welcome-title'));
    assert.deepEqual([...welcome.querySelectorAll('.install-welcome-actions span')].map(node => node.textContent), ['Log In', 'Sign Up']);

    click('#install-play');
    runTimer(950);
    click('#install-play');
    assert.equal(phone.dataset.previewPhase, 'ready');
    assert.ok(![...timers.values()].some(job => job.delay === 850));
    dialog.close();
    click('.download-open');
    for (const [step, readingTime] of [3400, 2100, 5300, 2100].entries()) {
      assert.equal($(`[data-install-step="${step}"]`).getAttribute('aria-current'), 'step');
      runTimer(950);
      if (step === 0 || step === 3) runTimer(850);
      runTimer(readingTime);
    }
    assert.equal(welcome.hidden, false);
    assert.equal($('#install-play span').textContent, 'Play walkthrough');
    click('#install-play');
    click('.install-guide .dialog-close');
    assert.ok(![...timers.values()].some(job => job.delay === 950));
    click('.download-open');
    assert.equal($('#install-download').hidden, false);
    assert.equal(welcome.hidden || welcome.parentElement.hidden, true);
    assert.equal($('#install-play span').textContent, 'Stop walkthrough');
    dialog.close();
    assert.ok(![...timers.values()].some(job => job.delay === 950));

    frame(16);
    window.scrollY = 500;
    window.dispatchEvent(new window.Event('scroll'));
    frame(32);
    const image = $('.landing-hero');
    const first = parseFloat(image.style.getPropertyValue('--landscape-y'));
    assert.ok(first > 0 && first < 50);
    frame(48);
    assert.ok(parseFloat(image.style.getPropertyValue('--landscape-y')) > first);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
