import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated";

export const layoutSpring = Layout.springify().damping(14).stiffness(140);
export const fadeIn = FadeIn.duration(180);
export const fadeOut = FadeOut.duration(160);

export function withLayoutTransitions(Component = Animated.View) {
  return Component;
}
