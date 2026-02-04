import React, { useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CharacterProps {
  state: "idle" | "cheer" | "worry";
}

const characterImages = {
  idle: require("../../assets/images/character-idle.png"),
  cheer: require("../../assets/images/character-cheer.png"),
  worry: require("../../assets/images/character-worry.png"),
};

export default function Character({ state }: CharacterProps) {
  const bounce = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (state === "idle") {
      bounce.value = withRepeat(
        withSequence(
          withSpring(-4, { damping: 8, stiffness: 100 }),
          withSpring(0, { damping: 8, stiffness: 100 })
        ),
        -1,
        true
      );
      rotation.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1000 }),
          withTiming(2, { duration: 1000 })
        ),
        -1,
        true
      );
    } else if (state === "cheer") {
      bounce.value = withRepeat(
        withSequence(
          withSpring(-12, { damping: 4, stiffness: 150 }),
          withSpring(0, { damping: 4, stiffness: 150 })
        ),
        3,
        true
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      );
    } else if (state === "worry") {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 100 }),
          withTiming(2, { duration: 100 })
        ),
        -1,
        true
      );
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 150 }),
          withTiming(5, { duration: 150 })
        ),
        -1,
        true
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image source={characterImages[state]} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
