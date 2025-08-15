import React from "react";
import { View } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

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
  return (
    <View style={globalStyles.header}>
      <SearchBar
        value={query}
        onChangeText={onChangeQuery}
        onPressFilter={onPressFilter}
      />
      <ThemeToggle />
    </View>
  );
};
