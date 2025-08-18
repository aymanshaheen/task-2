import React from "react";
import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../styles/spacing";
import { globalStyles } from "../styles/globalStyles";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { themeStyles } = useTheme();
  return (
    <View
      style={[
        { borderRadius: spacing.s12, padding: spacing.s16 },
        globalStyles.shadowSmall,
        themeStyles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}
