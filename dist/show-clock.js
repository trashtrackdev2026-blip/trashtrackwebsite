export const FEATURE_ORDER = ['collections', 'assist', 'reports', 'events'];
export const SCENE_DURATIONS = [11000, 12000, 12500, 11000];

// Time advances only while the player is visible and playing.
export class ShowClock {
  constructor(durations = SCENE_DURATIONS) {
    this.durations = durations;
    this.index = 0;
    this.elapsed = 0;
    this.previous = null;
  }
  tick(now, running = true) {
    if (!running) { this.previous = null; return false; }
    if (this.previous === null) { this.previous = now; return false; }
    // Ignore background-tab catch-up rather than skipping a whole demonstration.
    const delta = Math.min(100, Math.max(0, now - this.previous));
    this.previous = now;
    this.elapsed += delta;
    if (this.elapsed < this.durations[this.index]) return false;
    this.elapsed = 0;
    this.index = (this.index + 1) % this.durations.length;
    return true;
  }
  select(index) {
    this.index = Math.max(0, Math.min(this.durations.length - 1, index));
    this.elapsed = 0;
    this.previous = null;
  }
  suspend() { this.previous = null; }
  get progress() { return Math.min(1, this.elapsed / this.durations[this.index]); }
}

export function demoFrame(feature, elapsed) {
  const t = Math.max(0, elapsed);
  if (feature === 'collections') return {
    step: t < 1000 ? 0 : t < 1800 ? 1 : t < 3900 ? 2 : t < 4500 ? 3 : t < 7600 ? 4 : t < 8800 ? 5 : 6,
    scheduleOpen: t >= 1800 && t < 8800, filterActive: t >= 4500, ready: t >= 7600,
    pointer: t >= 1000 && t < 1800 ? 'schedule' : t >= 3900 && t < 4500 ? 'active' : null,
  };
  if (feature === 'assist') return {
    step: t < 1100 ? 0 : t < 1800 ? 1 : t < 3900 ? 2 : t < 6200 ? 3 : t < 7000 ? 4 : 5,
    scanning: t >= 1800 && t < 3900, result: t >= 3900, answer: t >= 7000,
    scanProgress: Math.max(0, Math.min(1, (t - 1800) / 2100)),
    pointer: t >= 1100 && t < 1800 ? 'scan-tab' : t >= 6200 && t < 7000 ? 'ask' : null,
  };
  if (feature === 'reports') return {
    step: t < 1000 ? 0 : t < 1700 ? 1 : t < 4200 ? 2 : t < 6000 ? 3 : t < 6800 ? 4 : t < 8800 ? 5 : t < 9600 ? 6 : 7,
    text: 'Waste bags beside our street.'.slice(0, Math.max(0, Math.floor((t - 1800) / 70))),
    location: t >= 4200, review: t >= 6800, complete: t >= 9600,
    pointer: t >= 1000 && t < 1700 ? 'concern' : t >= 6000 && t < 6800 ? 'review' : t >= 8800 && t < 9600 ? 'finish' : null,
  };
  return {
    step: t < 1200 ? 0 : t < 1900 ? 1 : t < 4500 ? 2 : t < 5300 ? 3 : 4,
    details: t >= 1900, joined: t >= 5300,
    pointer: t >= 1200 && t < 1900 ? 'details' : t >= 4500 && t < 5300 ? 'join' : null,
  };
}
