import React, { useMemo, useLayoutEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useNotes } from "../../hooks/useNotes";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { spacing } from "../../styles/spacing";
import { NoteDetailsCard } from "../../components/notes/NoteDetailsCard";

type RouteParams = { id: string };

export function NoteDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params as RouteParams;
  const { notes } = useNotes();
  const { themeStyles } = useTheme();

  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: note?.title || "Note" });
  }, [navigation, note?.title]);

  if (!note) {
    return (
      <View
        style={[
          globalStyles.flex1,
          themeStyles.background,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: themeStyles.colors.muted }}>Note not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[globalStyles.flex1, themeStyles.background]}
      contentContainerStyle={{ padding: spacing.s16 }}
    >
      <NoteDetailsCard note={note} />
    </ScrollView>
  );
}
