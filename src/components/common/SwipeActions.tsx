import React, { forwardRef } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { useTheme } from "../../hooks/useTheme";
import { useSwipeToDelete } from "../../performance/animations/GestureAnimations";
import { hapticImpactMedium } from "../../performance/haptics";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
};

export const SwipeActions = forwardRef<any, Props>(
  ({ children, onDelete, deleteLabel = "Delete" }, _ref) => {
    const { themeStyles } = useTheme();
    const c = themeStyles.colors;

    const { gesture, rowStyle, rightActionStyle } = useSwipeToDelete({
      width: 88,
      onDelete,
      hapticTrigger: hapticImpactMedium,
    });

    return (
      <View style={{ overflow: "hidden" }}>
        <Animated.View
          style={[
            styles.rightContainer,
            { backgroundColor: c.danger },
            rightActionStyle,
          ]}
        >
          <TouchableOpacity
            accessibilityLabel={deleteLabel}
            onPress={onDelete}
            style={styles.rightAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.rightActionText, { color: c.white }]}>
              {deleteLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View style={rowStyle}>{children}</Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  rightAction: {
    alignItems: "flex-end",
    borderRadius: spacing.s8,
    justifyContent: "center",
    marginHorizontal: spacing.s12,
    marginTop: spacing.s8,
    paddingHorizontal: spacing.s20,
  },
  rightActionText: {
    fontWeight: typography.weight.bold,
  },
  rightContainer: {
    alignItems: "flex-end",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
  },
});
