"use server";

/**
 * Server action to store demo logo style on the server
 * Must run server-side because it uses Prisma
 */

import type { LogoResult } from "./logoGenerator";
import prisma from "./prisma";
import { extractStyleFingerprint } from "./demoLogoStyleManager";
import { createDemoMetadata } from "./demoMetadata";

export async function storeLogoDemoStyle(
  seed: string,
  result: LogoResult,
  generatedLogoId?: string,
  rarity?: string,
): Promise<void> {
  // Extract deterministic fingerprint from seed
  // This will produce the same style every time for the same seed
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

    console.log(
      `[storeLogoDemoStyle] Stored demo style for seed ${seed}:`,
      fingerprint,
    );
  } catch (error) {
    console.error("Failed to store demo logo style:", error);
    throw error; // Don't silently fail - let caller know
  }
}
