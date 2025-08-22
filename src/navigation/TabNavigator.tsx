import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, StyleSheet } from "react-native";

import { useNotificationCenter } from "../hooks/useNotificationCenter";
import { useTheme } from "../hooks/useTheme";
import OptimizedSocialScreen, {
  preload as preloadSocial,
} from "../optimized-screens/SocialFeed";
import { AllNotesScreen } from "../screens/notes/AllNotesScreen";
import { FavoritesScreen } from "../screens/notes/FavoritesScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { notesService } from "../services/notesService";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { prefetchWhenIdle } from "../utils/bundleOptimization";

export type MainTabParamList = {
  All: undefined;
  Favorites: undefined;
  Social: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function TabNavigator() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const { unreadCount } = useNotificationCenter();

  React.useEffect(() => {
    prefetchWhenIdle([
      () => preloadSocial?.(),
      async () => {
        try {
          await notesService.getNotes({ limit: 30, offset: 0 });
        } catch {}
      },
    ]);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: {
          paddingTop: spacing.s6,
          paddingBottom: spacing.s4,
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
      }}
    >
      <Tab.Screen
        name="All"
        component={AllNotesScreen}
        options={{
          title: "All",
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: focused ? size + 2 : size }}>
              📒
            </Text>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: focused ? typography.size.md : typography.size.sm,
                fontWeight: focused
                  ? typography.weight.bold
                  : typography.weight.medium,
              }}
            >
              All
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: focused ? size + 2 : size }}>
              ⭐️
            </Text>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: focused ? typography.size.md : typography.size.sm,
                fontWeight: focused
                  ? typography.weight.bold
                  : typography.weight.medium,
              }}
            >
              Favorites
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={OptimizedSocialScreen}
        options={{
          title: "Social",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: focused ? size + 2 : size }}>
              💬
            </Text>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: focused ? typography.size.md : typography.size.sm,
                fontWeight: focused
                  ? typography.weight.bold
                  : typography.weight.medium,
              }}
            >
              Social
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: focused ? size + 2 : size }}>
              ⚙️
            </Text>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: focused ? typography.size.md : typography.size.sm,
                fontWeight: focused
                  ? typography.weight.bold
                  : typography.weight.medium,
              }}
            >
              Settings
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
