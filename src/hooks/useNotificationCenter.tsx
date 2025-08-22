import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { notificationService } from "../services/notificationService";

import { useAsyncStorage } from "./useAsyncStorage";


type NotificationPayload = {
  type?: string;
  noteId?: string;
  title?: string;
  body?: string;
};

type NotificationCenterValue = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  incrementUnread: (by?: number) => void;
  clearUnread: () => void;
  registerIfEnabled: () => Promise<void>;
  notificationsAvailable?: boolean;
};

const NotificationCenterContext = createContext<
  NotificationCenterValue | undefined
>(undefined);

export function NotificationCenterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { value: notificationsEnabled } = useAsyncStorage<boolean>(
    "settings:notificationsEnabledV2",
    false
  );
  const { value: storedToken, setValue: setStoredToken } = useAsyncStorage<
    string | null
  >("settings:pushToken", null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsAvailable, setNotificationsAvailable] = useState(false);

  const setUnread = useCallback(
    (n: number) => setUnreadCount(Math.max(0, n)),
    []
  );
  const incrementUnread = useCallback(
    (by: number = 1) => setUnreadCount((c) => c + by),
    []
  );
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const registerIfEnabled = useCallback(async () => {
    if (!notificationsEnabled) return;
    try {
      if (Constants?.appOwnership === "expo") return;
      const Notifications: any = await import("expo-notifications").catch(
        () => null
      );
      if (!Notifications) return;
      setNotificationsAvailable(true);
      const {
        getPermissionsAsync,
        requestPermissionsAsync,
        getExpoPushTokenAsync,
        getDevicePushTokenAsync,
        setNotificationChannelAsync,
      } = Notifications as any;

      const perms = await getPermissionsAsync();
      if (!perms?.status || perms.status !== "granted") {
        const req = await requestPermissionsAsync();
        if (req.status !== "granted") {
          return;
        }
      }

      if (Platform.OS === "android" && setNotificationChannelAsync) {
        await setNotificationChannelAsync("default", {
          name: "Default",
          importance: 4,
        });
      }

      let token: string | null = null;
      try {
        const deviceTokenResp =
          typeof getDevicePushTokenAsync === "function"
            ? await getDevicePushTokenAsync()
            : null;
        const possibleTokenValues = [
          deviceTokenResp?.data,
          (deviceTokenResp as any)?.token,
          (deviceTokenResp as any)?.devicePushToken,
        ].filter(Boolean);
        if (possibleTokenValues.length > 0) {
          token = String(possibleTokenValues[0]);
        }
      } catch {}

      if (!token) {
        const tokenResp = await getExpoPushTokenAsync({ projectId: undefined });
        token = tokenResp?.data || null;
      }
      if (token && token !== storedToken) {
        await notificationService.registerDevice(
          token,
          Platform.OS === "ios" ? "ios" : "android"
        );
        await setStoredToken(token);
      }
    } catch (e) {}
  }, [notificationsEnabled, setStoredToken, storedToken]);

  useEffect(() => {
    let sub1: any = null;
    let sub2: any = null;
    (async () => {
      try {
        if (Constants?.appOwnership === "expo") return;
        const Notifications: any = await import("expo-notifications").catch(
          () => null
        );
        if (!Notifications) return;
        setNotificationsAvailable(true);
        const {
          addNotificationReceivedListener,
          addNotificationResponseReceivedListener,
        } = Notifications as any;

        sub1 = addNotificationReceivedListener((notification: any) => {
          const data: NotificationPayload =
            notification?.request?.content?.data || {};
          if (data?.type === "like") {
            incrementUnread(1);
          } else {
            incrementUnread(1);
          }
        });

        sub2 = addNotificationResponseReceivedListener((response: any) => {
          const data: NotificationPayload =
            response?.notification?.request?.content?.data || {};
          const providedUrl: string | undefined = (response as any)
            ?.notification?.request?.content?.data?.url;
          try {
            const Linking = require("expo-linking");
            if (providedUrl) {
              Linking.openURL(providedUrl);
            } else if (data?.noteId) {
              Linking.openURL(`task-2://note/${data.noteId}`);
            }
          } catch {}
        });
      } catch (e) {}
    })();

    return () => {
      try {
        sub1?.remove?.();
        sub2?.remove?.();
      } catch {}
    };
  }, [incrementUnread]);

  useEffect(() => {
    registerIfEnabled();
  }, [registerIfEnabled]);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount: setUnread,
      incrementUnread,
      clearUnread,
      registerIfEnabled,
      notificationsAvailable,
    }),
    [
      unreadCount,
      setUnread,
      incrementUnread,
      clearUnread,
      registerIfEnabled,
      notificationsAvailable,
    ]
  );

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      setUnreadCount: () => {},
      incrementUnread: () => {},
      clearUnread: () => {},
      registerIfEnabled: async () => {},
    };
  }
  return ctx;
}
