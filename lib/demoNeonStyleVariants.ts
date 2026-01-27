/**
 * Enforced Neon Demo Style Variants
 *
 * DEMO MODE CONSTRAINT: All demos MUST use:
 * - Neon/vibrant gradients only
 * - High contrast palettes with magenta/cyan/purple dominance
 * - NO muted colors
 *
 * This file enforces stricter variant pools for demo mode exclusivity.
 */

import type {
  PaletteVariant,
  GradientVariant,
  GlowVariant,
  ChromeVariant,
  BloomVariant,
  TextureVariant,
  LightingVariant,
  StyleFingerprint,
} from "./demoStyleVariants";

/**
 * ENFORCED PALETTES (High Contrast + Magenta/Cyan/Purple Dominance)
 *
 * Removed: retroRed, arcadeYellow, vaporTeal (less vibrant)
 * Kept: 9 neon-focused palettes with magenta/cyan/purple emphasis
 */
export const DEMO_NEON_PALETTES: readonly PaletteVariant[] = [
  // Magenta-dominant
  "neonPinkBlue", // Hot magenta + electric blue
  "magentaCyan", // Pure magenta + cyan
  "hotPinkGold", // Hot pink + gold (high contrast)

  // Purple-dominant
  "sunsetPurple", // Purple + warm
  "ultraviolet", // Deep purple + bright

  // Cyan-dominant
  "electricBlue", // Cyan/electric blue
  "cyberOrange", // Cyan + hot orange (extreme contrast)

  // Hybrid neon
  "laserGreen", // Bright green + contrast
  "midnightNeon", // Dark + neon pop
] as const;

/**
 * ENFORCED GRADIENTS (Neon Only)
 *
 * Removed: metallicBand (too metallic, less neon)
 * Kept: 5 dynamic gradient types for neon effect
 */
export const DEMO_NEON_GRADIENTS: readonly GradientVariant[] = [
  "horizontal", // Classic neon stripe
  "vertical", // Vertical neon flow
  "diagonal", // Dynamic diagonal neon
  "radial", // Explosive radial neon burst
  "sunsetFade", // Neon fade gradient
] as const;

/**
 * ENFORCED GLOWS (Maximum Neon Impact)
 *
 * All glow types are neon-friendly, but we prefer the strongest ones
 * Kept: all 4 (all are neon-appropriate for demos)
 */
export const DEMO_NEON_GLOWS: readonly GlowVariant[] = [
  "softNeon", // Subtle glow
  "hardNeon", // Intense edge glow
  "pulseGlow", // Pulsing neon effect
  "auraGlow", // Halos around edges
] as const;

/**
 * ENFORCED CHROMES (Bright Reflective)
 *
 * Kept: 4 (all chromes work with neon)
 * Note: These add shine and reflection to neon
 */
export const DEMO_NEON_CHROMES: readonly ChromeVariant[] = [
  "mirrorChrome", // Reflective mirror
  "rainbowChrome", // Rainbow reflections (VERY neon)
  "brushedMetal", // Metallic sheen
  "darkChrome", // Dark + glossy
] as const;

/**
 * ENFORCED BLOOMS (High Visibility)
 *
 * Removed: "low" (too subtle for neon)
 * Kept: medium + heavy for dramatic neon bloom
 */
export const DEMO_NEON_BLOOMS: readonly BloomVariant[] = [
  "medium", // Good bloom intensity
  "heavy", // Maximum bloom glow
] as const;

/**
 * ENFORCED TEXTURES (Pattern + Neon Mix)
 *
 * Kept: 4 (all textures add drama to neon)
 * Patterns complement neon without muting it
 */
export const DEMO_NEON_TEXTURES: readonly TextureVariant[] = [
  "none", // Pure neon
  "grain", // Vintage grain + neon
  "halftone", // Comic halftone + neon pop
  "scanlines", // CRT scanlines + neon (very retro)
] as const;

/**
 * ENFORCED LIGHTING (Strategic)
 *
 * Kept: all 4 angles work for neon drama
 */
export const DEMO_NEON_LIGHTINGS: readonly LightingVariant[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "front",
] as const;

/**
 * Generate enforced neon style fingerprint
 *
 * Randomly selects from ENFORCED pools only.
 * Guarantees all demos have neon gradients, high contrast, magenta/cyan/purple.
 */
export function generateNeonFingerprint(): StyleFingerprint {
  return {
    palette:
      DEMO_NEON_PALETTES[Math.floor(Math.random() * DEMO_NEON_PALETTES.length)],
    gradient:
      DEMO_NEON_GRADIENTS[
        Math.floor(Math.random() * DEMO_NEON_GRADIENTS.length)
      ],
    glow: DEMO_NEON_GLOWS[Math.floor(Math.random() * DEMO_NEON_GLOWS.length)],
    chrome:
      DEMO_NEON_CHROMES[Math.floor(Math.random() * DEMO_NEON_CHROMES.length)],
    bloom:
      DEMO_NEON_BLOOMS[Math.floor(Math.random() * DEMO_NEON_BLOOMS.length)],
    texture:
      DEMO_NEON_TEXTURES[Math.floor(Math.random() * DEMO_NEON_TEXTURES.length)],
    lighting:
      DEMO_NEON_LIGHTINGS[
        Math.floor(Math.random() * DEMO_NEON_LIGHTINGS.length)
      ],
  };
}

/**
 * Validate that a style fingerprint meets demo neon requirements
 *
 * @param style - Style to validate
 * @returns true if style meets all neon constraints
 */
