import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

import { StorageErrorType } from "../enums/storage";
import {
  StorageError,
  UseAsyncStorageOptions,
  StorageWrapper,
} from "../models/storage";

export function useAsyncStorage<T>(
  key: string,
  initialValue: T,
  options: UseAsyncStorageOptions = {}
) {
  const config = {
    writeDelay: 250,
    validateOnRead: true,
    retryOnFailure: true,
    maxRetries: 3,
    compress: false,
    ...options,
  };

  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<StorageError | null>(null);
  const [initialized, setInitialized] = useState(false);

  const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const currentVersion = useRef("1.0.0");

  useEffect(() => {
    isMountedRef.current = true;
    setInitialized(false);

    async function initializeStorage() {
      try {
        setLoading(true);
        setError(null);

        const raw = await AsyncStorage.getItem(key);

        if (raw !== null) {
          try {
            let parsedData: T;
            let isValid = true;

            try {
              const wrapped: StorageWrapper<T> = JSON.parse(raw);

              if (wrapped.meta) {
                if (
                  wrapped.meta.ttl &&
                  Date.now() - wrapped.meta.timestamp > wrapped.meta.ttl
                ) {
                  await AsyncStorage.removeItem(key);
                  isValid = false;
                }

                if (isValid && wrapped.meta.checksum && config.validateOnRead) {
                  const currentChecksum = generateChecksum(wrapped.data);
                  if (currentChecksum !== wrapped.meta.checksum) {
                    isValid = false;
                  }
                }

                parsedData = wrapped.data;
              } else {
                parsedData = wrapped as T;
              }
            } catch {
              parsedData = JSON.parse(raw);
            }

            if (isValid && isMountedRef.current) {
              setValue(parsedData);
            }
          } catch (parseError) {
            if (isMountedRef.current) {
              const storageError: StorageError = {
                type: StorageErrorType.DATA_CORRUPTION,
                message: "Stored data is corrupted and cannot be parsed",
                key,
                originalError: parseError as Error,
              };
              setError(storageError);
            }
          }
        }
      } catch (accessError) {
        if (isMountedRef.current) {
          const storageError: StorageError = {
            type: StorageErrorType.ACCESS_DENIED,
            message: "Cannot access device storage",
            key,
            originalError: accessError as Error,
          };
          setError(storageError);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initializeStorage();

    return () => {
      isMountedRef.current = false;
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        writeTimeoutRef.current = null;
      }
    };
  }, [key, config.validateOnRead]);

  const save = useCallback(
    async (nextValue: T, immediate: boolean = false) => {
      try {
        setValue(nextValue);
        setError(null);

        if (writeTimeoutRef.current) {
          clearTimeout(writeTimeoutRef.current);
          writeTimeoutRef.current = null;
        }

        setSaving(true);

        const performSave = async () => {
          try {
            const wrapped: StorageWrapper<T> = {
              data: nextValue,
              meta: {
                version: currentVersion.current,
                timestamp: Date.now(),
                checksum: generateChecksum(nextValue),
                compressed: config.compress,
                ttl: config.ttl,
              },
            };

            const serializedData = JSON.stringify(wrapped);

            if (serializedData.length > 6 * 1024 * 1024) {
              throw new Error("Data too large for AsyncStorage");
            }

            await AsyncStorage.setItem(key, serializedData);

            if (isMountedRef.current) {
              retryCountRef.current = 0;
            }
          } catch (saveError) {
            if (isMountedRef.current) {
              let errorType = StorageErrorType.UNKNOWN_ERROR;
              let errorMessage = "Failed to save data";

              if (
                (saveError as any).message?.includes("quota") ||
                (saveError as any).message?.includes("storage")
              ) {
                errorType = StorageErrorType.QUOTA_EXCEEDED;
                errorMessage = "Device storage is full";
              } else if ((saveError as any).message?.includes("permission")) {
                errorType = StorageErrorType.ACCESS_DENIED;
                errorMessage = "Storage access denied";
              } else if (saveError instanceof SyntaxError) {
                errorType = StorageErrorType.SERIALIZATION_ERROR;
                errorMessage = "Data cannot be serialized";
              }

              const storageError: StorageError = {
                type: errorType,
                message: errorMessage,
                key,
                originalError: saveError as Error,
              };

              if (
                config.retryOnFailure &&
                retryCountRef.current < config.maxRetries
              ) {
                retryCountRef.current++;

                setTimeout(() => {
                  if (isMountedRef.current) {
                    performSave();
                  }
                }, Math.pow(2, retryCountRef.current) * 1000);
              } else {
                setError(storageError);
              }
            }
          } finally {
            if (isMountedRef.current) {
              setSaving(false);
            }
          }
        };

        if (immediate) {
          await performSave();
        } else {
          writeTimeoutRef.current = setTimeout(performSave, config.writeDelay);
        }
      } catch (error) {
        if (isMountedRef.current) {
          const storageError: StorageError = {
            type: StorageErrorType.UNKNOWN_ERROR,
            message: "Unexpected error during save operation",
            key,
            originalError: error as Error,
          };
          setError(storageError);
          setSaving(false);
        }
      }
    },
    [
      key,
      config.writeDelay,
      config.compress,
      config.ttl,
      config.retryOnFailure,
      config.maxRetries,
    ]
  );

  const clear = useCallback(async () => {
    try {
      setValue(initialValue);
      setError(null);

      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        writeTimeoutRef.current = null;
      }

      setSaving(true);

      await AsyncStorage.removeItem(key);
    } catch (clearError) {
      if (isMountedRef.current) {
        const storageError: StorageError = {
          type: StorageErrorType.UNKNOWN_ERROR,
          message: "Failed to clear stored data",
          key,
          originalError: clearError as Error,
        };
        setError(storageError);
      }
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [key, initialValue]);

  const forceSave = useCallback(
    async (nextValue?: T) => {
      const valueToSave = nextValue !== undefined ? nextValue : value;
      await save(valueToSave, true);
    },
    [save, value]
  );

  function generateChecksum(data: T): string {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    } catch {
      return "invalid";
    }
  }

  return {
    value,
    loading,
    saving,
    initialized,
    error,
    setValue: save,
    clear,
    forceSave,
    retryLastOperation: () => save(value, true),
    clearError: () => setError(null),
  } as const;
}
