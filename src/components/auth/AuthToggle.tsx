import React from "react";
import { View, Text, Pressable, Animated } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface AuthToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function AuthToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: AuthToggleProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [c.border, c.primary],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <View style={{ marginBottom: spacing.s16 }}>
      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          opacity: disabled ? 0.6 : 1,
        }}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={label}
        accessibilityHint={description}
      >
        <View style={{ flex: 1, marginRight: spacing.s12 }}>
          <Text
            style={{
              color: c.text,
              fontSize: typography.size.md,
              fontWeight: typography.weight.medium,
              marginBottom: description ? spacing.s4 : 0,
            }}
          >
            {label}
          </Text>

          {description && (
            <Text
              style={{
                color: c.muted,
                fontSize: typography.size.sm,
                lineHeight: 20,
              }}
            >
              {description}
            </Text>
          )}
        </View>

        <Animated.View
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: trackColor,
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Animated.View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: c.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
              transform: [{ translateX: thumbTranslateX }],
            }}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
