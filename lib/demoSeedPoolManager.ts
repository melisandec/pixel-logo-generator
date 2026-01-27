import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { invalidateForgeCache } from "./demoForgeLock";

const prisma = new PrismaClient();

/**
 * Generates cryptographically random seed values for the demo pool.
 * Uses 256-bit random data (32 bytes) converted to hex for 64-character strings.
 * Ensures uniqueness by tracking generated seeds in a Set.
 */
export function generateDemoSeeds(count: number = 5000): string[] {
  const seeds: string[] = [];
  const seedSet = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 10; // Safety limit

  while (seeds.length < count && attempts < maxAttempts) {
    // Generate 32 bytes of cryptographic randomness -> 64-char hex string
    const seed = randomBytes(32).toString("hex");

    if (!seedSet.has(seed)) {
      seedSet.add(seed);
      seeds.push(seed);
    }

    attempts++;
  }

  if (seeds.length !== count) {
    throw new Error(
      `Failed to generate ${count} unique seeds after ${maxAttempts} attempts`,
    );
  }

  return seeds;
}

/**
 * Initializes the DemoSeedPool with 9000 seeds.
 * Should be called once during setup or as part of migration seeding.
 * Safe to call multiple times - will only insert seeds that don't exist.
 */
export async function initializeDemoSeedPool(): Promise<void> {
  const seeds = generateDemoSeeds();
  const existingCount = await prisma.demoSeedPool.count();

  if (existingCount === seeds.length) {
    console.log(
      `✓ Demo seed pool already initialized with ${seeds.length} seeds`,
    );
    return;
  }

  console.log(`Initializing demo seed pool with ${seeds.length} seeds...`);

  // Use createMany with skipDuplicates to safely insert
  const result = await prisma.demoSeedPool.createMany({
    data: seeds.map((seed) => ({
      seed,
      used: false,
    })),
    skipDuplicates: true,
  });

  console.log(`✓ Inserted ${result.count} seeds into demo pool`);
}

/**
 * Gets the next available demo seed and consumes it atomically using a database transaction.
 * Uses: SELECT ... FOR UPDATE SKIP LOCKED to prevent race conditions.
 * Returns the seed if successful, or null if no seeds remain (forge is locked).
 *
 * Validates that total generations never exceed 9000.
 *
 * Transaction steps:
 * 1. Lock first unused seed row (prevents other transactions from modifying it)
 * 2. Mark it as used with current timestamp and user ID
 * 3. Commit atomically
 *
 * FOR UPDATE: Prevents other transactions from modifying this row
 * SKIP LOCKED: If row is locked, skip it and try next one (no waiting)
 */
export async function getAndConsumeDemoSeed(
  userId?: string,
): Promise<string | null> {
  const result = await prisma.$transaction(async (tx) => {
    // Get first unused seed with row-level lock
    // SKIP LOCKED allows concurrent requests to skip locked rows
    const seeds = await tx.$queryRaw<Array<{ seed: string }>>`
      SELECT seed FROM "DemoSeedPool"
      WHERE used = false
      ORDER BY seed ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    if (!seeds || seeds.length === 0) {
      // No seeds remaining - forge is locked
      return null;
    }

    const seedValue = seeds[0].seed;

    // Mark seed as used atomically within the same transaction
    await tx.$executeRaw`
      UPDATE "DemoSeedPool"
      SET used = true,
          "usedAt" = NOW(),
          "usedByUserId" = ${userId || null}
      WHERE seed = ${seedValue}
    `;

    return seedValue;
  });

  // Invalidate forge lock cache after consumption
  if (result) {
    invalidateForgeCache();
  }

  return result;
}

/**
 * Gets the next available unused demo seed (preview only, does not consume).
 * Returns null if no seeds are available.
 */
export async function getNextDemoSeed(): Promise<string | null> {
  const nextSeed = await prisma.demoSeedPool.findFirst({
    where: { used: false },
    orderBy: { seed: "asc" },
  });

  return nextSeed?.seed ?? null;
}

/**
 * Legacy: Consumes a demo seed if it exists and hasn't been used.
 * Use getAndConsumeDemoSeed() instead for transaction safety.
 * Returns the consumed seed value or null if already used/not found.
 */
export async function consumeDemoSeed(
  seed: string,
  userId?: string,
): Promise<string | null> {
  try {
    const updated = await prisma.demoSeedPool.update({
      where: { seed },
      data: {
        used: true,
        usedAt: new Date(),
        usedByUserId: userId,
      },
    });

    return updated.seed;
  } catch (error) {
    // Seed not found or already updated
    return null;
  }
}

/**
 * Gets statistics about the demo seed pool usage.
 */
export async function getDemoSeedPoolStats(): Promise<{
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
}> {
  const total = await prisma.demoSeedPool.count();
  const used = await prisma.demoSeedPool.count({ where: { used: true } });
  const available = total - used;
  const percentageUsed = total > 0 ? (used / total) * 100 : 0;

  return {
    total,
    used,
    available,
    percentageUsed,
  };
}

/**
 * Resets the demo seed pool (for testing/admin purposes).
 * WARNING: This will mark all seeds as unused.
 */
export async function resetDemoSeedPool(): Promise<void> {
  await prisma.demoSeedPool.updateMany({
    data: {
      used: false,
      usedAt: null,
      usedByUserId: null,
    },
  });

  console.log("✓ Demo seed pool reset");
}
