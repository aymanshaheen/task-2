import React from "react";
import { View, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

type Props = {
  locationText: string | null;
  addressText: string | null;
};

export function LocationSummary({ locationText, addressText }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  if (!locationText) return null;
  return (
    <View>
      <Text style={{ marginTop: spacing.s12, color: c.muted }}>
        Coordinates: {locationText}
      </Text>
      {!!addressText && (
        <Text style={{ marginTop: spacing.s6, color: c.text }}>
          Address: {addressText}
        </Text>
      )}
    </View>
  );
}
