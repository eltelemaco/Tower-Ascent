import React from "react";
import { View, StyleSheet, Modal, Pressable, Switch, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { useGame } from "@/context/GameContext";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { gameState, setSoundEnabled } = useGame();

  const handleResetProgress = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        performReset();
      }
    } else {
      Alert.alert(
        "Reset Progress",
        "Are you sure you want to reset all progress? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: performReset },
        ]
      );
    }
  };

  const performReset = async () => {
    try {
      await AsyncStorage.removeItem("gameStats");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error("Failed to reset progress:", error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInUp.duration(300).springify()} style={styles.modal}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Settings</ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              testID="button-close-settings"
            >
              <Feather name="x" size={24} color={GameColors.textDark} />
            </Pressable>
          </View>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="smartphone" size={20} color={GameColors.textDark} />
                <View>
                  <ThemedText style={styles.settingLabel}>Sound & Haptics</ThemedText>
                  <ThemedText style={styles.settingDescription}>Vibration feedback on actions</ThemedText>
                </View>
              </View>
              <Switch
                value={gameState.soundEnabled}
                onValueChange={(value) => {
                  setSoundEnabled(value);
                  if (value) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                trackColor={{ false: "#E0E0E0", true: GameColors.accent }}
                thumbColor={GameColors.surface}
                testID="switch-sound"
              />
            </View>
          </View>

          <View style={styles.dangerZone}>
            <Pressable
              style={styles.resetButton}
              onPress={handleResetProgress}
              testID="button-reset-progress"
            >
              <Feather name="trash-2" size={18} color="#E74C3C" />
              <ThemedText style={styles.resetButtonText}>Reset All Progress</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.version}>Tower Rescue v1.0.0</ThemedText>
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
    width: "100%",
    maxWidth: 380,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsList: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GameColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: GameColors.textDark,
    opacity: 0.6,
  },
  dangerZone: {
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: "#E74C3C",
  },
  version: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: GameColors.textDark,
    opacity: 0.4,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
