import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useNotes } from "../../hooks/useNotes";
import { useNoteFormValidation } from "../../hooks/useNoteFormValidation";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { spacing } from "../../styles/spacing";
import { globalStyles } from "../../styles/globalStyles";
import { NoteForm } from "../../components/forms/NoteForm";
import { FormLoadingState } from "../../components/forms/FormLoadingState";
import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { SavingToast } from "../../components/common/SavingToast";

export function AddNoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, themeStyles } = useTheme();
  const { createNote, updateNote, getNote, loading, error, saving } =
    useNotes();
  const { isOffline } = useOfflineIntegration();
  const { errors, validateForm, clearError } = useNoteFormValidation();

  const noteId = (route.params as any)?.noteId;
  const isEditMode = !!noteId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Edit Note" : "Add Note",
      headerShown: true,
    });
  }, [navigation, isEditMode]);

  // Reset form when navigating to create mode
  useFocusEffect(
    React.useCallback(() => {
      if (!isEditMode) {
        // Clear form when navigating to create new note
        setTitle("");
        setContent("");
        setIsFavorite(false);
      }
    }, [isEditMode])
  );

  useEffect(() => {
    if (isEditMode && noteId) {
      setIsLoadingNote(true);
      getNote(noteId)
        .then((note) => {
          setTitle(note.title || "");
          setContent(note.content || "");
          setIsFavorite(note.isFavorite || false);
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to load note for editing");
          navigation.goBack();
        })
        .finally(() => {
          setIsLoadingNote(false);
        });
    }
  }, [isEditMode, noteId, getNote, navigation]);

  const handleSave = async () => {
    if (!validateForm({ title, content })) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && noteId) {
        await updateNote(noteId, {
          title: title.trim(),
          content: content.trim(),
          isFavorite,
        });
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          isFavorite,
        });
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } note. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (errors.title) clearError("title");
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    if (errors.content) clearError("content");
  };

  const isFormDisabled = isSubmitting || loading || isLoadingNote;

  return (
    <SafeAreaView style={[globalStyles.flex1, themeStyles.background]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <ScrollView
        style={[globalStyles.flex1, { padding: spacing.s16 }]}
        showsVerticalScrollIndicator={false}
      >
        <NoteForm
          title={title}
          content={content}
          isFavorite={isFavorite}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onFavoriteChange={setIsFavorite}
          onCancel={handleCancel}
          onSave={handleSave}
          titleError={errors.title}
          contentError={errors.content}
          generalError={error?.message}
          disabled={isFormDisabled}
          isEditMode={isEditMode}
        />

        <FormLoadingState
          isLoadingNote={isLoadingNote}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
        />

        <View style={{ height: spacing.s24 }} />
      </ScrollView>
      <SavingToast visible={!!saving && !loading && !isSubmitting} />
      <NetworkSnackbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
