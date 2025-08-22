import { useCallback, useEffect, useMemo, useRef } from "react";

export function useStableCallback(fn) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  return useCallback((...args) => fnRef.current?.(...args), []);
}

export function useOptimizedCallbacks(callbacks) {
  return useMemo(() => callbacks, [callbacks]);
}
