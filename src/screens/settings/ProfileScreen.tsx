import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { SafeAreaView, View, Text } from "react-native";

import { Card } from "../../components/common/Card";
import { ProfileActions } from "../../components/profile/ProfileActions";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileInfo } from "../../components/profile/ProfileInfo";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { cameraService } from "../../services/cameraService";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";

export function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { themeStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Prefer the avatar URL saved locally, otherwise fall back to possible API field names
  const avatarUrl =
    (user as any)?.avatarUrl ||
    (user as any)?.profilePictureUrl ||
    (user as any)?.profilePicture ||
    (user as any)?.photoUrl ||
    (user as any)?.imageUrl;

  useEffect(() => {
    const selected = (route.params as any)?.selectedLocation as
      | { latitude: number; longitude: number; address?: string }
      | undefined;
    if (selected) {
      const pretty =
        selected.address ||
        `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}`;
      updateUser({ location: pretty } as any);
      navigation.setParams({ selectedLocation: undefined } as any);
    }
  }, [route.params, navigation, updateUser]);
  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s16, marginTop: spacing.s16 },
      ]}
    >
      <View style={{ height: spacing.s20 }} />
      {user ? (
        <>
          <Card>
            <ProfileHeader
              name={user.name}
              email={user.email}
              avatarUrl={avatarUrl}
            />
            <ProfileInfo
              userId={user.id}
              memberSince={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : undefined
              }
              plan="Free"
              location={user.location || null}
            />
          </Card>

          <View style={{ height: spacing.s12 }} />

          <Card>
            <ProfileActions
              onEditPhoto={async () => {
                try {
                  const picked = await cameraService.pickImageFromLibrary({
                    allowsEditing: true,
                    aspect: [1, 1],
                  });
                  if (picked?.uri) {
                    await updateUser({ avatarUrl: picked.uri } as any);
                  }
                } catch {}
              }}
            />
          </Card>
        </>
      ) : (
        <Card>
          <Text style={{ color: themeStyles.colors.text }}>Not logged in</Text>
        </Card>
      )}
    </SafeAreaView>
  );
}
