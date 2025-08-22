import React from "react";
import { Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

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
