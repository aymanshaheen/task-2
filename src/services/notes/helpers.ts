import { Note, NotesFilter, NotesResponse } from "../../models/notes";

export function buildNotesEndpoint(filter: NotesFilter): string {
  const queryParams = new URLSearchParams();
  if (filter.tags?.length) queryParams.append("tags", filter.tags.join(","));
  if (filter.isFavorite !== undefined)
    queryParams.append("favorite", filter.isFavorite.toString());
  if (filter.searchQuery) queryParams.append("search", filter.searchQuery);
  if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
  if (typeof filter.limit === "number")
    queryParams.append("limit", String(filter.limit));
  if (typeof filter.offset === "number")
    queryParams.append("offset", String(filter.offset));
  return `/notes?${queryParams.toString()}`;
}

export function normalizeNotesResponse(raw: any): {
  normalizedResponse: NotesResponse;
  normalizedNotes: Note[];
} {
  const notes = raw?.data || raw?.notes || raw || [];
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
      createdAt: note.createdAt || note.created_at || new Date().toISOString(),
      updatedAt: note.updatedAt || note.updated_at || new Date().toISOString(),
      userId: note.userId || note.user_id || "unknown",
    } as Note;
  });

  const totalCount =
    typeof raw?.total === "number" ? raw.total : normalizedNotes.length;

  const normalizedResponse: NotesResponse = {
    notes: normalizedNotes,
    total: totalCount,
    hasMore: typeof raw?.hasMore === "boolean" ? raw.hasMore : false,
  };
  return { normalizedResponse, normalizedNotes };
}
