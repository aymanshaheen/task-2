import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  Platform,
  UIManager,
  InteractionManager,
} from "react-native";

import { NotesScreenActions } from "../../components/notes/NotesScreenActions";
import { NotesScreenContent } from "../../components/notes/NotesScreenContent";
import { NotesScreenHeader } from "../../components/notes/NotesScreenHeader";
import { useNotes } from "../../hooks/useNotes";
import type { Note } from "../../hooks/useNotes";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { useSearch } from "../../hooks/useSearch";
import { useTheme } from "../../hooks/useTheme";
import { usePerformanceMonitoring } from "../../performance/hooks/usePerformanceMonitoring";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { measureScreenTransition } from "../../utils/performanceUtils";

export function AllNotesScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = measureScreenTransition(navigation, "all_notes");
    return () => unsubscribe?.();
  }, [navigation]);

  const { theme, themeStyles } = useTheme();
  const {
    notes,
    loadNotes,
    loadMore,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    refreshNotes,
    tags,
    error,
    loading,
    loadingMore,
    refreshing,
    saving,
    hasMore,
  } = useNotes({ autoLoad: false });
  const { isOffline, syncStatus, hasPendingOperations } =
    useOfflineIntegration();
  const { query, setQuery, filteredNotes, selectedTags, setSelectedTags } =
    useSearch(notes);

  usePerformanceMonitoring("all_notes_screen");

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        loadNotes();
      });
      return () => task?.cancel?.();
    }, [loadNotes, isOffline])
  );

  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "title" | "favorites">(
    "date"
  );
  const [hasUserSelectedSort, setHasUserSelectedSort] = useState(false);

  const handleSortKeyChange = useCallback(
    (key: "date" | "title" | "favorites") => {
      setSortKey(key);
      setHasUserSelectedSort(true);
    },
    []
  );

  const list = useMemo(() => {
    if (!hasUserSelectedSort) return filteredNotes;
    const copy = filteredNotes.slice();
    if (sortKey === "title") {
      copy.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
          numeric: true,
        })
      );
    } else if (sortKey === "favorites") {
      copy.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return (
          new Date(b.updatedAt || new Date().toISOString()).getTime() -
          new Date(a.updatedAt || new Date().toISOString()).getTime()
        );
      });
    } else if (sortKey === "date") {
      copy.sort(
        (a, b) =>
          new Date(b.updatedAt || new Date().toISOString()).getTime() -
          new Date(a.updatedAt || new Date().toISOString()).getTime()
      );
    }
    return copy;
  }, [filteredNotes, sortKey, hasUserSelectedSort]);

  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s12, marginTop: spacing.s8 },
      ]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <NotesScreenHeader
        query={query}
        onChangeQuery={setQuery}
        showSortOptions={showSortOptions}
        onToggleSortOptions={() => setShowSortOptions((v) => !v)}
        sortKey={sortKey}
        onChangeSortKey={handleSortKeyChange}
        availableTags={tags}
        selectedTags={selectedTags}
        onChangeSelectedTags={setSelectedTags}
      />

      <NotesScreenContent
        loading={loading}
        error={error}
        notes={list as Note[]}
        allNotes={notes}
        refreshing={refreshing}
        onRefresh={refreshNotes}
        onEndReached={loadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onTogglePin={togglePin}
        onToggleFavorite={toggleFavorite}
        tintColor={themeStyles.colors.primary}
      />

      <NotesScreenActions
        saving={saving}
        loading={loading}
        isOffline={isOffline}
        hasPendingOperations={hasPendingOperations}
        syncStatus={syncStatus}
      />
    </SafeAreaView>
  );
}
