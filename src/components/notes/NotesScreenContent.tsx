import React, { memo } from "react";

import type { Note } from "../../hooks/useNotes";
import type { NotesError } from "../../models/notes";
import { EmptyState } from "../common/EmptyState";
import { ErrorText } from "../common/ErrorText";
import { LoadingState } from "../common/LoadingState";

import { NotesList } from "./NotesList";

interface NotesScreenContentProps {
  loading: boolean;
  error: NotesError | null;
  notes: Note[];
  allNotes: Note[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  onUpdate: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  onTogglePin: (noteId: string) => Promise<void>;
  onToggleFavorite: (noteId: string) => Promise<void>;
  tintColor: string;
}

export const NotesScreenContent = memo(function NotesScreenContent({
  loading,
  error,
  notes,
  allNotes,
  refreshing,
  onRefresh,
  onEndReached,
  loadingMore,
  hasMore,
  onUpdate,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  tintColor,
}: NotesScreenContentProps) {
  if (error) {
    return <ErrorText message={error.message} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        message={
          !allNotes.length
            ? "No notes yet. Pull down to refresh or tap + to create your first note."
            : "No results found"
        }
      />
    );
  }

  return (
    <NotesList
      notes={notes}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onTogglePin={onTogglePin}
      onToggleFavorite={onToggleFavorite}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      onEndReached={onEndReached}
      loadingMore={loadingMore}
      hasMore={hasMore}
    />
  );
});
