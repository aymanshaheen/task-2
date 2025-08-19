import React from "react";
import { View } from "react-native";
import { FormField } from "./FormField";
import { FavoriteToggle } from "./FavoriteToggle";
import { FormActions } from "./FormActions";
import { ErrorText } from "../common/ErrorText";

interface NoteFormProps {
  title: string;
  content: string;
  isFavorite: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onFavoriteChange: (isFavorite: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  titleError?: string;
  contentError?: string;
  generalError?: string;
  disabled?: boolean;
  isEditMode?: boolean;
}

export function NoteForm({
  title,
  content,
  isFavorite,
  onTitleChange,
  onContentChange,
  onFavoriteChange,
  onCancel,
  onSave,
  titleError,
  contentError,
  generalError,
  disabled = false,
  isEditMode = false,
}: NoteFormProps) {
  return (
    <View>
      <FormField
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        placeholder="Enter note title..."
        error={titleError}
        maxLength={100}
        disabled={disabled}
        required
        showCharCount
      />

      <FavoriteToggle
        value={isFavorite}
        onValueChange={onFavoriteChange}
        disabled={disabled}
      />

      <FormField
        label="Content"
        value={content}
        onChangeText={onContentChange}
        placeholder="Write your note content here..."
        error={contentError}
        maxLength={5000}
        disabled={disabled}
        required
        showCharCount
        multiline
        minHeight={200}
      />

      {generalError && <ErrorText message={generalError} />}

      <FormActions
        onCancel={onCancel}
        onSave={onSave}
        disabled={disabled}
        saveText={isEditMode ? "Update" : "Save"}
      />
    </View>
  );
}
