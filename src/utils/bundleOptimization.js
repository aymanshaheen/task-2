import React from "react";

const moduleCache = new Map();

export function safeDynamicImport(importer, key) {
  const cacheKey = key || importer.toString();
  if (moduleCache.has(cacheKey)) return moduleCache.get(cacheKey);
  const p = importer()
    .then((m) => m)
    .catch((e) => {
      if (__DEV__)
        console.warn(`Dynamic import failed${key ? ` (${key})` : ""}:`, e);
      throw e;
    });
  moduleCache.set(cacheKey, p);
  return p;
}

export function lazyComponent(importer, selectDefault) {
  const load = () =>
    safeDynamicImport(importer).then((m) => ({
      default: selectDefault ? selectDefault(m) : m.default || m,
    }));
  const Comp = React.lazy(load);
  Comp.preload = load;
  return Comp;
}

export function prefetchWhenIdle(tasks = []) {
  const schedule = (fn) => {
    const ric =
      typeof globalThis.requestIdleCallback === "function"
        ? globalThis.requestIdleCallback
        : (cb) =>
            setTimeout(
              () => cb({ didTimeout: false, timeRemaining: () => 0 }),
              1200
            );
    ric(() => {
      for (const t of tasks) {
        try {
          t?.();
        } catch {}
      }
    });
  };
  schedule(() => {});
}

export function withSuspense(Component, Fallback) {
  return function Suspended(props) {
    return (
      <React.Suspense fallback={Fallback ? <Fallback /> : null}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}
