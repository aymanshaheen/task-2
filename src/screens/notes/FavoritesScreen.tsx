import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { useNotes } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { NotesList } from "../../components/NotesList";
import { spacing } from "../../styles/spacing";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { ComposerSheet } from "../../components/ComposerSheet";
import { NoteEditor } from "../../components/NoteEditor";

export function FavoritesScreen() {
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
  } = useNotes();
  const [showComposer, setShowComposer] = useState(false);
  const list = useMemo(() => notes.filter((n) => n.favorite), [notes]);
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
