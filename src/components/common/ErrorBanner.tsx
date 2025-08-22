import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

type Props = { message?: string | null };

export const ErrorBanner = memo(({ message }: Props) => {
  if (!message) return null;
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.dangerBg, borderColor: c.dangerBorder },
      ]}
    >
      <Text style={[styles.text, { color: c.dangerText }]}>{message}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.s6,
    borderWidth: 1,
    marginHorizontal: spacing.s12,
    marginTop: spacing.s8,
    padding: spacing.s8,
  },
  text: {},
});
