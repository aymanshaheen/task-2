import { useCallback } from "react";
import { Alert } from "react-native";

import { useNetworkStatus } from "./useNetworkStatus";

export interface OfflineErrorOptions {
  title?: string;
  message?: string;
  retryAction?: () => void;
  showAlert?: boolean;
}

export function useOfflineErrorHandler() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOffline = !isConnected || isInternetReachable === false;

  const handleError = useCallback(
    (error: any, options: OfflineErrorOptions = {}) => {
      const {
        title = "Connection Error",
        message,
        retryAction,
        showAlert = true,
      } = options;

      // Determine if this is a network-related error
      const isNetworkError =
        error?.type === "NETWORK_ERROR" ||
        error?.type === "OFFLINE_ERROR" ||
        error?.message?.includes("Network request failed") ||
        error?.message?.includes("fetch") ||
        error?.message?.includes("connection") ||
        error?.name === "TypeError" ||
        isOffline;

      if (isNetworkError && showAlert) {
        const errorMessage =
          message ||
          (isOffline
            ? "You are currently offline. Your changes have been saved locally and will be synced when you reconnect."
            : "Network connection problem. Please check your internet connection and try again.");

        Alert.alert(title, errorMessage, [
          { text: "OK", style: "default" as const },
          ...(retryAction
            ? [
                {
                  text: "Retry",
                  onPress: retryAction,
                  style: "default" as const,
                },
              ]
            : []),
        ]);
      }

      return isNetworkError;
    },
    [isOffline]
  );

  const handleAuthError = useCallback(
    (error: any, logoutAction?: () => void) => {
      if (error?.type === "AUTHENTICATION_ERROR" || error?.status === 401) {
        Alert.alert(
          "Authentication Required",
          "Your session has expired. Please log in again.",
          [{ text: "OK", onPress: logoutAction, style: "default" as const }]
        );
        return true;
      }
      return false;
    },
    []
  );

  const handleStorageError = useCallback((error: any) => {
    if (error?.type === "QUOTA_EXCEEDED") {
      Alert.alert(
        "Storage Full",
        "Your device storage is full. Please free up some space and try again.",
        [{ text: "OK", style: "default" as const }]
      );
      return true;
    }

    if (error?.type === "ACCESS_DENIED") {
      Alert.alert(
        "Storage Access Denied",
        "Cannot access device storage. Please check app permissions.",
        [{ text: "OK", style: "default" as const }]
      );
      return true;
    }

    return false;
  }, []);

  const getErrorMessage = useCallback(
    (error: any): string => {
      if (isOffline) {
        return "You are offline. Changes will be saved locally.";
      }

      if (error?.type === "NETWORK_ERROR") {
        return "Network connection problem. Please try again.";
      }

      if (error?.type === "AUTHENTICATION_ERROR") {
        return "Authentication required. Please log in.";
      }

      if (error?.type === "VALIDATION_ERROR") {
        return error.message || "Please check your input and try again.";
      }

      if (error?.type === "NOT_FOUND_ERROR") {
        return "The requested item was not found.";
      }

      if (error?.type === "CONFLICT_ERROR") {
        return "A conflict occurred. The item may have been modified by another device.";
      }

      return (
        error?.message || "An unexpected error occurred. Please try again."
      );
    },
    [isOffline]
  );

  return {
    handleError,
    handleAuthError,
    handleStorageError,
    getErrorMessage,
    isOffline,
  };
}