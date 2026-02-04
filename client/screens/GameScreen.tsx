import React, { useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gameState, handleTap, pauseGame, resumeGame, restartGame, goToMenu, claimBonus, skipBonus } = useGame();

  const tapScale = useSharedValue(1);
  const tapOpacity = useSharedValue(0);

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

      <AnimatedPressable
        style={[styles.gameArea, tapAreaAnimatedStyle]}
        onPress={onTap}
        testID="tap-area"
      >
        <Animated.View style={[styles.tapFeedback, tapFeedbackStyle]} />

        <View style={styles.characterContainer}>
          {gameState.characterMessage.length > 0 ? (
            <SpeechBubble message={gameState.characterMessage} />
          ) : null}
          <Character state={gameState.characterState} />
        </View>

        <Tower
          blocksRemaining={gameState.blocksRemaining}
          progress={progress}
          currentBlockIndex={currentBlockIndex}
        />
      </AnimatedPressable>

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
