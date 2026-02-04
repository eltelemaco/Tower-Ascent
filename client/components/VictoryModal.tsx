import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface VictoryModalProps {
  visible: boolean;
  timeElapsed: number;
  totalClicks: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function Confetti() {
  const confettiPieces = Array.from({ length: 20 }, (_, i) => i);

  return (
    <View style={styles.confettiContainer}>
      {confettiPieces.map((i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);

  const color = [
    GameColors.primary,
    GameColors.secondary,
    GameColors.accent,
    "#9B59B6",
    "#E91E63",
  ][index % 5];

  const left = (index * 17) % 100;

  useEffect(() => {
    translateY.value = withDelay(
      index * 100,
      withRepeat(
        withSequence(
          withSpring(400, { damping: 10, stiffness: 30 }),
          withSpring(-50, { damping: 20, stiffness: 100 })
        ),
        -1
      )
    );
    translateX.value = withRepeat(
      withSequence(
        withSpring(20, { damping: 5 }),
        withSpring(-20, { damping: 5 })
      ),
      -1,
      true
    );
    rotation.value = withRepeat(
      withSpring(360, { damping: 2, stiffness: 20 }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: color, left: `${left}%` },
        animatedStyle,
      ]}
    />
  );
}

export default function VictoryModal({
  visible,
  timeElapsed,
  totalClicks,
  onPlayAgain,
  onMainMenu,
}: VictoryModalProps) {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
        <Confetti />

        <Animated.View entering={SlideInUp.duration(400).springify()} style={styles.content}>
          <Image
            source={require("../../assets/images/victory-illustration.png")}
            style={styles.illustration}
            resizeMode="contain"
          />

          <ThemedText style={styles.title}>TOWER CLEARED!</ThemedText>
          <ThemedText style={styles.subtitle}>You saved your friend!</ThemedText>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="clock" size={20} color={GameColors.textDark} />
              <ThemedText style={styles.statValue}>{formatTime(timeElapsed)}</ThemedText>
              <ThemedText style={styles.statLabel}>Time</ThemedText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Feather name="mouse-pointer" size={20} color={GameColors.textDark} />
              <ThemedText style={styles.statValue}>{totalClicks.toLocaleString()}</ThemedText>
              <ThemedText style={styles.statLabel}>Taps</ThemedText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Feather name="box" size={20} color={GameColors.textDark} />
              <ThemedText style={styles.statValue}>9</ThemedText>
              <ThemedText style={styles.statLabel}>Blocks</ThemedText>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPlayAgain();
            }}
            testID="button-play-again"
          >
            <Feather name="refresh-cw" size={20} color={GameColors.textLight} />
            <ThemedText style={styles.primaryButtonText}>Play Again</ThemedText>
          </Pressable>

          <Pressable
            style={styles.textButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onMainMenu();
            }}
            testID="button-menu"
          >
            <ThemedText style={styles.textButtonText}>Main Menu</ThemedText>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: GameColors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  confettiPiece: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 36,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.primary,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.7,
    marginTop: Spacing.xs,
    marginBottom: Spacing["2xl"],
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.5,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.primary,
    width: 280,
    height: 56,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textLight,
  },
  textButton: {
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  textButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.6,
  },
});
