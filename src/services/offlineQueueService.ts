import { CreateNoteData, UpdateNoteData } from "../models/notes";

import { storageService } from "./storageService";

export interface QueuedOperation {
  id: string;
  type: "CREATE_NOTE" | "UPDATE_NOTE" | "DELETE_NOTE" | "TOGGLE_FAVORITE";
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  data: any;
  userId: string;
}

export interface SyncResult {
  success: number;
  failed: number;
  errors: Array<{
    operation: QueuedOperation;
    error: any;
  }>;
}

const QUEUE_STORAGE_KEY = "offline_operations_queue";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

class OfflineQueueService {
  private syncInProgress = false;
  private syncListeners: Array<(result: SyncResult) => void> = [];

  async addOperation(
    operation: Omit<QueuedOperation, "id" | "timestamp" | "retryCount">
  ): Promise<void> {
    try {
      const queuedOperation: QueuedOperation = {
        id: `${operation.type}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        ...operation,
      };

      const currentQueue = await this.getQueue();
      const updatedQueue = [...currentQueue, queuedOperation];

      await storageService.setItem("TEMP", QUEUE_STORAGE_KEY, updatedQueue);
    } catch (error) {
      console.error("❌ Failed to add operation to offline queue:", error);
    }
  }

  async getQueue(): Promise<QueuedOperation[]> {
    try {
      const queue = await storageService.getItem<QueuedOperation[]>(
        "TEMP",
        QUEUE_STORAGE_KEY
      );
      return queue || [];
    } catch (error) {
      console.error("Failed to get offline queue:", error);
      return [];
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await storageService.removeItem("TEMP", QUEUE_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear offline queue:", error);
    }
  }

  async removeOperation(operationId: string): Promise<void> {
    try {
      const currentQueue = await this.getQueue();
      const updatedQueue = currentQueue.filter((op) => op.id !== operationId);
      await storageService.setItem("TEMP", QUEUE_STORAGE_KEY, updatedQueue);
    } catch (error) {
      console.error("Failed to remove operation from queue:", error);
    }
  }

  async syncOfflineOperations(
    userId: string,
    isOnline: boolean = true
  ): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: 0, failed: 0, errors: [] };
    }

    if (!isOnline) {
      return { success: 0, failed: 0, errors: [] };
    }

    this.syncInProgress = true;
    const result: SyncResult = { success: 0, failed: 0, errors: [] };

    try {
      const queue = await this.getQueue();
      const userOperations = queue.filter((op) => op.userId === userId);

      if (userOperations.length === 0) {
        return result;
      }

      // Sort operations by timestamp to maintain order
      userOperations.sort((a, b) => a.timestamp - b.timestamp);

      for (const operation of userOperations) {
        try {
          await this.executeOperation(operation);
          await this.removeOperation(operation.id);
          result.success++;
        } catch (error: any) {
          console.error(
            `❌ Failed to sync operation ${operation.type}:`,
            error
          );

          // If it's a network error and we're not forced, stop trying
          if (error?.type === "NETWORK_ERROR" && !isOnline) {
            result.failed++;
            result.errors.push({ operation, error });
            continue; // Don't increment retry count for network errors when offline
          }

          operation.retryCount++;

          if (operation.retryCount >= operation.maxRetries) {
            await this.removeOperation(operation.id);
            result.failed++;
            result.errors.push({ operation, error });
          } else {
            const currentQueue = await this.getQueue();
            const updatedQueue = currentQueue.map((op) =>
              op.id === operation.id
                ? { ...op, retryCount: operation.retryCount }
                : op
            );
            await storageService.setItem(
              "TEMP",
              QUEUE_STORAGE_KEY,
              updatedQueue
            );
            result.failed++;
            result.errors.push({ operation, error });
          }
        }

        await this.delay(500);
      }

      this.notifySyncListeners(result);

      return result;
    } catch (error) {
      console.error("Error during offline sync:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case "CREATE_NOTE":
        await this.executeCreateNote(operation);
        break;
      case "UPDATE_NOTE":
        await this.executeUpdateNote(operation);
        break;
      case "DELETE_NOTE":
        await this.executeDeleteNote(operation);
        break;
      case "TOGGLE_FAVORITE":
        await this.executeToggleFavorite(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async executeCreateNote(operation: QueuedOperation): Promise<void> {
    const { noteData } = operation.data as { noteData: CreateNoteData };
    // Import dynamically to avoid circular dependency
    const { makeAuthenticatedRequest } = await import("./notesService");

    try {
      const response = await makeAuthenticatedRequest<any>("/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
      });
    } catch (error) {
      console.error("Sync: Failed to create note via queue:", error);
      throw error;
    }
  }

  private async executeUpdateNote(operation: QueuedOperation): Promise<void> {
    const { noteId, updates } = operation.data as {
      noteId: string;
      updates: UpdateNoteData;
    };
    // Import dynamically to avoid circular dependency
    const { makeAuthenticatedRequest } = await import("./notesService");

    try {
      const response = await makeAuthenticatedRequest<any>(`/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Sync: Failed to update note via queue:", error);
      throw error;
    }
  }

  private async executeDeleteNote(operation: QueuedOperation): Promise<void> {
    const { noteId } = operation.data as { noteId: string };
    // Import dynamically to avoid circular dependency
    const { makeAuthenticatedRequest } = await import("./notesService");

    try {
      await makeAuthenticatedRequest<any>(`/notes/${noteId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Sync: Failed to delete note via queue:", error);
      throw error;
    }
  }

  private async executeToggleFavorite(
    operation: QueuedOperation
  ): Promise<void> {
    const { noteId, isFavorite } = operation.data as {
      noteId: string;
      isFavorite: boolean;
    };
    // Import dynamically to avoid circular dependency
    const { makeAuthenticatedRequest } = await import("./notesService");

    try {
      // Get current note first
      const noteResponse = await makeAuthenticatedRequest<any>(
        `/notes/${noteId}`,
        {
          method: "GET",
        }
      );

      const note = noteResponse.data || noteResponse.note || noteResponse;

      // Update with new favorite status
      await makeAuthenticatedRequest<any>(`/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({ ...note, isFavorite }),
      });
    } catch (error) {
      console.error("Sync: Failed to toggle favorite via queue:", error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  addSyncListener(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  private notifySyncListeners(result: SyncResult): void {
    this.syncListeners.forEach((listener) => {
      try {
        listener(result);
      } catch (error) {
        console.error("Error in sync listener:", error);
      }
    });
  }

  async getQueueStats(): Promise<{
    totalOperations: number;
    operationsByType: Record<string, number>;
    oldestOperation: Date | null;
    failedOperations: number;
  }> {
    try {
      const queue = await this.getQueue();

      const stats = {
        totalOperations: queue.length,
        operationsByType: {} as Record<string, number>,
        oldestOperation: null as Date | null,
        failedOperations: 0,
      };

      if (queue.length === 0) {
        return stats;
      }

      // Count operations by type
      queue.forEach((op) => {
        stats.operationsByType[op.type] =
          (stats.operationsByType[op.type] || 0) + 1;
        if (op.retryCount > 0) {
          stats.failedOperations++;
        }
      });

      // Find oldest operation
      const oldest = queue.reduce((oldest, current) =>
        current.timestamp < oldest.timestamp ? current : oldest
      );
      stats.oldestOperation = new Date(oldest.timestamp);

      return stats;
    } catch (error) {
      console.error("Failed to get queue stats:", error);
      return {
        totalOperations: 0,
        operationsByType: {},
        oldestOperation: null,
        failedOperations: 0,
      };
    }
  }
}

export const offlineQueueService = new OfflineQueueService();

// Helper functions for common operations
export const queueOperations = {
  createNote: async (noteData: CreateNoteData, userId: string) => {
    await offlineQueueService.addOperation({
      type: "CREATE_NOTE",
      data: { noteData },
      userId,
      maxRetries: MAX_RETRY_ATTEMPTS,
    });
  },

  updateNote: async (
    noteId: string,
    updates: UpdateNoteData,
    userId: string
  ) => {
    await offlineQueueService.addOperation({
      type: "UPDATE_NOTE",
      data: { noteId, updates },
      userId,
      maxRetries: MAX_RETRY_ATTEMPTS,
    });
  },

  deleteNote: async (noteId: string, userId: string) => {
    await offlineQueueService.addOperation({
      type: "DELETE_NOTE",
      data: { noteId },
      userId,
      maxRetries: MAX_RETRY_ATTEMPTS,
    });
  },

  toggleFavorite: async (
    noteId: string,
    isFavorite: boolean,
    userId: string
  ) => {
    await offlineQueueService.addOperation({
      type: "TOGGLE_FAVORITE",
      data: { noteId, isFavorite },
      userId,
      maxRetries: MAX_RETRY_ATTEMPTS,
    });
  },
};
