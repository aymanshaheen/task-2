import { useNavigation } from "@react-navigation/native";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import Animated, {
  Easing as ReEasing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";

import type { Note } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { formatRelativeTime } from "../../utils/dateHelpers";
import { SwipeActions } from "../common/SwipeActions";

type Props = {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  isVisible?: boolean;
  isScrolling?: boolean;
  disableAnimations?: boolean;
};

export const NoteCard = memo(
  ({
    note,
    onUpdate,
    onDelete,
    onToggleFavorite,
    isVisible = true,
    isScrolling = false,
    disableAnimations = false,
  }: Props) => {
    if (!note || !note.id) {
      return null;
    }

    const { themeStyles } = useTheme();
    const navigation = useNavigation<any>();
    const mount = useSharedValue(0);
    useEffect(() => {
      if (disableAnimations) {
        mount.value = 1;
        return;
      }
      mount.value = withTiming(1, {
        duration: 220,
        easing: ReEasing.out(ReEasing.cubic),
      });
    }, [mount, disableAnimations]);
    const mountStyle = useAnimatedStyle(() => ({
      opacity: mount.value,
      transform: [{ translateY: (1 - mount.value) * 8 }],
    }));
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setTick((t) => t + 1), 60000);
      return () => clearInterval(id);
    }, []);
    const subtitle = useMemo(() => {
      const updatedAt = note.updatedAt || new Date().toISOString();
      return formatRelativeTime(
        typeof updatedAt === "string"
          ? new Date(updatedAt).getTime()
          : updatedAt
      );
    }, [note.updatedAt, tick]);
    const [isEditing, setIsEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(note.title || "");
    const [draftContent, setDraftContent] = useState(note.content || "");
    const [draftTagsText, setDraftTagsText] = useState(
      note.tags?.join(", ") || ""
    );

    const plainTextSource = isEditing ? draftContent : note.content;
    const plainText = useMemo(() => {
      if (!plainTextSource || typeof plainTextSource !== "string") {
        return "";
      }
      return plainTextSource
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
    }, [plainTextSource]);
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
        .map((t: string) => t.trim())
        .filter(Boolean);
      onUpdate(note.id, {
        title: draftTitle.trim(),
        content: draftContent,
        tags,
      });
      setIsEditing(false);
    };

    const swipeableRef = useRef<any | null>(null);

    return (
      <SwipeActions ref={swipeableRef} onDelete={confirmDelete}>
        <Animated.View
          entering={
            isScrolling || disableAnimations
              ? undefined
              : FadeInDown.duration(200)
          }
          exiting={
            isScrolling || disableAnimations
              ? undefined
              : FadeOutUp.duration(180)
          }
          layout={
            isScrolling || disableAnimations
              ? undefined
              : Layout.springify().damping(14).stiffness(140)
          }
          style={[styles.card, themeStyles.card]}
          pointerEvents={isScrolling ? "none" : "auto"}
          shouldRasterizeIOS={!isEditing}
          renderToHardwareTextureAndroid={!isEditing}
        >
          <Animated.View style={mountStyle}>
            <View style={styles.row}>
              {isEditing ? (
                <TextInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  style={[styles.title, { color: themeStyles.colors.text }]}
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("NoteDetails", { id: note.id })
                  }
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[styles.title, { color: themeStyles.colors.text }]}
                  >
                    {note.title || "Untitled"}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    onToggleFavorite(note.id);
                  }}
                  activeOpacity={1}
                >
                  <Animated.Text
                    style={[styles.icon, { color: themeStyles.colors.text }]}
                  >
                    {note.isFavorite ? "★" : "☆"}
                  </Animated.Text>
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
                      navigation.navigate("AddNote", { noteId: note.id });
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
            {!!(note as any).author && !isEditing && (
              <Text
                style={[styles.subtitle, { color: themeStyles.colors.muted }]}
              >
                By {(note as any).author}
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("NoteDetails", { id: note.id })
                }
              >
                <Text
                  numberOfLines={6}
                  style={[styles.content, { color: themeStyles.colors.text }]}
                >
                  {plainText}
                </Text>
              </TouchableOpacity>
            )}
            {!!(note as any).photos?.length &&
              !isEditing &&
              isVisible &&
              !disableAnimations &&
              !isScrolling && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: spacing.s8 }}
                >
                  {(note as any).photos
                    .slice(0, 5)
                    .map((uri: string, idx: number) => (
                      <View
                        key={`${note.id}_photo_${idx}`}
                        style={{ marginRight: spacing.s8 }}
                      >
                        <Animated.Image
                          source={{ uri }}
                          style={{
                            width: 120,
                            height: 90,
                            borderRadius: spacing.s6,
                            backgroundColor: themeStyles.colors.surface,
                          }}
                          resizeMode="cover"
                          sharedTransitionTag={`${note.id}_photo_${idx}`}
                        />
                      </View>
                    ))}
                </ScrollView>
              )}
            {!!(note as any).location && !isEditing && (
              <Text
                style={[styles.location, { color: themeStyles.colors.muted }]}
              >
                📍{" "}
                {(note as any).location.address ||
                  `${(note as any).location.latitude?.toFixed?.(4)}, ${(
                    note as any
                  ).location.longitude?.toFixed?.(4)}`}
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
                {note.tags?.join(", ") || ""}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </SwipeActions>
    );
  },
  (prev, next) => {
    const a = prev.note;
    const b = next.note;
    if (prev.isVisible !== next.isVisible) return false;
    if (!a || !b) return a === b;
    if (a.id !== b.id) return false;
    if (a.title !== b.title) return false;
    if (a.content !== b.content) return false;
    if (a.isFavorite !== b.isFavorite) return false;
    if (a.updatedAt !== b.updatedAt) return false;
    const aTags = Array.isArray(a.tags) ? a.tags.join("|") : "";
    const bTags = Array.isArray(b.tags) ? b.tags.join("|") : "";
    if (aTags !== bTags) return false;
    const aPhotos = (a as any).photos?.length || 0;
    const bPhotos = (b as any).photos?.length || 0;
    if (aPhotos !== bPhotos) return false;
    const aLoc = (a as any).location;
    const bLoc = (b as any).location;
    if (!!aLoc !== !!bLoc) return false;
    if (aLoc && bLoc) {
      if (aLoc.latitude !== bLoc.latitude) return false;
      if (aLoc.longitude !== bLoc.longitude) return false;
      if (aLoc.address !== bLoc.address) return false;
    }
    return true;
  }
);

const styles = StyleSheet.create({
  action: {
    paddingHorizontal: spacing.s6,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.s8,
  },
  card: {
    borderRadius: spacing.s8,
    marginHorizontal: spacing.s12,
    marginTop: spacing.s8,
    padding: spacing.s12,
    ...globalStyles.shadowSmall,
  },
  content: {
    marginTop: spacing.s8,
  },
  counter: {
    fontSize: typography.size.xs,
    marginTop: spacing.s6,
  },
  delete: {},
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.s8,
  },
  icon: {
    fontSize: typography.size.md,
    paddingHorizontal: spacing.s6,
  },
  location: {
    fontSize: typography.size.xs,
    marginTop: spacing.s6,
  },
  muted: {
    fontSize: typography.size.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: typography.size.xs,
    marginTop: spacing.s4,
  },
  tags: {
    fontSize: typography.size.xs,
  },
  tagsInput: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.s8,
    paddingTop: spacing.s8,
  },
  title: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginRight: spacing.s8,
  },
});
