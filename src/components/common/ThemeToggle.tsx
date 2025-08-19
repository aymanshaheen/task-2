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
  iconButton: {
    width: spacing.s40 as unknown as number,
    height: spacing.s40 as unknown as number,
    borderRadius: spacing.s20 as unknown as number,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: typography.size.lg,
  },
});
