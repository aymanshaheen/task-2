import { Note, NotesFilter } from "../../models/notes";
import { storageService } from "../storageService";

export async function getAllLocalNotes(): Promise<Note[]> {
  try {
    const notes: Note[] = [];

    try {
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      const allKeys = await AsyncStorage.getAllKeys();

      const noteKeys = allKeys.filter((key) => key.startsWith("@notes_"));

      for (const fullKey of noteKeys) {
        try {
          const rawData = await AsyncStorage.getItem(fullKey);
          if (rawData) {
            const wrappedData = JSON.parse(rawData);
            const noteData = wrappedData.data || wrappedData;

            if (noteData && noteData.id && noteData.title !== undefined) {
              const note: Note = {
                id: noteData.id,
                title: noteData.title || "",
                content: noteData.content || "",
                tags: noteData.tags || [],
                isFavorite: noteData.isFavorite || false,
                createdAt: noteData.createdAt || new Date().toISOString(),
                updatedAt: noteData.updatedAt || new Date().toISOString(),
                userId: noteData.userId || "unknown",
                isLocalOnly: noteData.isLocalOnly,
                needsSync: noteData.needsSync,
                photos: noteData.photos || [],
                location: noteData.location,
              };
              notes.push(note);
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse note from key ${fullKey}:`, parseError);
        }
      }
    } catch (asyncStorageError) {}

    const uniqueNotes = notes.filter(
      (note, index, arr) => arr.findIndex((n) => n.id === note.id) === index
    );

    const sortedNotes = uniqueNotes.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );

    return sortedNotes;
  } catch (error) {
    console.error("Failed to get local notes:", error);
    return [];
  }
}

export async function getLocalNotes(filter: NotesFilter = {}): Promise<Note[]> {
  try {
    const allNotes = await getAllLocalNotes();
    let filteredNotes = allNotes;

    if (filter.isFavorite !== undefined) {
      filteredNotes = filteredNotes.filter(
        (note) => note.isFavorite === filter.isFavorite
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredNotes = filteredNotes.filter((note) =>
        filter.tags!.some((tag) => note.tags.includes(tag))
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filter.sortBy) {
      filteredNotes.sort((a, b) => {
        const order = filter.sortOrder === "asc" ? 1 : -1;
        switch (filter.sortBy) {
          case "title":
            return order * a.title.localeCompare(b.title);
          case "createdAt":
            return (
              order *
              (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime())
            );
          case "updatedAt":
          default:
            return (
              order *
              (new Date(a.updatedAt || 0).getTime() -
                new Date(b.updatedAt || 0).getTime())
            );
        }
      });
    }

    let startIndex = 0;
    if (filter.offset) {
      startIndex = filter.offset;
    }

    if (filter.limit) {
      return filteredNotes.slice(startIndex, startIndex + filter.limit);
    }

    return filteredNotes.slice(startIndex);
  } catch (error) {
    console.error("Failed to get filtered local notes:", error);
    return [];
  }
}

export const localStore = {
  getAllLocalNotes,
  getLocalNotes,
  setItem: storageService.setItem.bind(storageService),
  getItem: storageService.getItem.bind(storageService),
  removeItem: storageService.removeItem.bind(storageService),
};
