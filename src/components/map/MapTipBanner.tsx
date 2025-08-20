import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

type Props = { visible: boolean };

export function MapTipBanner({ visible }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  if (!visible) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: spacing.s12,
        left: spacing.s12,
        right: spacing.s12,
        backgroundColor: c.surface,
        borderRadius: spacing.s10,
        padding: spacing.s10,
      }}
    >
      <Text style={{ color: c.text }}>
        Long-press anywhere to drop a pin. Drag the pin to adjust.
      </Text>
    </View>
  );
}
