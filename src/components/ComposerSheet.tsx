import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

type Props = {
  title: string;
  children: React.ReactNode;
};

export const ComposerSheet: React.FC<Props> = ({ title, children }) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View style={[styles.sheetOverlay, { backgroundColor: c.overlay }]}>
      <View style={[styles.sheet, { backgroundColor: c.surface }]}>
        <Text style={[styles.sheetTitle, { color: c.text }]}>{title}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    paddingTop: spacing.s8,
    paddingBottom: spacing.s16,
    paddingHorizontal: spacing.s12,
    borderRadius: spacing.s16,
    width: "92%",
    maxWidth: 520,
  },
  sheetTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    paddingBottom: spacing.s8,
  },
});
