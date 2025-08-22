export class MemoryMonitor {
  constructor(label = "memory", options = {}) {
    this.label = label;
    this.interval = null;
    this.samples = [];
    this.thresholds = {
      idleMb: 100,
      heavyMb: 200,
      leakSlopeMbPerMin: 5,
      ...options?.thresholds,
    };
    this.windowSize = options?.windowSize || 12; // 12*5s = 60s
  }

  _log(mb) {
    const { idleMb, heavyMb } = this.thresholds;
    const prefix = `[${this.label}]`;
    if (mb > heavyMb) {
      console.warn(`${prefix} js_heap_mb=${mb} (over heavy ${heavyMb})`);
    } else if (mb > idleMb) {
    } else {
    }
  }

  _detectLeak() {
    if (this.samples.length < this.windowSize) return;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const minutes = (last.t - first.t) / 60000;
    if (minutes <= 0) return;
    const slope = (last.mb - first.mb) / minutes; // mb per minute
    if (slope > this.thresholds.leakSlopeMbPerMin) {
      console.warn(
        `[${this.label}] potential_leak slope_mb_per_min=${slope.toFixed(1)}`
      );
    }
  }

  start() {
    if (global?.performance?.memory) {
      this.interval = setInterval(() => {
        const used = global.performance.memory.usedJSHeapSize || 0;
        const mb = Math.round((used / (1024 * 1024)) * 10) / 10;
        this._log(mb);
        const t = Date.now();
        this.samples.push({ t, mb });
        if (this.samples.length > this.windowSize) this.samples.shift();
        this._detectLeak();
      }, 5000);
    }
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.samples.length = 0;
  }
}
