import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { GameColors } from "@/constants/theme";

interface CharacterProps {
  state: "idle" | "cheer" | "worry";
}

export default function Character({ state }: CharacterProps) {
  const bodyBounce = useSharedValue(0);
  const armLeftRotation = useSharedValue(0);
  const armRightRotation = useSharedValue(0);
  const headTilt = useSharedValue(0);
  const eyeBlink = useSharedValue(1);
  const mouthWidth = useSharedValue(8);

  useEffect(() => {
    eyeBlink.value = withRepeat(
      withSequence(
        withDelay(2000, withTiming(0.1, { duration: 100 })),
        withTiming(1, { duration: 100 })
      ),
      -1
    );
  }, []);

  useEffect(() => {
    if (state === "idle") {
      bodyBounce.value = withRepeat(
        withSequence(
          withSpring(-3, { damping: 10, stiffness: 80 }),
          withSpring(0, { damping: 10, stiffness: 80 })
        ),
        -1,
        true
      );
      armLeftRotation.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(15, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      armRightRotation.value = withRepeat(
        withSequence(
          withDelay(400, withTiming(20, { duration: 600, easing: Easing.inOut(Easing.ease) })),
          withTiming(-10, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      headTilt.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1000 }),
          withTiming(5, { duration: 1000 })
        ),
        -1,
        true
      );
      mouthWidth.value = withTiming(8, { duration: 200 });
    } else if (state === "cheer") {
      bodyBounce.value = withRepeat(
        withSequence(
          withSpring(-10, { damping: 5, stiffness: 120 }),
          withSpring(0, { damping: 5, stiffness: 120 })
        ),
        4,
        true
      );
      armLeftRotation.value = withRepeat(
        withSequence(
          withTiming(-60, { duration: 150 }),
          withTiming(-40, { duration: 150 })
        ),
        -1,
        true
      );
      armRightRotation.value = withRepeat(
        withSequence(
          withTiming(60, { duration: 150 }),
          withTiming(40, { duration: 150 })
        ),
        -1,
        true
      );
      headTilt.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 150 }),
          withTiming(8, { duration: 150 })
        ),
        -1,
        true
      );
      mouthWidth.value = withTiming(14, { duration: 100 });
    } else if (state === "worry") {
      bodyBounce.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 100 }),
          withTiming(2, { duration: 100 })
        ),
        -1,
        true
      );
      armLeftRotation.value = withTiming(30, { duration: 300 });
      armRightRotation.value = withTiming(-30, { duration: 300 });
      headTilt.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 200 }),
          withTiming(3, { duration: 200 })
        ),
        -1,
        true
      );
      mouthWidth.value = withTiming(5, { duration: 200 });
    }
  }, [state]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bodyBounce.value }],
  }));

  const headStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${headTilt.value}deg` }],
  }));

  const armLeftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${armLeftRotation.value}deg` }],
  }));

  const armRightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${armRightRotation.value}deg` }],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeBlink.value }],
  }));

  const mouthStyle = useAnimatedStyle(() => ({
    width: mouthWidth.value,
  }));

  const eyeColor = state === "worry" ? "#E74C3C" : "#2C3E50";

  return (
    <Animated.View style={[styles.container, bodyStyle]}>
      <Animated.View style={[styles.armLeft, armLeftStyle]}>
        <View style={styles.armSegment} />
        <View style={styles.hand} />
      </Animated.View>

      <Animated.View style={[styles.armRight, armRightStyle]}>
        <View style={styles.armSegment} />
        <View style={styles.hand} />
      </Animated.View>

      <View style={styles.body}>
        <View style={styles.kurta}>
          <View style={styles.kurtaPattern1} />
          <View style={styles.kurtaPattern2} />
          <View style={styles.kurtaPattern3} />
        </View>
      </View>

      <Animated.View style={[styles.head, headStyle]}>
        <View style={styles.face}>
          <View style={styles.turban}>
            <View style={styles.turbanFold1} />
            <View style={styles.turbanFold2} />
            <View style={styles.turbanJewel} />
          </View>

          <View style={styles.eyes}>
            <Animated.View style={[styles.eye, eyeStyle]}>
              <View style={[styles.pupil, { backgroundColor: eyeColor }]} />
              <View style={styles.eyeShine} />
            </Animated.View>
            <Animated.View style={[styles.eye, eyeStyle]}>
              <View style={[styles.pupil, { backgroundColor: eyeColor }]} />
              <View style={styles.eyeShine} />
            </Animated.View>
          </View>

          {state === "worry" ? (
            <View style={styles.eyebrowsWorry}>
              <View style={styles.eyebrowWorryLeft} />
              <View style={styles.eyebrowWorryRight} />
            </View>
          ) : null}

          <View style={styles.nose} />

          <Animated.View style={[styles.mouth, mouthStyle]}>
            {state === "cheer" ? (
              <View style={styles.teeth} />
            ) : null}
          </Animated.View>

          {state === "cheer" ? (
            <>
              <View style={[styles.blush, styles.blushLeft]} />
              <View style={[styles.blush, styles.blushRight]} />
            </>
          ) : null}
        </View>
      </Animated.View>

      <View style={styles.legs}>
        <View style={styles.leg} />
        <View style={styles.leg} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 90,
    alignItems: "center",
  },
  head: {
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  face: {
    width: 36,
    height: 36,
    backgroundColor: "#D4A574",
    borderRadius: 18,
    alignItems: "center",
    position: "relative",
  },
  turban: {
    position: "absolute",
    top: -8,
    width: 40,
    height: 24,
    backgroundColor: GameColors.primary,
    borderRadius: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  turbanFold1: {
    position: "absolute",
    top: 6,
    left: 4,
    width: 32,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  turbanFold2: {
    position: "absolute",
    top: 12,
    left: 6,
    width: 28,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
  },
  turbanJewel: {
    position: "absolute",
    top: 16,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: GameColors.secondary,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  eyes: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },
  eye: {
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  eyeShine: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 2,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  eyebrowsWorry: {
    position: "absolute",
    top: 14,
    left: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrowWorryLeft: {
    width: 8,
    height: 3,
    backgroundColor: "#5D4E3D",
    borderRadius: 2,
    transform: [{ rotate: "-20deg" }],
  },
  eyebrowWorryRight: {
    width: 8,
    height: 3,
    backgroundColor: "#5D4E3D",
    borderRadius: 2,
    transform: [{ rotate: "20deg" }],
  },
  nose: {
    width: 4,
    height: 4,
    backgroundColor: "#C49A6C",
    borderRadius: 2,
    marginTop: 2,
  },
  mouth: {
    height: 4,
    backgroundColor: "#8B4513",
    borderRadius: 4,
    marginTop: 3,
    overflow: "hidden",
  },
  teeth: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: "#FFFFFF",
  },
  blush: {
    position: "absolute",
    width: 6,
    height: 4,
    backgroundColor: "rgba(255, 150, 150, 0.5)",
    borderRadius: 3,
    top: 26,
  },
  blushLeft: {
    left: 2,
  },
  blushRight: {
    right: 2,
  },
  body: {
    position: "absolute",
    top: 32,
    zIndex: 5,
  },
  kurta: {
    width: 30,
    height: 36,
    backgroundColor: GameColors.accent,
    borderRadius: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  kurtaPattern1: {
    position: "absolute",
    top: 4,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  kurtaPattern2: {
    position: "absolute",
    top: 8,
    left: 4,
    width: 6,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  kurtaPattern3: {
    position: "absolute",
    top: 8,
    right: 4,
    width: 6,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  armLeft: {
    position: "absolute",
    top: 36,
    left: 2,
    zIndex: 4,
    transformOrigin: "top center",
  },
  armRight: {
    position: "absolute",
    top: 36,
    right: 2,
    zIndex: 4,
    transformOrigin: "top center",
  },
  armSegment: {
    width: 8,
    height: 22,
    backgroundColor: "#D4A574",
    borderRadius: 4,
  },
  hand: {
    width: 10,
    height: 10,
    backgroundColor: "#D4A574",
    borderRadius: 5,
    marginTop: -2,
    marginLeft: -1,
  },
  legs: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    gap: 4,
    zIndex: 3,
  },
  leg: {
    width: 10,
    height: 18,
    backgroundColor: "#5D4E3D",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
