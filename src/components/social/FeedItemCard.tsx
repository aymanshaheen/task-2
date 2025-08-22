import React, { useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { SocialFeedItem } from "../../services/socialService";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  item: SocialFeedItem;
  onPressLike: (id: string) => void;
  onOpenDetails: (id: string) => void;
};

export function FeedItemCard({ item, onPressLike, onOpenDetails }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const likeAnimRef = useRef(new Animated.Value(1));

  const handlePressLike = () => {
    Animated.sequence([
      Animated.timing(likeAnimRef.current, {
        toValue: 1.3,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(likeAnimRef.current, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onPressLike(item.id);
  };

  const cleanedContent = useMemo(
    () => (item.content || "").replace(/<[^>]+>/g, " "),
    [item.content]
  );

  return (
    <View
      style={{
        marginHorizontal: spacing.s12,
        marginTop: spacing.s8,
        padding: spacing.s12,
        borderRadius: spacing.s8,
        backgroundColor: c.surface,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: typography.size.md,
            fontWeight: typography.weight.medium,
            color: c.text,
            flex: 1,
            marginRight: spacing.s8,
          }}
          accessibilityRole="header"
        >
          {item.title || "Untitled"}
        </Text>
        <Animated.View style={{ transform: [{ scale: likeAnimRef.current }] }}>
          <TouchableOpacity
            onPress={handlePressLike}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Like note"
          >
            <Text style={{ fontSize: typography.size.lg }}>
              {item.likedByMe ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {!!item.author && (
        <Text style={{ color: c.muted, marginTop: spacing.s2 }}>
          by {item.author}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => onOpenDetails(item.id)}
        activeOpacity={0.85}
        style={{ marginTop: spacing.s8 }}
      >
        <Text style={{ color: c.text }} numberOfLines={6}>
          {cleanedContent}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: spacing.s8,
        }}
      >
        <Text style={{ color: c.muted }}>{item.likeCount || 0} likes</Text>
      </View>
    </View>
  );
}
