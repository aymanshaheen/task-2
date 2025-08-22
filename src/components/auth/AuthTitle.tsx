import React from "react";
import { Text } from "react-native";

import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: typography.size.xxl,
        textAlign: "center",
        marginBottom: spacing.s20,
      }}
    >
      {children}
    </Text>
  );
}
