import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { formatRelativeTime } from "../../utils/dateHelpers";
import type { Note } from "../../hooks/useNotes";

export function NoteDetailsCard({ note }: { note: Note }) {
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

      {!!(note as any).photos?.length && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.s12 }}
        >
          {(note as any).photos.map((uri: string, idx: number) => (
            <View
              key={`${note.id}_detail_photo_${idx}`}
              style={{ marginRight: spacing.s8 }}
            >
              <Image
                source={{ uri }}
                style={{
                  width: 200,
                  height: 140,
                  borderRadius: spacing.s8,
                  backgroundColor: themeStyles.colors.surface,
                }}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {!!(note as any).location && (
        <Text
          style={{
            marginTop: spacing.s8,
            color: themeStyles.colors.muted,
            fontSize: typography.size.sm,
          }}
        >
          📍{" "}
          {(note as any).location.address ||
            `${(note as any).location.latitude?.toFixed?.(4)}, ${(
              note as any
            ).location.longitude?.toFixed?.(4)}`}
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
        Created{" "}
        {formatRelativeTime(
          typeof note.createdAt === "string"
            ? new Date(note.createdAt).getTime()
            : note.createdAt
        )}{" "}
        • Updated{" "}
        {formatRelativeTime(
          typeof note.updatedAt === "string"
            ? new Date(note.updatedAt).getTime()
            : note.updatedAt
        )}
      </Text>
    </View>
  );
}
