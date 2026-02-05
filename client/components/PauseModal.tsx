import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function PauseModal({ visible, onResume, onRestart, onMainMenu }: PauseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInDown.duration(300).springify()} style={styles.modal}>
          <ThemedText style={styles.title}>Paused</ThemedText>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onResume();
            }}
            testID="button-resume"
          >
            <Feather name="play" size={20} color={GameColors.textLight} />
            <ThemedText style={styles.primaryButtonText}>Resume</ThemedText>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onRestart();
            }}
            testID="button-restart"
          >
            <Feather name="refresh-cw" size={18} color={GameColors.textLight} />
            <ThemedText style={styles.secondaryButtonText}>Restart</ThemedText>
          </Pressable>

          <Pressable
            style={styles.textButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onMainMenu();
            }}
            testID="button-main-menu"
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modal: {
    width: 320,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.primary,
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textLight,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.secondary,
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textLight,
  },
  textButton: {
    padding: Spacing.md,
  },
  textButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.6,
  },
});
