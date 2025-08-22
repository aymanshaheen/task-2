import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useEffect } from "react";
import { SafeAreaView, View, StatusBar } from "react-native";

import { EmptyState } from "../../components/common/EmptyState";
import { ErrorText } from "../../components/common/ErrorText";
import { FloatingActionButton } from "../../components/common/FloatingActionButton";
import { LoadingState } from "../../components/common/LoadingState";
import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { SavingToast } from "../../components/common/SavingToast";
import { SearchBar } from "../../components/common/SearchBar";
import { NotesList } from "../../components/notes/NotesList";
import type { Note } from "../../hooks/useNotes";
import { useNotes } from "../../hooks/useNotes";
import { useSearch } from "../../hooks/useSearch";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";

export function SearchScreen() {
  const navigation = useNavigation();
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    error,
    loading,
    saving,
  } = useNotes();

  const { query, setQuery, filteredNotes } = useSearch(notes);

  const list = useMemo(() => {
    const copy = [...filteredNotes];
    copy.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return copy;
  }, [filteredNotes]);

  useEffect(() => {
    // Clear search when leaving screen could be added via focus listeners if needed
  }, []);

  const showStartTyping = query.trim().length === 0 && notes.length > 0;

  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s12, marginTop: spacing.s16 },
      ]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={globalStyles.header}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      {error && <ErrorText message={error.message} />}
      {loading ? (
        <LoadingState />
      ) : showStartTyping ? (
        <EmptyState message="Start typing to search" />
      ) : list.length === 0 ? (
        <EmptyState
          message={!notes.length ? "No notes yet" : "No results found"}
        />
      ) : (
        <NotesList
          notes={list as Note[]}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          onToggleFavorite={toggleFavorite}
        />
      )}
      <SavingToast visible={!!saving && !loading} />
      <FloatingActionButton
        accessibilityLabel="Add note"
        onPress={() => navigation.navigate("AddNote" as never)}
      />
      <NetworkSnackbar />
    </SafeAreaView>
  );
}
