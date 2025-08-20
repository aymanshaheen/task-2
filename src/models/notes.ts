export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isLocalOnly?: boolean;
  needsSync?: boolean;
  conflictResolution?: "local" | "remote" | "manual";
  lastSyncAttempt?: string;
  photos?: string[]; // array of image URIs
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface CreateNoteData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPublic?: boolean;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface NotesFilter {
  tags?: string[];
  isFavorite?: boolean;
  searchQuery?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface NotesResponse {
  notes: Note[];
  total: number;
  hasMore: boolean;
}

export interface NoteResponse {
  note: Note;
}

export interface NotesError {
  type: string;
  message: string;
  field?: string;
  noteId?: string;
  retryable?: boolean;
}
