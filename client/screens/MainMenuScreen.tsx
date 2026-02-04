import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { useGame } from "@/context/GameContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import StatsModal from "@/components/StatsModal";
import SettingsModal from "@/components/SettingsModal";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MainMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { startGame, stats } = useGame();
  const [showStats, setShowStats] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const playButtonScale = useSharedValue(1);
  const characterBounce = useSharedValue(0);

  React.useEffect(() => {
    characterBounce.value = withRepeat(
      withSequence(
        withSpring(-8, { damping: 4, stiffness: 100 }),
        withSpring(0, { damping: 4, stiffness: 100 })
      ),
      -1,
      true
    );
  }, []);

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGame();
    navigation.navigate("Game");
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: characterBounce.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.logoSection}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        <ThemedText style={styles.title}>Tower Rescue</ThemedText>
        <ThemedText style={styles.subtitle}>Save the trapped friend!</ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <AnimatedPressable
          onPress={handlePlayPress}
          onPressIn={() => {
            playButtonScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            playButtonScale.value = withSpring(1);
          }}
          style={[styles.playButton, playButtonAnimatedStyle]}
          testID="button-play"
        >
          <Feather name="play" size={32} color={GameColors.textLight} />
          <ThemedText style={styles.playButtonText}>PLAY</ThemedText>
        </AnimatedPressable>

        <View style={styles.iconButtonsRow}>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowStats(true);
            }}
            testID="button-stats"
          >
            <Feather name="bar-chart-2" size={24} color={GameColors.textDark} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSettings(true);
            }}
            testID="button-settings"
          >
            <Feather name="settings" size={24} color={GameColors.textDark} />
          </Pressable>
        </View>
      </View>

      <Animated.View style={[styles.characterContainer, characterAnimatedStyle]}>
        <Image
          source={require("../../assets/images/character-idle.png")}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </Animated.View>

      <StatsModal visible={showStats} onClose={() => setShowStats(false)} stats={stats} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 42,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.primary,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Nunito_600SemiBold",
    color: GameColors.textDark,
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  buttonSection: {
    alignItems: "center",
  },
  playButton: {
    backgroundColor: GameColors.primary,
    width: 280,
    height: 64,
    borderRadius: BorderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: Spacing.sm,
  },
  playButtonText: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textLight,
    letterSpacing: 2,
  },
  iconButtonsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing["2xl"],
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  characterContainer: {
    position: "absolute",
    bottom: 20,
    right: -20,
  },
  characterImage: {
    width: 140,
    height: 140,
    opacity: 0.3,
  },
});
