import { useState, useCallback } from "react";
import { Rarity } from "@/lib/logoGenerator";

type SeedCrackStage =
  | "dormant"
  | "stress"
  | "crawl-1"
  | "crawl-2"
  | "fissure"
  | "swell"
  | "shake"
  | "pause"
  | "bloom"
  | "ticket"
  | null;

interface SeedCrackVariance {
  shakeAmp: number;
  crackOffset: number;
  glowHue: number;
  bloomAngle: number;
}

/**
 * Manages seed crack animation sequence state:
 * - Current stage of the animation
 * - Seed being displayed
 * - Rarity being revealed
 * - Variance values for visual effects
 */
export function useSeedCrackAnimation() {
  const [seedCrackValue, setSeedCrackValue] = useState<string | null>(null);
  const [seedCrackStage, setSeedCrackStage] = useState<SeedCrackStage>(null);
  const [seedCrackRarity, setSeedCrackRarity] = useState<Rarity | null>(null);
  const [seedCrackVariance, setSeedCrackVariance] =
    useState<SeedCrackVariance | null>(null);

  const startCrackAnimation = useCallback((seed: string, rarity: Rarity) => {
    setSeedCrackValue(seed);
    setSeedCrackRarity(rarity);
    setSeedCrackStage("dormant");
    setSeedCrackVariance({
      shakeAmp: 0,
      crackOffset: 0,
      glowHue: 0,
      bloomAngle: 0,
    });
  }, []);

  const advanceCrackStage = useCallback((nextStage: SeedCrackStage) => {
    setSeedCrackStage(nextStage);
  }, []);

  const updateCrackVariance = useCallback(
    (variance: Partial<SeedCrackVariance>) => {
      setSeedCrackVariance((prev) => (prev ? { ...prev, ...variance } : null));
    },
    [],
  );

  const resetCrackAnimation = useCallback(() => {
    setSeedCrackValue(null);
    setSeedCrackStage(null);
    setSeedCrackRarity(null);
    setSeedCrackVariance(null);
  }, []);

  return {
    seedCrackValue,
    setSeedCrackValue,
    seedCrackStage,
    setSeedCrackStage,
    seedCrackRarity,
    setSeedCrackRarity,
    seedCrackVariance,
    setSeedCrackVariance,
    startCrackAnimation,
    advanceCrackStage,
    updateCrackVariance,
    resetCrackAnimation,
  };
}
