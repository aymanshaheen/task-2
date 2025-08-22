import React from "react";
import { View, ActivityIndicator, Text, Alert } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { permissionsService } from "../services/permissionsService";

export default function CameraEntryScreen() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [checking, setChecking] = React.useState(true);
  const [granted, setGranted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    permissionsService
      .ensureCameraPermissions()
      .then((ok) => {
        if (!mounted) return;
        setGranted(ok);
      })
      .catch((e) => {
        if (__DEV__) console.warn("Camera permission error", e);
        Alert.alert("Camera Error", "Unable to check camera permissions.");
        setGranted(false);
      })
      .finally(() => mounted && setChecking(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.background,
        }}
      >
        <ActivityIndicator color={c.primary} />
        <Text style={{ color: c.muted, marginTop: 12 }}>Checking camera…</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.background,
        padding: 16,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "600", marginBottom: 8 }}>
        Camera
      </Text>
      <Text style={{ color: c.muted, textAlign: "center" }}>
        {granted
          ? "Camera is available. Use camera actions within supported screens."
          : "Camera permission denied. Enable permissions in system settings."}
      </Text>
    </View>
  );
}
