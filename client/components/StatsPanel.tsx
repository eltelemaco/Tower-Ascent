import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface StatsPanelProps {
  timeElapsed: number;
  blocksDestroyed: number;
  clicksRemaining: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function StatsPanel({ timeElapsed, blocksDestroyed, clicksRemaining }: StatsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <Feather name="clock" size={14} color={GameColors.textDark} style={styles.icon} />
        <ThemedText style={styles.statValue}>{formatTime(timeElapsed)}</ThemedText>
      </View>

      <View style={styles.statRow}>
        <Feather name="box" size={14} color={GameColors.textDark} style={styles.icon} />
        <ThemedText style={styles.statValue}>{blocksDestroyed}/9</ThemedText>
      </View>

      <View style={styles.statRow}>
        <Feather name="target" size={14} color={GameColors.primary} style={styles.icon} />
        <ThemedText style={[styles.statValue, styles.highlight]}>{formatNumber(clicksRemaining)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: Spacing.xs,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: Spacing.xs,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textDark,
  },
  highlight: {
    color: GameColors.primary,
  },
});
