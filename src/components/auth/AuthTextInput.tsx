import React, { useState, useRef } from "react";
import { TextInput, Text, View, Pressable } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type ValidationState = "default" | "valid" | "invalid" | "warning";

type Props = React.ComponentProps<typeof TextInput> & {
  invalid?: boolean;
  errorText?: string;
  validationState?: ValidationState;
  hint?: string;
  label?: string;
  showValidationIcon?: boolean;
  onFocusChange?: (focused: boolean) => void;
};

export function AuthTextInput({
  invalid,
  errorText,
  validationState = "default",
  hint,
  label,
  showValidationIcon = false,
  style,
  onFocusChange,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const getBorderColor = () => {
    if (focused) return c.primary;
    if (invalid || validationState === "invalid") return c.danger;
    if (validationState === "valid") return "#44aa44";
    if (validationState === "warning") return "#ffaa00";
    return c.border;
  };

  const getValidationIcon = () => {
    if (!showValidationIcon) return null;

    switch (validationState) {
      case "valid":
        return "✓";
      case "invalid":
        return "✗";
      case "warning":
        return "⚠";
      default:
        return null;
    }
  };

  const getValidationIconColor = () => {
    switch (validationState) {
      case "valid":
        return "#44aa44";
      case "invalid":
        return c.danger;
      case "warning":
        return "#ffaa00";
      default:
        return c.muted;
    }
  };

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocusChange?.(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onFocusChange?.(false);
    onBlur?.(e);
  };

  const hasPasswordToggle = secureTextEntry;
  const actualSecureEntry = secureTextEntry && !showPassword;

  return (
    <View style={[{ marginBottom: spacing.s8 }, style]}>
      {label && (
        <Text
          style={{
            color: c.text,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
            marginBottom: spacing.s4,
          }}
        >
          {label}
        </Text>
      )}

      <View style={{ position: "relative" }}>
        <TextInput
          ref={inputRef}
          {...rest}
          secureTextEntry={actualSecureEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
              borderWidth: focused ? 2 : 1,
              borderColor: getBorderColor(),
              backgroundColor: c.surface,
              borderRadius: spacing.s12,
              padding: spacing.s12,
              paddingRight:
                hasPasswordToggle || showValidationIcon ? 48 : spacing.s12,
              fontSize: typography.size.md,
              color: c.text,
              minHeight: 48,
            }}
          placeholderTextColor={c.muted}
        />

        {/* Right side icons */}
        <View
          style={{
            position: "absolute",
            right: spacing.s12,
            top: 0,
            bottom: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.s8,
          }}
        >
          {showValidationIcon && getValidationIcon() && (
            <Text
              style={{
                color: getValidationIconColor(),
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {getValidationIcon()}
            </Text>
          )}

          {hasPasswordToggle && (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{
                padding: 4,
              }}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Text
                style={{
                  color: c.muted,
                  fontSize: 16,
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Error message */}
      {(invalid || validationState === "invalid") && !!errorText && (
        <Text
          style={{
            color: c.danger,
            fontSize: typography.size.xs,
            marginTop: spacing.s4,
            marginLeft: spacing.s4,
          }}
        >
          {errorText}
        </Text>
      )}

      {/* Hint message */}
      {hint && !(invalid || validationState === "invalid") && (
        <Text
          style={{
            color: c.muted,
            fontSize: typography.size.xs,
            marginTop: spacing.s4,
            marginLeft: spacing.s4,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}
