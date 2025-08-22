export class PerformanceTracker {
  constructor(label = "perf", options = {}) {
    this.label = label;
    this.t0 = 0;
    this.samples = [];
    this.running = false;
    this.thresholds = {
      screenLoadMs: 1000,
      searchMs: 200,
      ...options?.thresholds,
    };
    this._marks = new Map();
  }

  _now() {
    return global?.performance?.now?.() ?? Date.now();
  }

  start() {
    this.running = true;
    this.t0 = this._now();
    this.samples.length = 0;
  }

  mark(name) {
    if (!this.running) return;
    const t = this._now() - this.t0;
    this.samples.push({ name, t });
  }

  markStart(name) {
    this._marks.set(name, this._now());
  }

  markEnd(name, targetMs) {
    const start = this._marks.get(name);
    if (start == null) return 0;
    const duration = this._now() - start;
    this._marks.delete(name);
    const ms = Math.round(duration);
    const warnThreshold = targetMs || this.thresholds[name + "Ms"];
    if (warnThreshold && ms > warnThreshold) {
      console.warn(`[${this.label}] ${name}_ms=${ms} (over ${warnThreshold})`);
    } else {
    }
    return ms;
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    try {
      const total = this._now() - this.t0;
      const ms = Math.round(total);
    } catch {}
  }
}
