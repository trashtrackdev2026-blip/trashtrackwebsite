const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function filmFrame(sectionTop, travel, count = 4, paused = false) {
  const progress = clamp(-sectionTop / Math.max(1, travel));
  const index = Math.min(count - 1, Math.floor(progress * count));
  const phase = clamp(progress * count - index);
  return {
    progress, index, phase,
    enter: paused || index === 0 ? 1 : smooth(phase / .18),
    accent: paused ? 1 : smooth((phase + (index === 0 ? .12 : 0) - .04) / .18),
    open: paused ? 1 : smooth((phase - .16) / .28),
    out: paused || index === count - 1 ? 1 : smooth((1 - phase) / .15),
  };
}

export function featureScrollTarget(sectionTop, travel, index, count = 4) {
  const safeIndex = Math.max(0, Math.min(count - 1, index));
  return sectionTop + Math.max(0, travel) * (safeIndex + .56) / count;
}
