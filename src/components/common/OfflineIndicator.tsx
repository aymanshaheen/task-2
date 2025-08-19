import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useNetworkStatus, useIsOffline } from "../../hooks/useNetworkStatus";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface OfflineIndicatorProps {
  visible?: boolean;
  showConnectionQuality?: boolean;
  onPress?: () => void;
}

export function OfflineIndicator({
  visible,
  showConnectionQuality = false,
  onPress,
}: OfflineIndicatorProps) {
  const { themeStyles } = useTheme();
  const networkStatus = useNetworkStatus();
  const isOffline = useIsOffline();

  // Removed excessive logging that was causing performance issues

  // If visible is explicitly passed, use that, otherwise use network status
  const shouldShow = visible !== undefined ? visible : isOffline;

  // Always show if showConnectionQuality is true, regardless of online/offline status
  if (!shouldShow && !showConnectionQuality) return null;

  const getStatusText = () => {
    // Always show current network status when showConnectionQuality is true
    if (showConnectionQuality) {
      const qualityEmojis = {
        excellent: "📶",
        good: "📶",
        poor: "📶",
        offline: "📵",
      };

      const qualityText = {
        excellent: "Excellent connection",
        good: "Good connection",
        poor: "Poor connection",
        offline: "No connection",
      };

      // Force offline status based on actual network state
      const actualQuality = isOffline
        ? "offline"
        : networkStatus.connectionQuality;
      const emoji = qualityEmojis[actualQuality];
      const text = qualityText[actualQuality];

      if (isOffline) {
        return `${emoji} ${text} - Showing saved notes`;
      } else {
        return `${emoji} ${text}`;
      }
    }

    // Default offline message when not showing connection quality
    if (isOffline) {
      return "📵 You're offline. Showing saved notes.";
    }

    return null;
  };

  const getStatusColor = () => {
    if (isOffline)
      return { backgroundColor: "#ff6b6b", borderColor: "#ff5252" };

    const qualityColors = {
      excellent: { backgroundColor: "#4caf50", borderColor: "#45a049" },
      good: { backgroundColor: "#2196f3", borderColor: "#1976d2" },
      poor: { backgroundColor: "#ff9800", borderColor: "#f57c00" },
      offline: { backgroundColor: "#ff6b6b", borderColor: "#ff5252" },
    };

    return qualityColors[networkStatus.connectionQuality];
  };

  const statusText = getStatusText();
  if (!statusText) return null;

  const StatusComponent = onPress ? TouchableOpacity : View;

  return (
    <StatusComponent
      style={[styles.container, themeStyles.offlineIndicator, getStatusColor()]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.text, themeStyles.offlineText]}>{statusText}</Text>
      {networkStatus.type !== "unknown" && showConnectionQuality && (
        <Text style={[styles.subText, themeStyles.offlineText]}>
          {networkStatus.type.toUpperCase()}
          {networkStatus.details.ssid && ` • ${networkStatus.details.ssid}`}
        </Text>
      )}
    </StatusComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s8,
    marginBottom: spacing.s8,
    borderRadius: spacing.s8,
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    fontSize: typography.size.sm,
    textAlign: "center",
    fontWeight: "600",
    color: "#ffffff",
  },
  subText: {
    fontSize: typography.size.xs,
    textAlign: "center",
    marginTop: 2,
    opacity: 0.9,
    color: "#ffffff",
  },
});
