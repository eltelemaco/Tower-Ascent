import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLICK_REQUIREMENTS = [1, 22, 333, 4444, 55555, 666666, 7777777, 88888888, 999999999];

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

  const showCharacterMessage = useCallback((message: string) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setGameState((prev) => ({ ...prev, characterMessage: message }));
    messageTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({ ...prev, characterMessage: "" }));
    }, 2000);
  }, []);

  const getRandomMessage = () => {
    return CHARACTER_MESSAGES[Math.floor(Math.random() * CHARACTER_MESSAGES.length)];
  };

  const getRandomBonus = (): Bonus => {
    return BONUSES[Math.floor(Math.random() * BONUSES.length)];
  };

  const handleTap = useCallback(() => {
    if (gameState.isPaused || gameState.isVictory || !gameState.isPlaying || gameState.showBonus) return;

    const clickValue = gameState.bonusMultiplier;
    const newClicks = gameState.currentBlockClicks + clickValue;
    const newTotalClicks = gameState.totalClicks + clickValue;

    if (newClicks >= gameState.currentBlockRequired) {
      const newBlocksDestroyed = gameState.blocksDestroyed + 1;
      const newBlocksRemaining = gameState.blocksRemaining - 1;

      if (newBlocksRemaining === 0) {
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
        setGameState((prev) => ({
          ...prev,
          blocksRemaining: newBlocksRemaining,
          currentBlockClicks: 0,
          currentBlockRequired: CLICK_REQUIREMENTS[newBlocksDestroyed],
          totalClicks: newTotalClicks,
          blocksDestroyed: newBlocksDestroyed,
          characterState: "cheer",
          showBonus: true,
          pendingBonus: bonus,
          bonusMultiplier: 1,
        }));
        showCharacterMessage("Block destroyed!");
      }
    } else {
      const progress = newClicks / gameState.currentBlockRequired;
      let characterState: "idle" | "cheer" | "worry" = "idle";
      if (progress > 0.8) characterState = "cheer";
      else if (progress > 0.5) characterState = "idle";
      else if (gameState.blocksRemaining <= 3) characterState = "worry";

      if (Math.random() < 0.03) {
        showCharacterMessage(getRandomMessage());
      }

      setGameState((prev) => ({
        ...prev,
        currentBlockClicks: newClicks,
        totalClicks: newTotalClicks,
        characterState,
      }));
    }
  }, [gameState, stats, showCharacterMessage]);

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

      if (newBlocksRemaining === 0) {
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
    showCharacterMessage("Bonus activated!");
  }, [gameState, stats, showCharacterMessage]);

  const skipBonus = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      showBonus: false,
      pendingBonus: null,
    }));
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      ...defaultGameState,
      isPlaying: true,
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState({
      ...defaultGameState,
      isPlaying: true,
    });
  }, []);

  const goToMenu = useCallback(() => {
    setGameState(defaultGameState);
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
