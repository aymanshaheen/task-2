import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAsyncStorage } from "./useAsyncStorage";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const generateId = () => Math.random().toString(36).slice(2);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    value: session,
    setValue,
    clear,
    loading,
  } = useAsyncStorage<AuthSession>("session", { user: null });

  const login = useCallback(
    async (email: string, _password: string) => {
      // In a real app, call an API here. For now, accept any credentials.
      const user: AuthUser = { id: generateId(), email };
      await setValue({ user });
    },
    [setValue]
  );

  const signup = useCallback(
    async (email: string, _password: string) => {
      const user: AuthUser = { id: generateId(), email };
      await setValue({ user });
    },
    [setValue]
  );

  const logout = useCallback(async () => {
    await clear();
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      isAuthenticated: Boolean(session.user),
      loading,
      login,
      signup,
      logout,
    }),
    [session.user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    } as const;
  }
  return ctx;
}
