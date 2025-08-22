import { useMemo, useRef, useState } from "react";

import { useDebounced } from "../performance/hooks/useDebounced";
import { measureSearch, assertTargets } from "../utils/performanceUtils";

import { Note } from "./useNotes";

export function useSearch(notes: Note[]) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchMeterRef = useRef(measureSearch("search_notes"));

  const normalizedQueryImmediate = query.trim().toLowerCase();
  const normalizedQuery = useDebounced(normalizedQueryImmediate, 300);
  const hasFilters = normalizedQuery.length > 0 || selectedTags.length > 0;

  const preprocessed = useMemo(() => {
    if (!hasFilters || !Array.isArray(notes))
      return [] as Array<{
        ref: Note;
        lcTitle: string;
        lcContent: string;
        tags: string[] | undefined;
      }>;
    return notes.map((n) => ({
      ref: n,
      lcTitle: (n.title || "").toLowerCase(),
      lcContent: (n.content || "").toLowerCase(),
      tags: n.tags,
    }));
  }, [notes, hasFilters]);

  const filteredNotes = useMemo(() => {
    searchMeterRef.current.start();
    // Fast path: no query and no tag filters -> return original list
    if (!hasFilters) {
      return notes as Note[];
    }
    if (!preprocessed.length) return [] as Note[];

    return preprocessed
      .filter((p) => {
        const matchesQuery =
          !normalizedQuery ||
          p.lcTitle.includes(normalizedQuery) ||
          p.lcContent.includes(normalizedQuery);

        if (!matchesQuery) return false;
        if (selectedTags.length === 0) return true;
        const tags = p.tags || [];
        for (const t of selectedTags) {
          if (!tags.includes(t)) return false;
        }
        return true;
      })
      .map((p) => p.ref);
  }, [preprocessed, normalizedQuery, selectedTags, notes, hasFilters]);

  // End measurement after memo computation finishes
  useMemo(() => {
    const ms = searchMeterRef.current.stop();
    if (ms)
      assertTargets({
        searchMs: ms,
        idleMb: undefined,
        heavyMb: undefined,
        fps: undefined,
        screenLoadMs: undefined,
      });
  }, [filteredNotes]);

  return {
    query,
    setQuery,
    filteredNotes,
    selectedTags,
    setSelectedTags,
  } as const;
}
