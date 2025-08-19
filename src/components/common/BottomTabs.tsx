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
  tabbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.s64,
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s2,
  },
  tabItemActive: {},
  tabIcon: { fontSize: typography.size.lg },
  tabText: { fontSize: typography.size.xs },
});
