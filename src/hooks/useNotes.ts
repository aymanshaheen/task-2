import { useCallback, useMemo } from "react";
import { useAsyncStorage } from "./useAsyncStorage";

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

type NewNote = Pick<Note, "title" | "content" | "tags" | "author">;

const generateId = () => Math.random().toString(36).slice(2);

export function useNotes() {
  const {
    value: notes,
    setValue,
    error,
    loading,
    saving,
  } = useAsyncStorage<Note[]>("notes", []);

  const createNote = useCallback(
    (note: NewNote) => {
      const now = Date.now();
      const next: Note = {
        id: generateId(),
        title: note.title,
        content: note.content,
        author: note.author || "",
        tags: note.tags,
        pinned: false,
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      setValue([next, ...notes]);
    },
    [notes, setValue]
  );

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      const next = notes.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: Date.now() } : n
      );
      setValue(next);
    },
    [notes, setValue]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      setValue(notes.filter((n) => n.id !== noteId));
    },
    [notes, setValue]
  );

  const togglePin = useCallback(
    (noteId: string) => {
      updateNote(noteId, {
        pinned: !notes.find((n) => n.id === noteId)?.pinned,
      });
    },
    [notes, updateNote]
  );

  const toggleFavorite = useCallback(
    (noteId: string) => {
      const next = notes.map((n) =>
        n.id === noteId ? { ...n, favorite: !n.favorite } : n
      );
      setValue(next);
    },
    [notes, setValue]
  );

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      for (const t of n.tags) set.add(t);
    }
    return Array.from(set).sort();
  }, [notes]);


  const sortedNotes = useMemo(() => {
    const copy = [...notes];
    copy.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
    return copy;
  }, [notes]);

  return {
    notes: sortedNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleFavorite,
    tags,
    error,
    loading,
    saving,
  } as const;
}
