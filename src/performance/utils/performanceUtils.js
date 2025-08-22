export function shouldThrottle(now = Date.now(), last = 0, interval = 120) {
  return now - last < interval;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
