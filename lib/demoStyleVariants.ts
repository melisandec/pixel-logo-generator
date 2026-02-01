/**
 * Demo Logo Style Variants
 *
 * Predefined pools for each of the 7 style components.
 * Used to generate deterministic style fingerprints and
 * categorize the visual characteristics of demo logos.
 */

// 12 Color palettes
export const PALETTE_VARIANTS = [
  "neonPinkBlue",
  "magentaCyan",
  "sunsetPurple",
  "electricBlue",
  "laserGreen",
  "hotPinkGold",
  "cyberOrange",
  "vaporTeal",
  "midnightNeon",
  "retroRed",
  "arcadeYellow",
  "ultraviolet",
] as const;

export type PaletteVariant = (typeof PALETTE_VARIANTS)[number];

// 6 Gradient styles
export const GRADIENT_VARIANTS = [
  "horizontal",
  "vertical",
  "diagonal",
  "radial",
  "metallicBand",
  "sunsetFade",
] as const;

export type GradientVariant = (typeof GRADIENT_VARIANTS)[number];

// 4 Glow styles
export const GLOW_VARIANTS = [
  "softNeon",
  "hardNeon",
  "pulseGlow",
  "auraGlow",
] as const;

export type GlowVariant = (typeof GLOW_VARIANTS)[number];

// 4 Chrome styles
export const CHROME_VARIANTS = [
  "mirrorChrome",
  "brushedMetal",
  "rainbowChrome",
  "darkChrome",
] as const;

export type ChromeVariant = (typeof CHROME_VARIANTS)[number];

// 3 Bloom strengths
export const BLOOM_VARIANTS = ["low", "medium", "heavy"] as const;

export type BloomVariant = (typeof BLOOM_VARIANTS)[number];

// 4 Texture types
export const TEXTURE_VARIANTS = [
  "none",
  "grain",
  "halftone",
  "scanlines",
] as const;

export type TextureVariant = (typeof TEXTURE_VARIANTS)[number];

// 4 Lighting angles
export const LIGHTING_VARIANTS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "front",
] as const;

export type LightingVariant = (typeof LIGHTING_VARIANTS)[number];

/**
 * Total combinations: 12 × 6 × 4 × 4 × 3 × 4 × 4 = 9,216 unique styles
 * (5000 demo seeds only use a subset of these)
 */

/**
 * Helper: Select variant by index (deterministic)
 */
export function selectVariantByIndex<T extends readonly any[]>(
  variants: T,
  index: number,
): T[number] {
  return variants[index % variants.length];
}

/**
 * Helper: Get variant index from ID string
 */
export function getVariantIndex(
  variants: readonly string[],
  id: string,
): number {
  return variants.indexOf(id as any);
}

/**
 * All variant pools combined
 */
export const ALL_VARIANT_POOLS = {
  palettes: PALETTE_VARIANTS,
  gradients: GRADIENT_VARIANTS,
  glows: GLOW_VARIANTS,
  chromes: CHROME_VARIANTS,
  blooms: BLOOM_VARIANTS,
  textures: TEXTURE_VARIANTS,
  lightings: LIGHTING_VARIANTS,
} as const;

/**
 * Get total possible style combinations
 */
export function getTotalStyleCombinations(): number {
  return (
    PALETTE_VARIANTS.length *
    GRADIENT_VARIANTS.length *
    GLOW_VARIANTS.length *
    CHROME_VARIANTS.length *
    BLOOM_VARIANTS.length *
    TEXTURE_VARIANTS.length *
    LIGHTING_VARIANTS.length
  );
}

/**
 * Style fingerprint using actual variant names
 */
export interface StyleFingerprint {
  palette: PaletteVariant;
  gradient: GradientVariant;
  glow: GlowVariant;
  chrome: ChromeVariant;
  bloom: BloomVariant;
  texture: TextureVariant;
  lighting: LightingVariant;
}

/**
 * Generate a deterministic style fingerprint from a numeric seed
 * Maps seed to indices in each variant pool using deterministic algorithm
 * This ensures the SAME seed always produces the SAME visual style
 */
