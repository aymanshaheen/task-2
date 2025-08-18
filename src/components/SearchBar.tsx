import React, { memo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter?: () => void;
};

export const SearchBar = memo(
  ({ value, onChangeText, onPressFilter }: Props) => {
    const { theme, themeStyles } = useTheme();
    const c = themeStyles.colors;
    const isDark = theme === "dark";
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
    flex: 1,
    marginRight: spacing.s8,
    borderRadius: spacing.s8,
    paddingHorizontal: spacing.s10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: spacing.s40,
    flex: 1,
  },
  filterButton: {
    width: spacing.s36,
    height: spacing.s36,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    fontSize: typography.size.md,
  },
});
