import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
  LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { AuthNavigator } from "./AuthNavigator";
import { DrawerNavigator } from "./DrawerNavigator";
import { ProfileSetupNavigator } from "./ProfileSetupNavigator";
import { useTheme } from "../hooks/useTheme";

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, user } = useAuth();
  const { theme, themeStyles } = useTheme();
  const c = themeStyles.colors;

  const navTheme: Theme = React.useMemo(() => {
    const base = theme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.primary,
        background: c.background,
        card: c.surface,
        text: c.text,
        border: c.border,
        notification: c.danger,
      },
    } as Theme;
  }, [theme, c]);

  const linking: LinkingOptions<any> = {
    prefixes: ["task-2://"],
    config: {
      screens: {
        Main: {
          screens: {
            NoteDetails: "note/:id",
          },
        },
      },
    },
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user && (user as any).profileCompleted ? (
            <Stack.Screen name="Main" component={DrawerNavigator} />
          ) : (
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupNavigator}
            />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
