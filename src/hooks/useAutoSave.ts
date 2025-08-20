import { useEffect, useRef, useCallback } from "react";
import { useAsyncStorage } from "./useAsyncStorage";

interface AutoSaveOptions {
  enabled?: boolean;
  delay?: number; 
  clearOnSubmit?: boolean; 
}

export function useAutoSave<T extends object>(
  key: string,
  data: T,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    delay = 2000,
    clearOnSubmit = true,
  } = options;

  const {
    value: savedData,
    setValue: setSavedData,
    clear: clearSavedData,
    saving,
    initialized,
  } = useAsyncStorage<T | null>(`autosave_${key}`, null, {
    writeDelay: delay,
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastDataRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || !initialized) return;

    const currentDataString = JSON.stringify(data);

    if (currentDataString === lastDataRef.current) return;

    lastDataRef.current = currentDataString;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const hasData = Object.entries(data).some(([key, value]) => {
        if (
          typeof value === "boolean" &&
          (key === "rememberMe" ||
            key === "acceptedTerms" ||
            key === "enable2FA" ||
            key === "enableSecurityQuestions")
        ) {
          return false; 
        }

        if (typeof value === "string") return value.trim().length > 0;
        if (typeof value === "boolean") return value;
        return value != null && value !== "" && value !== "personal"; // Skip default account type
      });

      if (hasData) {
        setSavedData(data);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, setSavedData, initialized]);

  const clearDraft = useCallback(async () => {
    await clearSavedData();
    lastDataRef.current = "";
  }, [clearSavedData]);

  const getSavedData = useCallback(() => {
    return savedData;
  }, [savedData]);

  const hasDraft = useCallback(() => {
    if (!savedData || !initialized) return false;

    return Object.entries(savedData).some(([key, value]) => {
      if (
        typeof value === "boolean" &&
        (key === "rememberMe" ||
          key === "acceptedTerms" ||
          key === "enable2FA" ||
          key === "enableSecurityQuestions")
      ) {
        return false;
      }

      if (typeof value === "string") return value.trim().length > 0;
      if (typeof value === "boolean") return value;
      return value != null && value !== "" && value !== "personal"; // Skip default account type
    });
  }, [savedData, initialized]);

  const markAsSubmitted = useCallback(async () => {
    if (clearOnSubmit) {
      await clearDraft();
    }
  }, [clearOnSubmit, clearDraft]);

  return {
    savedData,
    hasDraft: hasDraft(),
    saving,
    initialized,
    getSavedData,
    clearDraft,
    markAsSubmitted,
  };
}
