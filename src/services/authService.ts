import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorType } from "../enums/auth";
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from "../models/auth";

import { authEvents } from "./authEvents";

const API_BASE_URL =
  "https://react-native-lessons-api-production.up.railway.app/api";

const REQUEST_TIMEOUT = 30000;

const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  USER_DATA: "@user_data",
  REFRESH_TOKEN: "@refresh_token",
} as const;

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    const isFormDataBody =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const defaultHeaders: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormDataBody && { "Content-Type": "application/json" }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const error: AuthError = {
        type:
          response.status === 401 || response.status === 403
            ? ErrorType.AUTHENTICATION_ERROR
            : response.status >= 400 && response.status < 500
            ? ErrorType.VALIDATION_ERROR
            : ErrorType.SERVER_ERROR,
        message: errorData.message || `HTTP Error: ${response.status}`,
        statusCode: response.status,
      };

      if (response.status === 401 || response.status === 403) {
        try {
          authEvents.emitUnauthorized({
            status: response.status,
            message: error.message,
            source: "authService",
          });
        } catch {}
      }

      throw error;
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      const timeoutError: AuthError = {
        type: ErrorType.TIMEOUT_ERROR,
        message:
          "Request timed out. Please check your connection and try again.",
      };
      throw timeoutError;
    }

    if (error.message === "Network request failed" || !navigator.onLine) {
      const networkError: AuthError = {
        type: ErrorType.NETWORK_ERROR,
        message:
          "No internet connection. Please check your network and try again.",
      };
      throw networkError;
    }

    if (error.type) {
      throw error;
    }

    const unknownError: AuthError = {
      type: ErrorType.UNKNOWN_ERROR,
      message: "An unexpected error occurred. Please try again.",
    };
    throw unknownError;
  }
}

export async function register(
  credentials: RegisterCredentials,
  profileImage?: { uri: string; name?: string; type?: string }
): Promise<User> {
  try {
    const formData = new FormData();
    formData.append("name", credentials.name);
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    if (profileImage?.uri) {
      const imagePart: any = {
        uri: profileImage.uri,
        name: profileImage.name || `profile_${Date.now()}.jpg`,
        type: profileImage.type || "image/jpeg",
      };
      formData.append("profilePicture", imagePart);
    }

    const response = await makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: formData,
    });

    await storeAuthData(response);
    return response.user;
  } catch (error) {
    throw error;
  }
}

export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const response = await makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    await storeAuthData(response);
    return response.user;
  } catch (error) {
    throw error;
  }
}

async function storeAuthData(authResponse: AuthResponse): Promise<void> {
  try {
    const { storageService } = await import("./storageService");

    await Promise.all([
      storageService.setItem("AUTH", "token", authResponse.token),
      storageService.setItem("AUTH", "user", authResponse.user),
      authResponse.refreshToken
        ? storageService.setItem(
            "AUTH",
            "refreshToken",
            authResponse.refreshToken
          )
        : Promise.resolve(),
      storageService.setItem("AUTH", "loginTime", new Date().toISOString()),
    ]);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(authResponse.user)
    );

    if (authResponse.refreshToken) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        authResponse.refreshToken
      );
    }
  } catch (error) {
    console.error("Failed to save authentication data:", error);
    throw new Error("Failed to save authentication data");
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const legacyToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (legacyToken) {
      return legacyToken;
    }

    try {
      const { storageService } = await import("./storageService");
      const token = await storageService.getItem<string>("AUTH", "token");
      if (token) return token;
    } catch (storageError) {
      console.warn("Failed to get token from storage service");
    }

    return null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    try {
      const { storageService, cacheManager } = await import("./storageService");

      await Promise.all([
        storageService.clearNamespace("AUTH"),
        storageService.clearNamespace("NOTES"),
        storageService.clearNamespace("CACHE"),
        storageService.clearNamespace("TEMP"),
      ]);

      await cacheManager.invalidateCache();
    } catch (storageError) {
      console.warn("Failed to clear storage service data:", storageError);
    }

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userDataKeys = allKeys.filter(
        (key) =>
          key.startsWith("@auth_") ||
          key.startsWith("@notes_") ||
          key.startsWith("@cache_") ||
          key.startsWith("@temp_") ||
          key.startsWith("@user_") ||
          key === "auth_session"
      );

      if (userDataKeys.length > 0) {
        await AsyncStorage.multiRemove(userDataKeys);
      }
    } catch (keyCleanupError) {
      console.warn(
        "Failed to clear additional user data keys:",
        keyCleanupError
      );
    }
  } catch (error) {
    console.error("Error during logout:", error);
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem("auth_session"),
      ]);
    } catch (fallbackError) {
      console.error("Failed fallback logout cleanup:", fallbackError);
    }
  }
}

export async function refreshAuthToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return null;
  } catch (error) {
    return null;
  }
}
