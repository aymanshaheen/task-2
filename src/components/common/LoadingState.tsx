import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  const { themeStyles } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text
        style={{
          marginTop: spacing.s8,
          color: themeStyles.colors.muted,
          fontSize: typography.size.sm,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
