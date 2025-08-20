import { getAuthToken } from "./authService";
import { NotesErrorType } from "../enums/notes";

const API_BASE_URL =
  "https://react-native-lessons-api-production.up.railway.app/api";
const REQUEST_TIMEOUT = 30000;

export type SocialFeedItem = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  author?: string;
  likeCount?: number;
  likedByMe?: boolean;
};

async function makeAuthenticatedRequest<T>(
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
      };
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
      const error = {
        type:
          response.status === 401
            ? NotesErrorType.AUTHENTICATION_ERROR
            : response.status >= 400 && response.status < 500
            ? NotesErrorType.VALIDATION_ERROR
            : NotesErrorType.NETWORK_ERROR,
        message: errorData.message || `HTTP Error: ${response.status}`,
        retryable: response.status >= 500,
      } as any;
      throw error;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw {
        type: NotesErrorType.NETWORK_ERROR,
        message: "Request timed out. Please check your connection.",
        retryable: true,
      };
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
      };
    }
    throw error;
  }
}

class SocialService {
  async getFeed(
    limit: number,
    offset: number,
    sort: "recent" | "mostLiked" = "recent"
  ): Promise<{ notes: SocialFeedItem[]; total?: number; hasMore?: boolean }> {
    const params = new URLSearchParams();
    params.append("limit", String(limit));
    params.append("offset", String(offset));
    if (sort) params.append("sort", sort);
    const data = await makeAuthenticatedRequest<any>(
      `/social/feed?${params.toString()}`
    );

    const notes: SocialFeedItem[] = (
      data?.data ||
      data?.notes ||
      data ||
      []
    ).map((n: any) => {
      const id = n.id || n._id;
      const serverLocation =
        n.location ||
        (n.latitude && n.longitude
          ? {
              latitude: n.latitude,
              longitude: n.longitude,
              address: n.address || n.formattedAddress || undefined,
            }
          : null);
      const authorName =
        typeof n.author === "string"
          ? n.author
          : n.author?.name || n.authorName || n.userName || "Unknown";
      return {
        id,
        title: n.title || "",
        content: n.content || "",
        tags: n.tags || [],
        photos: n.photos || n.images || [],
        location: serverLocation,
        createdAt: n.createdAt || n.created_at || new Date().toISOString(),
        updatedAt: n.updatedAt || n.updated_at || new Date().toISOString(),
        userId: n.userId || n.user_id || "unknown",
        author: authorName,
        likeCount: n.likeCount ?? n.likes ?? 0,
        likedByMe: !!(n.likedByMe ?? n.liked),
      } as SocialFeedItem;
    });

    // Client-side sort fallback
    const sorted = [...notes].sort((a, b) => {
      if (sort === "mostLiked") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      notes: sorted,
      total: data?.total ?? sorted.length,
      hasMore: data?.hasMore ?? sorted.length >= limit,
    };
  }

  async likeNote(
    id: string
  ): Promise<{ likeCount: number; likedByMe: boolean }> {
    const data = await makeAuthenticatedRequest<any>(
      `/social/notes/${id}/like`,
      { method: "POST" }
    );
    return {
      likeCount: data?.likeCount ?? data?.likes ?? 0,
      likedByMe: !!(data?.likedByMe ?? true),
    };
  }

  async getLikes(id: string): Promise<{ users: any[]; total: number }> {
    const data = await makeAuthenticatedRequest<any>(
      `/social/notes/${id}/likes`
    );
    const users = data?.data || data?.users || [];
    const total = data?.total ?? users.length;
    return { users, total };
  }
}

export const socialService = new SocialService();
