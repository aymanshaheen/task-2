import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useNotes } from "../../hooks/useNotes";
import type { Note } from "../../hooks/useNotes";
import { useSearch } from "../../hooks/useSearch";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { NotesScreenHeader } from "../../components/notes/NotesScreenHeader";
import { NotesScreenContent } from "../../components/notes/NotesScreenContent";
import { NotesScreenActions } from "../../components/notes/NotesScreenActions";

export function AllNotesScreen() {
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const { theme, themeStyles } = useTheme();
  const {
    notes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    refreshNotes,
    tags,
    error,
    loading,
    refreshing,
    saving,
  } = useNotes();
  const {
    isOffline,
    syncStatus,
    performSync,
    hasPendingOperations,
    isSyncing,
  } = useOfflineIntegration();
  const { query, setQuery, filteredNotes, selectedTags, setSelectedTags } =
    useSearch(notes);

  // Fetch notes every time this tab is focused - online or offline
  useFocusEffect(
    useCallback(() => {
      console.log(
        `📱 AllNotesScreen focused - loading notes (${
          isOffline ? "offline" : "online"
        } mode)`
      );
      loadNotes();
    }, [loadNotes, isOffline])
  );

  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "title" | "favorites">(
    "date"
  );
  const [hasUserSelectedSort, setHasUserSelectedSort] = useState(false);

  const handleSortKeyChange = (key: "date" | "title" | "favorites") => {
    setSortKey(key);
    setHasUserSelectedSort(true);
  };

  const list = useMemo(() => {
    const copy = [...filteredNotes];

    if (hasUserSelectedSort) {
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

const styles = StyleSheet.create({});
