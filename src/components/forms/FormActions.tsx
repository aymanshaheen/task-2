import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface FormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
  saveText?: string;
  cancelText?: string;
}

export function FormActions({
  onCancel,
  onSave,
  disabled = false,
  saveText = "Save",
  cancelText = "Cancel",
}: FormActionsProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={onCancel}
        style={[styles.button, styles.cancelButton, { borderColor: c.border }]}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, { color: c.text }]}>{cancelText}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSave}
        style={[
          styles.button,
          styles.saveButton,
          { backgroundColor: c.primary },
          disabled && { opacity: 0.5 },
        ]}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, { color: c.white }]}>{saveText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: spacing.s8,
    flex: 1,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.s12,
    marginTop: spacing.s24,
  },
  buttonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  cancelButton: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
});
