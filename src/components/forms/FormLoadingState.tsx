import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { LoadingState } from "../common/LoadingState";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface FormLoadingStateProps {
  isLoadingNote?: boolean;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function FormLoadingState({
  isLoadingNote = false,
  isSubmitting = false,
  isEditMode = false,
}: FormLoadingStateProps) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  if (!isLoadingNote && !isSubmitting) {
    return null;
  }

  const getLoadingText = () => {
    if (isLoadingNote) return "Loading note...";
    if (isSubmitting) return `${isEditMode ? "Updating" : "Creating"} note...`;
    return "Loading...";
  };

  return (
    <View style={styles.loadingContainer}>
      <LoadingState />
      <Text style={[styles.loadingText, { color: c.muted }]}>
        {getLoadingText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.s16,
  },
  loadingText: {
    fontSize: typography.size.sm,
    marginTop: spacing.s8,
  },
});
