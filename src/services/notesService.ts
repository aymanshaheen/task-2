import { storageService, cacheManager } from "./storageService";
import { getAuthToken } from "./authService";
import { queueOperations } from "./offlineQueueService";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NotesFilter,
  NotesResponse,
  NoteResponse,
  NotesError,
} from "../models/notes";
import { NotesErrorType } from "../enums/notes";

const API_BASE_URL =
  "https://react-native-lessons-api-production.up.railway.app/api";
const REQUEST_TIMEOUT = 30000;

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw {
        type: NotesErrorType.AUTHENTICATION_ERROR,
        message: "No authentication token found. Please log in.",
        retryable: false,
      } as NotesError;
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const error: NotesError = {
        type:
          response.status === 401
            ? NotesErrorType.AUTHENTICATION_ERROR
            : response.status === 404
            ? NotesErrorType.NOT_FOUND_ERROR
            : response.status === 409
            ? NotesErrorType.CONFLICT_ERROR
            : response.status >= 400 && response.status < 500
            ? NotesErrorType.VALIDATION_ERROR
            : NotesErrorType.NETWORK_ERROR,
        message: errorData.message || `HTTP Error: ${response.status}`,
        retryable: response.status >= 500,
      };

      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw {
        type: NotesErrorType.NETWORK_ERROR,
        message: "Request timed out. Please check your connection.",
        retryable: true,
      } as NotesError;
    }

    if (
      error.message &&
      (error.message.includes("Network request failed") ||
        error.message.includes("fetch") ||
        error.message.includes("connection") ||
        error.name === "TypeError")
    ) {
      throw {
        type: NotesErrorType.NETWORK_ERROR,
        message: "Network error. Please check your connection.",
        retryable: true,
      } as NotesError;
    }

    if (error.type) {
      throw error;
    }

    throw {
      type: NotesErrorType.NETWORK_ERROR,
      message: "An unexpected error occurred. Please try again.",
      retryable: true,
    } as NotesError;
  }
}

class NotesService {
  private isOffline = false;

  setOfflineStatus(isOffline: boolean): void {
    this.isOffline = isOffline;
  }

  async getNotes(filter: NotesFilter = {}): Promise<NotesResponse> {
    const cacheKey = `notes_${JSON.stringify(filter)}`;

    try {
      // Always check cache first for better performance
      const cachedData = await cacheManager.getCachedApiResponse<NotesResponse>(
        cacheKey
      );

      if (this.isOffline) {
        if (cachedData && cachedData.notes && cachedData.notes.length > 0) {
          return cachedData;
        }

        const localNotes = await this.getLocalNotes(filter);
        return {
          notes: localNotes,
          total: localNotes.length,
          hasMore: false,
        };
      }

      if (cachedData) {
        this.fetchNotesInBackground(filter, cacheKey).catch(() => {});
        return cachedData;
      }

      return await this.fetchNotesFromAPI(filter, cacheKey);
    } catch (error: any) {
      console.error("getNotes error:", error.message);

      // Try to return cached data on error
      const cachedData = await cacheManager.getCachedApiResponse<NotesResponse>(
        cacheKey
      );
      if (cachedData) {
        return cachedData;
      }

      try {
        const localNotes = await this.getLocalNotes(filter);
        return { notes: localNotes, total: localNotes.length, hasMore: false };
      } catch (localError) {
        throw error;
      }
    }
  }

  async getFavorites(): Promise<NotesResponse> {
    const cacheKey = "favorites_fresh";

    try {
      if (this.isOffline) {
        const localNotes = await this.getLocalNotes({ isFavorite: true });
        return {
          notes: localNotes,
          total: localNotes.length,
          hasMore: false,
        };
      }

      const filter: NotesFilter = { isFavorite: true };
      const response = await this.fetchNotesFromAPI(filter, cacheKey);

      await cacheManager.cacheApiResponse(cacheKey, response, 30 * 1000);

      return response;
    } catch (error: any) {
      const cachedData = await cacheManager.getCachedApiResponse<NotesResponse>(
        cacheKey
      );
      if (cachedData) {
        return cachedData;
      }

      try {
        const localNotes = await this.getLocalNotes({ isFavorite: true });
        return { notes: localNotes, total: localNotes.length, hasMore: false };
      } catch (localError) {
        throw error;
      }
    }
  }

