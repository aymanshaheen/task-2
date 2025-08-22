import { useNavigation } from "@react-navigation/native";
import React, { memo, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

import { SearchBar } from "./SearchBar";

type Props = {
  query: string;
  onChangeQuery: (text: string) => void;
  onPressFilter: () => void;
};

export const HeaderBar: React.FC<Props> = memo(
  ({ query, onChangeQuery, onPressFilter }) => {
    const navigation = useNavigation<any>();
    const { themeStyles } = useTheme();
    const handleOpenSearch = useCallback(() => {
      navigation.navigate("Search");
    }, [navigation]);
    return (
      <View style={globalStyles.header}>
        <SearchBar
          value={query}
          onChangeText={onChangeQuery}
          onPressFilter={onPressFilter}
        />
        <TouchableOpacity
          onPress={handleOpenSearch}
          accessibilityLabel="Open search"
          style={styles.iconButton}
        >
          <Text style={[styles.icon, { color: themeStyles.colors.text }]}>
            🔍
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  icon: {
    fontSize: typography.size.lg,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: spacing.s18 as unknown as number,
    height: spacing.s36 as unknown as number,
    justifyContent: "center",
    width: spacing.s36 as unknown as number,
  },
});
