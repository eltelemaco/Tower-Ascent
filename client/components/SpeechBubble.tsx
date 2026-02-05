import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

interface SpeechBubbleProps {
  message: string;
}

export default function SpeechBubble({ message }: SpeechBubbleProps) {
  return (
    <Animated.View
      entering={SlideInUp.duration(200).springify()}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <ThemedText style={styles.text}>{message}</ThemedText>
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  text: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
  },
  tail: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: GameColors.surface,
  },
});
