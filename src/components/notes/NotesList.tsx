import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, InteractionManager } from "react-native";

import type { Note } from "../../hooks/useNotes";
import OptimizedFlatList from "../../performance/components/OptimizedFlatList";
import { spacing } from "../../styles/spacing";
import {
  createScrollFpsMeter,
  assertTargets,
} from "../../utils/performanceUtils";

import { NoteCard } from "./NoteCard";

type Props = {
  notes: Note[];
  sections?: { title: string; data: Note[] }[];
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  tintColor?: string;
  onEndReached?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
};

export const NotesList: React.FC<Props> = memo(
  ({
    notes,
    sections,
    onUpdate,
    onDelete,
    onTogglePin,
    onToggleFavorite,
    refreshing,
    onRefresh,
    onEndReached,
    loadingMore,
    hasMore,
  }) => {
    const keyExtractor = useCallback((item: Note) => item.id, []);
    const [isScrolling, setIsScrolling] = useState(false);
    const [animationsEnabled, setAnimationsEnabled] = useState(false);
    useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setAnimationsEnabled(true);
      });
      return () => task?.cancel?.();
    }, []);

    const renderItem = useCallback(
      (
        { item }: { item: Note; index: number },
        helpers?: { isItemVisible?: boolean }
      ) => (
        <NoteCard
          note={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onToggleFavorite={onToggleFavorite}
          isVisible={helpers?.isItemVisible ?? true}
          isScrolling={isScrolling}
          disableAnimations={!animationsEnabled}
        />
      ),
      [
        onUpdate,
        onDelete,
        onTogglePin,
        onToggleFavorite,
        isScrolling,
        animationsEnabled,
      ]
    );

    const scrollMeterRef = useRef(createScrollFpsMeter("notes_scroll"));
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = useCallback(() => {
      if (!__DEV__) return;
      if (!scrollMeterRef.current) return;
      scrollMeterRef.current.start();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        const { fps } = scrollMeterRef.current.stop();
        assertTargets({
          fps,
          idleMb: undefined,
          heavyMb: undefined,
          searchMs: undefined,
          screenLoadMs: undefined,
        });
      }, 300);
    }, []);

    const onScrollBegin = useCallback(() => setIsScrolling(true), []);
    const onScrollEnd = useCallback(() => setIsScrolling(false), []);

    return (
      <OptimizedFlatList
        data={sections ? undefined : notes}
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: spacing.s92 }} />}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onScroll={__DEV__ ? handleScroll : undefined}
        onScrollBeginDrag={onScrollBegin}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollBegin={onScrollBegin}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={__DEV__ ? 32 : 48}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={64}
        estimatedItemHeight={200}
        onEndReached={onEndReached}
        hasMore={!!hasMore}
        loadingMore={!!loadingMore}
      />
    );
  }
);
