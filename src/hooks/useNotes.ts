import { useCallback, useMemo, useState, useEffect, useRef } from "react";

import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NotesError,
} from "../models/notes";
import { notesService } from "../services/notesService";
import { cacheManager } from "../services/storageService";
import { useSyncManager } from "../services/syncManager";

import { useAuth } from "./useAuth";
import { useNetworkAware, useIsOffline } from "./useNetworkStatus";

export type { Note };

type NewNote = Pick<Note, "title" | "content"> & {
  author?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPublic?: boolean;
  photos?: string[];
  location?: { latitude: number; longitude: number; address?: string };
};

export function useNotes(options?: { autoLoad?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);
  const PAGE_SIZE = 15;
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<NotesError | null>(null);

  const { user, logout } = useAuth();
  const networkStatus = useNetworkAware();
  const isOffline = useIsOffline();
  const { syncStatus, performManualSync, startAutoSync } = useSyncManager(
    user?.id || null
  );

  const prevOfflineRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (prevOfflineRef.current !== isOffline) {
      notesService.setOfflineStatus(isOffline);
      prevOfflineRef.current = isOffline;
    }
  }, [isOffline]);

  const loadNotes = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      setError(null);

      const response = await notesService.getNotes({
        limit: PAGE_SIZE,
        offset: 0,
      });
      const loadedNotes = response?.notes || [];
      setHasMore(
        Boolean(response?.hasMore) ||
          (response?.total ?? 0) > loadedNotes.length
      );
      setPageOffset(loadedNotes.length);

      if (loadedNotes.length > 0) {
        setNotes(loadedNotes);
        // Prefetch next page in background
        (async () => {
          try {
            if (
              response?.hasMore ||
              (response?.total ?? 0) > loadedNotes.length
            ) {
              const nextResp = await notesService.getNotes({
                limit: PAGE_SIZE,
                offset: loadedNotes.length,
              });
              const next = nextResp?.notes || [];
              if (next.length > 0) {
                setNotes((prev) => [...prev, ...next]);
                setPageOffset(loadedNotes.length + next.length);
                setHasMore(
                  Boolean(nextResp?.hasMore) ||
                    (typeof nextResp?.total === "number"
                      ? loadedNotes.length + next.length < nextResp.total
                      : next.length === PAGE_SIZE)
                );
              }
            }
          } catch {}
        })();
      } else {
        if (!isOffline) {
          setNotes([]);
        }
      }

      const updatedFavorites = loadedNotes.filter((note) => note.isFavorite);
      setFavorites(updatedFavorites);

      if (loadedNotes.length > 0 || !isOffline) {
        setError(null);
      }
    } catch (err: any) {
      console.error("Failed to load notes:", err);

      if (
        err?.type === "AUTHENTICATION_ERROR" ||
        err?.status === 401 ||
        err?.statusCode === 401
      ) {
        try {
          await logout();
        } catch {}
        return;
      }

      if (!isOffline) {
        setError(err);
        setNotes([]);
        setFavorites([]);
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, isOffline]);

  const loadMore = useCallback(async () => {
    if (!user?.id) return;
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await notesService.getNotes({
        limit: PAGE_SIZE,
        offset: pageOffset,
      });
      const next = response?.notes || [];
      setNotes((prev) => [...prev, ...next]);
      const newOffset = pageOffset + next.length;
      setPageOffset(newOffset);
      const total =
        typeof response?.total === "number" ? response.total : undefined;
      setHasMore(
        Boolean(response?.hasMore) ||
          (typeof total === "number"
            ? newOffset < total
            : next.length === PAGE_SIZE)
      );
    } catch (err: any) {
    } finally {
      setLoadingMore(false);
    }
  }, [user?.id, loadingMore, hasMore, pageOffset]);

  const togglePin = useCallback(async (_noteId: string) => {
    // Not implemented in model; keep as a no-op for API compatibility
    return Promise.resolve();
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      setError(null);
      const response = await notesService.getFavorites();
      const loadedFavorites = response?.notes || [];
      const trueFavorites = loadedFavorites.filter(
        (note) => note.isFavorite === true
      );
      setFavorites(trueFavorites);

      if (trueFavorites.length > 0) {
        setNotes((prevNotes) => {
          return prevNotes.map((note) => {
            const favoriteVersion = trueFavorites.find(
              (fav) => fav.id === note.id
            );
            if (favoriteVersion) {
              return favoriteVersion;
            } else if (note.isFavorite) {
              return { ...note, isFavorite: false };
            }
            return note;
          });
        });
      }
    } catch (err: any) {
      console.error("Failed to load favorites:", err);
      setError(err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const autoLoad = options?.autoLoad !== false;
  useEffect(() => {
    if (!autoLoad) return;
    if (user?.id) {
      loadNotes();
    }
  }, [user?.id, loadNotes, autoLoad]);

  const refreshNotes = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      setError(null);

      const { cacheManager } = await import("../services/storageService");
      await cacheManager.invalidateCache("notes_");
      await cacheManager.invalidateCache("favorites_");

      await loadNotes();
    } catch (err: any) {
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  const refreshFavorites = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      setError(null);

      const { cacheManager } = await import("../services/storageService");
      await cacheManager.invalidateCache("favorites_");
      await cacheManager.invalidateCache("notes_");

      await loadFavorites();
    } catch (err: any) {
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, loadFavorites]);

  const handleNetworkRestore = useCallback(async () => {
    if (user?.id) {
      try {
        await performManualSync();
        await loadNotes();
      } catch (error) {
        console.error("Error during network restore:", error);
      }
    }
  }, [user?.id, performManualSync, loadNotes]);

  const handleNetworkLoss = useCallback(async () => {
    if (user?.id) {
      try {
        await loadNotes();
      } catch (error) {
        console.error("Error during network loss:", error);
      }
    }
  }, [user?.id, loadNotes]);

  const networkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (networkStatus.justCameOnline) {
      if (networkTimeoutRef.current) {
        clearTimeout(networkTimeoutRef.current);
      }
      networkTimeoutRef.current = setTimeout(handleNetworkRestore, 1000);
    }

    return () => {
      if (networkTimeoutRef.current) {
        clearTimeout(networkTimeoutRef.current);
      }
    };
  }, [networkStatus.justCameOnline, handleNetworkRestore]);

  useEffect(() => {
    if (networkStatus.justWentOffline) {
      if (networkTimeoutRef.current) {
        clearTimeout(networkTimeoutRef.current);
      }
      handleNetworkLoss();
    }
  }, [networkStatus.justWentOffline, handleNetworkLoss]);

  const prevAutoSyncStateRef = useRef<
    { userId?: string; isOffline: boolean } | undefined
  >(undefined);
  useEffect(() => {
    const currentState = { userId: user?.id, isOffline };
    const prevState = prevAutoSyncStateRef.current;

    if (
      user?.id &&
      !isOffline &&
      (!prevState ||
        prevState.userId !== user.id ||
        prevState.isOffline !== isOffline)
    ) {
      startAutoSync();
    }

    prevAutoSyncStateRef.current = currentState;
  }, [user?.id, isOffline, startAutoSync]);

  const createNote = useCallback(
    async (note: NewNote) => {
      if (!user?.id) return;

      setSaving(true);

      // Create optimistic note for immediate UI feedback
      const optimisticNote: Note = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: note.title || "",
        content: note.content || "",
        tags: note.tags || [],
        isFavorite: note.isFavorite || false,
        photos: note.photos || [],
        location: note.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        isLocalOnly: true,
        needsSync: true,
      };

      setNotes((prev) => [optimisticNote, ...(prev || [])]);

      try {
        setError(null);
        const noteData: CreateNoteData = {
          title: note.title || "",
          content: note.content || "",
          tags: note.tags || [],
          isFavorite: note.isFavorite || false,
          isPublic: note.isPublic || false,
          photos: note.photos || [],
          location: note.location,
        };

        const newNote = await notesService.createNote(noteData, user.id);

        setNotes((prev) =>
          prev
            .map((n) => {
              if (n && (n.id === optimisticNote.id || n.isLocalOnly)) {
                return newNote;
              }
              return n;
            })
            .filter(Boolean)
        );

        if (!isOffline) {
          await cacheManager.invalidateCache("notes_");
        }
      } catch (err: any) {
        console.error("Failed to create note:", err);
        setError(err);

        setNotes((prev) => prev.filter((n) => n && n.id !== optimisticNote.id));
      } finally {
        setSaving(false);
      }
    },
    [user?.id]
  );

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      if (!user?.id) return;

      setSaving(true);
      try {
        setError(null);

        setNotes((prev) =>
          prev
            .map((n) => (n && n.id === noteId ? { ...n, ...updates } : n))
            .filter(Boolean)
        );

        const updateData: UpdateNoteData = {
          title: updates.title,
          content: updates.content,
          tags: updates.tags,
          isFavorite: updates.isFavorite,
          photos: (updates as any).photos,
          location: (updates as any).location,
        };

        const updatedNote = await notesService.updateNote(
          noteId,
          updateData,
          false,
          user.id
        );
        setNotes((prev) =>
          prev
            .map((n) => (n && n.id === noteId ? updatedNote : n))
            .filter(Boolean)
        );
      } catch (err: any) {
        setError(err);
        await loadNotes();
      } finally {
        setSaving(false);
      }
    },
    [user?.id]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!user?.id) return;

      setSaving(true);
      try {
        setError(null);

        setNotes((prev) => prev.filter((n) => n && n.id !== noteId));
        setFavorites((prev) => prev.filter((n) => n && n.id !== noteId));

        await notesService.deleteNote(noteId);
      } catch (err: any) {
        setError(err);
        await loadNotes();
      } finally {
        setSaving(false);
      }
    },
    [user?.id, notes]
  );

  const toggleFavorite = useCallback(
    async (noteId: string) => {
      if (!user?.id) return;

      setSaving(true);

      try {
        setError(null);

        const currentNote = notes.find((n) => n && n.id === noteId);
        if (!currentNote || !currentNote.id) {
          console.warn(`Note ${noteId} not found in current notes`);
          return;
        }

        const originalNote = { ...currentNote };
        const newFavoriteStatus = !currentNote.isFavorite;

        // Optimistic update - immediately change UI for both notes and favorites
        const updatedNoteOptimistic = {
          ...currentNote,
          isFavorite: newFavoriteStatus,
        };

        setNotes((prev) => {
          return prev
            .map((n) => {
              if (n && n.id === noteId) {
                return updatedNoteOptimistic;
              }
              return n;
            })
            .filter(Boolean);
        });

        // Also optimistically update favorites state
        if (newFavoriteStatus) {
          // Adding to favorites
          setFavorites((prev) => {
            const exists = prev.some((n) => n.id === noteId);
            if (!exists) {
              return [...prev, updatedNoteOptimistic];
            }
            return prev.map((n) =>
              n.id === noteId ? updatedNoteOptimistic : n
            );
          });
        } else {
          // Removing from favorites
          setFavorites((prev) => prev.filter((n) => n.id !== noteId));
        }

        const updateData = {
          title: currentNote.title || "",
          content: currentNote.content || "",
          tags: currentNote.tags || [],
          isFavorite: newFavoriteStatus,
        };

        const updatedNote = await notesService.updateNote(
          noteId,
          updateData,
          true,
          user.id
        );

        if (updatedNote && updatedNote.id) {
          setNotes((prev) => {
            return prev
              .map((n) => {
                if (n && n.id === noteId) {
                  return updatedNote;
                }
                return n;
              })
              .filter(Boolean);
          });

          // Update favorites list as well
          if (updatedNote.isFavorite) {
            setFavorites((prev) => {
              const exists = prev.some((n) => n.id === noteId);
              if (!exists) {
                return [...prev, updatedNote];
              }
              return prev.map((n) => (n.id === noteId ? updatedNote : n));
            });
          } else {
            setFavorites((prev) => prev.filter((n) => n.id !== noteId));
          }
        } else {
          console.warn("Invalid server response, keeping optimistic update");
        }
      } catch (err: any) {
        console.error("Failed to toggle favorite:", err);
        setError(err);

        // Revert to original state on error - reload from server
        await loadNotes();
        await loadFavorites();
      } finally {
        setSaving(false);
      }
    },
    [user?.id, notes]
  );

  const tags = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    const set = new Set<string>();
    for (const n of notes) {
      if (n && n.tags && Array.isArray(n.tags)) {
        for (const t of n.tags) set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [notes]);

  const sortedNotes = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    return [...notes].filter(Boolean);
  }, [notes]);

  // Ensure favorites always contains only notes with isFavorite: true
  const filteredFavorites = useMemo(() => {
    return favorites.filter((note) => note && note.isFavorite === true);
  }, [favorites]);

  const getNote = useCallback(async (noteId: string) => {
    try {
      return await notesService.getNote(noteId);
    } catch (error: any) {
      console.error("Failed to get note:", error);
      setError(error);
      throw error;
    }
  }, []);

  return {
    notes: sortedNotes,
    favorites: filteredFavorites,
    loadNotes,
    loadMore,
    loadFavorites,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    togglePin,
    refreshNotes,
    refreshFavorites,
    tags,
    error,
    loading,
    loadingMore,
    hasMore,
    refreshing,
    saving,
    isOffline,
    syncStatus,
    performManualSync,
    getNote,
  } as const;
}
