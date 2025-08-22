import React from "react";
import { View, Text, Switch } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function SettingsToggleCard({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { themeStyles } = useTheme();
  return (
    <View
      style={[
        themeStyles.card,
        {
          borderRadius: spacing.s12,
          padding: spacing.s16,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: spacing.s12 }}>
          <Text
            style={{
              color: themeStyles.colors.text,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.medium,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: themeStyles.colors.muted,
              marginTop: spacing.s4,
              fontSize: typography.size.sm,
            }}
          >
            {subtitle}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: themeStyles.colors.border,
            true: themeStyles.colors.primaryAlt,
          }}
          thumbColor={themeStyles.colors.white}
          ios_backgroundColor={themeStyles.colors.border}
        />
      </View>
    </View>
  );
}
