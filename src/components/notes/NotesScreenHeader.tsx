import React, { memo, useEffect, useState } from "react";
import { View, InteractionManager } from "react-native";

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

export const NotesScreenHeader = memo(function NotesScreenHeader({
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
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task?.cancel?.();
  }, []);
  return (
    <View>
      <HeaderBar
        query={query}
        onChangeQuery={onChangeQuery}
        onPressFilter={onToggleSortOptions}
      />
      {ready && showSortOptions && (
        <SortBar sortKey={sortKey} onChangeSortKey={onChangeSortKey} />
      )}
      {ready && (
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onChangeSelected={onChangeSelectedTags}
        />
      )}
    </View>
  );
});
