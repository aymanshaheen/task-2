import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { useTheme } from "../../hooks/useTheme";
import { useNavigation } from "@react-navigation/native";

type Props = {
  onEditPhoto?: () => void;
  onEditLocation?: () => void;
};

export function ProfileActions({ onEditPhoto, onEditLocation }: Props) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const navigation = useNavigation<any>();

  return (
    <View style={{ flexDirection: "row", columnGap: spacing.s8 }}>
      <TouchableOpacity
        onPress={onEditPhoto || (() => {})}
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: spacing.s10,
          paddingVertical: spacing.s12,
          alignItems: "center",
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: c.text, fontWeight: typography.weight.medium }}>
          Edit Photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={
          onEditLocation ||
          (() =>
            navigation.navigate(
              "MapPicker" as never,
              {
                initialLocation: undefined,
                targetRouteName: "Profile",
              } as never
            ))
        }
        style={{
          flex: 1,
          backgroundColor: c.primary,
          borderRadius: spacing.s10,
          paddingVertical: spacing.s12,
          alignItems: "center",
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: c.white, fontWeight: typography.weight.medium }}>
          Set Location
        </Text>
      </TouchableOpacity>
    </View>
  );
}
