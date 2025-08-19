import React from "react";
import { offlineQueueService, SyncResult } from "./offlineQueueService";
import { storageService, cacheManager } from "./storageService";
import { notesService } from "./notesService";
import { Note } from "../models/notes";

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingOperations: number;
  syncInProgress: boolean;
  lastSyncResult: SyncResult | null;
}

export interface SyncManagerOptions {
  autoSync: boolean;
  syncInterval: number;
  maxRetryAttempts: number;
  retryDelay: number;
}

class SyncManager {
  private syncStatus: SyncStatus = {
    isOnline: true, // Start optimistic - will be updated based on sync results
    lastSyncTime: null,
    pendingOperations: 0,
    syncInProgress: false,
    lastSyncResult: null,
  };

  private options: SyncManagerOptions = {
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    maxRetryAttempts: 3,
    retryDelay: 5000, // 5 seconds
  };

  private syncTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private isInitialized = false;

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load last sync time from storage
      const lastSyncTime = await storageService.getItem<string>(
        "SETTINGS",
        "lastSyncTime"
      );
      if (lastSyncTime) {
        this.syncStatus.lastSyncTime = new Date(lastSyncTime);
      }

      // Get pending operations count
      const queueStats = await offlineQueueService.getQueueStats();
      this.syncStatus.pendingOperations = queueStats.totalOperations;

      this.isInitialized = true;
      this.notifyListeners();

      console.log("SyncManager initialized");
    } catch (error) {
      console.error("Failed to initialize SyncManager:", error);
    }
  }

  async startAutoSync(userId: string): Promise<void> {
    if (!this.options.autoSync || this.syncTimer) return;

    this.syncTimer = setInterval(async () => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        console.log("⏰ Auto-sync triggered");
        try {
          await this.performSync(userId);
        } catch (error) {
          console.error("Auto-sync failed:", error);
          // Don't throw error from auto-sync to avoid unhandled promise rejections
        }
      }
    }, this.options.syncInterval);

    console.log(
      `🔄 Auto-sync started with interval: ${this.options.syncInterval}ms`
    );
  }

  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log("Auto-sync stopped");
    }
  }

  updateNetworkStatus(isOnline: boolean): void {
    const wasOffline = !this.syncStatus.isOnline;
    this.syncStatus.isOnline = isOnline;

    console.log(
      `🔄 SyncManager: Network status updated to ${
        isOnline ? "ONLINE" : "OFFLINE"
      }`
    );

    if (wasOffline && isOnline) {
      console.log("🟢 Network restored, preparing to sync...");
      this.scheduleImmediateSync();
    } else if (!wasOffline && !isOnline) {
      console.log("🔴 Network lost, stopping auto-sync");
    }

    this.notifyListeners();
  }

  private scheduleImmediateSync(): void {
    setTimeout(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.notifyListeners();
      }
    }, 2000);
  }

  async performSync(
    userId: string,
    force: boolean = false
  ): Promise<SyncResult> {
    if (this.syncStatus.syncInProgress && !force) {
      console.log("Sync already in progress, skipping...");
      return (
        this.syncStatus.lastSyncResult || { success: 0, failed: 0, errors: [] }
      );
    }

    if (!this.syncStatus.isOnline && !force) {
      console.log("Cannot sync while offline");
      return { success: 0, failed: 0, errors: [] };
    }

    this.syncStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      console.log("Starting sync process...");

      // Double-check online status before proceeding
      if (!this.syncStatus.isOnline && !force) {
        console.log("Aborting sync - detected offline during sync start");
        return { success: 0, failed: 0, errors: [] };
      }

      // Sync offline operations
      const syncResult = await offlineQueueService.syncOfflineOperations(
        userId,
        this.syncStatus.isOnline
      );

      if (this.syncStatus.isOnline && syncResult.success > 0) {
        try {
          await this.refreshLocalCache();
        } catch (cacheError: any) {
          console.warn("Cache refresh failed during sync:", cacheError);
          if (cacheError?.type === "NETWORK_ERROR") {
            this.syncStatus.isOnline = false;
          }
        }
      }

      // Update sync status
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.lastSyncResult = syncResult;

      // If sync was successful, we're probably online
      if (syncResult.success > 0 || syncResult.failed === 0) {
        this.syncStatus.isOnline = true;
      }

      // Update pending operations count
      const queueStats = await offlineQueueService.getQueueStats();
      this.syncStatus.pendingOperations = queueStats.totalOperations;

      // Save last sync time
      await storageService.setItem(
        "SETTINGS",
        "lastSyncTime",
        this.syncStatus.lastSyncTime.toISOString()
      );

      console.log(
        `Sync completed: ${syncResult.success} successful, ${syncResult.failed} failed`
      );

      return syncResult;
    } catch (error) {
      console.error("Sync failed:", error);

      // If sync failed, we might be offline
      this.syncStatus.isOnline = false;

      const errorResult: SyncResult = {
        success: 0,
        failed: 1,
        errors: [{ operation: null as any, error }],
      };

      this.syncStatus.lastSyncResult = errorResult;
      return errorResult;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async refreshLocalCache(): Promise<void> {
    try {
      // Only refresh cache if we're truly online
      if (!this.syncStatus.isOnline) {
        console.log("Skipping cache refresh - offline");
        return;
      }

      // Invalidate all caches to force fresh data
      await cacheManager.invalidateCache();

      // Pre-cache frequently accessed data
      await notesService.getNotes({ limit: 50 }); // Cache recent notes
      await notesService.getFavorites(); // Cache favorites

      console.log("Local cache refreshed");
    } catch (error) {
      console.error("Failed to refresh local cache:", error);
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getSyncStatus());
      } catch (error) {
        console.error("Error in sync status listener:", error);
      }
    });
  }

  updateOptions(newOptions: Partial<SyncManagerOptions>): void {
    this.options = { ...this.options, ...newOptions };

    // Restart auto-sync if interval changed
    if (newOptions.syncInterval && this.syncTimer) {
      this.stopAutoSync();
      // Auto-sync will be restarted by the component
    }
  }

  async getDetailedSyncStatus(): Promise<{
    status: SyncStatus;
    queueStats: any;
    cacheInfo: any;
  }> {
    try {
      const [queueStats, cacheInfo] = await Promise.all([
        offlineQueueService.getQueueStats(),
        storageService.getStorageInfo(),
      ]);

      return {
        status: this.getSyncStatus(),
        queueStats,
        cacheInfo,
      };
    } catch (error) {
      console.error("Failed to get detailed sync status:", error);
      return {
        status: this.getSyncStatus(),
        queueStats: null,
        cacheInfo: null,
      };
    }
  }

  async clearSyncData(): Promise<void> {
    try {
      await offlineQueueService.clearQueue();
      await storageService.removeItem("SETTINGS", "lastSyncTime");

      this.syncStatus = {
        isOnline: this.syncStatus.isOnline,
        lastSyncTime: null,
        pendingOperations: 0,
        syncInProgress: false,
        lastSyncResult: null,
      };

      this.notifyListeners();
      console.log("Sync data cleared");
    } catch (error) {
      console.error("Failed to clear sync data:", error);
    }
  }
}

