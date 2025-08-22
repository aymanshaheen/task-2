import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "./hooks/useAuth";
import { NotificationCenterProvider } from "./hooks/useNotificationCenter";
import { ThemeProvider } from "./hooks/useTheme";
import { AppNavigator } from "./navigation/AppNavigator";
import { MemoryMonitor } from "./performance/monitoring/MemoryMonitor";
import { assertTargets } from "./utils/performanceUtils";

function AppInner() {
  React.useEffect(() => {
    let isRunning = true;
    let frameCount = 0;
    const start = Date.now();
    function tick() {
      frameCount += 1;
      if (!isRunning) return;
      if (Date.now() - start < 3000) {
        requestAnimationFrame(tick);
      } else {
        const seconds = (Date.now() - start) / 1000;
        const fps = Math.round(frameCount / seconds);
        console.log(`fps_avg=${fps}`);
        assertTargets({
          fps,
          idleMb: undefined,
          heavyMb: undefined,
          searchMs: undefined,
          screenLoadMs: undefined,
        });
      }
    }
    requestAnimationFrame(tick);
    return () => {
      isRunning = false;
    };
  }, []);

  React.useEffect(() => {
    const mem = new MemoryMonitor("app_memory");
    mem.start();
    return () => mem.stop();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationCenterProvider>
        <AppInner />
        {(() => {
          try {
            const t0 = (global as any).__appLaunch;
            if (t0) {
              const ms = Date.now() - t0;
              // Clear marker to avoid duplicate logs on re-render
              (global as any).__appLaunch = undefined;
              console.log(`startup_ms=${ms}`);
            }
          } catch {}
          return null as any;
        })()}
      </NotificationCenterProvider>
    </ThemeProvider>
  );
}
