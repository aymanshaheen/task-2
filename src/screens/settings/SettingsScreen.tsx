import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { SettingsToggleCard } from "../../components/SettingsToggleCard";
import { useAsyncStorage } from "../../hooks/useAsyncStorage";

export function SettingsScreen() {
  const { themeStyles, toggleTheme, theme } = useTheme();
  const { logout } = useAuth();
  const { value: notificationsEnabled, setValue: setNotificationsEnabled } =
    useAsyncStorage<boolean>("settings:notificationsEnabled", true);
  const { value: biometricLock, setValue: setBiometricLock } =
    useAsyncStorage<boolean>("settings:biometricLock", false);
  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s16, marginTop: spacing.s16 },
      ]}
    >
      <SettingsToggleCard
        title="Appearance"
        subtitle="Dark mode"
        value={theme === "dark"}
        onValueChange={toggleTheme}
      />

      <View style={{ height: spacing.s16 }} />

      <SettingsToggleCard
        title="Notifications"
        subtitle="Enable push notifications"
        value={!!notificationsEnabled}
        onValueChange={setNotificationsEnabled}
      />

      <View style={{ height: spacing.s16 }} />

      <SettingsToggleCard
        title="Security"
        subtitle="Biometric lock"
        value={!!biometricLock}
        onValueChange={setBiometricLock}
      />

      <View style={{ height: spacing.s16 }} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={logout}
        style={{
          backgroundColor: themeStyles.colors.danger,
          paddingVertical: spacing.s12,
          paddingHorizontal: spacing.s16,
          borderRadius: spacing.s12,
          alignItems: "center",
          alignSelf: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text
          style={{
            color: themeStyles.colors.inverseText,
            fontSize: typography.size.md,
            fontWeight: typography.weight.bold,
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
