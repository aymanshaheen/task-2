import React from "react";
import { SafeAreaView, View, Text, Linking, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { Card } from "../../components/common/Card";
import { SectionTitle } from "../../components/common/SectionTitle";

export function HelpScreen() {
  const { themeStyles } = useTheme();
  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s16, marginTop: spacing.s4 },
      ]}
    >
      <View style={{ height: spacing.s20 }} />

      <Card>
        <SectionTitle>About this app</SectionTitle>
        <Text
          style={{
            color: themeStyles.colors.text,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          A minimal notes application built with React Native and Expo. Create,
          search, tag, and organize your notes with a clean, distraction-free
          interface.
        </Text>
      </Card>

      <View style={{ height: spacing.s16 }} />

      <Card>
        <SectionTitle>Version</SectionTitle>
        <Text style={{ color: themeStyles.colors.text }}>1.0.0</Text>
      </Card>

      <View style={{ height: spacing.s16 }} />

      <Card>
        <SectionTitle>Resources</SectionTitle>
        <Text
          accessibilityRole="link"
          style={{
            color: themeStyles.colors.primary,
            marginBottom: spacing.s8,
          }}
          onPress={() => Linking.openURL("https://expo.dev")}
        >
          Expo documentation
        </Text>
        <Text
          accessibilityRole="link"
          style={{
            color: themeStyles.colors.primary,
            marginBottom: spacing.s8,
          }}
          onPress={() => Linking.openURL("https://reactnative.dev")}
        >
          React Native docs
        </Text>
        <Text
          accessibilityRole="link"
          style={{ color: themeStyles.colors.primary }}
          onPress={() => Linking.openURL("https://github.com/expo/examples")}
        >
          Example projects
        </Text>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
