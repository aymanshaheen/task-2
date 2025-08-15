import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw != null) {
          if (isMountedRef.current) setValue(JSON.parse(raw));
        }
      } catch (e) {
        if (isMountedRef.current) setError(e as Error);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    })();
    return () => {
      isMountedRef.current = false;
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        writeTimeoutRef.current = null;
      }
    };
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      try {
        setValue(next);
        if (writeTimeoutRef.current) {
          clearTimeout(writeTimeoutRef.current);
        }
        setSaving(true);
        writeTimeoutRef.current = setTimeout(async () => {
          try {
            await AsyncStorage.setItem(key, JSON.stringify(next));
          } catch (e) {
            if (isMountedRef.current) setError(e as Error);
          } finally {
            if (isMountedRef.current) setSaving(false);
          }
        }, 250);
      } catch (e) {
        setError(e as Error);
      }
    },
    [key]
  );

  const clear = useCallback(async () => {
    try {
      setValue(initialValue);
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        writeTimeoutRef.current = null;
      }
      setSaving(true);
      await AsyncStorage.removeItem(key);
      if (isMountedRef.current) setSaving(false);
    } catch (e) {
      setError(e as Error);
    }
  }, [key, initialValue]);

  return { value, setValue: save, clear, loading, saving, error } as const;
}
