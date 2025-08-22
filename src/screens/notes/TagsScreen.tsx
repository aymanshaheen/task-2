import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";

import { ErrorText } from "../../components/common/ErrorText";
import { FloatingActionButton } from "../../components/common/FloatingActionButton";
import { LoadingState } from "../../components/common/LoadingState";
import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { SavingToast } from "../../components/common/SavingToast";
import { TagFilterChips } from "../../components/common/TagFilterChips";
import { NotesList } from "../../components/notes/NotesList";
import { useNotes } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";

export function TagsScreen() {
  const navigation = useNavigation();
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    tags,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    error,
    loading,
    saving,
  } = useNotes();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const list = useMemo(() => {
    if (!activeTag) return notes;
    return notes.filter((n) => n.tags?.includes(activeTag) || false);
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

      {error && <ErrorText message={error.message} />}
      <TagFilterChips
        tags={tags}
        activeTag={activeTag}
        onToggle={(t) => setActiveTag((prev) => (prev === t ? null : t))}
      />
      {loading ? (
        <LoadingState />
      ) : (
        <NotesList
          notes={list}
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
