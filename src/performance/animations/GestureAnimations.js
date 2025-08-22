import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

export function useSwipeToDelete({
  width = 88,
  onDelete,
  onReveal,
  onClose,
  hapticTrigger,
} = {}) {
  const translateX = useSharedValue(0);
  const revealed = useSharedValue(false);
  const threshold = -width * 0.6;

  const gesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .onChange((e) => {
      const next = clamp(translateX.value + e.changeX, -width * 1.2, 0);
      const wasRevealed = revealed.value;
      translateX.value = next;
      if (!wasRevealed && next < threshold) {
        revealed.value = true;
        if (hapticTrigger) runOnJS(hapticTrigger)();
        if (onReveal) runOnJS(onReveal)();
      } else if (wasRevealed && next > threshold) {
        revealed.value = false;
        if (onClose) runOnJS(onClose)();
      }
    })
    .onEnd(() => {
      if (translateX.value < -width) {
        translateX.value = withTiming(-width * 1.4, { duration: 120 }, () => {
          if (onDelete) runOnJS(onDelete)();
        });
      } else if (translateX.value < threshold) {
        translateX.value = withSpring(-width, { damping: 15, stiffness: 160 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 160 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    width,
    opacity: -translateX.value / width,
  }));

  return { gesture, rowStyle, rightActionStyle, translateX, revealed };
}
