import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

type TabKey = "home" | "favorites";

type Props = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export const BottomTabs: React.FC<Props> = ({ activeTab, onChange }) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={[
        styles.tabbar,
        { backgroundColor: c.surface, borderTopColor: c.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => onChange("home")}
        style={[
          styles.tabItem,
          activeTab === "home" && { backgroundColor: c.tabActiveBg },
        ]}
      >
        <Text style={[styles.tabIcon, { color: c.text }]}>🏠</Text>
        <Text style={[styles.tabText, { color: c.text }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange("favorites")}
        style={[
          styles.tabItem,
          activeTab === "favorites" && { backgroundColor: c.tabActiveBg },
        ]}
      >
        <Text style={[styles.tabIcon, { color: c.text }]}>⭐️</Text>
        <Text style={[styles.tabText, { color: c.text }]}>Favorites</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabIcon: { fontSize: typography.size.lg },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: spacing.s2,
    justifyContent: "center",
  },
  tabItemActive: {},
  tabText: { fontSize: typography.size.xs },
  tabbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: "row",
    height: spacing.s64,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
