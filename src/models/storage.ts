export interface StorageError {
  type: string;
  message: string;
  key?: string;
  originalError?: Error;
}

export interface StorageOptions {
  ttl?: number;
  compress?: boolean;
  priority?: "low" | "normal" | "high";
}

export interface StorageMetadata {
  version: string;
  timestamp: number;
  checksum?: string;
  compressed?: boolean;
  ttl?: number;
}

export interface StorageWrapper<T> {
  data: T;
  meta: StorageMetadata;
}

export interface UseAsyncStorageOptions {
  writeDelay?: number;
  validateOnRead?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  compress?: boolean;
  ttl?: number;
}
