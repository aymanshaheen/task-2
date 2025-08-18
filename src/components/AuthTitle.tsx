import React from "react";
import { Text } from "react-native";
import { typography } from "../styles/typography";
import { spacing } from "../styles/spacing";

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
