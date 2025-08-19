import React, { forwardRef } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
};

export const SwipeActions = forwardRef<Swipeable, Props>(
  ({ children, onDelete, deleteLabel = "Delete" }, ref) => {
    const { themeStyles } = useTheme();
    const c = themeStyles.colors;

    const renderRightActions = () => (
      <TouchableOpacity
        accessibilityLabel={deleteLabel}
        onPress={() => {
          if (ref && typeof ref === "object" && ref.current) {
            ref.current.close();
          }
          onDelete();
        }}
        style={[styles.rightAction, { backgroundColor: c.danger }]}
      >
        <Text style={[styles.rightActionText, { color: c.white }]}>
          {deleteLabel}
        </Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable ref={ref} renderRightActions={renderRightActions}>
        {children}
      </Swipeable>
    );
  }
);

const styles = StyleSheet.create({
  rightAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: spacing.s20,
    marginTop: spacing.s8,
    marginHorizontal: spacing.s12,
    borderRadius: spacing.s8,
  },
  rightActionText: {
    fontWeight: typography.weight.bold,
  },
});
