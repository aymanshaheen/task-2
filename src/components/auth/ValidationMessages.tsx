import React from "react";
import { View, Text, ScrollView } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface ValidationError {
  field: string;
  label: string;
  message: string;
}

interface ValidationMessagesProps {
  errors: ValidationError[];
  visible: boolean;
  onDismiss?: () => void;
}

export function ValidationMessages({
  errors,
  visible,
}: ValidationMessagesProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  if (!visible || errors.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: c.dangerBg,
        borderColor: c.danger,
        borderWidth: 1,
        borderRadius: spacing.s12,
        padding: spacing.s16,
        marginBottom: spacing.s16,
        maxHeight: 200,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.s12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginRight: spacing.s8,
          }}
        >
          ⚠️
        </Text>
        <Text
          style={{
            color: c.dangerText,
            fontSize: typography.size.md,
            fontWeight: typography.weight.medium,
            flex: 1,
          }}
        >
          Please complete the following fields:
        </Text>
      </View>

      <ScrollView
        style={{ maxHeight: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {errors.map((error, index) => (
          <View
            key={error.field}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: errors.length - 1 === index ? 0 : spacing.s8,
            }}
          >
            <Text
              style={{
                color: c.dangerText,
                fontSize: typography.size.sm,
                marginRight: spacing.s8,
                marginTop: 2,
              }}
            >
              •
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: c.dangerText,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                }}
              >
                {error.label}
              </Text>
              <Text
                style={{
                  color: c.dangerText,
                  fontSize: typography.size.xs,
                  marginTop: 2,
                  opacity: 0.8,
                }}
              >
                {error.message}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
