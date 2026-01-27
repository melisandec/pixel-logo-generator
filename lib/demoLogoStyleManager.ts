/**
 * Utilities for capturing and storing demo logo style fingerprints
 * Enables reproduction of 80s exclusive logos with random style variants
 */

import type { LogoResult } from "./logoGenerator";
import prisma from "./prisma";
import {
  generateRandomFingerprint,
  type StyleFingerprint,
} from "./demoStyleVariants";
import {
  generateNeonFingerprint,
  enforceNeonConstraints,
  isValidNeonDemoStyle,
} from "./demoNeonStyleVariants";
import {
  createDemoMetadata,
  addDemoMetadataToLogo,
  DEMO_CONSTRAINTS,
} from "./demoMetadata";

/**
 * Extracts a style fingerprint from a generated logo result
 * ENFORCED: All demo logos use neon gradients, high contrast palettes,
 * magenta/cyan/purple dominance, and NO muted colors
 */
export function extractStyleFingerprint(result: LogoResult): StyleFingerprint {
  // DEMO MODE CONSTRAINT: Generate ONLY neon-friendly styles
  // Each demo generation gets a unique random combination from the ENFORCED neon pools:
  // - 9 high-contrast palettes (magenta/cyan/purple dominant)
  // - 5 neon gradients only
  // - 4 neon glows
  // - 4 bright chromes
  // - 2 blooms (medium-heavy only, no subtle blooms)
  // - 4 textures
  // - 4 lighting angles
  // Total: 1,800 unique neon combinations (down from 9,216)
  const fingerprint = generateNeonFingerprint();

  // Double-check constraints are met (safety validation)
  if (!isValidNeonDemoStyle(fingerprint)) {
    return enforceNeonConstraints(fingerprint);
  }

  return fingerprint;
}

/**
 * Stores a demo logo with both style fingerprint AND exclusivity metadata
 * Links seed to style variants and marks as 80s exclusive
 */
export async function storeDemoLogoStyle(
  seed: string,
  result: LogoResult,
  generatedLogoId?: string,
  rarity?: string,
): Promise<void> {
  const fingerprint = extractStyleFingerprint(result);

  try {
    // Store style fingerprint
    await prisma.demoLogoStyle.create({
      data: {
        seed,
        palette: fingerprint.palette,
        gradient: fingerprint.gradient,
        glow: fingerprint.glow,
        chrome: fingerprint.chrome,
        bloom: fingerprint.bloom,
        texture: fingerprint.texture,
        lighting: fingerprint.lighting,
        generatedLogoId: generatedLogoId || undefined,
      },
    });

    // Update GeneratedLogo with demo metadata if it exists
    if (generatedLogoId) {
      const demoMetadata = createDemoMetadata(seed, rarity);
      await prisma.generatedLogo.update({
        where: { id: generatedLogoId },
        data: {
          metadata: demoMetadata as any, // Prisma Json type
        },
      });
    }
  } catch (error) {
    // Log but don't throw - style storage is non-critical
    console.warn("Failed to store demo logo style:", error);
  }
}

/**
 * Create logo data with demo metadata included
 * Use when creating a new GeneratedLogo entry
 */
export function createDemoLogoData(
  baseData: Record<string, unknown>,
  seed: string,
  rarity?: string,
): Record<string, unknown> {
  return addDemoMetadataToLogo(baseData, seed, rarity);
}

/**
 * Retrieves a stored demo logo style by seed
 * Used to reproduce exact style when displaying from gallery
 */
export async function getDemoLogoStyle(seed: string) {
  try {
    return await prisma.demoLogoStyle.findUnique({
      where: { seed },
    });
  } catch (error) {
    console.warn("Failed to retrieve demo logo style:", error);
    return null;
  }
}

/**
 * Gets all demo logo styles created by a user (via generatedLogoId)
 * Useful for user gallery of 80s exclusive logos
 */
export async function getUserDemoLogoStyles(generatedLogoId: string[]) {
  try {
    return await prisma.demoLogoStyle.findMany({
      where: {
        generatedLogoId: {
          in: generatedLogoId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.warn("Failed to retrieve user demo logo styles:", error);
    return [];
  }
}

/**
 * Gets statistics about demo logo styles
 * Tracks which variant combinations are most commonly generated
 */
export async function getDemoLogoStyleStats() {
  try {
    const total = await prisma.demoLogoStyle.count();

    const paletteStats = await prisma.demoLogoStyle.groupBy({
      by: ["palette"],
      _count: true,
      orderBy: {
        _count: {
          palette: "desc",
        },
      },
      take: 10,
    });

    const glowStats = await prisma.demoLogoStyle.groupBy({
      by: ["glow"],
      _count: true,
      orderBy: {
        _count: {
          glow: "desc",
        },
      },
      take: 10,
    });

    const chromeStats = await prisma.demoLogoStyle.groupBy({
      by: ["chrome"],
      _count: true,
      orderBy: {
        _count: {
          chrome: "desc",
        },
      },
      take: 10,
    });

    const lightingStats = await prisma.demoLogoStyle.groupBy({
      by: ["lighting"],
      _count: true,
      orderBy: {
        _count: {
          lighting: "desc",
        },
      },
      take: 10,
    });

    return {
      total,
      topPalettes: paletteStats,
      topGlows: glowStats,
      topChromes: chromeStats,
      topLightings: lightingStats,
    };
  } catch (error) {
    console.warn("Failed to get demo logo style stats:", error);
    return {
      total: 0,
      topPalettes: [],
      topGlows: [],
      topChromes: [],
      topLightings: [],
    };
  }
}

/**
 * Get all styles matching specific variant(s)
 * Useful for finding logos with specific palette, glow, etc.
 */
export async function findStylesByVariant(
  variant: keyof StyleFingerprint,
  value: string,
) {
  try {
    const where: Record<string, string> = { [variant]: value };
    return await prisma.demoLogoStyle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.warn(`Failed to find styles with ${variant}:${value}:`, error);
    return [];
  }
}