export function generateDeterministicFingerprint(
  seed: number,
): StyleFingerprint {
  let hash = seed;

  // Deterministic index generation using seed with LCG algorithm
  const paletteIdx =
    (hash = (hash * 9301 + 49297) % 233280) % PALETTE_VARIANTS.length;
  const gradientIdx =
    (hash = (hash * 9301 + 49297) % 233280) % GRADIENT_VARIANTS.length;
  const glowIdx =
    (hash = (hash * 9301 + 49297) % 233280) % GLOW_VARIANTS.length;
  const chromeIdx =
    (hash = (hash * 9301 + 49297) % 233280) % CHROME_VARIANTS.length;
  const bloomIdx =
    (hash = (hash * 9301 + 49297) % 233280) % BLOOM_VARIANTS.length;
  const textureIdx =
    (hash = (hash * 9301 + 49297) % 233280) % TEXTURE_VARIANTS.length;
  const lightingIdx =
    (hash = (hash * 9301 + 49297) % 233280) % LIGHTING_VARIANTS.length;

  return {
    palette: PALETTE_VARIANTS[paletteIdx],
    gradient: GRADIENT_VARIANTS[gradientIdx],
    glow: GLOW_VARIANTS[glowIdx],
    chrome: CHROME_VARIANTS[chromeIdx],
    bloom: BLOOM_VARIANTS[bloomIdx],
    texture: TEXTURE_VARIANTS[textureIdx],
    lighting: LIGHTING_VARIANTS[lightingIdx],
  };
}

/**
 * Generate a random style fingerprint (legacy)
 * Randomly selects from each of the 7 variant pools
 * Use generateDeterministicFingerprint() for demo mode to ensure reproducibility
 */
export function generateRandomFingerprint(): StyleFingerprint {
  return {
    palette:
      PALETTE_VARIANTS[Math.floor(Math.random() * PALETTE_VARIANTS.length)],
    gradient:
      GRADIENT_VARIANTS[Math.floor(Math.random() * GRADIENT_VARIANTS.length)],
    glow: GLOW_VARIANTS[Math.floor(Math.random() * GLOW_VARIANTS.length)],
    chrome: CHROME_VARIANTS[Math.floor(Math.random() * CHROME_VARIANTS.length)],
    bloom: BLOOM_VARIANTS[Math.floor(Math.random() * BLOOM_VARIANTS.length)],
    texture:
      TEXTURE_VARIANTS[Math.floor(Math.random() * TEXTURE_VARIANTS.length)],
    lighting:
      LIGHTING_VARIANTS[Math.floor(Math.random() * LIGHTING_VARIANTS.length)],
  };
}

/**
 * Example: Generate fingerprint deterministically from a numeric seed
 * Maps seed to indices in each variant pool
 * (Legacy: not used in demo generation, kept for reference)
 */
export function fingerprintFromSeed(seed: number): StyleFingerprint {
  let hash = seed;

  // Deterministic index generation using seed
  const paletteIdx =
    (hash = (hash * 9301 + 49297) % 233280) % PALETTE_VARIANTS.length;
  const gradientIdx =
    (hash = (hash * 9301 + 49297) % 233280) % GRADIENT_VARIANTS.length;
  const glowIdx =
    (hash = (hash * 9301 + 49297) % 233280) % GLOW_VARIANTS.length;
  const chromeIdx =
    (hash = (hash * 9301 + 49297) % 233280) % CHROME_VARIANTS.length;
  const bloomIdx =
    (hash = (hash * 9301 + 49297) % 233280) % BLOOM_VARIANTS.length;
  const textureIdx =
    (hash = (hash * 9301 + 49297) % 233280) % TEXTURE_VARIANTS.length;
  const lightingIdx =
    (hash = (hash * 9301 + 49297) % 233280) % LIGHTING_VARIANTS.length;

  return {
    palette: PALETTE_VARIANTS[paletteIdx],
    gradient: GRADIENT_VARIANTS[gradientIdx],
    glow: GLOW_VARIANTS[glowIdx],
    chrome: CHROME_VARIANTS[chromeIdx],
    bloom: BLOOM_VARIANTS[bloomIdx],
    texture: TEXTURE_VARIANTS[textureIdx],
    lighting: LIGHTING_VARIANTS[lightingIdx],
  };
}

/**
 * Example style fingerprints
 */
export const EXAMPLE_FINGERPRINTS = {
  common: {
    palette: "retroRed" as const,
    gradient: "horizontal" as const,
    glow: "softNeon" as const,
    chrome: "darkChrome" as const,
    bloom: "low" as const,
    texture: "none" as const,
    lighting: "front" as const,
  },
  rare: {
    palette: "neonPinkBlue" as const,
    gradient: "diagonal" as const,
    glow: "hardNeon" as const,
    chrome: "brushedMetal" as const,
    bloom: "medium" as const,
    texture: "grain" as const,
    lighting: "topLeft" as const,
  },
  epic: {
    palette: "ultraviolet" as const,
    gradient: "radial" as const,
    glow: "pulseGlow" as const,
    chrome: "rainbowChrome" as const,
    bloom: "medium" as const,
    texture: "halftone" as const,
    lighting: "topRight" as const,
  },
  legendary: {
    palette: "vaporTeal" as const,
    gradient: "sunsetFade" as const,
    glow: "auraGlow" as const,
    chrome: "mirrorChrome" as const,
    bloom: "heavy" as const,
    texture: "scanlines" as const,
    lighting: "topLeft" as const,
  },
} as const satisfies Record<string, StyleFingerprint>;
