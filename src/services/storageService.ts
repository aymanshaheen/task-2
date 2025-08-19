import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageError, StorageOptions } from "../models/storage";
import { StorageErrorType } from "../enums/storage";

const STORAGE_NAMESPACES = {
  USER: "@user_",
  SETTINGS: "@settings_",
  CACHE: "@cache_",
  TEMP: "@temp_",
  AUTH: "@auth_",
  NOTES: "@notes_",
} as const;

const STORAGE_CONFIG = {
  MAX_ITEM_SIZE: 1024 * 1024,
  DEFAULT_TTL: 24 * 60 * 60 * 1000,
  MAX_CACHE_ITEMS: 100,
  BATCH_SIZE: 10,
} as const;

interface StoredData<T> {
  data: T;
  timestamp: number;
  version: string;
  ttl?: number;
  checksum?: string;
}

class StorageService {
  private readonly version = "1.0.0";

  async setItem<T>(
    namespace: keyof typeof STORAGE_NAMESPACES,
    key: string,
    data: T,
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(namespace, key);

      const wrappedData: StoredData<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
        ttl: options.ttl,
        checksum: this.generateChecksum(data),
      };

      const serializedData = JSON.stringify(wrappedData);

      if (serializedData.length > STORAGE_CONFIG.MAX_ITEM_SIZE) {
        throw this.createStorageError(
          StorageErrorType.QUOTA_EXCEEDED,
          `Data too large for key: ${fullKey}`,
          fullKey
        );
      }

