import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { SortKey } from "../../enums/social";

type Props = {
  sort: SortKey;
  onChangeSort: (sort: SortKey) => void;
  notificationsAvailable?: boolean;
  unreadCount?: number;
};

export function FeedSortBar({
  sort,
  onChangeSort,
  notificationsAvailable,
  unreadCount = 0,
}: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.s8,
        paddingHorizontal: spacing.s12,
        marginBottom: spacing.s4,
      }}
    >
      <TouchableOpacity
        onPress={() => onChangeSort("recent")}
        activeOpacity={0.9}
        style={{
          paddingVertical: spacing.s6,
          paddingHorizontal: spacing.s10,
          borderRadius: spacing.s20,
          backgroundColor: sort === "recent" ? c.tabActiveBg : c.surface,
        }}
      >
        <Text style={{ color: c.text }}>Recent</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChangeSort("mostLiked")}
        activeOpacity={0.9}
        style={{
          paddingVertical: spacing.s6,
          paddingHorizontal: spacing.s10,
          borderRadius: spacing.s20,
          backgroundColor: sort === "mostLiked" ? c.tabActiveBg : c.surface,
        }}
      >
        <Text style={{ color: c.text }}>Most Liked</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {!!notificationsAvailable && (unreadCount || 0) > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.s4,
            paddingHorizontal: spacing.s6,
            backgroundColor: c.surface,
            borderRadius: spacing.s20,
          }}
        >
          <Text style={{ fontSize: typography.size.lg }}>🔔</Text>
          <View
            style={{
              marginLeft: spacing.s4,
              paddingHorizontal: spacing.s6,
              paddingVertical: spacing.s2,
              borderRadius: spacing.s20,
              backgroundColor: c.primary,
            }}
            accessibilityLabel="Unread interactions"
            accessible
          >
            <Text
              style={{
                color: "#fff",
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
              }}
            >
              {unreadCount}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
