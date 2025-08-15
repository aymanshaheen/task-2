import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export const FloatingActionButton: React.FC<Props> = ({
  onPress,
  accessibilityLabel = "Add",
}) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.fab, { backgroundColor: c.primary }]}
    >
      <Text style={[styles.fabIcon, { color: c.white }]}>＋</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.s20,
    bottom: spacing.s64 + spacing.s16,
    width: spacing.s56,
    height: spacing.s56,
    borderRadius: spacing.s28,
    alignItems: "center",
    justifyContent: "center",
    ...globalStyles.shadowSmall,
  },
  fabIcon: {
    fontSize: typography.size.xl + 8,
    lineHeight: typography.size.xl + 8,
  },
});
