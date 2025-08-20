import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function PreferenceToggleButton({ label, active, onPress }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? c.primary : c.surface,
        paddingVertical: spacing.s12,
        paddingHorizontal: spacing.s16,
        borderRadius: spacing.s10,
        marginBottom: spacing.s12,
      }}
    >
      <Text
        style={{
          color: active ? c.white : c.text,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
