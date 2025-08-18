import React, { useMemo, useState, useEffect } from "react";
import { SafeAreaView, View, Text, StatusBar } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNotes } from "../../hooks/useNotes";
import type { Note } from "../../hooks/useNotes";
import { useSearch } from "../../hooks/useSearch";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { SearchBar } from "../../components/SearchBar";
import { EmptyState } from "../../components/EmptyState";
import { NotesList } from "../../components/NotesList";
import { LoadingState } from "../../components/LoadingState";
import { ErrorText } from "../../components/ErrorText";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { ComposerSheet } from "../../components/ComposerSheet";
import { NoteEditor } from "../../components/NoteEditor";

export function SearchScreen() {
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    error,
    loading,
  } = useNotes();

  const { query, setQuery, filteredNotes } = useSearch(notes);
  const [showComposer, setShowComposer] = useState(false);

  const list = useMemo(() => {
    const copy = [...filteredNotes];
    copy.sort((a, b) => b.updatedAt - a.updatedAt);
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
      <FloatingActionButton
        accessibilityLabel="Add note"
        onPress={() => setShowComposer(true)}
      />
      {showComposer && (
        <ComposerSheet title="Add Message">
          <NoteEditor
            visible
            onSave={(payload) => {
              createNote(payload);
              setQuery("");
            }}
            onClose={() => setShowComposer(false)}
            showAuthor={false}
            showTags
          />
        </ComposerSheet>
      )}
    </SafeAreaView>
  );
}
