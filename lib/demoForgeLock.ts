/**
 * Demo Forge Lock Manager
 *
 * Manages the state of the 80s Forge:
 * - Tracks exactly 9000 total generations
 * - Locks when all seeds are consumed
 * - Prevents new generations after lock
 * - Provides lock status and messaging
 */

import prisma from "./prisma";
import { createDemoForgeStatus, FORGE_LOCKED_MESSAGE } from "./demoMetadata";

/**
 * Get current demo forge lock status
 *
 * @returns Forge status including lock state, seed counts, messages
 */
export async function getDemoForgeLockStatus() {
  try {
    // Get seed pool statistics
    const total = await prisma.demoSeedPool.count();
    const used = await prisma.demoSeedPool.count({
      where: { used: true },
    });
    const available = total - used;
    const percentageUsed = total > 0 ? (used / total) * 100 : 0;

    const stats = {
      total,
      used,
      available,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
    };

    return createDemoForgeStatus(stats);
  } catch (error) {
    console.error("Failed to get forge lock status:", error);
    // Return safe default
    return createDemoForgeStatus({
      total: 9000,
      used: 0,
      available: 9000,
      percentageUsed: 0,
    });
  }
}

/**
 * Check if the demo forge is locked
 * Forge is locked when no seeds remain
 */
export async function isForgeLockedAsync(): Promise<boolean> {
  const status = await getDemoForgeLockStatus();
  return status.isLocked;
}

/**
 * Get forge lock status synchronously (use cached value if available)
 * Falls back to async call if needed
 */
let cachedForgeStatus: {
  timestamp: number;
  status: Awaited<ReturnType<typeof getDemoForgeLockStatus>>;
} | null = null;

const CACHE_TTL_MS = 60000; // Cache for 60 seconds

export async function getForgeStatusCached() {
  const now = Date.now();

  if (cachedForgeStatus && now - cachedForgeStatus.timestamp < CACHE_TTL_MS) {
    return cachedForgeStatus.status;
  }

  const status = await getDemoForgeLockStatus();
  cachedForgeStatus = { timestamp: now, status };
  return status;
}

/**
 * Invalidate forge status cache (call after seed consumption)
 */
export function invalidateForgeCache(): void {
  cachedForgeStatus = null;
}

/**
 * Validate that total demo generations never exceed 9000
 *
 * @param usedCount - Current used seed count
 * @returns true if generation is allowed
 */
export function canGenerateDemoLogo(usedCount: number): boolean {
  return usedCount < 9000;
}

/**
 * Get remaining seeds before forge lock
 */
export async function getRemainingSeeds(): Promise<number> {
  const status = await getDemoForgeLockStatus();
  return status.availableSeeds;
}

/**
 * Get forge lock progress (0-100)
 */
export async function getForgeProgressPercent(): Promise<number> {
  const status = await getDemoForgeLockStatus();
  return status.percentageUsed;
}

/**
 * Get user-friendly forge status message
 */
export async function getForgeStatusMessage(): Promise<string> {
  const status = await getDemoForgeLockStatus();

  if (status.isLocked) {
    return FORGE_LOCKED_MESSAGE;
  }

  const remaining = status.availableSeeds;
  const percent = status.percentageUsed;

  if (remaining === 0) {
    return "🔒 The Forge is locked. All 9000 exclusive seeds have been used.";
  } else if (remaining < 100) {
    return `⚠️ Only ${remaining} unreleased seeds remain!`;
  } else if (percent > 90) {
    return `🔥 Nearly gone: ${remaining} seeds left (${percent.toFixed(1)}% used)`;
  } else if (percent > 75) {
    return `📉 ${remaining} seeds available (${percent.toFixed(1)}% used)`;
  } else {
    return `⚡ ${remaining} unreleased seeds available`;
  }
}

/**
 * Enforce forge lock - prevent generation if locked
 * Call this before attempting to consume a seed
 *
 * @throws Error if forge is locked
 */
export async function enforceForgeNotLocked(): Promise<void> {
  const status = await getDemoForgeLockStatus();

  if (status.isLocked) {
    const error = new Error(FORGE_LOCKED_MESSAGE);
    (error as any).statusCode = 429; // Too Many Requests
    (error as any).isForgeLockedError = true;
    throw error;
  }
}

/**
 * Check if an error is a forge lock error
 */
export function isForgeLockedError(error: unknown): boolean {
  return error instanceof Error && (error as any).isForgeLockedError === true;
}

/**
 * Get detailed forge analytics
 */
export async function getForgeAnalytics() {
  const status = await getDemoForgeLockStatus();

  const details = {
    ...status,
    seedsPerDay: Math.round(status.usedSeeds / getDaysSinceForgeStart()),
    daysToExhaustion:
      status.availableSeeds > 0
        ? Math.ceil(
            status.availableSeeds /
              Math.max(1, status.usedSeeds / getDaysSinceForgeStart()),
          )
        : 0,
  };

  return details;
}

/**
 * Estimate days since forge started (rough calculation)
 */
function getDaysSinceForgeStart(): number {
  // The forge started on a specific date - adjust this as needed
  const forgeStartDate = new Date("2024-01-01"); // Adjust to actual start date
  const daysPassed =
    (Date.now() - forgeStartDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, daysPassed); // At least 1 day to avoid division by zero
}

/**
 * Reset forge for testing (admin only - DO NOT USE IN PRODUCTION)
 */
export async function resetForgeForTesting(): Promise<void> {
  // This should only work in development
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Forge reset only available in development");
  }

  // Mark all seeds as unused
  await prisma.demoSeedPool.updateMany({
    data: {
      used: false,
      usedAt: null,
      usedByUserId: null,
    },
  });

  invalidateForgeCache();
  console.log("⚠️ Demo forge reset (DEVELOPMENT ONLY)");
}

/**
 * Forge status enum
 */
export enum ForgeState {
  AVAILABLE = "available",
  CRITICAL = "critical", // < 100 seeds
  EXHAUSTED = "exhausted", // 0 seeds
}

/**
 * Get forge state enum
 */
export async function getForgeState(): Promise<ForgeState> {
  const status = await getDemoForgeLockStatus();

  if (status.isLocked) {
    return ForgeState.EXHAUSTED;
  } else if (status.availableSeeds < 100) {
    return ForgeState.CRITICAL;
  } else {
    return ForgeState.AVAILABLE;
  }
}

/**
 * Forge state descriptions for UI
 */
export const FORGE_STATE_DESCRIPTIONS: Record<ForgeState, string> = {
  [ForgeState.AVAILABLE]: "The Forge is active with plenty of unreleased seeds",
  [ForgeState.CRITICAL]: "The Forge is running out of seeds - act fast!",
  [ForgeState.EXHAUSTED]:
    "The Forge has locked. All 9000 seeds have been used.",
};

/**
 * Forge state colors for UI
 */
export const FORGE_STATE_COLORS: Record<ForgeState, string> = {
  [ForgeState.AVAILABLE]: "#00ff00", // Green
  [ForgeState.CRITICAL]: "#ff8800", // Orange
  [ForgeState.EXHAUSTED]: "#ff0000", // Red
};
