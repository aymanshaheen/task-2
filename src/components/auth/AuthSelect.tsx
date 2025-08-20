import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useTheme } from "../../hooks/useTheme";

interface Option {
  label: string;
  value: string;
}

interface AuthSelectProps {
  label?: string;
  placeholder: string;
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function AuthSelect({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  error,
  hint,
  disabled = false,
}: AuthSelectProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={{ marginBottom: spacing.s8 }}>
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

      <Pressable
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderColor: error ? c.danger : c.border,
          backgroundColor: disabled ? c.muted + "20" : c.surface,
          borderRadius: spacing.s12,
          padding: spacing.s12,
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled }}
      >
        <Text
          style={{
            color: selectedOption ? c.text : c.muted,
            fontSize: typography.size.md,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 16,
          }}
        >
          ▼
        </Text>
      </Pressable>

      {error && (
        <Text
          style={{
            color: c.danger,
            fontSize: typography.size.xs,
            marginTop: spacing.s4,
            marginLeft: spacing.s4,
          }}
        >
          {error}
        </Text>
      )}

      {hint && !error && (
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

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.s16,
          }}
          onPress={() => setShowModal(false)}
        >
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: spacing.s12,
              maxHeight: "60%",
              width: "100%",
              maxWidth: 400,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: c.border,
                padding: spacing.s16,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.medium,
                  color: c.text,
                  textAlign: "center",
                }}
              >
                {label || "Select an option"}
              </Text>
            </View>

            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onValueChange(option.value);
                    setShowModal(false);
                  }}
                  style={{
                    padding: spacing.s16,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border + "30",
                    backgroundColor:
                      option.value === value ? c.primary + "10" : "transparent",
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <Text
                    style={{
                      fontSize: typography.size.md,
                      color: option.value === value ? c.primary : c.text,
                      fontWeight:
                        option.value === value
                          ? typography.weight.medium
                          : typography.weight.regular,
                    }}
                  >
                    {option.label}
                    {option.value === value && " ✓"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: c.border,
                padding: spacing.s16,
              }}
            >
              <Pressable
                onPress={() => setShowModal(false)}
                style={{
                  padding: spacing.s12,
                  alignItems: "center",
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text
                  style={{
                    color: c.muted,
                    fontSize: typography.size.md,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
