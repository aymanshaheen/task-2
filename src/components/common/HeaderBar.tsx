import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { SearchBar } from "./SearchBar";
import { useNavigation } from "@react-navigation/native";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  query: string;
  onChangeQuery: (text: string) => void;
  onPressFilter: () => void;
};

export const HeaderBar: React.FC<Props> = ({
  query,
  onChangeQuery,
  onPressFilter,
}) => {
  const navigation = useNavigation<any>();
  const { themeStyles } = useTheme();
  return (
    <View style={globalStyles.header}>
      <SearchBar
        value={query}
        onChangeText={onChangeQuery}
        onPressFilter={onPressFilter}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Search")}
        accessibilityLabel="Open search"
        style={styles.iconButton}
      >
        <Text style={[styles.icon, { color: themeStyles.colors.text }]}>
          🔍
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: spacing.s36 as unknown as number,
    height: spacing.s36 as unknown as number,
    borderRadius: spacing.s18 as unknown as number,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: typography.size.lg,
  },
});
