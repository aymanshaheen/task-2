import Constants from "expo-constants";

import { NotesErrorType } from "../enums/notes";

import { getAuthToken } from "./authService";

const API_BASE_URL =
  "https://react-native-lessons-api-production.up.railway.app/api";
const REQUEST_TIMEOUT = 30000;

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

class NotificationService {
  async registerDevice(token: string, platform: "ios" | "android") {
    return makeAuthenticatedRequest("/push/register", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    });
  }

  async unregisterDevice(token: string) {
    return makeAuthenticatedRequest("/push/unregister", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async presentLocalNotification(options: {
    title: string;
    body: string;
    data?: any;
  }): Promise<void> {
    try {
      // Skip importing expo-notifications in Expo Go to avoid noisy warnings
      if (Constants?.appOwnership === "expo") {
        return;
      }
      const Notifications: any = await import("expo-notifications").catch(
        () => null
      );
      if (!Notifications) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {}
  }
}

export const notificationService = new NotificationService();
