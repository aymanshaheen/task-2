import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { useTheme } from "../hooks/useTheme";
import { MapPickerScreen } from "../screens/common/MapPickerScreen";
import { ProfileLocationScreen } from "../screens/profile/ProfileLocationScreen";
import { ProfilePreferencesScreen } from "../screens/profile/ProfilePreferencesScreen";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

export type ProfileSetupStackParamList = {
  ProfileLocation: undefined;
  ProfilePreferences: undefined;
  MapPicker:
    | {
        initialLocation?: { latitude: number; longitude: number } | null;
        targetRouteName: string;
      }
    | undefined;
};

const Stack = createNativeStackNavigator<ProfileSetupStackParamList>();

export function ProfileSetupNavigator() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        contentStyle: {
          paddingTop: spacing.s12,
          paddingHorizontal: spacing.s12,
          backgroundColor: c.background,
        },
      }}
    >
      <Stack.Screen
        name="ProfileLocation"
        component={ProfileLocationScreen}
        options={{ title: "Set Location" }}
      />
      <Stack.Screen
        name="ProfilePreferences"
        component={ProfilePreferencesScreen}
        options={{ title: "Preferences" }}
      />
      <Stack.Screen
        name="MapPicker"
        component={MapPickerScreen}
        options={{ title: "Pick Location" }}
      />
    </Stack.Navigator>
  );
}
