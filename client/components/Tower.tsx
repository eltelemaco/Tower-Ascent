import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

interface TowerProps {
  blocksRemaining: number;
  progress: number;
  currentBlockIndex: number;
}

interface BlockProps {
  row: number;
  col: number;
  blockIndex: number;
  isCurrentBlock: boolean;
  isDestroyed: boolean;
  progress: number;
}

function Block({ row, col, blockIndex, isCurrentBlock, isDestroyed, progress }: BlockProps) {
  const shake = useSharedValue(0);
  const crackLevel = useSharedValue(0);

  React.useEffect(() => {
    if (isCurrentBlock && progress > 0) {
      shake.value = withSequence(
        withTiming(-3, { duration: 30 }),
        withTiming(3, { duration: 30 }),
        withTiming(-2, { duration: 25 }),
        withTiming(2, { duration: 25 }),
        withTiming(0, { duration: 20 })
      );
      crackLevel.value = withTiming(progress, { duration: 100 });
    }
  }, [progress, isCurrentBlock]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: isCurrentBlock ? 1 + progress * 0.03 : 1 },
    ],
  }));

  if (isDestroyed) {
    return <View style={[styles.block, styles.destroyedBlock]} />;
  }

  const baseColor = row === 0 ? "#8B7355" : row === 1 ? "#9B8B7A" : "#A89B8B";
  const highlightColor = row === 0 ? "#9B8365" : row === 1 ? "#AB9B8A" : "#B8AB9B";
  const shadowColor = row === 0 ? "#7B6345" : row === 1 ? "#8B7B6A" : "#988B7B";

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay((row * 3 + col) * 50)}
      layout={Layout.springify()}
      style={[
        styles.block,
        isCurrentBlock && styles.currentBlock,
        animatedStyle,
      ]}
    >
      <View style={[styles.blockBase, { backgroundColor: baseColor }]}>
        <View style={[styles.blockHighlight, { backgroundColor: highlightColor }]} />
        <View style={[styles.blockShadow, { backgroundColor: shadowColor }]} />
        
        <View style={styles.stonePattern}>
          <View style={[styles.stoneLine, { top: "30%", width: "60%", left: "20%" }]} />
          <View style={[styles.stoneLine, { top: "60%", width: "70%", left: "10%" }]} />
          <View style={[styles.stoneVertical, { left: "40%", top: "10%", height: "25%" }]} />
          <View style={[styles.stoneVertical, { left: "55%", top: "55%", height: "30%" }]} />
        </View>

        {isCurrentBlock ? (
          <View style={styles.currentIndicator}>
            <ThemedText style={styles.ordinalText} selectable={false}>{ORDINALS[blockIndex]}</ThemedText>
            <View style={styles.targetIcon}>
              <View style={styles.targetRing} />
              <View style={styles.targetDot} />
            </View>
          </View>
        ) : (
          <View style={styles.blockLabel}>
            <ThemedText style={styles.ordinalTextSmall} selectable={false}>{ORDINALS[blockIndex]}</ThemedText>
          </View>
        )}

        {isCurrentBlock && progress > 0 ? (
          <View style={styles.crackOverlay}>
            {progress > 0.2 ? <View style={[styles.crack, styles.crack1]} /> : null}
            {progress > 0.4 ? <View style={[styles.crack, styles.crack2]} /> : null}
            {progress > 0.6 ? <View style={[styles.crack, styles.crack3]} /> : null}
            {progress > 0.8 ? <View style={[styles.crack, styles.crack4]} /> : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function Tower({ blocksRemaining, progress, currentBlockIndex }: TowerProps) {
  const destroyedCount = 9 - blocksRemaining;

  return (
    <View style={styles.container}>
      <View style={styles.towerTop}>
        <View style={styles.battlement}>
          <View style={styles.merlon} />
          <View style={styles.crenel} />
          <View style={styles.merlon} />
          <View style={styles.crenel} />
          <View style={styles.merlon} />
        </View>
        <View style={styles.flag}>
          <View style={styles.flagPole} />
          <View style={styles.flagBanner} />
        </View>
      </View>

      <View style={styles.towerBody}>
        {[2, 1, 0].map((row) => (
          <View key={row} style={styles.towerRow}>
            {[0, 1, 2].map((col) => {
              const blockIndex = row * 3 + col;
              const isDestroyed = blockIndex < destroyedCount;
              const isCurrentBlock = blockIndex === destroyedCount && blocksRemaining > 0;
              
              return (
                <Block
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  blockIndex={blockIndex}
                  isCurrentBlock={isCurrentBlock}
                  isDestroyed={isDestroyed}
                  progress={isCurrentBlock ? progress : 0}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.foundation}>
        <View style={styles.foundationStone} />
        <View style={styles.grass} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  towerTop: {
    width: 210,
    height: 40,
    backgroundColor: "#7B6B5B",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -2,
    position: "relative",
  },
  battlement: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    position: "absolute",
    top: -15,
    left: 10,
    right: 10,
  },
  merlon: {
    width: 30,
    height: 20,
    backgroundColor: "#8B7B6B",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  crenel: {
    width: 20,
    height: 8,
  },
  flag: {
    position: "absolute",
    top: -40,
    right: 30,
    alignItems: "center",
  },
  flagPole: {
    width: 4,
    height: 35,
    backgroundColor: "#5D4E3D",
    borderRadius: 2,
  },
  flagBanner: {
    position: "absolute",
    top: 5,
    left: 4,
    width: 25,
    height: 18,
    backgroundColor: GameColors.primary,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 6,
  },
  towerBody: {
    backgroundColor: "#6B5B4B",
    padding: 6,
    borderRadius: 4,
  },
  towerRow: {
    flexDirection: "row",
    marginVertical: 3,
  },
  block: {
    width: 64,
    height: 56,
    marginHorizontal: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  destroyedBlock: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(139, 115, 85, 0.3)",
    borderStyle: "dashed",
  },
  currentBlock: {
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  blockBase: {
    flex: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  blockHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  blockShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  stonePattern: {
    ...StyleSheet.absoluteFillObject,
  },
  stoneLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 1,
  },
  stoneVertical: {
    position: "absolute",
    width: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 1,
  },
  blockLabel: {
    zIndex: 10,
  },
  currentIndicator: {
    alignItems: "center",
    zIndex: 10,
  },
  ordinalText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ordinalTextSmall: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.7)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  targetIcon: {
    width: 16,
    height: 16,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  targetRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  targetDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GameColors.primary,
  },
  crackOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  crack: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 1,
  },
  crack1: {
    width: 2,
    height: 18,
    left: "25%",
    top: "10%",
    transform: [{ rotate: "25deg" }],
  },
  crack2: {
    width: 2,
    height: 22,
    right: "30%",
    top: "20%",
    transform: [{ rotate: "-35deg" }],
  },
  crack3: {
    width: 2,
    height: 16,
    left: "45%",
    bottom: "15%",
    transform: [{ rotate: "15deg" }],
  },
  crack4: {
    width: 3,
    height: 28,
    left: "50%",
    top: "5%",
    transform: [{ rotate: "-10deg" }],
  },
  foundation: {
    width: 230,
    alignItems: "center",
    marginTop: -2,
  },
  foundationStone: {
    width: 220,
    height: 16,
    backgroundColor: "#5D4E3D",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  grass: {
    width: 240,
    height: 12,
    backgroundColor: "#6B8E23",
    borderRadius: 6,
    marginTop: -4,
  },
});
