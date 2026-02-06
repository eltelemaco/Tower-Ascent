import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { GameColors } from "@/constants/theme";

const CURSOR_SIZE = 26;
const HOTSPOT_OFFSET = { x: 13, y: 20 }; // tip of tool for click point

interface PickaxeCursorProps {
  visible: boolean;
  x: number;
  y: number;
  isTapping: boolean;
}

export function PickaxeCursor({ visible, x, y, isTapping }: PickaxeCursorProps) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isTapping) {
      rotate.value = withSequence(
        withTiming(-25, { duration: 40 }),
        withTiming(5, { duration: 80 }),
        withTiming(0, { duration: 60 })
      );
      scale.value = withSequence(
        withTiming(1.15, { duration: 40 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [isTapping]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -HOTSPOT_OFFSET.x },
      { translateY: -HOTSPOT_OFFSET.y },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  if (Platform.OS !== "web" || !visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          left: x,
          top: y,
        },
      ]}
    >
      <Animated.View style={[styles.cursor, animatedStyle]}>
        <Feather name="tool" size={CURSOR_SIZE} color={GameColors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "fixed" as const,
    width: 1,
    height: 1,
    zIndex: 10000,
    top: 0,
    left: 0,
  },
  cursor: {
    position: "absolute" as const,
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    top: 0,
    left: 0,
  },
});