  private async fetchNotesFromAPI(
    filter: NotesFilter,
    cacheKey: string
  ): Promise<NotesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.tags?.length) {
        queryParams.append("tags", filter.tags.join(","));
      }
      if (filter.isFavorite !== undefined) {
        queryParams.append("favorite", filter.isFavorite.toString());
      }
      if (filter.searchQuery) {
        queryParams.append("search", filter.searchQuery);
      }
      if (filter.sortBy) {
        queryParams.append("sortBy", filter.sortBy);
      }

      const endpoint = `/notes?${queryParams.toString()}`;
      const response = await makeAuthenticatedRequest<any>(endpoint);

      const notes = response.data || response.notes || response || [];

      const normalizedNotes = await Promise.all(
        (notes as any[]).map(async (note: any) => {
          const id = note.id || note._id;
          let existingLocal: Note | null = null;
          try {
            existingLocal = await storageService.getItem<Note>("NOTES", id);
          } catch {}
          const serverLocation =
            note.location ||
            (note.latitude && note.longitude
              ? {
                  latitude: note.latitude,
                  longitude: note.longitude,
                  address: note.address || note.formattedAddress || undefined,
                }
              : undefined);
          return {
            id,
            title: note.title || "",
            content: note.content || "",
            tags: note.tags || [],
            isFavorite: note.isFavorite || note.favorite || false,
            isPublic: note.isPublic ?? note.public ?? false,
            photos: note.photos || note.images || existingLocal?.photos || [],
            location: serverLocation || existingLocal?.location,
            createdAt:
              note.createdAt || note.created_at || new Date().toISOString(),
            updatedAt:
              note.updatedAt || note.updated_at || new Date().toISOString(),
            userId: note.userId || note.user_id || "unknown",
          } as Note;
        })
      );

      const normalizedResponse: NotesResponse = {
        notes: normalizedNotes,
        total: response.total || normalizedNotes.length,
        hasMore: response.hasMore || false,
      };

      await cacheManager.cacheApiResponse(
        cacheKey,
        normalizedResponse,
        5 * 60 * 1000
      );

      for (const note of normalizedNotes) {
        try {
          await storageService.setItem("NOTES", note.id, note);
        } catch (error) {
          console.warn(
            `Failed to save note ${note.id} to local storage:`,
            error
          );
        }
      }

      return normalizedResponse;
    } catch (error: any) {
      throw error;
    }
  }

  private async fetchNotesInBackground(
    filter: NotesFilter,
    cacheKey: string
  ): Promise<void> {
    try {
      await this.fetchNotesFromAPI(filter, cacheKey);
    } catch (error: any) {}
  }

  async getNote(id: string): Promise<Note> {
    const cacheKey = `note_${id}`;

    try {
      const cachedNote = await cacheManager.getCachedApiResponse<Note>(
        cacheKey
      );
      if (cachedNote) {
        return cachedNote;
      }

      const response = await makeAuthenticatedRequest<NoteResponse>(
        `/notes/${id}`
      );

      // Ensure the response has a valid note
      if (!response || !response.note || !response.note.id) {
        throw {
          type: NotesErrorType.NOT_FOUND_ERROR,
          message: `Note ${id} not found or invalid response`,
          retryable: false,
        } as NotesError;
      }

      await cacheManager.cacheApiResponse(
        cacheKey,
        response.note,
        10 * 60 * 1000
      );

      return response.note;
    } catch (error: any) {
      const localNote = await storageService.getItem<Note>("NOTES", id);
      if (localNote) {
        return localNote;
      }

      throw error;
    }
  }

  async createNote(noteData: CreateNoteData, userId?: string): Promise<Note> {
    // Create local note immediately for offline-first experience
    const localNote: Note = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: noteData.title || "",
      content: noteData.content || "",
      tags: noteData.tags || [],
      isFavorite: noteData.isFavorite || false,
      photos: noteData.photos || [],
      location: noteData.location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId || "unknown",
      isLocalOnly: true,
      needsSync: true,
    };

    await storageService.setItem("NOTES", localNote.id, localNote);

    if (this.isOffline && userId) {
      await queueOperations.createNote(noteData, userId);
      return localNote;
    }

    try {
      const response = await makeAuthenticatedRequest<any>("/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
      });

      const note = response.data || response.note || response;

      const normalizedNote: Note = {
        id: note.id || note._id,
        title: note.title || "",
        content: note.content || "",
        tags: note.tags || [],
        isFavorite: note.isFavorite || note.favorite || false,
        isPublic: note.isPublic ?? note.public ?? note.visibility === "public",
        photos: note.photos || note.images || localNote.photos || [],
        location:
          note.location ||
          (note.latitude && note.longitude
            ? {
                latitude: note.latitude,
                longitude: note.longitude,
                address: note.address || note.formattedAddress || undefined,
              }
            : undefined) ||
          localNote.location,
        createdAt:
          note.createdAt || note.created_at || new Date().toISOString(),
        updatedAt:
          note.updatedAt || note.updated_at || new Date().toISOString(),
        userId: note.userId || note.user_id || "unknown",
      };

      // Replace local note with server note
      await storageService.removeItem("NOTES", localNote.id);
      await storageService.setItem("NOTES", normalizedNote.id, normalizedNote);

      await cacheManager.invalidateCache("notes_");
      await cacheManager.invalidateCache("favorites_");

      return normalizedNote;
    } catch (error: any) {
      console.error("API createNote failed:", error);

      if (userId) {
        await queueOperations.createNote(noteData, userId);
        return localNote;
      }

      throw error;
    }
  }

  async updateNote(
    id: string,
    updates: UpdateNoteData,
    preserveTimestamp: boolean = false,
    userId?: string
  ): Promise<Note> {
    try {
      const currentNote = await this.getNote(id);

      const updatedNote: Note = {
        ...currentNote,
        ...updates,
        updatedAt: preserveTimestamp
          ? currentNote.updatedAt || new Date().toISOString()
          : new Date().toISOString(),
        needsSync: true,
      };

      // Always save locally first
      await storageService.setItem("NOTES", id, updatedNote);

      // If offline, queue the operation
      if (this.isOffline && userId) {
        await queueOperations.updateNote(id, updates, userId);
        return updatedNote;
      }

      try {
        const response = await makeAuthenticatedRequest<any>(`/notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });

        let serverNote = null;
        if (response && response.note && response.note.id) {
          serverNote = response.note;
        } else if (response && response.data && response.data.id) {
          serverNote = response.data;
        } else {
          console.warn("Invalid API response for updateNote:", response);
          return updatedNote;
        }

        const normalizedNote: Note = {
          id: serverNote.id,
          title: serverNote.title || "",
          content: serverNote.content || "",
          tags: serverNote.tags || [],
          isFavorite: serverNote.isFavorite || serverNote.favorite || false,
          photos:
            serverNote.photos || serverNote.images || updatedNote.photos || [],
          location:
            serverNote.location ||
            (serverNote.latitude && serverNote.longitude
              ? {
                  latitude: serverNote.latitude,
                  longitude: serverNote.longitude,
                  address:
                    serverNote.address ||
                    serverNote.formattedAddress ||
                    undefined,
                }
              : undefined) ||
            updatedNote.location,
          createdAt:
            serverNote.createdAt ||
            serverNote.created_at ||
            new Date().toISOString(),
          updatedAt:
            serverNote.updatedAt ||
            serverNote.updated_at ||
            new Date().toISOString(),
          userId: serverNote.userId || serverNote.user_id || "unknown",
        };

        await storageService.setItem("NOTES", id, normalizedNote);

        await cacheManager.invalidateCache("notes_");
        await cacheManager.invalidateCache("favorites_");
        await cacheManager.invalidateCache(`note_${id}`);

        return normalizedNote;
      } catch (error: any) {
        if (error.type === NotesErrorType.CONFLICT_ERROR) {
          return await this.handleUpdateConflict(id, updatedNote, error);
        }

        // Queue for sync if online operation fails
        if (userId) {
          await queueOperations.updateNote(id, updates, userId);
        }

        // Keep local updated note; background sync is handled elsewhere
        return updatedNote;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const note = await this.getNote(id);
      const deletedNote: Note = {
        ...note,
        updatedAt: new Date().toISOString(),
      };

      await storageService.setItem("TEMP", `deleted_${id}`, deletedNote);
      await storageService.removeItem("NOTES", id);

      try {
        await makeAuthenticatedRequest(`/notes/${id}`, {
          method: "DELETE",
        });

        await cacheManager.invalidateCache("notes_");
      } catch (error: any) {
        await storageService.setItem("TEMP", `delete_queue_${id}`, {
          id,
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      throw error;
    }
  }

  async syncNotes(): Promise<{
    synced: number;
    conflicts: number;
    errors: number;
  }> {
    // Not used; kept as no-op for compatibility
    return { synced: 0, conflicts: 0, errors: 0 };
  }

  private async handleUpdateConflict(
    noteId: string,
    localNote: Note,
    conflictError: NotesError
  ): Promise<Note> {
    try {
      const serverNote = await this.getNote(noteId);

      if (!serverNote || !serverNote.id) {
        console.warn(
          "Invalid server note during conflict resolution, using local note"
        );
        return localNote;
      }

      const resolvedNote: Note = {
        ...serverNote,
        conflictResolution: "remote",
      };

      await storageService.setItem("NOTES", noteId, resolvedNote);

      await storageService.setItem("TEMP", `conflict_${noteId}`, localNote);

      return resolvedNote;
    } catch (error: any) {
      console.warn("Failed to resolve conflict, using local note:", error);
      return localNote;
    }
  }

  // Deprecated internal sync helpers removed as unused

  async searchNotesLocally(query: string): Promise<Note[]> {
    try {
      const allNotes = await this.getAllLocalNotes();

      const searchTerms = query.toLowerCase().split(" ");

      return allNotes.filter((note) => {
        const searchableText = `${note.title} ${note.content} ${note.tags.join(
          " "
        )}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    } catch (error: any) {
      return [];
    }
  }

  private async getAllLocalNotes(): Promise<Note[]> {
    try {
      // Try to get notes from AsyncStorage directly with better error handling
      const notes: Note[] = [];

      try {
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        const allKeys = await AsyncStorage.getAllKeys();

        // Filter for note-related keys (storageService uses @notes_ prefix)
        const noteKeys = allKeys.filter((key) => key.startsWith("@notes_"));
        console.log(`📦 Found ${noteKeys.length} local note keys`);

        for (const fullKey of noteKeys) {
          try {
            const rawData = await AsyncStorage.getItem(fullKey);
            if (rawData) {
              const wrappedData = JSON.parse(rawData);
              // Handle storageService wrapped format
              const noteData = wrappedData.data || wrappedData;

              if (noteData && noteData.id && noteData.title !== undefined) {
                // Ensure the note has the correct structure
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
                // console.log(`📝 Loaded local note: ${note.title}`);
              }
            }
          } catch (parseError) {
            console.warn(
              `Failed to parse note from key ${fullKey}:`,
              parseError
            );
          }
        }
      } catch (asyncStorageError) {
        // Silently handle AsyncStorage errors
      }

      // Remove duplicates and sort by updatedAt descending
      const uniqueNotes = notes.filter(
        (note, index, arr) => arr.findIndex((n) => n.id === note.id) === index
      );

      const sortedNotes = uniqueNotes.sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
      );

      console.log(
        `📝 getAllLocalNotes: returning ${sortedNotes.length} unique notes`
      );
      return sortedNotes;
    } catch (error) {
      console.error("Failed to get local notes:", error);
      return [];
    }
  }

  private async getLocalNotes(filter: NotesFilter = {}): Promise<Note[]> {
    try {
      const allNotes = await this.getAllLocalNotes();

      let filteredNotes = allNotes;

      // Apply filters
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

      // Apply sorting
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

      // Apply pagination
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
}

export const notesService = new NotesService();
