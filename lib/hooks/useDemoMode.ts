import { useCallback } from "react";
import {
  DEMO_PRESET_CONFIG,
  DEMO_PRESET_KEY,
  DEMO_SEED_BASE,
  DEMO_SEED_TOTAL,
} from "@/lib/demoMode";
import { requestAndConsumeDemoSeed } from "@/lib/demoSeedClient";
import { stringToSeed } from "@/lib/logoGenerator";

/**
 * Custom hook for managing demo mode logic
 * Handles seed resolution, consumption, and preset configuration
 */
export function useDemoMode(userUsername?: string) {
  /**
   * Resolve a seed to the demo range (100,000,000 - 100,004,999)
   * If seed is already in demo range, returns it as-is
   * If external seed provided, maps it to demo range using modulo
   * If no seed provided, returns random seed in demo range
   */
  const resolveDemoSeed = useCallback((value?: number) => {
    if (typeof value === "number") {
      // Check if seed is already in demo range
      if (
        value >= DEMO_SEED_BASE &&
        value <= DEMO_SEED_BASE + DEMO_SEED_TOTAL - 1
      ) {
        return value;
      }
      // Map external seed to demo range using modulo
      const index = Math.abs(value) % DEMO_SEED_TOTAL;
      return DEMO_SEED_BASE + index;
    }
    // Return a random seed within demo range
    const randomIndex = Math.floor(Math.random() * DEMO_SEED_TOTAL);
    return DEMO_SEED_BASE + randomIndex;
  }, []);

  /**
   * Get the effective preset key for demo mode
   * Returns DEMO_PRESET_KEY if in demo mode, otherwise returns provided preset
   */
  const getEffectivePreset = useCallback(
    (normalPreset?: string | null): string => {
      // In demo mode, always use demo preset
      return normalPreset || DEMO_PRESET_KEY;
    },
    [],
  );

  /**
   * Consume a seed from the demo seed pool atomically
   * Returns a seed string from the database pool
   * Throws error if pool is exhausted
   */
  const consumeDemoSeed = useCallback(async (): Promise<string | null> => {
    try {
      console.log("[useDemoMode] Requesting demo seed for user:", userUsername);
      const demoSeed = await requestAndConsumeDemoSeed(userUsername);
      console.log(
        "[useDemoMode] Demo seed response:",
        demoSeed,
        "type:",
        typeof demoSeed,
      );

      if (demoSeed) {
        // Return the seed string (will be converted to number by caller)
        return demoSeed;
      } else {
        // Pool exhausted
        console.error("[useDemoMode] Demo seed pool exhausted");
        throw new Error("The 80s Forge has exhausted its unreleased seeds.");
      }
    } catch (error) {
      console.error("[useDemoMode] Error getting demo seed:", error);
      throw error;
    }
  }, [userUsername]);

  return {
    resolveDemoSeed,
    getEffectivePreset,
    consumeDemoSeed,
    DEMO_PRESET_CONFIG,
    DEMO_PRESET_KEY,
  };
}
