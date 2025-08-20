import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/useAuth";
import { AppNavigator } from "./navigation/AppNavigator";
import { NotificationCenterProvider } from "./hooks/useNotificationCenter";

function AppInner() {
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
      </NotificationCenterProvider>
    </ThemeProvider>
  );
}
