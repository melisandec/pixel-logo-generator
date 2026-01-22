/**
 * Server-side Logo Generator Wrapper
 *
 * This module provides server-only functions for logo generation with
 * automatic legacy seed detection. Use these functions in API routes
 * to ensure backward compatibility with existing logos.
 */

import {
  generateLogo,
  type LogoConfig,
  type LogoResult,
} from "./logoGenerator";
import { isLegacySeed } from "./seedRegistry";

/**
 * Generate logo with automatic legacy seed detection
 *
 * This wrapper checks if a seed existed before enhancements were added.
 * If it's a legacy seed, enhancements are skipped to preserve the original logo.
 *
 * Usage in API routes:
 * ```typescript
 * import { generateLogoWithRegistry } from '@/lib/logoGeneratorServer';
 *
 * const result = await generateLogoWithRegistry({ text: "Nike", seed: 12345 });
 * ```
 *
 * @param config Logo configuration
 * @param checkRegistry Whether to check seed registry (default: true)
 * @returns Logo result with appropriate enhancement level
 */
export async function generateLogoWithRegistry(
  config: LogoConfig,
  checkRegistry: boolean = true,
): Promise<LogoResult> {
  // Only check registry if explicitly requested and seed is provided
  if (checkRegistry && config.seed) {
    try {
      const isLegacy = await isLegacySeed(config.seed);

      if (isLegacy) {
        console.log(
          `[LogoGenerator] Legacy seed ${config.seed} detected - skipping enhancements`,
        );
        // Force skip enhancements for backward compatibility
        return generateLogo({ ...config, skipEnhancements: true });
      }
    } catch (error) {
      console.warn("[LogoGenerator] Failed to check seed registry:", error);
      // Continue without registry check (fail-safe: apply enhancements to new logos)
    }
  }

  // Generate logo with enhancements for new seeds
  return generateLogo(config);
}

/**
 * Generate logo and register the seed as used (for new casts)
 *
 * Usage when creating a new cast:
 * ```typescript
 * const result = await generateAndRegisterLogo({ text: "Apple", seed: 67890 });
 * // Seed 67890 is now registered and will be treated as legacy in future
 * ```
 */
export async function generateAndRegisterLogo(
  config: LogoConfig,
): Promise<LogoResult> {
  const result = await generateLogoWithRegistry(config, true);

  // Register this seed for future lookups
  if (result.seed) {
    try {
      const { registerNewSeed } = await import("./seedRegistry");
      registerNewSeed(result.seed);
    } catch (error) {
      console.warn("[LogoGenerator] Failed to register new seed:", error);
    }
  }

  return result;
}
