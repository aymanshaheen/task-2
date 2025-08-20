import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useAsyncStorage } from "./useAsyncStorage";
import * as authService from "../services/authService";
import { AuthUser, AuthSession, AuthError } from "../models/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name?: string,
    profileImageUri?: string | null
  ) => Promise<void>;
  logout: () => Promise<void>;

  refreshToken: () => Promise<boolean>;

  updateUser: (userUpdates: Partial<AuthUser>) => Promise<void>;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    value: session,
    setValue: setSession,
    clear: clearSession,
    loading: storageLoading,
  } = useAsyncStorage<AuthSession>("auth_session", {
    user: null,
    token: null,
  });

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        if (storageLoading) return;

        if (!session.token || !session.user) {
          setInitializing(false);
          return;
        }

        if (isTokenExpired()) {
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            await logout();
          }
        }
      } catch (error) {
        await clearSession();
      } finally {
        setInitializing(false);
      }
    }

    initializeAuth();
  }, [storageLoading, session.token, session.user]);

  const isTokenExpired = useCallback((): boolean => {
    if (!session.expiresAt) {
      return false;
    }

    return Date.now() > session.expiresAt;
  }, [session.expiresAt]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setLoading(true);

        const user = await authService.login({ email, password });

        const token = await authService.getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found after login");
        }

        const newSession: AuthSession = {
          user,
          token,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        await setSession(newSession);
      } catch (error: any) {
        const authError: AuthError = {
          type: error.type || "AUTHENTICATION_ERROR",
          message: error.message || "Login failed. Please try again.",
          field: error.field,
        };

        throw authError;
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string = "",
      profileImageUri?: string | null
    ): Promise<void> => {
      try {
        setLoading(true);

        const user = await authService.register(
          { name, email, password },
          profileImageUri
            ? { uri: profileImageUri, name: "profile.jpg", type: "image/jpeg" }
            : undefined
        );

        const token = await authService.getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found after registration");
        }

        const newSession: AuthSession = {
          user,
          token,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        await setSession(newSession);
      } catch (error: any) {
        const authError: AuthError = {
          type: error.type || "AUTHENTICATION_ERROR",
          message: error.message || "Registration failed. Please try again.",
          field: error.field,
        };

        throw authError;
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      try {
        const { syncManager } = await import("../services/syncManager");
        await syncManager.clearSyncData();
      } catch (syncError) {
        console.warn("Failed to clear sync data:", syncError);
      }

      await authService.logout();
      await clearSession();

      setLoading(false);
      setInitializing(false);
    } catch (error) {
      console.error("Error during user logout:", error);

      try {
        await clearSession();
      } catch (sessionError) {
        console.error("Failed to clear session:", sessionError);
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await authService.refreshAuthToken();

      if (!newToken) {
        return false;
      }

      const updatedSession: AuthSession = {
        ...session,
        token: newToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      await setSession(updatedSession);

      return true;
    } catch (error) {
      return false;
    }
  }, [session, setSession]);

  const updateUser = useCallback(
    async (userUpdates: Partial<AuthUser>): Promise<void> => {
      try {
        if (!session.user) {
          throw new Error("No authenticated user to update");
        }

        setLoading(true);

        const updatedUser = { ...session.user, ...userUpdates };
        const updatedSession = { ...session, user: updatedUser };

        await setSession(updatedSession);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [session, setSession]
  );

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      isAuthenticated: Boolean(
        session.user && session.token && !isTokenExpired()
      ),
      loading,
      initializing,

      login,
      signup,
      logout,

      refreshToken,

      updateUser,
      isTokenExpired,
    }),
    [
      session.user,
      session.token,
      loading,
      initializing,
      login,
      signup,
      logout,
      refreshToken,
      updateUser,
      isTokenExpired,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      initializing: false,
      login: async () => {
        throw new Error("useAuth used outside AuthProvider");
      },
      signup: async () => {
        throw new Error("useAuth used outside AuthProvider");
      },
      logout: async () => {
        throw new Error("useAuth used outside AuthProvider");
      },
      refreshToken: async () => false,
      updateUser: async () => {
        throw new Error("useAuth used outside AuthProvider");
      },
      isTokenExpired: () => true,
    };
  }

  return context;
}

export function useAuthGuard() {
  const auth = useAuth();

  const requireAuth = useCallback(
    (redirectCallback?: () => void) => {
      if (!auth.isAuthenticated && !auth.loading && !auth.initializing) {
        redirectCallback?.();
        return false;
      }
      return true;
    },
    [auth.isAuthenticated, auth.loading, auth.initializing]
  );

  const requireGuest = useCallback(
    (redirectCallback?: () => void) => {
      if (auth.isAuthenticated && !auth.loading) {
        redirectCallback?.();
        return false;
      }
      return true;
    },
    [auth.isAuthenticated, auth.loading]
  );

  return {
    ...auth,
    requireAuth,
    requireGuest,
  };
}
