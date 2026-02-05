import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const CLICK_REQUIREMENTS = [1, 22, 333, 4444, 55555, 666666, 7777777, 88888888, 999999999];

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  multiplier: number;
}

export const TOOLS: Tool[] = [
  { id: "pickaxe", name: "Pickaxe", description: "2x tap power", icon: "tool", cost: 10, multiplier: 2 },
  { id: "hammer", name: "Hammer", description: "5x tap power", icon: "tool", cost: 25, multiplier: 5 },
  { id: "drill", name: "Drill", description: "10x tap power", icon: "zap", cost: 50, multiplier: 10 },
  { id: "dynamite", name: "Dynamite", description: "25x tap power", icon: "zap", cost: 100, multiplier: 25 },
  { id: "laser", name: "Laser", description: "50x tap power", icon: "zap", cost: 200, multiplier: 50 },
  { id: "nuke", name: "Nuke", description: "100x tap power", icon: "zap", cost: 500, multiplier: 100 },
];

export interface FallingGem {
  id: string;
  x: number;
  startY: number;
}

const BONUSES = [
  { id: "hammer", name: "Power Hammer", description: "Destroys 10% of next block!", icon: "bonus-hammer" },
  { id: "lightning", name: "Lightning Strike", description: "Instant destroy next block!", icon: "bonus-lightning" },
  { id: "double", name: "Double Tap", description: "Each click counts as 2!", icon: "bonus-hammer" },
  { id: "speed", name: "Speed Boost", description: "5 seconds of 5x clicks!", icon: "bonus-lightning" },
];

const CHARACTER_MESSAGES = [
  "You can do it!",
  "Keep tapping!",
  "Almost there!",
  "Great job!",
  "So fast!",
  "Incredible!",
  "My hero!",
  "Freedom awaits!",
  "Don't give up!",
  "Amazing!",
  "Wow!",
  "Keep going!",
  "You're the best!",
  "So strong!",
  "Hooray!",
  "Fantastic!",
  "I believe in you!",
  "Nearly free!",
  "One more push!",
  "Super!",
];

interface GameStats {
  towersCompleted: number;
  totalBlocksDestroyed: number;
  fastestTime: number | null;
  totalClicks: number;
}

