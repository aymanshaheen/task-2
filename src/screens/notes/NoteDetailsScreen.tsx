import React, { useMemo, useLayoutEffect, useEffect, useState } from "react";
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
  const { notes, getNote } = useNotes();
  const { themeStyles } = useTheme();

  const noteFromList = useMemo(
    () => notes.find((n) => n.id === id),
    [notes, id]
  );
  const [fetchedNote, setFetchedNote] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const note = fetchedNote || noteFromList || null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: note?.title || "Note" });
  }, [navigation, note?.title]);

  useEffect(() => {
    let cancelled = false;
    if (!noteFromList && id) {
      setLoading(true);
      getNote(id)
        .then((n) => {
          if (!cancelled) setFetchedNote(n);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [id, noteFromList, getNote]);

  if (loading) {
    return (
      <View
        style={[
          globalStyles.flex1,
          themeStyles.background,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: themeStyles.colors.muted }}>Loading note…</Text>
      </View>
    );
  }

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
