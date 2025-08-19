import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { globalStyles } from "../../styles/globalStyles";

interface FavoriteToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function FavoriteToggle({
  value,
  onValueChange,
  disabled = false,
}: FavoriteToggleProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <View style={[styles.inputGroup, styles.favoriteRow]}>
      <View style={globalStyles.flex1}>
        <Text style={[styles.label, { color: c.text }]}>Add to Favorites</Text>
        <Text style={[styles.description, { color: c.muted }]}>
          Mark this note as a favorite for quick access
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
  inputGroup: {
    marginBottom: spacing.s20,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.s8,
  },
  description: {
    fontSize: typography.size.sm,
    marginTop: spacing.s4,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s16,
  },
});
