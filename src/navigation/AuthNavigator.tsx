import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { useTheme } from "../hooks/useTheme";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignupScreen } from "../screens/auth/SignupScreen";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontSize: typography.size.xxl,
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
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: "Sign Up" }}
      />
    </Stack.Navigator>
  );
}