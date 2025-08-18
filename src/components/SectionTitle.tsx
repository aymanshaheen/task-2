import React from "react";
import { Text } from "react-native";
import { typography } from "../styles/typography";
import { spacing } from "../styles/spacing";
import { useTheme } from "../hooks/useTheme";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { themeStyles } = useTheme();
  return (
    <Text
      style={{
        fontSize: typography.size.lg,
        fontWeight: typography.weight.medium,
        marginBottom: spacing.s12,
        color: themeStyles.colors.text,
      }}
    >
      {children}
    </Text>
  );
}
