import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  label: string;
  onPress: () => void;
};

export function PrimaryBottomButton({ label, onPress }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: spacing.s16,
        left: spacing.s16,
        right: spacing.s16,
        backgroundColor: c.primary,
        paddingVertical: spacing.s16,
        borderRadius: spacing.s12,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: c.white,
          fontSize: typography.size.md,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
