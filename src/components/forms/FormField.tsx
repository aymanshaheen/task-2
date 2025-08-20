import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputEndEditingEventData,
  TextInputSubmitEditingEventData,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { ErrorText } from "../common/ErrorText";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  showCharCount?: boolean;
  minHeight?: number;
  onEndEditing?: (
    e: NativeSyntheticEvent<TextInputEndEditingEventData>
  ) => void;
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength = 100,
  multiline = false,
  disabled = false,
  required = false,
  showCharCount = false,
  minHeight,
  onEndEditing,
  onSubmitEditing,
}: FormFieldProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: c.text }]}>
        {label}
        {required && " *"}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[
          multiline ? styles.textAreaInput : styles.textInput,
          {
            color: c.text,
            backgroundColor: c.surface,
            borderColor: error ? c.danger : c.border,
            minHeight: minHeight || (multiline ? 200 : 50),
          },
        ]}
        placeholderTextColor={c.placeholder}
        editable={!disabled}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onEndEditing={onEndEditing}
        onSubmitEditing={onSubmitEditing}
      />
      {error && <ErrorText message={error} />}
      {showCharCount && (
        <Text style={[styles.charCount, { color: c.muted }]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: spacing.s20,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.s8,
  },
  textInput: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: spacing.s8,
  },
  textAreaInput: {
    fontSize: typography.size.md,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: spacing.s8,
  },
  charCount: {
    fontSize: typography.size.xs,
    textAlign: "right",
    marginTop: spacing.s4,
  },
});
