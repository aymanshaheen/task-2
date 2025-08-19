import React, { memo, useCallback } from "react";
import { FlatList, View, RefreshControl } from "react-native";
import { spacing } from "../../styles/spacing";
import { NoteCard } from "./NoteCard";
import type { Note } from "../../hooks/useNotes";

type Props = {
  notes: Note[];
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  tintColor?: string;
};

export const NotesList: React.FC<Props> = memo(
  ({
    notes,
    onUpdate,
    onDelete,
    onTogglePin,
    onToggleFavorite,
    refreshing,
    onRefresh,
    tintColor,
  }) => {
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

    const refreshControl = onRefresh ? (
      <RefreshControl
        refreshing={refreshing || false}
        onRefresh={onRefresh}
        tintColor={tintColor}
        colors={tintColor ? [tintColor] : undefined}
      />
    ) : undefined;

    return (
      <FlatList
        data={notes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: spacing.s92 }} />}
        refreshControl={refreshControl}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);
