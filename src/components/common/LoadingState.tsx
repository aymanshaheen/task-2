import React from "react";
import { View, Text } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  const { themeStyles } = useTheme();
  const r = useSharedValue(0);
  React.useEffect(() => {
    r.value = withTiming(
      1,
      { duration: 800, easing: Easing.linear },
      (finished) => {
        if (finished) r.value = 0;
      }
    );
  }, [r]);
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${r.value * 360}deg` }],
  }));
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: themeStyles.colors.border,
            borderTopColor: themeStyles.colors.primary,
          },
          spinnerStyle,
        ]}
      />
      <Text
        style={{
          marginTop: spacing.s8,
          color: themeStyles.colors.muted,
          fontSize: typography.size.sm,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
