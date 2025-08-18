import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNotes } from "../../hooks/useNotes";
import type { Note } from "../../hooks/useNotes";
import { useSearch } from "../../hooks/useSearch";
import { globalStyles } from "../../styles/globalStyles";
import { SortBar } from "../../components/SortBar";
import { HeaderBar } from "../../components/HeaderBar";
import { EmptyState } from "../../components/EmptyState";
import { NotesList } from "../../components/NotesList";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { ComposerSheet } from "../../components/ComposerSheet";
import { NoteEditor } from "../../components/NoteEditor";
import { TagSelector } from "../../components/TagSelector";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { LoadingState } from "../../components/LoadingState";
import { ErrorText } from "../../components/ErrorText";
import { SavingToast } from "../../components/SavingToast";

export function AllNotesScreen() {
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const { theme, themeStyles } = useTheme();
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    tags,
    error,
    loading,
    saving,
  } = useNotes();
  const { query, setQuery, filteredNotes, selectedTags, setSelectedTags } =
    useSearch(notes);

  const [showComposer, setShowComposer] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "title" | "favorites">(
    "date"
  );

  const list = useMemo(() => {
    const copy = [...filteredNotes];
    copy.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortKey === "date") return b.updatedAt - a.updatedAt;
      if (sortKey === "title")
        return a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
          numeric: true,
        });
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return b.updatedAt - a.updatedAt;
    });
    return copy;
  }, [filteredNotes, sortKey]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [list]);

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
      <HeaderBar
        query={query}
        onChangeQuery={setQuery}
        onPressFilter={() => setShowSortOptions((v) => !v)}
      />
      {showSortOptions && (
        <SortBar sortKey={sortKey} onChangeSortKey={setSortKey} />
      )}
      <TagSelector
        availableTags={tags}
        selectedTags={selectedTags}
        onChangeSelected={setSelectedTags}
      />
      {error && <ErrorText message={error.message} />}
      {loading ? (
        <LoadingState />
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
        onPress={() => setShowComposer(true)}
      />
      {showComposer && (
        <ComposerSheet title="Add Message">
          <NoteEditor
            visible
            onSave={(payload) => {
              createNote(payload);
              setQuery("");
              setSelectedTags([]);
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
