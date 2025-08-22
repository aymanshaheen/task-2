import { useEffect, useRef } from "react";
import { InteractionManager } from "react-native";

import { MemoryMonitor } from "../monitoring/MemoryMonitor";
import { PerformanceTracker } from "../monitoring/PerformanceTracker";

export function usePerformanceMonitoring(label = "notes_list") {
  const trackerRef = useRef(null);
  const memoryRef = useRef(null);

  useEffect(() => {
    if (!__DEV__) return;
    const task = InteractionManager.runAfterInteractions(() => {
      trackerRef.current = new PerformanceTracker(label);
      memoryRef.current = new MemoryMonitor(label);
      trackerRef.current?.start();
      memoryRef.current?.start();
    });
    return () => {
      task?.cancel?.();
      trackerRef.current?.stop();
      memoryRef.current?.stop();
    };
  }, [label]);
}
