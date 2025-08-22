import { PerformanceTracker } from "../performance/monitoring/PerformanceTracker";

export function createScrollFpsMeter(label = "scroll") {
  let frameCount = 0;
  let isActive = false;
  let start = 0;
  let rafId = null;

  function loop() {
    if (!isActive) return;
    frameCount += 1;
    rafId = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (isActive) return;
      frameCount = 0;
      start = Date.now();
      isActive = true;
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      if (!isActive) return { fps: 0 };
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
      const seconds = Math.max(0.001, (Date.now() - start) / 1000);
      const fps = Math.round(frameCount / seconds);
      if (fps < 55) {
        console.log(`[${label}] scroll_fps_avg=${fps}`);
      } else {
        console.log(`[${label}] scroll_fps_avg=${fps}`);
      }
      return { fps };
    },
  };
}

export function measureScreenTransition(navigation, screenName) {
  const tracker = new PerformanceTracker(`screen:${screenName}`);
  tracker.start();
  tracker.markStart("screenLoad");
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    tracker.markEnd("screenLoad", 1000);
    tracker.stop();
  };
  const unsub1 = navigation?.addListener?.("transitionEnd", end);
  requestAnimationFrame(() => requestAnimationFrame(end));
  const unsubscribe = () => {
    try {
      unsub1?.();
    } catch {}
  };
  return () => unsubscribe?.();
}

export function measureSearch(label = "search") {
  const tracker = new PerformanceTracker(label);
  return {
    start() {
      tracker.markStart("search");
    },
    stop() {
      return tracker.markEnd("search", 200);
    },
  };
}

export function assertTargets(targets = {}) {
  const { idleMb, heavyMb, fps, searchMs, screenLoadMs } = targets;
  const failures = [];
  if (typeof idleMb === "number" && idleMb > 100) {
    failures.push(`Idle memory ${idleMb}MB exceeds 100MB`);
  }
  if (typeof heavyMb === "number" && heavyMb > 200) {
    failures.push(`Heavy memory ${heavyMb}MB exceeds 200MB`);
  }
  if (typeof fps === "number" && fps < 60) {
    failures.push(`Scroll FPS ${fps} below 60`);
  }
  if (typeof searchMs === "number" && searchMs > 200) {
    failures.push(`Search ${searchMs}ms exceeds 200ms`);
  }
  if (typeof screenLoadMs === "number" && screenLoadMs > 1000) {
    failures.push(`Screen load ${screenLoadMs}ms exceeds 1000ms`);
  }
  if (failures.length) {
    console.log(`[targets] ${failures.join("; ")}`);
  } else {
    console.log("[targets] All targets met");
  }
  return failures;
}
