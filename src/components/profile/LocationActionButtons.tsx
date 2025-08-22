import React from "react";
import { View, Pressable, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  onUseCurrent: () => void;
  onPickOnMap: () => void;
};

export function LocationActionButtons({ onUseCurrent, onPickOnMap }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View>
      <Pressable
        onPress={onUseCurrent}
        style={{
          backgroundColor: c.primary,
          paddingVertical: spacing.s12,
          paddingHorizontal: spacing.s16,
          borderRadius: spacing.s10,
        }}
      >
        <Text style={{ color: c.white, fontWeight: typography.weight.medium }}>
          Use Current Location
        </Text>
      </Pressable>

      <View style={{ height: spacing.s12 }} />

      <Pressable
        onPress={onPickOnMap}
        style={{
          backgroundColor: c.surface,
          paddingVertical: spacing.s12,
          paddingHorizontal: spacing.s16,
          borderRadius: spacing.s10,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        <Text style={{ color: c.text, fontWeight: typography.weight.medium }}>
          Pick on Map
        </Text>
      </Pressable>
    </View>
  );
}
