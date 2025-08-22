import React from "react";
import { View, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { typography } from "../../styles/typography";

export function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { themeStyles } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{ color: themeStyles.colors.text, fontSize: typography.size.sm }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: themeStyles.colors.text,
          fontWeight: typography.weight.medium,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
