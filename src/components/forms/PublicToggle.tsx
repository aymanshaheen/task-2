import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface PublicToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function PublicToggle({
  value,
  onValueChange,
  disabled = false,
}: PublicToggleProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <View style={[styles.inputGroup, styles.row]}>
      <View style={globalStyles.flex1}>
        <Text style={[styles.label, { color: c.text }]}>Public</Text>
        <Text style={[styles.description, { color: c.muted }]}>
          Make this note visible in the Social Feed
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: c.border, true: c.primaryAlt }}
        thumbColor={c.white}
        ios_backgroundColor={c.border}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: typography.size.sm,
    marginTop: spacing.s4,
  },
  inputGroup: {
    marginBottom: spacing.s20,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.s8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s16,
  },
});
