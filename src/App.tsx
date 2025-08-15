import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  View,
  Text,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme, ThemeProvider } from "./hooks/useTheme";
import { NoteEditor } from "./components/NoteEditor";
import { TagSelector } from "./components/TagSelector";
import { ErrorBanner } from "./components/ErrorBanner";
import { useNotes } from "./hooks/useNotes";
import type { Note } from "./hooks/useNotes";
import { useSearch } from "./hooks/useSearch";
import { globalStyles } from "./styles/globalStyles";
import { SortBar } from "./components/SortBar";
import { HeaderBar } from "./components/HeaderBar";
import { EmptyState } from "./components/EmptyState";
import { NotesList } from "./components/NotesList";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { ComposerSheet } from "./components/ComposerSheet";
import { BottomTabs } from "./components/BottomTabs";

function AppInner() {
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

  const [activeTab, setActiveTab] = useState<"home" | "favorites">("home");
  const [showComposer, setShowComposer] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "title" | "favorites">(
    "date"
  );

  const list = useMemo(() => {
    const base = filteredNotes.filter((n) =>
      activeTab === "favorites" ? n.favorite : true
    );

    const copy = [...base];
    copy.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortKey === "date") {
        return b.updatedAt - a.updatedAt;
      }
      if (sortKey === "title") {
        return a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return b.updatedAt - a.updatedAt;
    });
    return copy;
  }, [filteredNotes, activeTab, sortKey]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [list]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[globalStyles.flex1, themeStyles.background]}>
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
        <ErrorBanner message={error?.message} />
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8, color: themeStyles.colors.muted }}>
              Loading…
            </Text>
          </View>
        ) : list.length === 0 ? (
          <EmptyState
            message={
              !notes.length
                ? "No notes yet"
                : activeTab === "favorites"
                ? "No favorites yet"
                : "No results found"
            }
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
        {saving && !loading && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: themeStyles.colors.surface,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <ActivityIndicator size="small" />
            <Text style={{ marginLeft: 8, color: themeStyles.colors.muted }}>
              Saving…
            </Text>
          </View>
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
                setActiveTab("home");
                setQuery("");
                setSelectedTags([]);
              }}
              onClose={() => setShowComposer(false)}
              showAuthor={false}
              showTags
            />
          </ComposerSheet>
        )}
        <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
