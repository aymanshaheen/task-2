import { NotesErrorType } from "../enums/notes";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NotesFilter,
  NotesResponse,
  NoteResponse,
  NotesError,
} from "../models/notes";

import { buildNotesEndpoint, normalizeNotesResponse } from "./notes/helpers";
import { localStore } from "./notes/localStore";
import { makeAuthenticatedRequest } from "./api/makeAuthenticatedRequest";
import { queueOperations } from "./offlineQueueService";
import { storageService, cacheManager } from "./storageService";

const LIST_TIMEOUT_MS = 12000;

export { makeAuthenticatedRequest };

class NotesService {
  private isOffline = false;

  setOfflineStatus(isOffline: boolean): void {
    this.isOffline = isOffline;
  }

  async getNotes(filter: NotesFilter = {}): Promise<NotesResponse> {
    const cacheKey = `notes_${JSON.stringify(filter)}`;

    try {
      const cachedData = await cacheManager.getCachedApiResponse<NotesResponse>(
        cacheKey
      );

      if (this.isOffline) {
        if (cachedData && cachedData.notes && cachedData.notes.length > 0) {
          return cachedData;
        }

        const localNotes = await localStore.getLocalNotes(filter);
        return {
          notes: localNotes,
          total: localNotes.length,
          hasMore: false,
        };
      }

      try {
        const endpoint = buildNotesEndpoint(filter);
        const response: any = await makeAuthenticatedRequest<any>(
          endpoint,
          { method: "GET", timeoutMs: LIST_TIMEOUT_MS } as any,
          cacheKey
        );

        if (!response || !response.data) {
          const notModified =
            await cacheManager.getCachedApiResponse<NotesResponse>(cacheKey);
          if (notModified) {
            return notModified;
          }
        }

        const { normalizedResponse, normalizedNotes } =
          normalizeNotesResponse(response);

        await cacheManager.cacheApiResponse(
          cacheKey,
          normalizedResponse,
          5 * 60 * 1000
        );

        try {
          const headers = response.__headers as Headers | undefined;
          const etag = headers?.get("etag") || undefined;
          const lastModified = headers?.get("last-modified") || undefined;
          await cacheManager.setApiMeta(cacheKey, { etag, lastModified });
        } catch {}

        (async () => {
          for (const note of normalizedNotes) {
            try {
              await storageService.setItem("NOTES", note.id, note);
            } catch (error) {}
          }
        })();

        return normalizedResponse;
      } catch {}

      if (cachedData) {
        this.fetchNotesInBackground(filter, cacheKey).catch(() => {});
        return cachedData;
      }

      return await this.fetchNotesFromAPI(filter, cacheKey);
    } catch (error: any) {
      console.error("getNotes error:", error.message);

      const cachedData = await cacheManager.getCachedApiResponse<NotesResponse>(
        cacheKey
      );
      if (cachedData) {
        return cachedData;
      }

      try {
        const localNotes = await localStore.getLocalNotes(filter);
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
        const localNotes = await localStore.getLocalNotes({ isFavorite: true });
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
        const localNotes = await localStore.getLocalNotes({ isFavorite: true });
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
      if (typeof filter.limit === "number") {
        queryParams.append("limit", String(filter.limit));
      }
      if (typeof filter.offset === "number") {
        queryParams.append("offset", String(filter.offset));
      }

      const endpoint = `/notes?${queryParams.toString()}`;
      const response = await makeAuthenticatedRequest<any>(endpoint, {
        method: "GET",
        timeoutMs: LIST_TIMEOUT_MS,
      } as any);

      const notes = response.data || response.notes || response || [];

      const normalizedNotes: Note[] = (notes as any[]).map((note: any) => {
        const id = note.id || note._id;
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
          photos: note.photos || note.images || [],
          location: serverLocation,
          createdAt:
            note.createdAt || note.created_at || new Date().toISOString(),
          updatedAt:
            note.updatedAt || note.updated_at || new Date().toISOString(),
          userId: note.userId || note.user_id || "unknown",
        } as Note;
      });

      const totalCount =
        typeof response.total === "number"
          ? response.total
          : normalizedNotes.length;
      let pagedNotes = normalizedNotes;
      if (
        typeof filter.offset === "number" ||
        typeof filter.limit === "number"
      ) {
        const start = filter.offset || 0;
        const limit = filter.limit || normalizedNotes.length;
        pagedNotes = normalizedNotes.slice(start, start + limit);
      }

      const normalizedResponse: NotesResponse = {
        notes: pagedNotes,
        total: totalCount,
        hasMore:
          typeof response.hasMore === "boolean"
            ? response.hasMore
            : (filter.offset || 0) + (pagedNotes?.length || 0) < totalCount,
      };

      await cacheManager.cacheApiResponse(
        cacheKey,
        normalizedResponse,
        5 * 60 * 1000
      );

      (async () => {
        for (const note of normalizedNotes) {
          try {
            await storageService.setItem("NOTES", note.id, note);
          } catch (error) {}
        }
      })();

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

      await storageService.setItem("NOTES", id, updatedNote);

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
}

export const notesService = new NotesService();
