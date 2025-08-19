import { useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useNetworkAware } from "./useNetworkStatus";
import { useSyncManager } from "../services/syncManager";
import { useOfflineErrorHandler } from "./useOfflineErrorHandler";
import { notesService } from "../services/notesService";

export function useOfflineIntegration() {
  const { user } = useAuth();
  const networkStatus = useNetworkAware();
  const {
    syncStatus,
    performManualSync,
    updateNetworkStatus,
    startAutoSync,
    stopAutoSync,
  } = useSyncManager(user?.id || null);
  const errorHandler = useOfflineErrorHandler();

  // Update network status for all services
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(
        `🔄 Network status update: ${
          networkStatus.isOffline ? "OFFLINE" : "ONLINE"
        }`
      );
      notesService.setOfflineStatus(networkStatus.isOffline);
      updateNetworkStatus(!networkStatus.isOffline);
    }, 100); // Small debounce to prevent rapid updates

    return () => clearTimeout(timer);
  }, [networkStatus.isOffline, updateNetworkStatus]);

  // Enhanced error handler that considers offline state
  const handleError = useCallback(
    (error: any, options: { retryAction?: () => void } = {}) => {
      return errorHandler.handleError(error, {
        retryAction: networkStatus.isOffline ? undefined : options.retryAction,
        ...options,
      });
    },
    [errorHandler, networkStatus.isOffline]
  );

  // Manual sync with error handling
  const performSyncWithErrorHandling = useCallback(async () => {
    if (networkStatus.isOffline) {
      errorHandler.handleError(
        { type: "NETWORK_ERROR" },
        {
          title: "Cannot Sync",
          message:
            "You are currently offline. Sync will happen automatically when you reconnect.",
        }
      );
      return;
    }

    try {
      const result = await performManualSync();
      if (result && result.failed > 0) {
        console.warn(
          `Sync completed with ${result.failed} failures:`,
          result.errors
        );
      }
      return result;
    } catch (error) {
      errorHandler.handleError(error, {
        title: "Sync Failed",
        message: "Failed to sync your changes. Please try again.",
        retryAction: performManualSync,
      });
      throw error;
    }
  }, [networkStatus.isOffline, performManualSync, errorHandler]);

  useEffect(() => {
    if (networkStatus.justCameOnline && user?.id) {
      console.log("Network restored, performing automatic sync...");
      const timer = setTimeout(() => {
        performSyncWithErrorHandling().catch((error) => {
          console.error("Auto-sync failed:", error);
        });
      }, 2000); // Wait 2 seconds for network to stabilize

      return () => clearTimeout(timer);
    }
  }, [networkStatus.justCameOnline, user?.id, performSyncWithErrorHandling]);

  // Manage auto-sync lifecycle
  useEffect(() => {
    if (user?.id && !networkStatus.isOffline) {
      console.log("🔄 Starting auto-sync (user online)");
      startAutoSync().catch((error) => {
        console.error("Failed to start auto-sync:", error);
      });
    } else if (networkStatus.isOffline) {
      console.log("🔄 Stopping auto-sync (offline)");
      stopAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [user?.id, networkStatus.isOffline]);

  const showOfflineMessage = useCallback(() => {
    errorHandler.handleError(
      { type: "OFFLINE_ERROR" },
      {
        title: "Offline Mode",
        message:
          "You are currently offline. Your changes are being saved locally and will sync when you reconnect.",
      }
    );
  }, [errorHandler]);

  return useMemo(
    () => ({
      // Network status
      isOnline: !networkStatus.isOffline,
      isOffline: networkStatus.isOffline,
      connectionQuality: networkStatus.connectionQuality,
      networkType: networkStatus.type,
      justCameOnline: networkStatus.justCameOnline,
      justWentOffline: networkStatus.justWentOffline,

      // Sync status
      syncStatus,
      hasPendingOperations: syncStatus.pendingOperations > 0,
      isSyncing: syncStatus.syncInProgress,
      lastSyncTime: syncStatus.lastSyncTime,

      // Actions
      performSync: performSyncWithErrorHandling,
      handleError,
      getErrorMessage: errorHandler.getErrorMessage,

      // Utility functions
      showOfflineMessage,
    }),
    [
      networkStatus.isOffline,
      networkStatus.connectionQuality,
      networkStatus.type,
      networkStatus.justCameOnline,
      networkStatus.justWentOffline,
      syncStatus.pendingOperations,
      syncStatus.syncInProgress,
      syncStatus.lastSyncTime,
      performSyncWithErrorHandling,
      handleError,
      errorHandler.getErrorMessage,
      showOfflineMessage,
    ]
  );
}

// Hook for components that just need offline awareness
export function useOfflineAware() {
  const networkStatus = useNetworkAware();
  const errorHandler = useOfflineErrorHandler();

  return {
    isOnline: !networkStatus.isOffline,
    isOffline: networkStatus.isOffline,
    connectionQuality: networkStatus.connectionQuality,
    handleError: errorHandler.handleError,
    getErrorMessage: errorHandler.getErrorMessage,
  };
}
