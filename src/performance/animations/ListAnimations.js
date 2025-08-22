import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";

// Reanimated layout and item animations that run fully on the UI thread.

export const listItemEntering = FadeInDown.duration(220).easing((t) => t);
export const listItemExiting = FadeOutUp.duration(200);
export const listItemLayout = Layout.springify().damping(14).stiffness(120);

// Convenience wrapper to attach to Animated.View
export function withListItemTransitions(Component = Animated.View) {
  return Component;
}
