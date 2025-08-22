import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { withSuspense, lazyComponent } from "../utils/bundleOptimization";

function SocialFallback() {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.background,
      }}
    >
      <ActivityIndicator color={c.primary} />
      <Text style={{ color: c.muted, marginTop: 12 }}>
        Loading social feed…
      </Text>
    </View>
  );
}

function SocialErrorBoundary({ error }: { error?: any }) {
  const { themeStyles } = useTheme();
  const c = themeStyles.colors;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.background,
        padding: 16,
      }}
    >
      <Text style={{ color: c.danger, fontWeight: "600", marginBottom: 8 }}>
        Failed to load Social
      </Text>
      <Text style={{ color: c.muted, textAlign: "center" }}>
        {String(error || "Try again later.")}
      </Text>
    </View>
  );
}

type SocialModule = { SocialFeedScreen: React.ComponentType<any> };
const LazySocial = lazyComponent(
  () => import("../screens/social/SocialFeedScreen") as Promise<SocialModule>,
  (m: SocialModule) => m.SocialFeedScreen
);

export default function OptimizedSocialScreen(props: any) {
  const [err] = React.useState<any>(null);
  const Inner = React.useMemo(
    () => withSuspense(LazySocial, SocialFallback),
    []
  );
  return err ? <SocialErrorBoundary error={err} /> : <Inner {...props} />;
}

export function preload() {
  return (LazySocial as any)?.preload?.();
}
