import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type SortKey = "date" | "title" | "favorites";

interface SortBarProps {
  sortKey: SortKey;
  onChangeSortKey: (key: SortKey) => void;
}

export const SortBar: React.FC<SortBarProps> = ({
  sortKey,
  onChangeSortKey,
}) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={[
        styles.sortBar,
        { backgroundColor: c.surface, borderBottomColor: c.border },
      ]}
    >
      <Text style={[styles.sortLabel, { color: c.muted }]}>Sort by:</Text>
      <View style={styles.sortOptions}>
        <TouchableOpacity
          onPress={() => onChangeSortKey("date")}
          style={[
            styles.sortChip,
            { backgroundColor: c.chipBg, borderColor: c.chipBorder },
            sortKey === "date" && {
              backgroundColor: c.primary,
              borderColor: c.primary,
            },
          ]}
        >
          <Text style={[styles.sortChipText, { color: c.text }]}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChangeSortKey("title")}
          style={[
            styles.sortChip,
            { backgroundColor: c.chipBg, borderColor: c.chipBorder },
            sortKey === "title" && {
              backgroundColor: c.primary,
              borderColor: c.primary,
            },
          ]}
        >
          <Text style={[styles.sortChipText, { color: c.text }]}>Title</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChangeSortKey("favorites")}
          style={[
            styles.sortChip,
            { backgroundColor: c.chipBg, borderColor: c.chipBorder },
            sortKey === "favorites" && {
              backgroundColor: c.primary,
              borderColor: c.primary,
            },
          ]}
        >
          <Text style={[styles.sortChipText, { color: c.text }]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sortBar: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sortLabel: {
    fontSize: typography.size.xs,
    marginBottom: spacing.s6,
  },
  sortOptions: {
    flexDirection: "row",
    gap: spacing.s8,
  },
  sortChip: {
    borderWidth: 1,
    paddingHorizontal: spacing.s10,
    paddingVertical: spacing.s6,
    borderRadius: spacing.s16,
  },
  sortChipActive: {},
  sortChipText: {},
});
