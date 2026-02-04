import React from "react";
import { View, StyleSheet, Modal, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface Bonus {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface BonusModalProps {
  visible: boolean;
  bonus: Bonus | null;
  onClaim: () => void;
  onSkip: () => void;
}

const bonusImages: Record<string, any> = {
  "bonus-hammer": require("../../assets/images/bonus-hammer.png"),
  "bonus-lightning": require("../../assets/images/bonus-lightning.png"),
};

export default function BonusModal({ visible, bonus, onClaim, onSkip }: BonusModalProps) {
  const iconScale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      iconScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 4 }),
          withSpring(1, { damping: 4 })
        ),
        -1,
        true
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!bonus) return null;

  const iconSource = bonusImages[bonus.icon] || bonusImages["bonus-hammer"];

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInDown.duration(300).springify()} style={styles.modal}>
          <View style={styles.sparkleContainer}>
            <Feather name="star" size={16} color={GameColors.secondary} style={styles.sparkle1} />
            <Feather name="star" size={12} color={GameColors.accent} style={styles.sparkle2} />
            <Feather name="star" size={14} color={GameColors.primary} style={styles.sparkle3} />
          </View>

          <ThemedText style={styles.label}>BONUS!</ThemedText>

          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Image source={iconSource} style={styles.bonusIcon} resizeMode="contain" />
          </Animated.View>

          <ThemedText style={styles.bonusName}>{bonus.name}</ThemedText>
          <ThemedText style={styles.bonusDescription}>{bonus.description}</ThemedText>

          <Pressable
            style={styles.claimButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClaim();
            }}
            testID="button-claim-bonus"
          >
            <Feather name="gift" size={20} color={GameColors.textLight} />
            <ThemedText style={styles.claimButtonText}>Claim Bonus</ThemedText>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSkip();
            }}
            testID="button-skip-bonus"
          >
            <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modal: {
    width: 320,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    position: "relative",
  },
  sparkleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle1: {
    position: "absolute",
    top: 20,
    left: 30,
  },
  sparkle2: {
    position: "absolute",
    top: 40,
    right: 40,
  },
  sparkle3: {
    position: "absolute",
    bottom: 120,
    left: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GameColors.secondary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(247, 147, 30, 0.1)",
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  bonusIcon: {
    width: 60,
    height: 60,
  },
  bonusName: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
    textAlign: "center",
  },
  bonusDescription: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.7,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.secondary,
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: GameColors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  claimButtonText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textLight,
  },
  skipButton: {
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.5,
  },
});
