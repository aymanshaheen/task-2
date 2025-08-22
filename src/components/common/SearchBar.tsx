import React, { memo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter?: () => void;
};

export const SearchBar = memo(
  ({ value, onChangeText, onPressFilter }: Props) => {
    const { themeStyles } = useTheme();
    const c = themeStyles.colors;
    return (
      <View style={[styles.container, { backgroundColor: c.surface }]}>
        <TextInput
          placeholder="Search notes..."
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, { color: c.text }]}
          autoCapitalize="none"
          placeholderTextColor={c.placeholder}
        />
        {onPressFilter && (
          <TouchableOpacity
            accessibilityLabel="Sort"
            onPress={onPressFilter}
            style={styles.filterButton}
          >
            <Text style={[styles.filterIcon, { color: c.text }]}>⇅</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: spacing.s8,
    flex: 1,
    flexDirection: "row",
    marginRight: spacing.s8,
    paddingHorizontal: spacing.s10,
  },
  filterButton: {
    alignItems: "center",
    height: spacing.s36,
    justifyContent: "center",
    width: spacing.s36,
  },
  filterIcon: {
    fontSize: typography.size.md,
  },
  input: {
    flex: 1,
    height: spacing.s40,
  },
});
