import React, { useEffect } from "react";
import { Pressable, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { FallingGem as FallingGemType } from "../context/GameContext";
import { GameColors } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FallingGemProps {
  gem: FallingGemType;
  onCollect: (gemId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FallingGem({ gem, onCollect }: FallingGemProps) {
  const translateY = useSharedValue(gem.startY);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(SCREEN_HEIGHT + 100, {
      duration: 3000,
      easing: Easing.linear,
    });
    rotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 200 }),
        withTiming(15, { duration: 400 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <AnimatedPressable
      style={[styles.gem, { left: `${gem.x}%` }, animatedStyle]}
      onPress={() => onCollect(gem.id)}
      testID={`gem-${gem.id}`}
    >
      <Feather name="hexagon" size={36} color={GameColors.gem} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gem: {
    position: "absolute",
    top: 0,
    zIndex: 100,
    padding: 8,
  },
});
