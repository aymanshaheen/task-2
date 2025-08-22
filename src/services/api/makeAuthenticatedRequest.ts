import { NotesErrorType } from "../../enums/notes";
import { NotesError } from "../../models/notes";

import { authEvents } from "../authEvents";
import { getAuthToken } from "../authService";
import { cacheManager } from "../storageService";

const API_BASE_URL =
  "https://react-native-lessons-api-production.up.railway.app/api";
const REQUEST_TIMEOUT = 30000;

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  metaKey?: string
): Promise<T & { __headers?: Headers }> {
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

    // Attach conditional headers if meta available
    if (metaKey) {
      try {
        const meta = await cacheManager.getApiMeta(metaKey);
        if (meta?.etag) (headers as any)["If-None-Match"] = meta.etag;
        if (meta?.lastModified)
          (headers as any)["If-Modified-Since"] = meta.lastModified;
      } catch {}
    }

    const controller = new AbortController();
    const timeoutMs = (options as any).timeoutMs || REQUEST_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 304) {
      // Not modified; caller should read cache
      const result: any = { __headers: response.headers };
      return result as unknown as T & { __headers?: Headers };
    }

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

      if (response.status === 401 || response.status === 403) {
        try {
          authEvents.emitUnauthorized({
            status: response.status,
            message: error.message,
            source: "notesService",
          });
        } catch {}
      }

      throw error;
    }

    const data = await response.json();
    (data as any).__headers = response.headers;
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
