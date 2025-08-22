import React from "react";
import { Image, View, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type Props = {
  email: string;
  avatarUrl?: string | null;
  size?: number;
  showLabel?: boolean;
};

export function ProfileAvatar({
  email,
  avatarUrl,
  size = 96,
  showLabel = false,
}: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  const radius = Math.round(size / 2) as unknown as number;
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    email
  )}&background=random&size=${Math.max(size * 2, 160)}`;

  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={{ uri: avatarUrl || fallback }}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: c.chipBg,
        }}
        resizeMode="cover"
      />
      {showLabel && (
        <Text
          numberOfLines={1}
          style={{
            marginTop: spacing.s8,
            color: c.muted,
            fontSize: typography.size.sm,
          }}
        >
          {email}
        </Text>
      )}
    </View>
  );
}
