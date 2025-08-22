import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { FeedList } from "../../components/social/FeedList";
import { FeedSortBar } from "../../components/social/FeedSortBar";
import { useSocialFeed } from "../../hooks/useSocialFeed";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";

export function SocialFeedScreen() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const navigation = useNavigation<any>();

  const {
    feed,
    loading,
    refreshing,
    hasMore,
    sort,
    setSort,
    onRefresh,
    loadMore,
    handleLike,
    notificationsAvailable,
    unreadCount,
  } = useSocialFeed();

  return (
    <View
      style={{ flex: 1, backgroundColor: c.background, paddingTop: spacing.s4 }}
    >
      <FeedSortBar
        sort={sort}
        onChangeSort={setSort}
        notificationsAvailable={notificationsAvailable}
        unreadCount={unreadCount}
      />
      <FeedList
        items={feed}
        loading={loading}
        hasMore={hasMore}
        refreshing={refreshing}
        onEndReached={loadMore}
        onRefresh={onRefresh}
        onPressLike={handleLike}
        onOpenDetails={(id) =>
          navigation.navigate("NoteDetails", { id } as any)
        }
      />
    </View>
  );
}
