import React, { useState, useEffect, useCallback } from "react";
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  details: {
    isConnectionExpensive: boolean | null;
    ssid: string | null;
    bssid: string | null;
    strength: number | null;
    ipAddress: string | null;
    subnet: string | null;
  };
  connectionQuality: "excellent" | "good" | "poor" | "offline";
}

export interface NetworkActions {
  refresh: () => Promise<void>;
  checkReachability: (url?: string) => Promise<boolean>;
}

const DEFAULT_NETWORK_STATUS: NetworkStatus = {
  isConnected: false,
  isInternetReachable: null,
  type: NetInfoStateType.unknown,
  details: {
    isConnectionExpensive: null,
    ssid: null,
    bssid: null,
    strength: null,
    ipAddress: null,
    subnet: null,
  },
  connectionQuality: "offline",
};

function determineConnectionQuality(
  state: NetInfoState
): NetworkStatus["connectionQuality"] {
  if (!state.isConnected || state.isInternetReachable === false) {
    return "offline";
  }

  // For WiFi connections, use signal strength if available
  if (state.type === NetInfoStateType.wifi && state.details.strength !== null) {
    const strength = state.details.strength;
    if (strength >= -50) return "excellent";
    if (strength >= -70) return "good";
    return "poor";
  }

  // For cellular connections, consider connection type
  if (state.type === NetInfoStateType.cellular) {
    // These are rough estimates based on cellular technology
    if (
      state.details.cellularGeneration === "4g" ||
      state.details.cellularGeneration === "5g"
    ) {
      return "excellent";
    }
    if (state.details.cellularGeneration === "3g") {
      return "good";
    }
    return "poor";
  }

  // For other connection types, assume good if connected
  if (state.isInternetReachable === true) {
    return "good";
  }

  // Default to poor if we're connected but can't verify internet
  return "poor";
}

function transformNetInfoState(state: NetInfoState): NetworkStatus {
  // Type-safe property extraction based on connection type
  const isWiFi = state.type === NetInfoStateType.wifi;
  const wifiDetails = isWiFi ? (state.details as any) : null;

  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
    details: {
      isConnectionExpensive: state.details?.isConnectionExpensive ?? null,
      ssid: wifiDetails?.ssid ?? null,
      bssid: wifiDetails?.bssid ?? null,
      strength: wifiDetails?.strength ?? null,
      ipAddress: wifiDetails?.ipAddress ?? null,
      subnet: wifiDetails?.subnet ?? null,
    },
    connectionQuality: determineConnectionQuality(state),
  };
}

export function useNetworkStatus(): NetworkStatus & NetworkActions {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    DEFAULT_NETWORK_STATUS
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const updateNetworkStatus = useCallback((state: NetInfoState) => {
    const newStatus = transformNetInfoState(state);
    setNetworkStatus(newStatus);
    setIsInitialized(true);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const state = await NetInfo.fetch();
      updateNetworkStatus(state);
    } catch (error) {
      console.warn("Failed to refresh network status:", error);
    }
  }, [updateNetworkStatus]);

  const checkReachability = useCallback(
    async (url: string = "https://www.google.com"): Promise<boolean> => {
      try {
        const isReachable = await NetInfo.fetch().then(
          (state) => state.isInternetReachable
        );
        return isReachable === true;
      } catch (error) {
        console.warn("Failed to check reachability:", error);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    // Configure NetInfo with balanced settings
    NetInfo.configure({
      reachabilityUrl: "https://clients3.google.com/generate_204",
      reachabilityTest: async (response) => response.status === 204,
      reachabilityLongTimeout: 60 * 1000, // 60s
      reachabilityShortTimeout: 10 * 1000, // 10s
      reachabilityRequestTimeout: 8 * 1000, // 8s
      shouldFetchWiFiSSID: false, // Disable WiFi SSID fetching for performance
      reachabilityShouldRun: () => true, // Re-enable but with longer timeouts
    });

    let mounted = true;
    let lastUpdate = 0;
    const UPDATE_THROTTLE = 1000; // Throttle updates to max once per second

    const throttledUpdateNetworkStatus = (state: NetInfoState) => {
      const now = Date.now();
      if (mounted && now - lastUpdate > UPDATE_THROTTLE) {
        lastUpdate = now;
        updateNetworkStatus(state);
      }
    };

    // Initial fetch with mounted check
    NetInfo.fetch().then((state) => {
      if (mounted) {
        updateNetworkStatus(state);
        lastUpdate = Date.now();
      }
    });

    // Subscribe to network state updates with mounted check and throttling
    const unsubscribe = NetInfo.addEventListener(throttledUpdateNetworkStatus);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // Stable effect with no dependencies

  return {
    ...networkStatus,
    refresh,
    checkReachability,
  };
}

// Utility hooks for specific use cases
export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && isInternetReachable !== false;
}

export function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // Simplified offline detection
  const isOffline = React.useMemo(() => {
    // If we know we're not connected, we're offline
    if (isConnected === false) {
      return true;
    }
    // If we're connected but internet is explicitly unreachable, we're offline
    if (isConnected === true && isInternetReachable === false) {
      return true;
    }
    // Otherwise assume we're online (including when isInternetReachable is null)
    return false;
  }, [isConnected, isInternetReachable]);

  return isOffline;
}

export function useConnectionQuality(): NetworkStatus["connectionQuality"] {
  const { connectionQuality } = useNetworkStatus();
  return connectionQuality;
}

// Hook for components that need to react to network changes
export function useNetworkAware() {
  const networkStatus = useNetworkStatus();
  const isOffline = useIsOffline();
  const [previouslyOffline, setPreviouslyOffline] = useState(isOffline);
  const [justCameOnline, setJustCameOnline] = useState(false);
  const [justWentOffline, setJustWentOffline] = useState(false);

  React.useEffect(() => {
    // Only trigger state changes when there's an actual transition
    if (isOffline !== previouslyOffline) {
      if (previouslyOffline && !isOffline) {
        // Just came back online
        console.log("🟢 Network restored - coming back online");
        setJustCameOnline(true);
        setJustWentOffline(false);
        setTimeout(() => setJustCameOnline(false), 5000);
      } else if (!previouslyOffline && isOffline) {
        // Just went offline
        console.log("🔴 Network lost - going offline");
        setJustWentOffline(true);
        setJustCameOnline(false);
        setTimeout(() => setJustWentOffline(false), 5000);
      }
      setPreviouslyOffline(isOffline);
    }
  }, [isOffline, previouslyOffline]);

  return {
    ...networkStatus,
    isOffline,
    wasOffline: previouslyOffline,
    justCameOnline,
    justWentOffline,
  };
}