export function isValidNeonDemoStyle(style: StyleFingerprint): boolean {
  return (
    (DEMO_NEON_PALETTES as readonly any[]).includes(style.palette) &&
    (DEMO_NEON_GRADIENTS as readonly any[]).includes(style.gradient) &&
    (DEMO_NEON_GLOWS as readonly any[]).includes(style.glow) &&
    (DEMO_NEON_CHROMES as readonly any[]).includes(style.chrome) &&
    (DEMO_NEON_BLOOMS as readonly any[]).includes(style.bloom) &&
    (DEMO_NEON_TEXTURES as readonly any[]).includes(style.texture) &&
    (DEMO_NEON_LIGHTINGS as readonly any[]).includes(style.lighting)
  );
}

/**
 * Enforce neon constraints on arbitrary style
 *
 * If a style doesn't meet constraints, replace invalid variants
 * with random valid ones.
 *
 * @param style - Style to enforce
 * @returns Style with all constraints applied
 */
export function enforceNeonConstraints(
  style: StyleFingerprint,
): StyleFingerprint {
  return {
    palette: (DEMO_NEON_PALETTES as readonly any[]).includes(style.palette)
      ? style.palette
      : DEMO_NEON_PALETTES[
          Math.floor(Math.random() * DEMO_NEON_PALETTES.length)
        ],
    gradient: (DEMO_NEON_GRADIENTS as readonly any[]).includes(style.gradient)
      ? style.gradient
      : DEMO_NEON_GRADIENTS[
          Math.floor(Math.random() * DEMO_NEON_GRADIENTS.length)
        ],
    glow: (DEMO_NEON_GLOWS as readonly any[]).includes(style.glow)
      ? style.glow
      : DEMO_NEON_GLOWS[Math.floor(Math.random() * DEMO_NEON_GLOWS.length)],
    chrome: (DEMO_NEON_CHROMES as readonly any[]).includes(style.chrome)
      ? style.chrome
      : DEMO_NEON_CHROMES[Math.floor(Math.random() * DEMO_NEON_CHROMES.length)],
    bloom: (DEMO_NEON_BLOOMS as readonly any[]).includes(style.bloom)
      ? style.bloom
      : DEMO_NEON_BLOOMS[Math.floor(Math.random() * DEMO_NEON_BLOOMS.length)],
    texture: (DEMO_NEON_TEXTURES as readonly any[]).includes(style.texture)
      ? style.texture
      : DEMO_NEON_TEXTURES[
          Math.floor(Math.random() * DEMO_NEON_TEXTURES.length)
        ],
    lighting: (DEMO_NEON_LIGHTINGS as readonly any[]).includes(style.lighting)
      ? style.lighting
      : DEMO_NEON_LIGHTINGS[
          Math.floor(Math.random() * DEMO_NEON_LIGHTINGS.length)
        ],
  };
}

/**
 * Get total possible DEMO NEON style combinations
 *
 * Reduced from 9,216 to 1,800 with enforced constraints:
 * 9 palettes × 5 gradients × 4 glows × 4 chromes × 2 blooms × 4 textures × 4 lightings = 1,800
 */
export function getTotalNeonCombinations(): number {
  return (
    DEMO_NEON_PALETTES.length *
    DEMO_NEON_GRADIENTS.length *
    DEMO_NEON_GLOWS.length *
    DEMO_NEON_CHROMES.length *
    DEMO_NEON_BLOOMS.length *
    DEMO_NEON_TEXTURES.length *
    DEMO_NEON_LIGHTINGS.length
  );
}

/**
 * Palette description for UI
 */
export function getPaletteDescription(palette: PaletteVariant): string {
  const descriptions: Record<PaletteVariant, string> = {
    neonPinkBlue: "Hot Magenta + Electric Blue",
    magentaCyan: "Pure Magenta + Cyan",
    sunsetPurple: "Purple + Warm Glow",
    electricBlue: "Cyan Electric Blue",
    laserGreen: "Bright Neon Green",
    hotPinkGold: "Hot Pink + Gold (High Contrast)",
    cyberOrange: "Cyan + Hot Orange (Extreme)",
    vaporTeal: "Vaporwave Teal (Soft Neon)", // Still in original for backwards compat
    midnightNeon: "Dark + Neon Pop",
    retroRed: "Retro Red (Muted - avoid)", // Still in original
    arcadeYellow: "Arcade Yellow (Muted - avoid)", // Still in original
    ultraviolet: "Deep Purple + Bright",
  };
  return descriptions[palette] || "Neon variant";
}

/**
 * Summary stats for demo neon constraints
 */
export const NEON_CONSTRAINTS_SUMMARY = {
  totalPalettes: DEMO_NEON_PALETTES.length,
  totalGradients: DEMO_NEON_GRADIENTS.length,
  totalGlows: DEMO_NEON_GLOWS.length,
  totalChromes: DEMO_NEON_CHROMES.length,
  totalBlooms: DEMO_NEON_BLOOMS.length,
  totalTextures: DEMO_NEON_TEXTURES.length,
  totalLightings: DEMO_NEON_LIGHTINGS.length,
  totalCombinations: getTotalNeonCombinations(),
  constraints: [
    "✨ Neon gradients only (no muted)",
    "🎨 High contrast palettes",
    "💜 Magenta/Cyan/Purple dominance",
    "🚫 NO muted colors",
    "🌟 Medium-to-heavy bloom (high visibility)",
  ],
} as const;
