import { useMemo } from "react";

export function useMemoizedCalculations(calculate, deps) {
  return useMemo(() => calculate(), deps);
}
