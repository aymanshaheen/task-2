import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

import { useNetworkAware } from "../../hooks/useNetworkStatus";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";

interface NetworkSnackbarProps {
  onPress?: () => void;
}

export function NetworkSnackbar({ onPress }: NetworkSnackbarProps) {
  const { themeStyles } = useTheme();
  const { justCameOnline, justWentOffline } = useNetworkAware();

  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Show snackbar when network status changes
  const shouldShow = justCameOnline || justWentOffline;

  useEffect(() => {
    if (shouldShow) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 4.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      // Reset animations when not showing
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  }, [shouldShow, slideAnim, opacityAnim, justCameOnline, justWentOffline]);

  const getSnackbarContent = () => {
    if (justCameOnline) {
      return {
        emoji: "🟢",
        message: "Internet Connected",
        subMessage: "You're back online and ready to sync",
        backgroundColor: "#4caf50",
        borderColor: "#45a049",
      };
    }

    if (justWentOffline) {
      return {
        emoji: "🔴",
        message: "No Internet Connection",
        subMessage: "Working offline - changes will sync when reconnected",
        backgroundColor: "#ff6b6b",
        borderColor: "#ff5252",
      };
    }

    return null;
  };

  const content = getSnackbarContent();

  if (!shouldShow || !content) {
    return null;
  }

  const SnackbarComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: content.backgroundColor,
          borderColor: content.borderColor,
        },
      ]}
    >
      <SnackbarComponent
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={styles.textContainer}>
          <View style={styles.mainTextRow}>
            <Text style={styles.emoji}>{content.emoji}</Text>
            <Text style={[styles.message, themeStyles.text]}>
              {content.message}
            </Text>
          </View>
          {content.subMessage && (
            <Text style={[styles.subMessage, themeStyles.text]}>
              {content.subMessage}
            </Text>
          )}
        </View>
      </SnackbarComponent>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.s12,
    borderWidth: 1,
    bottom: spacing.s16,
    elevation: 8,
    left: spacing.s16,
    position: "absolute",
    right: spacing.s16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    padding: spacing.s16,
  },
  emoji: {
    fontSize: typography.size.lg,
    marginRight: spacing.s8,
  },
  mainTextRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  message: {
    color: "#ffffff",
    fontSize: typography.size.md,
    fontWeight: "600",
  },
  subMessage: {
    color: "#ffffff",
    fontSize: typography.size.sm,
    marginTop: spacing.s4,
    opacity: 0.9,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
  },
});
