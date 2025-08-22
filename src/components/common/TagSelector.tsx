import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  availableTags: string[];
  selectedTags: string[];
  onChangeSelected: (tags: string[]) => void;
};

export const TagSelector = memo(
  ({ availableTags, selectedTags, onChangeSelected }: Props) => {
    const { themeStyles } = useTheme();
    const c = themeStyles.colors;
    const toggle = (tag: string) => {
      if (selectedTags.includes(tag)) {
        onChangeSelected(selectedTags.filter((t) => t !== tag));
      } else {
        onChangeSelected([...selectedTags, tag]);
      }
    };

    if (!availableTags.length) return null;

    return (
      <View style={styles.container}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => toggle(tag)}
            style={[
              styles.chip,
              { backgroundColor: c.chipBg, borderColor: c.chipBorder },
              selectedTags.includes(tag) && {
                backgroundColor: c.primary,
                borderColor: c.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: c.text },
                selectedTags.includes(tag) && { color: c.white },
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  chip: {
    borderRadius: spacing.s16,
    borderWidth: 1,
    paddingHorizontal: spacing.s10,
    paddingVertical: spacing.s6,
  },
  chipSelected: {},
  chipText: {
    fontSize: typography.size.sm,
  },
  chipTextSelected: {},
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
  },
});
