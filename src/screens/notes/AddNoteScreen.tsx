import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";

import { NetworkSnackbar } from "../../components/common/NetworkSnackbar";
import { SavingToast } from "../../components/common/SavingToast";
import { FormLoadingState } from "../../components/forms/FormLoadingState";
import { NoteForm } from "../../components/forms/NoteForm";
import { useNoteFormValidation } from "../../hooks/useNoteFormValidation";
import { useNotes } from "../../hooks/useNotes";
import { useOfflineIntegration } from "../../hooks/useOfflineIntegration";
import { useTheme } from "../../hooks/useTheme";
import { cameraService } from "../../services/cameraService";
import { locationService } from "../../services/locationService";
import { permissionsService } from "../../services/permissionsService";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";

export function AddNoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, themeStyles } = useTheme();
  const { createNote, updateNote, getNote, loading, error, saving } =
    useNotes();
  useOfflineIntegration();
  const { errors, validateForm, clearError } = useNoteFormValidation();

  const noteId = (route.params as any)?.noteId;
  const selectedLocationFromPicker = (route.params as any)?.selectedLocation as
    | { latitude: number; longitude: number; address?: string }
    | undefined;
  const isEditMode = !!noteId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  useEffect(() => {
    if (selectedLocationFromPicker) {
      setLocation(selectedLocationFromPicker);
      // Clear the param to avoid re-applying on focus changes
      (navigation as any)?.setParams?.({ selectedLocation: undefined });
    }
  }, [selectedLocationFromPicker]);

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
        setIsPublic(false);
        setPhotos([]);
        setLocation(null);
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
          setIsPublic((note as any).isPublic || false);
          setPhotos((note as any).photos || []);
          setLocation((note as any).location || null);
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
          photos,
          location: location || undefined,
        });
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          isFavorite,
          isPublic,
          photos,
          location: location || undefined,
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

  const handlePickPhotos = async () => {
    const granted = await permissionsService.ensureMediaPermissions();
    if (!granted) return;
    const uris = await cameraService.pickImagesFromLibrary({
      max: 10,
      compressQuality: 0.7,
      maxDimension: 1600,
    });
    if (uris?.length) {
      setPhotos((prev) => Array.from(new Set([...(prev || []), ...uris])));
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos((prev) => (prev || []).filter((p) => p !== uri));
  };

  const handleUseCurrentLocation = async () => {
    const granted = await permissionsService.ensureLocationPermissions();
    if (!granted) return;
    const loc = await locationService.getCurrentLocationWithAddress();
    if (loc) {
      const pretty = loc.address
        ? [loc.address.city, loc.address.region, loc.address.country]
            .filter(Boolean)
            .join(", ")
        : undefined;
      setLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: pretty,
      });
    }
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
          isPublic={isPublic}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onFavoriteChange={setIsFavorite}
          onPublicChange={setIsPublic}
          onCancel={handleCancel}
          onSave={handleSave}
          titleError={errors.title}
          contentError={errors.content}
          generalError={error?.message}
          disabled={isFormDisabled}
          isEditMode={isEditMode}
          photos={photos}
          onPickPhotos={handlePickPhotos}
          onRemovePhoto={handleRemovePhoto}
          location={location || undefined}
          onLocationChange={setLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
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
