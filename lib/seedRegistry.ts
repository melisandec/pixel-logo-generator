/**
 * Seed Registry System
 *
 * This module manages previously cast seeds to ensure backward compatibility.
 * When new visual enhancements are added, existing logos must remain unchanged.
 *
 * How it works:
 * 1. Query all seeds from the database that were cast before enhancements
 * 2. Store them in a Set for O(1) lookup
 * 3. Skip enhancements for any seed in this registry
 * 4. Apply enhancements only to new seeds
 *
 * This ensures:
 * - Existing logos look exactly the same
 * - New logos get enhanced visual treatments
 * - Complete backward compatibility
 */

import prisma from "./prisma";

// In-memory cache of existing seeds (populated on server startup)
let existingSeedsCache: Set<number> | null = null;
let lastCacheRefresh: Date | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Enhancement version tracking
export const CURRENT_ENHANCEMENT_VERSION = 1;
export const CUTOFF_DATE = new Date("2026-01-20T00:00:00Z"); // Date when enhancements were added

/**
 * Fetch all seeds that were cast before the enhancement cutoff date
 * Results are cached in memory for performance
 */
export async function getExistingSeeds(): Promise<Set<number>> {
  // Return cached data if valid
  if (existingSeedsCache && lastCacheRefresh) {
    const cacheAge = Date.now() - lastCacheRefresh.getTime();
    if (cacheAge < CACHE_TTL_MS) {
      return existingSeedsCache;
    }
  }

  try {
    // Query all seeds from leaderboard entries created before cutoff
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          lt: CUTOFF_DATE,
        },
      },
      select: {
        seed: true,
      },
    });

    // Convert to Set for O(1) lookup
    existingSeedsCache = new Set(
      entries.map((entry: { seed: number }) => entry.seed),
    );
    lastCacheRefresh = new Date();

    console.log(
      `[SeedRegistry] Loaded ${existingSeedsCache.size} existing seeds (pre-enhancement)`,
    );

    return existingSeedsCache;
  } catch (error) {
    console.error("[SeedRegistry] Failed to load existing seeds:", error);
    // Return empty set on error (fail-safe: apply enhancements)
    return new Set<number>();
  }
}

/**
 * Check if a seed existed before enhancements were added
 * Returns true if seed should use legacy rendering (no enhancements)
 */
export async function isLegacySeed(seed: number): Promise<boolean> {
  const existingSeeds = await getExistingSeeds();
  return existingSeeds.has(seed);
}

/**
 * Invalidate the cache (call this when seeds are updated)
 */
export function invalidateSeedCache(): void {
  existingSeedsCache = null;
  lastCacheRefresh = null;
}

/**
 * Add a new seed to the cache (for immediate consistency)
 * Call this after creating a new cast
 */
export function registerNewSeed(seed: number): void {
  if (existingSeedsCache) {
    existingSeedsCache.add(seed);
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  size: number;
  lastRefresh: Date | null;
  age: number;
} {
  return {
    size: existingSeedsCache?.size ?? 0,
    lastRefresh: lastCacheRefresh,
    age: lastCacheRefresh ? Date.now() - lastCacheRefresh.getTime() : 0,
  };
}

/**
 * Preload seeds on server startup (optional, for performance)
 * Call this in your server initialization
 */
export async function preloadSeedCache(): Promise<void> {
  await getExistingSeeds();
  console.log("[SeedRegistry] Seed cache preloaded");
}
