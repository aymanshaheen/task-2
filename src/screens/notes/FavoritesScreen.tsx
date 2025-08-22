import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useMemo, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
} from "react-native";

import { EmptyState } from "../../components/common/EmptyState";
import { ErrorText } from "../../components/common/ErrorText";
import { FloatingActionButton } from "../../components/common/FloatingActionButton";
import { LoadingState } from "../../components/common/LoadingState";
import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { SavingToast } from "../../components/common/SavingToast";
import { NotesList } from "../../components/notes/NotesList";
import { useNotes } from "../../hooks/useNotes";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";

export function FavoritesScreen() {
  const navigation = useNavigation();
  const { theme, themeStyles } = useTheme();
  const {
    notes,
    favorites,
    loadFavorites,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    refreshFavorites,
    error,
    loading,
    refreshing,
    saving,
  } = useNotes();
  const { isOffline, syncStatus, hasPendingOperations } =
    useOfflineIntegration();

  // Fetch favorites from API whenever this tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Ensure only true favorites are displayed - extra safety filter
  const trueFavorites = useMemo(() => {
    return favorites.filter((note) => note && note.isFavorite === true);
  }, [favorites]);

  // Debug favorites updates
  React.useEffect(() => {
    // favorites updated
  }, [trueFavorites]);

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

      {error && <ErrorText message={error.message} />}
      {loading ? (
        <LoadingState />
      ) : trueFavorites.length === 0 ? (
        <EmptyState message="No favorite notes yet. Pull down to refresh or mark some notes as favorites." />
      ) : (
        <NotesList
          notes={trueFavorites}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          onToggleFavorite={toggleFavorite}
          refreshing={refreshing}
          onRefresh={refreshFavorites}
          tintColor={themeStyles.colors.primary}
        />
      )}
      <SavingToast visible={!!saving && !loading} />
      <FloatingActionButton
        accessibilityLabel="Add note"
        onPress={() => navigation.navigate("AddNote" as never)}
      />
      <NetworkSnackbar
        onPress={() => {
          if (isOffline && hasPendingOperations) {
            Alert.alert(
              "Offline Mode",
              `You have ${syncStatus.pendingOperations} pending operations that will sync when you're back online.`
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
