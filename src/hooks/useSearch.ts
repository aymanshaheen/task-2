import { useMemo, useState } from "react";
import { Note } from "./useNotes";

export function useSearch(notes: Note[]) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesQuery =
        !normalizedQuery ||
        n.title.toLowerCase().includes(normalizedQuery) ||
        n.content.toLowerCase().includes(normalizedQuery);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => n.tags.includes(t));

      return matchesQuery && matchesTags;
    });
  }, [notes, normalizedQuery, selectedTags]);

  return {
    query,
    setQuery,
    filteredNotes,
    selectedTags,
    setSelectedTags,
  } as const;
}
