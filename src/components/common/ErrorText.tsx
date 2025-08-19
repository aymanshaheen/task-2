import React from "react";
import { Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

export function ErrorText({ message }: { message: string }) {
  const { themeStyles } = useTheme();
  return (
    <Text
      style={{
        color: themeStyles.colors.danger,
        paddingHorizontal: spacing.s12,
      }}
    >
      {message}
    </Text>
  );
}
