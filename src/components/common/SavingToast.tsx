import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

export function SavingToast({ visible }: { visible: boolean }) {
  const { themeStyles } = useTheme();
  if (!visible) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: spacing.s8,
        right: spacing.s12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: themeStyles.colors.surface,
        borderRadius: spacing.s12,
        paddingHorizontal: spacing.s10,
        paddingVertical: spacing.s6,
      }}
    >
      <ActivityIndicator size="small" />
      <Text style={{ marginLeft: spacing.s8, color: themeStyles.colors.muted }}>
        Saving…
      </Text>
    </View>
  );
}
