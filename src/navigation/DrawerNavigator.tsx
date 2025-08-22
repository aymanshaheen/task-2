import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton,
} from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { MapPickerScreen } from "../screens/common/MapPickerScreen";
import { AddNoteScreen } from "../screens/notes/AddNoteScreen";
import { NoteDetailsScreen } from "../screens/notes/NoteDetailsScreen";
import { SearchScreen } from "../screens/notes/SearchScreen";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import {
  withSuspense,
  lazyComponent,
  prefetchWhenIdle,
} from "../utils/bundleOptimization";

import { TabNavigator } from "./TabNavigator";

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Stats: undefined;
  Help: undefined;
  NoteDetails: { id: string } | undefined;
  Search: undefined;
  AddNote: { noteId?: string } | undefined;
  MapPicker:
    | {
        initialLocation?: { latitude: number; longitude: number } | null;
        targetRouteName: string;
      }
    | undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function ScreenFallback() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.background,
      }}
    >
      <Text style={{ color: c.muted }}>Loading…</Text>
    </View>
  );
}

// Lazy components for non-primary routes
const LazyProfile = lazyComponent(
  () => import("../screens/settings/ProfileScreen"),
  (m: any) => (m as any).ProfileScreen
);
const LazyStats = lazyComponent(
  () => import("../screens/settings/StatsScreen"),
  (m: any) => (m as any).StatsScreen
);
const LazyHelp = lazyComponent(
  () => import("../screens/settings/HelpScreen"),
  (m: any) => (m as any).HelpScreen
);

function CustomDrawerContent(props: any) {
  const { themeStyles, theme, toggleTheme } = useTheme();
  const c = themeStyles.colors;
  const drawerTextStyle = {
    color: c.text,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: spacing.s40 }}
        style={{ backgroundColor: c.background }}
      >
        <View style={{ paddingTop: spacing.s8 }}>
          <DrawerItemList {...props} />
        </View>
        <View style={{ height: spacing.s12 }} />
        <View
          style={{
            paddingHorizontal: spacing.s16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: spacing.s12 }}>
              <Text style={drawerTextStyle}>Dark mode</Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: c.border, true: c.primaryAlt }}
              thumbColor={c.white}
              ios_backgroundColor={c.border}
            />
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

export function DrawerNavigator() {
  const { themeStyles, theme } = useTheme();
  const c = themeStyles.colors;
  React.useEffect(() => {
    prefetchWhenIdle([
      () => (LazyProfile as any)?.preload?.(),
      () => (LazyStats as any)?.preload?.(),
      () => (LazyHelp as any)?.preload?.(),
    ]);
  }, []);
  const ProfileComp = React.useMemo(
    () => withSuspense(LazyProfile, ScreenFallback),
    []
  );
  const StatsComp = React.useMemo(
    () => withSuspense(LazyStats, ScreenFallback),
    []
  );
  const HelpComp = React.useMemo(
    () => withSuspense(LazyHelp, ScreenFallback),
    []
  );
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerTitleStyle: {
          fontSize: typography.size.xxl,
          fontWeight: typography.weight.bold,
          color: c.text,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        sceneContainerStyle: { paddingTop: spacing.s12 },
        drawerStyle: { backgroundColor: c.background },
        drawerContentStyle: { backgroundColor: c.background },
        drawerActiveBackgroundColor: c.tabActiveBg,
        drawerActiveTintColor: c.text,
        drawerInactiveTintColor: theme === "dark" ? c.white : c.muted,
        drawerLabelStyle: {
          fontSize: typography.size.md,
          fontWeight: typography.weight.medium,
        },
        headerLeft: () =>
          route.name === "Home" ? (
            <DrawerToggleButton tintColor={c.text} />
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={{ paddingHorizontal: spacing.s12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={{ color: c.text, fontSize: typography.size.lg }}>
                {"←"}
              </Text>
            </TouchableOpacity>
          ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={({ route }) => {
          const focusedRoute = getFocusedRouteNameFromRoute(route) ?? "All";
          const title =
            focusedRoute === "All"
              ? "All"
              : focusedRoute === "Favorites"
              ? "Favorites"
              : focusedRoute === "Social"
              ? "Social"
              : focusedRoute === "Settings"
              ? "Settings"
              : "All";
          return {
            title,
            drawerLabel: () => null,
            drawerItemStyle: { height: 0 },
          };
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileComp as any}
        options={{ title: "User Profile" }}
      />
      <Drawer.Screen
        name="Stats"
        component={StatsComp as any}
        options={{ title: "App Statistics" }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpComp as any}
        options={{ title: "About & Help" }}
      />
      <Drawer.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Search",
          drawerLabel: () => null,
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="NoteDetails"
        component={NoteDetailsScreen}
        options={{
          title: "Note",
          drawerLabel: () => null,
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{
          title: "Add Note",
          drawerLabel: () => null,
          drawerItemStyle: { height: 0 },
        }}
      />
      <Drawer.Screen
        name="MapPicker"
        component={MapPickerScreen}
        options={{
          title: "Pick Location",
          drawerLabel: () => null,
          drawerItemStyle: { height: 0 },
        }}
      />
    </Drawer.Navigator>
  );
}
