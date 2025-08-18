import React, { useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { useTheme } from "../hooks/useTheme";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

type Props = {
  onSave: (note: {
    title: string;
    content: string;
    tags: string[];
    author?: string;
  }) => void;
  visible?: boolean;
  onClose?: () => void;
  showAuthor?: boolean;
  showTags?: boolean;
};

export const NoteEditor = ({
  onSave,
  visible = true,
  onClose,
  showAuthor = true,
  showTags = true,
}: Props) => {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML content
  const [tagsText, setTagsText] = useState("");
  const [author, setAuthor] = useState("");
  const editorRef = useRef<RichEditor | null>(null);

  const plainText = useMemo(
    () =>
      content
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim(),
    [content]
  );
  const charCount = plainText.length;
  const wordCount = useMemo(
    () => (plainText ? plainText.split(/\s+/).length : 0),
    [plainText]
  );

  const handleSave = () => {
    const tags = showTags
      ? tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const authorOut = showAuthor ? author.trim() : undefined;
    onSave({ title: title.trim(), content, tags, author: authorOut });
    setTitle("");
    setContent("");
    setTagsText("");
    setAuthor("");
    onClose?.();
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={[styles.title, { color: c.text, borderBottomColor: c.border }]}
      />

      <View style={styles.editorContainer}>
        <RichToolbar
          editor={editorRef}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.heading1,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
          ]}
          iconTint={c.text}
          selectedIconTint={c.primary}
          style={[
            styles.richToolbar,
            { borderTopColor: c.border, backgroundColor: c.surface },
          ]}
        />
        <RichEditor
          ref={editorRef}
          initialContentHTML={content}
          onChange={setContent}
          placeholder="Write your note..."
          editorStyle={{
            backgroundColor: c.surface,
            color: c.text,
            placeholderColor: c.placeholder,
            contentCSSText: `min-height:120px; font-size:${typography.size.md}px;`,
          }}
          style={[styles.richEditor, { backgroundColor: c.surface }]}
        />
      </View>
      {showTags && (
        <TextInput
          placeholder="tags (comma separated)"
          value={tagsText}
          onChangeText={setTagsText}
          style={[styles.tags, { borderTopColor: c.border, color: c.text }]}
        />
      )}
      <View style={styles.footer}>
        <Text style={[styles.counter, { color: c.muted }]}>
          {wordCount} words • {charCount} chars
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.s8 }}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.saveBtn,
              styles.cancelBtn,
              { backgroundColor: c.muted },
            ]}
          >
            <Text style={[styles.saveText, { color: c.white }]}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: c.primary }]}
          >
            <Text style={[styles.saveText, { color: c.white }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.s12,
    padding: spacing.s12,
    borderRadius: spacing.s8,
    ...globalStyles.shadowSmall,
  },
  author: {
    fontSize: typography.size.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.s8,
    marginBottom: spacing.s8,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.s8,
  },
  content: {
    marginTop: spacing.s8,
    minHeight: 100,
    textAlignVertical: "top",
  },
  editorContainer: {
    marginTop: spacing.s8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: spacing.s6,
    overflow: "hidden",
  },
  richEditor: {
    minHeight: 140,
  },
  richToolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tags: {
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
    fontSize: typography.size.xs,
  },
  saveBtn: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: spacing.s6,
  },
  cancelBtn: {},
  saveText: {
    fontWeight: typography.weight.medium,
  },
});
