import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { useNotes } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { NotesList } from "../../components/NotesList";
import { spacing } from "../../styles/spacing";
import { TagFilterChips } from "../../components/TagFilterChips";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { ComposerSheet } from "../../components/ComposerSheet";
import { NoteEditor } from "../../components/NoteEditor";

export function TagsScreen() {
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    tags,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
  } = useNotes();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const list = useMemo(() => {
    if (!activeTag) return notes;
    return notes.filter((n) => n.tags.includes(activeTag));
  }, [notes, activeTag]);

  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s12 },
      ]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <TagFilterChips
        tags={tags}
        activeTag={activeTag}
        onToggle={(t) => setActiveTag((prev) => (prev === t ? null : t))}
      />
      <NotesList
        notes={list}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onTogglePin={togglePin}
        onToggleFavorite={toggleFavorite}
      />
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
