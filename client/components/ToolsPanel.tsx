import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useGame, TOOLS, Tool } from "../context/GameContext";
import { GameColors, Spacing, BorderRadius } from "../constants/theme";

export function ToolsPanel() {
  const { gameState, purchaseTool } = useGame();
  const [showShop, setShowShop] = useState(false);

  const handlePurchase = (tool: Tool) => {
    const success = purchaseTool(tool);
    if (success) {
      setShowShop(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.gemCounter}>
          <Feather name="hexagon" size={18} color={GameColors.gem} />
          <ThemedText style={styles.gemCount}>{gameState.gems}</ThemedText>
        </View>
        
        <Pressable 
          style={styles.shopButton}
          onPress={() => setShowShop(true)}
          testID="button-shop"
        >
          <Feather name="shopping-bag" size={18} color={GameColors.textLight} />
        </Pressable>

        {gameState.activeTool ? (
          <View style={styles.activeTool}>
            <Feather name={gameState.activeTool.icon as any} size={14} color={GameColors.accent} />
            <ThemedText style={styles.activeToolText}>
              {gameState.activeTool.multiplier}x
            </ThemedText>
          </View>
        ) : null}
      </View>

      <Modal
        visible={showShop}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShop(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Tool Shop</ThemedText>
              <View style={styles.modalGems}>
                <Feather name="hexagon" size={18} color={GameColors.gem} />
                <ThemedText style={styles.modalGemCount}>{gameState.gems}</ThemedText>
              </View>
            </View>

            <ScrollView style={styles.toolsList} showsVerticalScrollIndicator={false}>
              {TOOLS.map((tool) => {
                const canAfford = gameState.gems >= tool.cost;
                const isActive = gameState.activeTool?.id === tool.id;
                
                return (
                  <Pressable
                    key={tool.id}
                    style={[
                      styles.toolItem,
                      isActive && styles.toolItemActive,
                      !canAfford && !isActive && styles.toolItemDisabled,
                    ]}
                    onPress={() => canAfford && !isActive && handlePurchase(tool)}
                    disabled={!canAfford || isActive}
                    testID={`tool-${tool.id}`}
                  >
                    <View style={styles.toolIcon}>
                      <Feather 
                        name={tool.icon as any} 
                        size={24} 
                        color={isActive ? GameColors.accent : canAfford ? GameColors.primary : GameColors.textMuted} 
                      />
                    </View>
                    <View style={styles.toolInfo}>
                      <ThemedText style={[styles.toolName, !canAfford && !isActive && styles.toolNameDisabled]}>
                        {tool.name}
                      </ThemedText>
                      <ThemedText style={styles.toolDesc}>{tool.description}</ThemedText>
                    </View>
                    <View style={styles.toolPrice}>
                      {isActive ? (
                        <ThemedText style={styles.activeLabel}>ACTIVE</ThemedText>
                      ) : (
                        <>
                          <Feather name="hexagon" size={14} color={canAfford ? GameColors.gem : GameColors.textMuted} />
                          <ThemedText style={[styles.priceText, !canAfford && styles.priceDisabled]}>
                            {tool.cost}
                          </ThemedText>
                        </>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowShop(false)}
              testID="button-close-shop"
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  gemCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  gemCount: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textLight,
  },
  shopButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTool: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,193,7,0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: GameColors.accent,
  },
  activeToolText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: GameColors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.xl,
    width: "100%",
    maxWidth: 340,
    maxHeight: "80%",
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    color: GameColors.textDark,
  },
  modalGems: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  modalGemCount: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GameColors.gem,
  },
  toolsList: {
    flex: 1,
  },
  toolItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  toolItemActive: {
    backgroundColor: "rgba(255,193,7,0.15)",
    borderWidth: 1,
    borderColor: GameColors.accent,
  },
  toolItemDisabled: {
    opacity: 0.5,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textDark,
  },
  toolNameDisabled: {
    color: GameColors.textMuted,
  },
  toolDesc: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: GameColors.textMuted,
  },
  toolPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GameColors.gem,
  },
  priceDisabled: {
    color: GameColors.textMuted,
  },
  activeLabel: {
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    color: GameColors.accent,
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: GameColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GameColors.textLight,
  },
});
