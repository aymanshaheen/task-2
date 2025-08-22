import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export const ThemeToggle = memo(() => {
  const { theme, toggleTheme, themeStyles } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      accessibilityLabel={
        theme === "dark" ? "Switch to light" : "Switch to dark"
      }
      style={[styles.iconButton, { backgroundColor: themeStyles.colors.black }]}
    >
      <Text style={[styles.icon, { color: themeStyles.colors.white }]}>
        {theme === "dark" ? "☀️" : "🌙"}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  icon: {
    fontSize: typography.size.lg,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: spacing.s20 as unknown as number,
    height: spacing.s40 as unknown as number,
    justifyContent: "center",
    width: spacing.s40 as unknown as number,
  },
});
