import React from "react";
import { View, Text } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

import { ProfileAvatar } from "./ProfileAvatar";

type Props = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export function ProfileHeader({ name, email, avatarUrl }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const displayName = name || email.split("@")[0];

  return (
    <View style={{ alignItems: "center", marginBottom: spacing.s16 }}>
      <ProfileAvatar email={email} avatarUrl={avatarUrl} size={96} />
      <Text
        style={{
          color: c.text,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.medium,
          marginTop: spacing.s8,
        }}
      >
        {displayName}
      </Text>
      <Text style={{ color: c.muted, fontSize: typography.size.sm }}>
        {email}
      </Text>
    </View>
  );
}
