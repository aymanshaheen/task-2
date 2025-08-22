import React, { useState } from "react";
import { View, Text } from "react-native";

import { PreferenceToggleButton } from "../../components/profile/PreferenceToggleButton";
import { PrimaryBottomButton } from "../../components/profile/PrimaryBottomButton";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

export function ProfilePreferencesScreen({ navigation }: any) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const { updateUser } = useAuth();
  const [favorites, setFavorites] = useState<{ notes: boolean; tags: boolean }>(
    { notes: true, tags: false }
  );

  const toggle = (key: keyof typeof favorites) => {
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onFinish = async () => {
    await updateUser({
      preferences: favorites as any,
      profileCompleted: true,
    } as any);
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <View style={{ flex: 1, padding: spacing.s16 }}>
      <Text
        style={{
          color: c.text,
          fontSize: typography.size.lg,
          marginBottom: spacing.s16,
        }}
      >
        Choose your preferences
      </Text>

      <PreferenceToggleButton
        label="Prefer Notes Highlights"
        active={favorites.notes}
        onPress={() => toggle("notes")}
      />

      <PreferenceToggleButton
        label="Prefer Tags Highlights"
        active={favorites.tags}
        onPress={() => toggle("tags")}
      />

      <PrimaryBottomButton label="Finish" onPress={onFinish} />
    </View>
  );
}
