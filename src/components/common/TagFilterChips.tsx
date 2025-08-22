import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

export function TagFilterChips({
  tags,
  activeTag,
  onToggle,
}: {
  tags: string[];
  activeTag: string | null;
  onToggle: (tag: string) => void;
}) {
  const { themeStyles } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        padding: spacing.s12,
        gap: spacing.s8,
      }}
    >
      {tags.map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onToggle(t)}
          style={{
            paddingHorizontal: spacing.s12,
            paddingVertical: spacing.s8,
            borderRadius: spacing.s16,
            backgroundColor: themeStyles.colors.surface,
            borderWidth: 1,
            borderColor: themeStyles.colors.border,
          }}
        >
          <Text style={{ color: themeStyles.colors.text }}>
            {activeTag === t ? `# ${t} ✓` : `# ${t}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
