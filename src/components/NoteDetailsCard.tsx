import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { formatRelativeTime } from "../utils/dateHelpers";

export function NoteDetailsCard({
  note,
}: {
  note: {
    title: string;
    content: string;
    author?: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
  };
}) {
  const { themeStyles } = useTheme();
  return (
    <View
      style={[
        themeStyles.card,
        { padding: spacing.s16, borderRadius: spacing.s12 },
      ]}
    >
      <Text
        style={{
          color: themeStyles.colors.text,
          fontSize: typography.size.xl,
          fontWeight: typography.weight.bold,
        }}
      >
        {note.title || "Untitled"}
      </Text>
      {!!note.author && (
        <Text
          style={{
            marginTop: spacing.s6,
            color: themeStyles.colors.muted,
            fontSize: typography.size.sm,
          }}
        >
          By {note.author}
        </Text>
      )}
      <View style={{ height: spacing.s12 }} />
      <Text
        style={{
          color: themeStyles.colors.text,
          fontSize: typography.size.md,
          lineHeight: typography.lineHeight.normal,
        }}
      >
        {note.content.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")}
      </Text>
      <View style={{ height: spacing.s16 }} />
      {!!note.tags.length && (
        <Text style={{ color: themeStyles.colors.muted }}>
          Tags: {note.tags.join(", ")}
        </Text>
      )}
      <View style={{ height: spacing.s8 }} />
      <Text style={{ color: themeStyles.colors.muted }}>
        Created {formatRelativeTime(note.createdAt)} • Updated{" "}
        {formatRelativeTime(note.updatedAt)}
      </Text>
    </View>
  );
}
