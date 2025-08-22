import React, { memo, useCallback } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import OptimizedFlatList from "../../performance/components/OptimizedFlatList";
import { SocialFeedItem } from "../../services/socialService";
import { spacing } from "../../styles/spacing";

import { FeedItemCard } from "./FeedItemCard";


type Props = {
  items: SocialFeedItem[];
  loading: boolean;
  hasMore: boolean;
  refreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void | Promise<void>;
  onPressLike: (id: string) => void | Promise<void>;
  onOpenDetails: (id: string) => void;
};

export const FeedList = memo(function FeedList({
  items,
  loading,
  hasMore,
  refreshing,
  onEndReached,
  onRefresh,
  onPressLike,
  onOpenDetails,
}: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const keyExtractor = useCallback((item: SocialFeedItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: SocialFeedItem }) => (
      <FeedItemCard
        item={item}
        onPressLike={onPressLike}
        onOpenDetails={onOpenDetails}
      />
    ),
    [onPressLike, onOpenDetails]
  );

  return (
    <OptimizedFlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      hasMore={hasMore}
      loadingMore={loading}
      onEndReached={() => {
        if (!loading && hasMore) onEndReached();
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListFooterComponent={() =>
        loading ? (
          <View style={{ paddingVertical: spacing.s12 }}>
            <ActivityIndicator color={c.primary} />
          </View>
        ) : null
      }
      contentContainerStyle={{ paddingBottom: spacing.s16 }}
      windowSize={13}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={16}
      removeClippedSubviews
      estimatedItemHeight={120}
    />
  );
});
