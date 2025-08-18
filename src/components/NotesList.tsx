import React, { memo, useCallback } from "react";
import { FlatList, View } from "react-native";
import { spacing } from "../styles/spacing";
import { NoteCard } from "./NoteCard";
import type { Note } from "../hooks/useNotes";

type Props = {
  notes: Note[];
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
};

export const NotesList: React.FC<Props> = memo(
  ({ notes, onUpdate, onDelete, onTogglePin, onToggleFavorite }) => {
    const keyExtractor = useCallback((item: Note) => item.id, []);
    const renderItem = useCallback(
      ({ item }: { item: Note }) => (
        <NoteCard
          note={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onToggleFavorite={onToggleFavorite}
        />
      ),
      [onUpdate, onDelete, onTogglePin, onToggleFavorite]
    );
    return (
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: spacing.s92 }} />}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
      />
    );
  }
);
