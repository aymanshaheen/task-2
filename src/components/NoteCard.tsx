import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { formatRelativeTime } from "../utils/dateHelpers";
import { globalStyles } from "../styles/globalStyles";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { useTheme } from "../hooks/useTheme";
import { SwipeActions } from "./SwipeActions";

export type Note = {
  id: string;
  title: string;
  content: string;
  author?: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  updatedAt: number;
  createdAt: number;
};

type Props = {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
};

export const NoteCard = memo(
  ({ note, onUpdate, onDelete, onToggleFavorite }: Props) => {
    const { themeStyles } = useTheme();
    const mountProgress = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(mountProgress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [mountProgress]);
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setTick((t) => t + 1), 60000);
      return () => clearInterval(id);
    }, []);
    const subtitle = useMemo(
      () => formatRelativeTime(note.updatedAt),
      [note.updatedAt, tick]
    );
    const [isEditing, setIsEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(note.title);
    const [draftContent, setDraftContent] = useState(note.content);
    const [draftTagsText, setDraftTagsText] = useState(note.tags.join(", "));

    const plainTextSource = isEditing ? draftContent : note.content;
    const plainText = useMemo(
      () =>
        plainTextSource
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .trim(),
      [plainTextSource]
    );
    const charCount = plainText.length;
    const wordCount = useMemo(
      () => (plainText ? plainText.split(/\s+/).length : 0),
      [plainText]
    );

    const confirmDelete = () => {
      Alert.alert("Delete note?", "This action cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(note.id),
        },
      ]);
    };

    const save = () => {
      const tags = draftTagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      onUpdate(note.id, {
        title: draftTitle.trim(),
        content: draftContent,
        tags,
      });
      setIsEditing(false);
    };

    const swipeableRef = useRef<Swipeable | null>(null);

    return (
      <SwipeActions ref={swipeableRef} onDelete={confirmDelete}>
        <Animated.View
          style={[
            styles.card,
            themeStyles.card,
            {
              opacity: mountProgress,
              transform: [
                {
                  translateY: mountProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.row}>
            {isEditing ? (
              <TextInput
                value={draftTitle}
                onChangeText={setDraftTitle}
                style={[styles.title, { color: themeStyles.colors.text }]}
              />
            ) : (
              <Text style={[styles.title, { color: themeStyles.colors.text }]}>
                {note.title || "Untitled"}
              </Text>
            )}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => onToggleFavorite(note.id)}
                activeOpacity={1}
              >
                <Text style={[styles.icon, { color: themeStyles.colors.text }]}>
                  {note.favorite ? "★" : "☆"}
                </Text>
              </TouchableOpacity>
              {isEditing ? (
                <TouchableOpacity onPress={save} activeOpacity={1}>
                  <Text
                    style={[
                      styles.action,
                      { color: themeStyles.colors.primary },
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setDraftTitle(note.title);
                    setDraftContent(note.content);
                    setDraftTagsText(note.tags.join(", "));
                    setIsEditing(true);
                  }}
                  activeOpacity={1}
                >
                  <Text
                    style={[styles.icon, { color: themeStyles.colors.text }]}
                  >
                    ✏️
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {!!note.author && !isEditing && (
            <Text
              style={[styles.subtitle, { color: themeStyles.colors.muted }]}
            >
              By {note.author}
            </Text>
          )}
          {isEditing ? (
            <TextInput
              value={draftContent}
              onChangeText={setDraftContent}
              multiline
              style={[styles.content, { color: themeStyles.colors.text }]}
            />
          ) : (
            <Text
              numberOfLines={6}
              style={[styles.content, { color: themeStyles.colors.text }]}
            >
              {note.content.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")}
            </Text>
          )}
          {isEditing && (
            <TextInput
              placeholder="tags (comma separated)"
              value={draftTagsText}
              onChangeText={setDraftTagsText}
              style={[
                styles.tagsInput,
                {
                  borderTopColor: themeStyles.colors.border,
                  color: themeStyles.colors.text,
                },
              ]}
              placeholderTextColor={themeStyles.colors.placeholder}
            />
          )}
          <Text style={[styles.counter, { color: themeStyles.colors.muted }]}>
            {wordCount} words • {charCount} chars
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.muted, { color: themeStyles.colors.muted }]}>
              Edited {subtitle}
            </Text>
            <Text style={[styles.tags, { color: themeStyles.colors.muted }]}>
              {note.tags.join(", ")}
            </Text>
          </View>
        </Animated.View>
      </SwipeActions>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    padding: spacing.s12,
    borderRadius: spacing.s8,
    marginHorizontal: spacing.s12,
    marginTop: spacing.s8,
    ...globalStyles.shadowSmall,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    flex: 1,
    marginRight: spacing.s8,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.s8,
  },
  icon: {
    fontSize: typography.size.md,
    paddingHorizontal: spacing.s6,
  },
  action: {
    paddingHorizontal: spacing.s6,
  },
  delete: {},
  content: {
    marginTop: spacing.s8,
  },
  tagsInput: {
    marginTop: spacing.s8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.s8,
  },
  footer: {
    marginTop: spacing.s8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counter: {
    marginTop: spacing.s6,
    fontSize: typography.size.xs,
  },
  subtitle: {
    marginTop: spacing.s4,
    fontSize: typography.size.xs,
  },
  muted: {
    fontSize: typography.size.xs,
  },
  tags: {
    fontSize: typography.size.xs,
  },
});
