import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { SocialFeedItem } from "../../services/socialService";
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

export function FeedList({
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

  const keyExtractor = (item: SocialFeedItem) => item.id;

  const renderItem = ({ item }: { item: SocialFeedItem }) => (
    <FeedItemCard
      item={item}
      onPressLike={onPressLike}
      onOpenDetails={onOpenDetails}
    />
  );

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReachedThreshold={0.5}
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
    />
  );
}
