import React from "react";
import { View } from "react-native";
import { HeaderBar } from "../common/HeaderBar";
import { SortBar } from "../common/SortBar";
import { TagSelector } from "../common/TagSelector";

interface NotesScreenHeaderProps {
  query: string;
  onChangeQuery: (query: string) => void;
  showSortOptions: boolean;
  onToggleSortOptions: () => void;
  sortKey: "date" | "title" | "favorites";
  onChangeSortKey: (key: "date" | "title" | "favorites") => void;
  availableTags: string[];
  selectedTags: string[];
  onChangeSelectedTags: (tags: string[]) => void;
}

export function NotesScreenHeader({
  query,
  onChangeQuery,
  showSortOptions,
  onToggleSortOptions,
  sortKey,
  onChangeSortKey,
  availableTags,
  selectedTags,
  onChangeSelectedTags,
}: NotesScreenHeaderProps) {
  return (
    <View>
      <HeaderBar
        query={query}
        onChangeQuery={onChangeQuery}
        onPressFilter={onToggleSortOptions}
      />
      {showSortOptions && (
        <SortBar sortKey={sortKey} onChangeSortKey={onChangeSortKey} />
      )}
      <TagSelector
        availableTags={availableTags}
        selectedTags={selectedTags}
        onChangeSelected={onChangeSelectedTags}
      />
    </View>
  );
}