      await AsyncStorage.setItem(fullKey, serializedData);
    } catch (error) {
      throw this.handleStorageError(error, key);
    }
  }

  async getItem<T>(
    namespace: keyof typeof STORAGE_NAMESPACES,
    key: string,
    defaultValue?: T
  ): Promise<T | null> {
    try {
      const fullKey = this.buildKey(namespace, key);
      const rawData = await AsyncStorage.getItem(fullKey);

      if (rawData === null) {
        return defaultValue ?? null;
      }

      const wrappedData: StoredData<T> = JSON.parse(rawData);

      if (this.isExpired(wrappedData)) {
        await this.removeItem(namespace, key);
        return defaultValue ?? null;
      }

      if (
        wrappedData.checksum &&
        !this.verifyChecksum(wrappedData.data, wrappedData.checksum)
      ) {
        await this.removeItem(namespace, key);
        return defaultValue ?? null;
      }

      return wrappedData.data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        await this.removeItem(namespace, key).catch(() => {});
        return defaultValue ?? null;
      }

      throw this.handleStorageError(error, key);
    }
  }

  async removeItem(
    namespace: keyof typeof STORAGE_NAMESPACES,
    key: string
  ): Promise<void> {
    try {
      const fullKey = this.buildKey(namespace, key);
      await AsyncStorage.removeItem(fullKey);
    } catch (error) {
      throw this.handleStorageError(error, key);
    }
  }

  async cleanup(): Promise<{ removedCount: number; freedBytes: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      let removedCount = 0;
      let freedBytes = 0;

      for (let i = 0; i < allKeys.length; i += STORAGE_CONFIG.BATCH_SIZE) {
        const batch = allKeys.slice(i, i + STORAGE_CONFIG.BATCH_SIZE);
        const items = await AsyncStorage.multiGet(batch);

        const keysToRemove: string[] = [];

        for (const [key, value] of items) {
          if (value === null) continue;

          try {
            const wrappedData: StoredData<any> = JSON.parse(value);

            if (this.isExpired(wrappedData)) {
              keysToRemove.push(key);
              freedBytes += value.length;
            } else if (
              key.includes(STORAGE_NAMESPACES.TEMP) &&
              Date.now() - wrappedData.timestamp > 60 * 60 * 1000
            ) {
              keysToRemove.push(key);
              freedBytes += value.length;
            }
          } catch {
            keysToRemove.push(key);
            freedBytes += value.length;
          }
        }

        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          removedCount += keysToRemove.length;
        }
      }

      return { removedCount, freedBytes };
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async getStorageInfo(): Promise<{
    totalItems: number;
    totalSize: number;
    namespaceStats: Record<string, { count: number; size: number }>;
    largestItems: Array<{ key: string; size: number }>;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allItems = await AsyncStorage.multiGet(allKeys);

      let totalSize = 0;
      const namespaceStats: Record<string, { count: number; size: number }> =
        {};
      const largestItems: Array<{ key: string; size: number }> = [];

      for (const [key, value] of allItems) {
        if (value === null) continue;

        const size = value.length;
        totalSize += size;

        const namespace = this.extractNamespace(key);
        if (!namespaceStats[namespace]) {
          namespaceStats[namespace] = { count: 0, size: 0 };
        }
        namespaceStats[namespace].count++;
        namespaceStats[namespace].size += size;

        largestItems.push({ key, size });
      }

      largestItems.sort((a, b) => b.size - a.size);

      return {
        totalItems: allItems.length,
        totalSize,
        namespaceStats,
        largestItems: largestItems.slice(0, 10),
      };
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  async clearNamespace(
    namespace: keyof typeof STORAGE_NAMESPACES
  ): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const namespacePrefix = STORAGE_NAMESPACES[namespace];
      const keysToRemove = allKeys.filter((key) =>
        key.startsWith(namespacePrefix)
      );

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      return keysToRemove.length;
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  private buildKey(
    namespace: keyof typeof STORAGE_NAMESPACES,
    key: string
  ): string {
    return `${STORAGE_NAMESPACES[namespace]}${key}`;
  }

  private extractNamespace(fullKey: string): string {
    for (const [name, prefix] of Object.entries(STORAGE_NAMESPACES)) {
      if (fullKey.startsWith(prefix)) {
        return name;
      }
    }
    return "unknown";
  }

  private isExpired(wrappedData: StoredData<any>): boolean {
    if (!wrappedData.ttl) return false;
    return Date.now() - wrappedData.timestamp > wrappedData.ttl;
  }

  private generateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 10);
  }

  private verifyChecksum(data: any, expectedChecksum: string): boolean {
    return this.generateChecksum(data) === expectedChecksum;
  }

  private createStorageError(
    type: StorageErrorType,
    message: string,
    key?: string,
    originalError?: Error
  ): StorageError {
    return {
      type,
      message,
      key,
      originalError,
    };
  }

  private handleStorageError(error: any, key?: string): StorageError {
    if (error.type) {
      return error;
    }

    if (error.message?.includes("quota")) {
      return this.createStorageError(
        StorageErrorType.QUOTA_EXCEEDED,
        "Storage quota exceeded. Please free up space.",
        key,
        error
      );
    }

    if (
      error.message?.includes("permission") ||
      error.message?.includes("access")
    ) {
      return this.createStorageError(
        StorageErrorType.ACCESS_DENIED,
        "Storage access denied. Check app permissions.",
        key,
        error
      );
    }

    return this.createStorageError(
      StorageErrorType.UNKNOWN_ERROR,
      "An unknown storage error occurred.",
      key,
      error
    );
  }
}

export const storageService = new StorageService();

export const cacheManager = {
  async cacheApiResponse<T>(
    endpoint: string,
    data: T,
    ttl?: number
  ): Promise<void> {
    await storageService.setItem("CACHE", `api_${endpoint}`, data, {
      ttl: ttl || STORAGE_CONFIG.DEFAULT_TTL,
    });
  },

  async getCachedApiResponse<T>(endpoint: string): Promise<T | null> {
    return storageService.getItem("CACHE", `api_${endpoint}`);
  },

  async invalidateCache(pattern?: string): Promise<void> {
    if (pattern) {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const cacheKeys = allKeys.filter(
          (key) =>
            key.includes(`${STORAGE_NAMESPACES.CACHE}:api_`) &&
            key.includes(pattern)
        );

        if (cacheKeys.length > 0) {
          await AsyncStorage.multiRemove(cacheKeys);
        }
      } catch (error) {
        console.error("Failed to invalidate cache pattern:", error);
        await storageService.clearNamespace("CACHE");
      }
    } else {
      await storageService.clearNamespace("CACHE");
    }
  },

  async storeDraft(draftId: string, content: any): Promise<void> {
    await storageService.setItem("TEMP", `draft_${draftId}`, content, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },

  async getDraft(draftId: string): Promise<any> {
    return storageService.getItem("TEMP", `draft_${draftId}`);
  },
};

export { STORAGE_NAMESPACES };