export const syncManager = new SyncManager();

// Utility hook for components to use sync manager
export function useSyncManager(userId: string | null) {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(
    syncManager.getSyncStatus()
  );

  React.useEffect(() => {
    if (!userId) return;

    // Initialize sync manager
    syncManager.initialize(userId);

    // Subscribe to status updates
    const unsubscribe = syncManager.addStatusListener(setSyncStatus);

    return unsubscribe;
  }, [userId]);

  const performManualSync = React.useCallback(async () => {
    if (!userId) {
      console.warn("Cannot sync: No user ID");
      return;
    }
    console.log("🔄 Manual sync requested");
    return await syncManager.performSync(userId, true);
  }, [userId]);

  const startAutoSync = React.useCallback(async () => {
    if (!userId) return;
    await syncManager.startAutoSync(userId);
  }, [userId]);

  const stopAutoSync = React.useCallback(() => {
    syncManager.stopAutoSync();
  }, []);

  const updateNetworkStatus = React.useCallback((isOnline: boolean) => {
    syncManager.updateNetworkStatus(isOnline);
  }, []);

  return React.useMemo(
    () => ({
      syncStatus,
      performManualSync,
      startAutoSync,
      stopAutoSync,
      updateNetworkStatus,
    }),
    [
      syncStatus,
      performManualSync,
      startAutoSync,
      stopAutoSync,
      updateNetworkStatus,
    ]
  );
}
