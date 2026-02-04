import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

const CLICK_REQUIREMENTS = [1, 22, 333, 4444, 55555, 666666, 7777777, 88888888, 999999999];

interface TowerProps {
  blocksRemaining: number;
  progress: number;
}

interface BlockProps {
  index: number;
  isCurrentBlock: boolean;
  progress: number;
  clicksRequired: number;
}

function Block({ index, isCurrentBlock, progress, clicksRequired }: BlockProps) {
  const blockColor = GameColors.blockColors[index % GameColors.blockColors.length];

  const shake = useSharedValue(0);

  React.useEffect(() => {
    if (isCurrentBlock && progress > 0) {
      shake.value = withSequence(
        withTiming(-2, { duration: 30 }),
        withTiming(2, { duration: 30 }),
        withTiming(0, { duration: 30 })
      );
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: isCurrentBlock ? 1 + progress * 0.02 : 1 },
    ],
  }));

  const crackOpacity = isCurrentBlock ? Math.min(progress * 0.8, 0.7) : 0;

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(index * 50)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[
        styles.block,
        { backgroundColor: blockColor },
        isCurrentBlock && styles.currentBlock,
        animatedStyle,
      ]}
    >
      <View style={[styles.blockFace, styles.blockTop, { backgroundColor: lightenColor(blockColor, 20) }]} />
      <View style={[styles.blockFace, styles.blockRight, { backgroundColor: darkenColor(blockColor, 20) }]} />

      {isCurrentBlock ? (
        <View style={styles.blockContent}>
          <ThemedText style={styles.blockNumber}>
            {formatNumber(clicksRequired)}
          </ThemedText>
          <View style={styles.miniProgress}>
            <View style={[styles.miniProgressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      ) : (
        <View style={styles.blockContent}>
          <ThemedText style={styles.blockNumberSmall}>
            {formatNumber(clicksRequired)}
          </ThemedText>
        </View>
      )}

      {crackOpacity > 0 ? (
        <View style={[styles.crackOverlay, { opacity: crackOpacity }]}>
          <View style={styles.crack1} />
          <View style={styles.crack2} />
          <View style={styles.crack3} />
        </View>
      ) : null}
    </Animated.View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export default function Tower({ blocksRemaining, progress }: TowerProps) {
  const blocksDestroyed = 9 - blocksRemaining;
  const blocks = Array.from({ length: blocksRemaining }, (_, i) => blocksRemaining - 1 - i);

  return (
    <View style={styles.container}>
      <View style={styles.towerWrapper}>
        {blocks.map((blockIndex, arrayIndex) => {
          const actualBlockNumber = blocksDestroyed + arrayIndex;
          const isCurrentBlock = arrayIndex === blocks.length - 1;
          return (
            <Block
              key={`block-${blockIndex}`}
              index={actualBlockNumber}
              isCurrentBlock={isCurrentBlock}
              progress={isCurrentBlock ? progress : 0}
              clicksRequired={CLICK_REQUIREMENTS[actualBlockNumber]}
            />
          );
        })}
      </View>

      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  towerWrapper: {
    alignItems: "center",
  },
  block: {
    width: 100,
    height: 50,
    borderRadius: BorderRadius.sm,
    marginVertical: 2,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  currentBlock: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  blockFace: {
    position: "absolute",
  },
  blockTop: {
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  blockRight: {
    top: 0,
    right: 0,
    width: 8,
    bottom: 0,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  blockContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  blockNumber: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blockNumberSmall: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: "rgba(255,255,255,0.7)",
  },
  miniProgress: {
    width: 60,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 2,
  },
  crackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  crack1: {
    position: "absolute",
    width: 2,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    transform: [{ rotate: "45deg" }],
    left: "30%",
  },
  crack2: {
    position: "absolute",
    width: 2,
    height: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    transform: [{ rotate: "-30deg" }],
    right: "25%",
    top: "20%",
  },
  crack3: {
    position: "absolute",
    width: 2,
    height: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    transform: [{ rotate: "15deg" }],
    left: "50%",
    bottom: "10%",
  },
  ground: {
    width: 140,
    height: 20,
    backgroundColor: "#8B7355",
    borderRadius: BorderRadius.xs,
    marginTop: 4,
  },
});
