import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { typography } from "../styles/typography";

type Props = {
  message: string;
};

export const EmptyState: React.FC<Props> = ({ message }) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: c.muted }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: typography.size.md,
  },
});
