import React, { useCallback, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { useGame } from "@/context/GameContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import Tower from "@/components/Tower";
import Character from "@/components/Character";
import StatsPanel from "@/components/StatsPanel";
import PauseModal from "@/components/PauseModal";
import VictoryModal from "@/components/VictoryModal";
import BonusModal from "@/components/BonusModal";
import SpeechBubble from "@/components/SpeechBubble";
import { FallingGem } from "@/components/FallingGem";
import { ToolsPanel } from "@/components/ToolsPanel";
import { PickaxeCursor } from "@/components/PickaxeCursor";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gameState, handleTap, pauseGame, resumeGame, restartGame, goToMenu, claimBonus, skipBonus, collectGem } = useGame();

  const tapScale = useSharedValue(1);
  const tapOpacity = useSharedValue(0);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOverTapArea, setIsOverTapArea] = useState(false);
  const [cursorTapAnim, setCursorTapAnim] = useState(false);

  const onTap = useCallback(() => {
    if (gameState.isPaused || gameState.isVictory || gameState.showBonus) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    tapScale.value = withSequence(
      withTiming(1.01, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );

    tapOpacity.value = withSequence(
      withTiming(0.15, { duration: 50 }),
      withTiming(0, { duration: 150 })
    );

    if (Platform.OS === "web") {
      setCursorTapAnim(true);
      setTimeout(() => setCursorTapAnim(false), 200);
    }

    handleTap();
  }, [gameState.isPaused, gameState.isVictory, gameState.showBonus, handleTap]);

  const handleGoToMenu = useCallback(() => {
    goToMenu();
    navigation.navigate("MainMenu");
  }, [goToMenu, navigation]);

  const tapAreaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const tapFeedbackStyle = useAnimatedStyle(() => ({
    opacity: tapOpacity.value,
  }));

  const progress = gameState.currentBlockRequired > 0
    ? gameState.currentBlockClicks / gameState.currentBlockRequired
    : 0;

  const clicksRemaining = gameState.currentBlockRequired - gameState.currentBlockClicks;
  const currentBlockIndex = gameState.blocksDestroyed;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
      <View style={styles.header}>
        <ToolsPanel />
        <View style={styles.headerRight}>
          <StatsPanel
            timeElapsed={gameState.timeElapsed}
            blocksDestroyed={gameState.blocksDestroyed}
            clicksRemaining={clicksRemaining}
            currentBlockIndex={currentBlockIndex}
          />
          <Pressable
            style={styles.pauseButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              pauseGame();
            }}
            testID="button-pause"
          >
            <Feather name="pause" size={20} color={GameColors.textDark} />
          </Pressable>
        </View>
      </View>

      {gameState.fallingGems.map((gem) => (
        <FallingGem key={gem.id} gem={gem} onCollect={collectGem} />
      ))}

      <View style={styles.gameArea}>
        <View style={styles.characterContainer}>
          <View style={styles.speechBubbleContainer}>
            {gameState.characterMessage.length > 0 ? (
              <SpeechBubble message={gameState.characterMessage} />
            ) : null}
          </View>
          <Character state={gameState.characterState} />
        </View>

        <AnimatedPressable
          style={[
            styles.towerTapWrapper,
            styles.tapAreaNoSelect,
            tapAreaAnimatedStyle,
            Platform.OS === "web" && isOverTapArea && styles.tapAreaCursorNone,
          ]}
          onPress={onTap}
          onContextMenu={(e) => e?.preventDefault?.()}
          onMouseMove={
            Platform.OS === "web"
              ? (e: { nativeEvent: { clientX: number; clientY: number } }) => {
                  const { clientX, clientY } = e.nativeEvent;
                  setCursorPos({ x: clientX, y: clientY });
                  setIsOverTapArea(true);
                }
              : undefined
          }
          onMouseLeave={Platform.OS === "web" ? () => setIsOverTapArea(false) : undefined}
          testID="tap-area"
        >
          <Animated.View style={[styles.tapFeedback, tapFeedbackStyle]} />
          <Tower
            blocksRemaining={gameState.blocksRemaining}
            progress={progress}
            currentBlockIndex={currentBlockIndex}
          />
        </AnimatedPressable>

        {Platform.OS === "web" && (
          <PickaxeCursor
            visible={isOverTapArea}
            x={cursorPos.x}
            y={cursorPos.y}
            isTapping={cursorTapAnim}
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.clickCounterContainer}>
          <ThemedText style={styles.clickCounterLabel}>TAPS ON CURRENT BLOCK</ThemedText>
          <ThemedText style={styles.clickCounter}>{gameState.currentBlockClicks.toLocaleString()}</ThemedText>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.remainingText}>
            {clicksRemaining.toLocaleString()} taps to go
          </ThemedText>
        </View>

        {gameState.activeBonus ? (
          <View style={styles.activeBonusIndicator}>
            <Feather name="zap" size={16} color={GameColors.secondary} />
            <ThemedText style={styles.activeBonusText}>{gameState.activeBonus.name}</ThemedText>
          </View>
        ) : null}
      </View>

      <PauseModal
        visible={gameState.isPaused}
        onResume={resumeGame}
        onRestart={restartGame}
        onMainMenu={handleGoToMenu}
      />

      <VictoryModal
        visible={gameState.isVictory}
        timeElapsed={gameState.timeElapsed}
        totalClicks={gameState.totalClicks}
        onPlayAgain={restartGame}
        onMainMenu={handleGoToMenu}
      />

      <BonusModal
        visible={gameState.showBonus}
        bonus={gameState.pendingBonus}
        onClaim={claimBonus}
        onSkip={skipBonus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  towerTapWrapper: {
    alignSelf: "center",
    position: "relative",
  },
  tapAreaNoSelect: {
    userSelect: "none",
    // @ts-expect-error - web-only, prevents text/element selection and context menu
    WebkitUserSelect: "none",
  },
  tapAreaCursorNone: {
    cursor: "none",
  },
  tapFeedback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GameColors.accent,
    borderRadius: BorderRadius["2xl"],
  },
  characterContainer: {
    alignItems: "center",
    marginBottom: Spacing.sm,
    zIndex: 10,
  },
  speechBubbleContainer: {
    height: 50,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  clickCounterContainer: {
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  clickCounterLabel: {
    fontSize: 11,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.5,
    letterSpacing: 1,
  },
  clickCounter: {
    fontSize: 42,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.primary,
    marginVertical: Spacing.xs,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GameColors.accent,
    borderRadius: 5,
  },
  remainingText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.6,
    marginTop: Spacing.sm,
  },
  activeBonusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(247, 147, 30, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  activeBonusText: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.secondary,
  },
});
