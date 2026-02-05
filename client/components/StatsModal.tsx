import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface GameStats {
  towersCompleted: number;
  totalBlocksDestroyed: number;
  fastestTime: number | null;
  totalClicks: number;
}

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function StatsModal({ visible, onClose, stats }: StatsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInUp.duration(300).springify()} style={styles.modal}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Your Stats</ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              testID="button-close-stats"
            >
              <Feather name="x" size={24} color={GameColors.textDark} />
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "rgba(255, 107, 53, 0.15)" }]}>
                <Feather name="flag" size={24} color={GameColors.primary} />
              </View>
              <ThemedText style={styles.statValue}>{stats.towersCompleted}</ThemedText>
              <ThemedText style={styles.statLabel}>Towers Completed</ThemedText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "rgba(0, 217, 192, 0.15)" }]}>
                <Feather name="box" size={24} color={GameColors.accent} />
              </View>
              <ThemedText style={styles.statValue}>{stats.totalBlocksDestroyed}</ThemedText>
              <ThemedText style={styles.statLabel}>Blocks Destroyed</ThemedText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "rgba(247, 147, 30, 0.15)" }]}>
                <Feather name="zap" size={24} color={GameColors.secondary} />
              </View>
              <ThemedText style={styles.statValue}>{formatTime(stats.fastestTime)}</ThemedText>
              <ThemedText style={styles.statLabel}>Fastest Time</ThemedText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "rgba(155, 89, 182, 0.15)" }]}>
                <Feather name="mouse-pointer" size={24} color="#9B59B6" />
              </View>
              <ThemedText style={styles.statValue}>
                {stats.totalClicks >= 1000000
                  ? `${(stats.totalClicks / 1000000).toFixed(1)}M`
                  : stats.totalClicks >= 1000
                  ? `${(stats.totalClicks / 1000).toFixed(1)}K`
                  : stats.totalClicks}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Taps</ThemedText>
            </View>
          </View>

          {stats.towersCompleted === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="play-circle" size={48} color={GameColors.textDark} style={{ opacity: 0.3 }} />
              <ThemedText style={styles.emptyStateText}>
                Play your first game to start tracking stats!
              </ThemedText>
            </View>
          ) : null}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    backgroundColor: GameColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.6,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.5,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
