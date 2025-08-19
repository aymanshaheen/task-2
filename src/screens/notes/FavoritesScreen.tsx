import React, { useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useNotes } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { globalStyles } from "../../styles/globalStyles";
import { NotesList } from "../../components/notes/NotesList";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorText } from "../../components/common/ErrorText";
import { SavingToast } from "../../components/common/SavingToast";
import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { spacing } from "../../styles/spacing";
import { FloatingActionButton } from "../../components/common/FloatingActionButton";

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
  const {
    isOffline,
    syncStatus,
    performSync,
    hasPendingOperations,
    isSyncing,
  } = useOfflineIntegration();

  // Fetch favorites from API whenever this tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log("FavoritesScreen focused - loading favorites from API");
      loadFavorites();
    }, [loadFavorites])
  );

  // Ensure only true favorites are displayed - extra safety filter
  const trueFavorites = useMemo(() => {
    return favorites.filter((note) => note && note.isFavorite === true);
  }, [favorites]);

  // Debug favorites updates
  React.useEffect(() => {
    console.log(
      `FavoritesScreen: favorites updated - count: ${trueFavorites.length}`
    );
    trueFavorites.forEach((fav, index) => {
      console.log(`  ${index}: ${fav.title} (isFavorite: ${fav.isFavorite})`);
    });
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