interface Bonus {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface GameState {
  blocksRemaining: number;
  currentBlockClicks: number;
  currentBlockRequired: number;
  totalClicks: number;
  blocksDestroyed: number;
  timeElapsed: number;
  isPlaying: boolean;
  isPaused: boolean;
  isVictory: boolean;
  activeBonus: Bonus | null;
  bonusMultiplier: number;
  characterMessage: string;
  characterState: "idle" | "cheer" | "worry";
  showBonus: boolean;
  pendingBonus: Bonus | null;
  soundEnabled: boolean;
  gems: number;
  totalGems: number;
  activeTool: Tool | null;
  fallingGems: FallingGem[];
}

interface GameContextType {
  gameState: GameState;
  stats: GameStats;
  handleTap: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  claimBonus: () => void;
  skipBonus: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  collectGem: (gemId: string) => void;
  purchaseTool: (tool: Tool) => boolean;
}

const defaultGameState: GameState = {
  blocksRemaining: 9,
  currentBlockClicks: 0,
  currentBlockRequired: CLICK_REQUIREMENTS[0],
  totalClicks: 0,
  blocksDestroyed: 0,
  timeElapsed: 0,
  isPlaying: false,
  isPaused: false,
  isVictory: false,
  activeBonus: null,
  bonusMultiplier: 1,
  characterMessage: "",
  characterState: "idle",
  showBonus: false,
  pendingBonus: null,
  soundEnabled: true,
  gems: 0,
  totalGems: 0,
  activeTool: null,
  fallingGems: [],
};

const defaultStats: GameStats = {
  towersCompleted: 0,
  totalBlocksDestroyed: 0,
  fastestTime: null,
  totalClicks: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<string>("");

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isVictory) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isVictory]);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem("gameStats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const saveStats = async (newStats: GameStats) => {
    try {
      await AsyncStorage.setItem("gameStats", JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error("Failed to save stats:", error);
    }
  };

  const playHaptic = useCallback((type: "tap" | "destroy" | "bonus" | "victory") => {
    if (!gameState.soundEnabled) return;
    
    try {
      if (type === "tap") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === "destroy") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (type === "bonus") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === "victory") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      // Haptics may not be available on all platforms
    }
  }, [gameState.soundEnabled]);

  const showCharacterMessage = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    let newMessage = CHARACTER_MESSAGES[Math.floor(Math.random() * CHARACTER_MESSAGES.length)];
    while (newMessage === lastMessageRef.current && CHARACTER_MESSAGES.length > 1) {
      newMessage = CHARACTER_MESSAGES[Math.floor(Math.random() * CHARACTER_MESSAGES.length)];
    }
    lastMessageRef.current = newMessage;
    
    setGameState((prev) => ({ ...prev, characterMessage: newMessage }));
    messageTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({ ...prev, characterMessage: "" }));
    }, 2000);
  }, []);

  const getRandomBonus = (): Bonus | null => {
    if (Math.random() < 0.7) {
      return BONUSES[Math.floor(Math.random() * BONUSES.length)];
    }
    return null;
  };

  const spawnGem = useCallback(() => {
    const gemId = `gem-${Date.now()}-${Math.random()}`;
    const x = 20 + Math.random() * 60;
    const startY = -50;
    
    setGameState((prev) => ({
      ...prev,
      fallingGems: [...prev.fallingGems, { id: gemId, x, startY }],
    }));
    
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        fallingGems: prev.fallingGems.filter((g) => g.id !== gemId),
      }));
    }, 3000);
  }, []);

  const collectGem = useCallback((gemId: string) => {
    playHaptic("bonus");
    setGameState((prev) => ({
      ...prev,
      gems: prev.gems + 1,
      totalGems: prev.totalGems + 1,
      fallingGems: prev.fallingGems.filter((g) => g.id !== gemId),
    }));
  }, [playHaptic]);

  const purchaseTool = useCallback((tool: Tool): boolean => {
    if (gameState.gems < tool.cost) return false;
    
    playHaptic("bonus");
    setGameState((prev) => ({
      ...prev,
      gems: prev.gems - tool.cost,
      activeTool: tool,
    }));
    return true;
  }, [gameState.gems, playHaptic]);

  const handleTap = useCallback(() => {
    if (gameState.isPaused || gameState.isVictory || !gameState.isPlaying || gameState.showBonus) return;

    const toolMultiplier = gameState.activeTool?.multiplier || 1;
    const clickValue = gameState.bonusMultiplier * toolMultiplier;
    const newClicks = gameState.currentBlockClicks + clickValue;
    const newTotalClicks = gameState.totalClicks + clickValue;

    playHaptic("tap");
    
    if (Math.random() < 0.08) {
      spawnGem();
    }

    if (newClicks >= gameState.currentBlockRequired) {
      const newBlocksDestroyed = gameState.blocksDestroyed + 1;
      const newBlocksRemaining = gameState.blocksRemaining - 1;

      playHaptic("destroy");

      if (newBlocksRemaining === 0) {
        playHaptic("victory");
        const newStats: GameStats = {
          towersCompleted: stats.towersCompleted + 1,
          totalBlocksDestroyed: stats.totalBlocksDestroyed + newBlocksDestroyed,
          fastestTime:
            stats.fastestTime === null
              ? gameState.timeElapsed
              : Math.min(stats.fastestTime, gameState.timeElapsed),
          totalClicks: stats.totalClicks + newTotalClicks,
        };
        saveStats(newStats);

        setGameState((prev) => ({
          ...prev,
          blocksRemaining: 0,
          currentBlockClicks: 0,
          totalClicks: newTotalClicks,
          blocksDestroyed: newBlocksDestroyed,
          isVictory: true,
          characterState: "cheer",
        }));
      } else {
        const bonus = getRandomBonus();
        if (bonus) {
          playHaptic("bonus");
        }
        setGameState((prev) => ({
          ...prev,
          blocksRemaining: newBlocksRemaining,
          currentBlockClicks: 0,
          currentBlockRequired: CLICK_REQUIREMENTS[newBlocksDestroyed],
          totalClicks: newTotalClicks,
          blocksDestroyed: newBlocksDestroyed,
          characterState: "cheer",
          showBonus: bonus !== null,
          pendingBonus: bonus,
          bonusMultiplier: 1,
        }));
        showCharacterMessage();
      }
    } else {
      const progress = newClicks / gameState.currentBlockRequired;
      let characterState: "idle" | "cheer" | "worry" = "idle";
      if (progress > 0.8) characterState = "cheer";
      else if (progress > 0.5) characterState = "idle";
      else if (gameState.blocksRemaining <= 3) characterState = "worry";

      if (Math.random() < 0.02) {
        showCharacterMessage();
      }

      setGameState((prev) => ({
        ...prev,
        currentBlockClicks: newClicks,
        totalClicks: newTotalClicks,
        characterState,
      }));
    }
  }, [gameState, stats, showCharacterMessage, playHaptic]);

  const claimBonus = useCallback(() => {
    if (!gameState.pendingBonus) return;

    const bonus = gameState.pendingBonus;
    let newState: Partial<GameState> = {
      showBonus: false,
      pendingBonus: null,
      activeBonus: bonus,
    };

    if (bonus.id === "lightning") {
      const newBlocksDestroyed = gameState.blocksDestroyed + 1;
      const newBlocksRemaining = gameState.blocksRemaining - 1;

      playHaptic("destroy");

      if (newBlocksRemaining === 0) {
        playHaptic("victory");
        const newStats: GameStats = {
          towersCompleted: stats.towersCompleted + 1,
          totalBlocksDestroyed: stats.totalBlocksDestroyed + newBlocksDestroyed,
          fastestTime:
            stats.fastestTime === null
              ? gameState.timeElapsed
              : Math.min(stats.fastestTime, gameState.timeElapsed),
          totalClicks: stats.totalClicks + gameState.totalClicks,
        };
        saveStats(newStats);
        newState = {
          ...newState,
          blocksRemaining: 0,
          isVictory: true,
          blocksDestroyed: newBlocksDestroyed,
        };
      } else {
        newState = {
          ...newState,
          blocksRemaining: newBlocksRemaining,
          currentBlockClicks: 0,
          currentBlockRequired: CLICK_REQUIREMENTS[newBlocksDestroyed],
          blocksDestroyed: newBlocksDestroyed,
        };
      }
    } else if (bonus.id === "hammer") {
      const reduction = Math.floor(gameState.currentBlockRequired * 0.1);
      newState.currentBlockClicks = reduction;
    } else if (bonus.id === "double") {
      newState.bonusMultiplier = 2;
    } else if (bonus.id === "speed") {
      newState.bonusMultiplier = 5;
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, bonusMultiplier: 1, activeBonus: null }));
      }, 5000);
    }

    setGameState((prev) => ({ ...prev, ...newState }));
    showCharacterMessage();
  }, [gameState, stats, showCharacterMessage, playHaptic]);

  const skipBonus = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      showBonus: false,
      pendingBonus: null,
    }));
  }, []);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...defaultGameState,
      isPlaying: true,
      soundEnabled: prev.soundEnabled,
      gems: prev.gems,
      totalGems: prev.totalGems,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState((prev) => ({
      ...defaultGameState,
      isPlaying: true,
      soundEnabled: prev.soundEnabled,
      gems: prev.gems,
      totalGems: prev.totalGems,
    }));
  }, []);

  const goToMenu = useCallback(() => {
    setGameState((prev) => ({
      ...defaultGameState,
      soundEnabled: prev.soundEnabled,
      gems: prev.gems,
      totalGems: prev.totalGems,
    }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setGameState((prev) => ({ ...prev, soundEnabled: enabled }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        stats,
        handleTap,
        startGame,
        pauseGame,
        resumeGame,
        restartGame,
        goToMenu,
        claimBonus,
        skipBonus,
        setSoundEnabled,
        collectGem,
        purchaseTool,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
