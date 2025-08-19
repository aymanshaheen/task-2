import React from "react";
import { Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AllNotesScreen } from "../screens/notes/AllNotesScreen";
import { FavoritesScreen } from "../screens/notes/FavoritesScreen";
import { TagsScreen } from "../screens/notes/TagsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { useTheme } from "../hooks/useTheme";
import { typography } from "../styles/typography";
import { spacing } from "../styles/spacing";

export type MainTabParamList = {
  All: undefined;
  Favorites: undefined;
  Tags: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function TabNavigator() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
        name="Tags"
        component={TagsScreen}
        options={{
          title: "Categories",
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ color, fontSize: focused ? size + 2 : size }}>
              🏷️
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
              Categories
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