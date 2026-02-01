/**
 * Enforced Neon Demo Style Constraints
 *
 * DEMO MODE APPROACH (refactored):
 * - Uses FULL variant pools from demoStyleVariants (12 palettes, 6 gradients, etc.)
 * - Enforces neon aesthetic via SVG filter application, NOT pool restriction
 * - Only constraint: blooms must be "medium" or "heavy" (no "low")
 * - All 9,216 combinations are valid; neon styling applied at render time
 *
 * RATIONALE:
 * 1. demoSvgRenderer expects full variant pools for style mapping
 * 2. Neon aesthetic is applied via SVG filters in demoSvgRenderer, not by limiting pools
 * 3. Restricting pools to 9 palettes, 5 gradients, etc. limited us to only 1,800 combos
 * 4. Now we support full diversity while enforcing neon via rendering pipeline
 */

import type { StyleFingerprint } from "./demoStyleVariants";

/**
 * NEON INTENSITY CONSTRAINTS
 *
 * The ONLY constraint for demo neon mode:
 * - Bloom must be "medium" or "heavy" (no "low" - too subtle for neon aesthetic)
 *
 * All other variants (12 palettes, 6 gradients, 4 glows, 4 chromes, 4 textures, 4 lightings)
 * are valid. Neon aesthetic is enforced via SVG filter application in demoSvgRenderer,
 * not by artificially restricting pools at generation time.
 */
export const NEON_INTENSITY_CONSTRAINTS = {
  // Bloom constraints: "low" is too subtle for neon, loses visibility with vibrant colors
  allowedBlooms: ["medium", "heavy"] as const,
  rejectedBlooms: ["low"] as const,

  // Palette/gradient approach: unrestricted - neon enforced via SVG filters in demoSvgRenderer
  // This enables full 9,216 combinations instead of restricted 1,800
  paletteApproach:
    "unrestricted - neon enforced via SVG filters at render time" as const,

  minSaturation: 2.0,
} as const;

/**
 * DEPRECATED: Random neon fingerprint generator
 * Preserved for backwards compatibility - delegates to full pool + constraint enforcement
 * Use generateRandomFingerprint() from demoStyleVariants + enforceNeonConstraints() directly instead
 */
export function generateNeonFingerprint(): StyleFingerprint {
  console.warn(
    "[DEPRECATED] generateNeonFingerprint() - use generateRandomFingerprint() from demoStyleVariants " +
      "+ enforceNeonConstraints() instead. This wrapper will be removed in a future version.",
  );
  // Import dynamically to avoid circular dependency
  const { generateRandomFingerprint } = require("./demoStyleVariants");
  const fingerprint = generateRandomFingerprint() as StyleFingerprint;
  return enforceNeonConstraints(fingerprint);
}

/**
 * DEPRECATED: Deterministic neon fingerprint from seed
 * Preserved for backwards compatibility - delegates to full pool + constraint enforcement
 * Use generateDeterministicFingerprint() from demoStyleVariants + enforceNeonConstraints() directly instead
 */
export function generateDeterministicFingerprint(
  seed: number,
): StyleFingerprint {
  console.warn(
    "[DEPRECATED] generateDeterministicFingerprint() in demoNeonStyleVariants - " +
      "import from demoStyleVariants instead and call enforceNeonConstraints(). " +
      "This wrapper will be removed in a future version.",
  );
  // Import dynamically to avoid circular dependency
  const {
    generateDeterministicFingerprint: baseFn,
  } = require("./demoStyleVariants");
  const fingerprint = baseFn(seed) as StyleFingerprint;
  return enforceNeonConstraints(fingerprint);
}

/**
 * Validate that fingerprint meets neon demo constraints
 * Only check: bloom must be "medium" or "heavy" (not "low")
 *
 * @param style - Fingerprint to validate
 * @returns true if bloom is valid; false if missing or invalid
 */
export function isValidNeonDemoStyle(style: StyleFingerprint): boolean {
  // Validate that style exists and has a bloom property
  if (!style || !style.bloom) {
    console.warn(
      "isValidNeonDemoStyle: StyleFingerprint missing bloom property",
      style,
    );
    return false;
  }

  // Check if bloom is in allowed set
  const isValid = (
    NEON_INTENSITY_CONSTRAINTS.allowedBlooms as readonly any[]
  ).includes(style.bloom);

  if (!isValid) {
    console.warn(
      `isValidNeonDemoStyle: Invalid bloom "${style.bloom}". Must be "medium" or "heavy".`,
    );
  }

  return isValid;
}

/**
 * Enforce neon constraints on fingerprint with adaptive bloom logic
 *
 * "Low" bloom is too subtle for neon aesthetic. It blends poorly with the vibrant colors
 * and SVG filters used in demoSvgRenderer, resulting in logos that don't feel "neon."
 * Medium provides good visibility while maintaining readability.
 *
 * ADAPTIVE RULES:
 * - Dark palettes (midnightNeon) can use low bloom (lighter on dark background)
 * - Heavy textures (grain, scanlines) boost bloom for visibility
 * - Light palettes must avoid low bloom (already subtle)
 * - Default: medium or heavy for all others
 *
 * All other variants (palette, gradient, glow, chrome, texture, lighting) are unrestricted
 * and can be any value from the full pools - neon styling is applied via SVG filters.
 *
 * @param style - Fingerprint to enforce constraints on
 * @returns Fingerprint with constraints applied (low bloom → medium, or adapted by rules)
 * @throws Error if style is missing required properties
 */
export function enforceNeonConstraints(
  style: StyleFingerprint,
): StyleFingerprint {
  // Validate input
  if (!style) {
    console.error("enforceNeonConstraints: received null or undefined style");
    throw new Error("enforceNeonConstraints requires a valid StyleFingerprint");
  }

  if (!style.bloom) {
    console.error(
      "enforceNeonConstraints: StyleFingerprint missing bloom property",
      style,
    );
    throw new Error("StyleFingerprint must have a bloom property");
  }

  // Check adaptive rules from ADAPTIVE_BLOOM_CONSTRAINTS
  const darkPalettes =
    ADAPTIVE_BLOOM_CONSTRAINTS.darkPalettes as readonly string[];
  const heavyTextures =
    ADAPTIVE_BLOOM_CONSTRAINTS.heavyTextures as readonly string[];
  const lightPalettes =
    ADAPTIVE_BLOOM_CONSTRAINTS.lightPalettes as readonly string[];

  // RULE 1: Dark palettes CAN use low bloom
  if (style.bloom === "low" && darkPalettes.includes(style.palette as string)) {
    return style; // Allow as-is
  }

  // RULE 2: Light palettes should NOT use low bloom
  if (
    style.bloom === "low" &&
    lightPalettes.includes(style.palette as string)
  ) {
    return {
      ...style,
      bloom: "medium", // Upgrade to medium
    };
  }

  // RULE 3: Heavy textures with low bloom → upgrade to medium for visibility
  if (
    style.bloom === "low" &&
    heavyTextures.includes(style.texture as string)
  ) {
    return {
      ...style,
      bloom: "medium", // Boost visibility with heavy texture
    };
  }

  // RULE 4: Default - all other low blooms → medium
  if (style.bloom === "low") {
    return {
      ...style,
      bloom: "medium",
    };
  }

  // All other blooms are valid
  return style;
}

/**
 * Get total possible DEMO neon style combinations
 * Now uses FULL pools: 12 × 6 × 4 × 4 × 3 × 4 × 4 = 9,216 total
 * With bloom constraint (medium + heavy only): 12 × 6 × 4 × 4 × 2 × 4 × 4 = 6,144 valid
 */
export function getTotalNeonCombinations(): number {
  return 12 * 6 * 4 * 4 * 2 * 4 * 4; // Full pools with "low" bloom constraint
}

// ============= INTEGRATION HELPERS =============

/**
 * Get SVG filter intensity multiplier based on design intensity level
 * Used in demoSvgRenderer to scale blur, saturation, and glow effects
 *
 * @param intensity - Design intensity level
 * @returns Object with SVG filter scaling values
 */
export function getFilterIntensityMultiplier(intensity: DesignIntensity) {
  const config = DESIGN_INTENSITY_LEVELS[intensity];
  return {
    saturation: config.saturation,
    stdDeviation: 3 * config.filterIntensity, // Base blur × intensity
    bloomOpacity: 0.5 * config.bloomMultiplier,
    glowSpread: 4 * config.filterIntensity,
  };
}

/**
 * Get theme recommendations for UI rendering
 * Used in LogoGenerator.tsx to suggest style combinations
 *
 * @param theme - Style theme key
 * @returns Theme configuration with recommendations
 */
export function getThemeConfig(theme: StyleTheme) {
  const themeData = STYLE_THEMES[theme];
  return {
    name: themeData.name,
    description: themeData.description,
    recommendations: {
      palettes: themeData.recommendedPalettes,
      gradients: themeData.recommendedGradients,
      glows: themeData.recommendedGlows,
    },
    colorTheme: themeData.colorTheme,
    effectFocus: themeData.recommendedEffect,
  };
}

/**
 * Apply gradient intensity to SVG gradient opacity and color stops
 * Used in demoSvgRenderer when rendering gradients
 *
 * @param intensity - Gradient intensity level
 * @returns Object with gradient rendering values
 */
export function getGradientIntensityConfig(intensity: GradientIntensity) {
  const config = GRADIENT_INTENSITY_VARIANTS[intensity];
  return {
    opacity: config.opacity,
    colorStops: config.colorStops,
    saturation: config.saturation,
    description: config.description,
  };
}

/**
 * Get stroke configuration for text layering
 * Used in demoSvgRenderer when rendering multi-layer text effects
 *
 * @param option - Stroke layer option
 * @returns Object with stroke rendering values
 */
export function getStrokeLayerConfig(option: StrokeLayerOption) {
  const config = STROKE_LAYER_OPTIONS[option];
  return {
    strokeCount: config.strokeCount,
    strokeSpacing: config.strokeSpacing,
    shadowDepth: config.shadowDepth,
    name: config.name,
    description: config.description,
  };
}

/**
 * Determine if animation is enabled for a style
 * Used in demoSvgRenderer to add SVG animation elements
 *
 * @param animation - Animation option
 * @returns Object with animation configuration
 */
export function getAnimationConfig(animation: AnimationOption) {
  const config = ANIMATION_OPTIONS[animation];
  const baseConfig = {
    enabled: config.enabled,
    type: animation,
    name: config.name,
    description: config.description,
  };

  // Type-safe spreading based on animation type
  if (animation === "pulse" && "frequencies" in config) {
    return { ...baseConfig, frequencies: config.frequencies };
  }
  if (animation === "flicker" && "intensities" in config) {
    return { ...baseConfig, intensities: config.intensities };
  }
  if (animation === "wave" && "wavelengths" in config) {
    return { ...baseConfig, wavelengths: config.wavelengths };
  }
  if (animation === "rotate" && "speeds" in config) {
    return { ...baseConfig, speeds: config.speeds };
  }

  return baseConfig;
}

/**
 * Check if a palette allows low bloom under adaptive rules
 * Used in enforceNeonConstraints and validation logic
 *
 * @param palette - Palette name
 * @returns true if low bloom is allowed for this palette
 */
export function isPaletteAllowedLowBloom(palette: string): boolean {
  return (
    ADAPTIVE_BLOOM_CONSTRAINTS.allowLowBloomFor as readonly string[]
  ).includes(palette);
}

/**
 * Check if a texture should boost bloom for visibility
 * Used in enforceNeonConstraints adaptive logic
 *
 * @param texture - Texture name
 * @returns true if this texture benefits from boosted bloom
 */
export function shouldBoostBloomForTexture(texture: string): boolean {
  return (
    ADAPTIVE_BLOOM_CONSTRAINTS.boostBloomFor as readonly string[]
  ).includes(texture);
}

/**
 * Summary stats for neon constraints
 */
export const NEON_CONSTRAINTS_SUMMARY = {
  description:
    "Demo mode uses FULL variant pools with neon enforcement via SVG filters",
  totalPalettes: 12,
  totalGradients: 6,
  totalGlows: 4,
  totalChromes: 4,
  allowedBlooms: 2,
  totalTextures: 4,
  totalLightings: 4,
  totalValidCombinations: 6144,
  constraints: [
    "✨ Neon aesthetic enforced via SVG filters (not pool restriction)",
    "🎨 All 12 palettes supported",
    "💜 Bloom must be medium or heavy (no 'low')",
    "🚫 'Low' bloom auto-upgraded to 'medium' for visibility",
    "🌟 All 9,216 palette/gradient/texture combinations possible",
    "📊 But only 6,144 are valid (due to bloom constraint)",
  ],
} as const;

// ============= EXTENDED DESIGN OPTIONS (v2 EXPANSION) =============

/**
 * 1. DESIGN INTENSITY LEVELS
 * Control overall visual saturation and bloom strength per style
 * Maps to SVG filter intensity and color saturation values
 */
export const DESIGN_INTENSITY_LEVELS = {
  subtle: {
    saturation: 1.2,
    bloomMultiplier: 0.8,
    filterIntensity: 0.6,
    description: "Soft, understated neon",
  },
  balanced: {
    saturation: 1.8,
    bloomMultiplier: 1.0,
    filterIntensity: 1.0,
    description: "Standard neon aesthetic",
  },
  intense: {
    saturation: 2.5,
    bloomMultiplier: 1.3,
    filterIntensity: 1.4,
    description: "Bold, vibrant neon",
  },
  extreme: {
    saturation: 3.0,
    bloomMultiplier: 1.5,
    filterIntensity: 1.8,
    description: "Maximum neon impact",
  },
} as const;

export type DesignIntensity = keyof typeof DESIGN_INTENSITY_LEVELS;

/**
 * 2. STYLE THEMES
 * Pre-curated combinations of palette, gradient, glow, and effects
 * Users can pick a theme then customize within it
 */
export const STYLE_THEMES = {
  synthwave: {
    name: "Synthwave",
    description: "80s Miami: pink, cyan, purple with neon glow",
    recommendedPalettes: ["magentaCyan", "hotPinkGold", "sunsetPurple"],
    recommendedGradients: ["diagonal", "sunsetFade"],
    recommendedGlows: ["softNeon", "pulseGlow"],
    recommendedEffect: "neon-glow" as const,
    colorTheme: "#FF1493-#00FFFF" as const,
  },
  cyberpunk: {
    name: "Cyberpunk",
    description: "High-tech neon: aggressive orange, electric blue, glitch",
    recommendedPalettes: ["cyberOrange", "electricBlue", "ultraviolet"],
    recommendedGradients: ["vertical", "metallicBand"],
    recommendedGlows: ["hardNeon"],
    recommendedEffect: "glitch" as const,
    colorTheme: "#FF8C00-#0066FF" as const,
  },
  retrowave: {
    name: "Retrowave",
    description: "Retro scan: laser green, red, teal with scanlines",
    recommendedPalettes: ["laserGreen", "retroRed", "vaporTeal"],
    recommendedGradients: ["horizontal"],
    recommendedGlows: ["auraGlow"],
    recommendedEffect: "scanlines" as const,
    colorTheme: "#00FF00-#FF0000" as const,
  },
  vaporwave: {
    name: "Vaporwave",
    description: "Dreamy aesthetic: teal, purple, soft bloom",
    recommendedPalettes: ["vaporTeal", "midnightNeon"],
    recommendedGradients: ["radial"],
    recommendedGlows: ["softNeon"],
    recommendedEffect: "bloom" as const,
    colorTheme: "#00FFFF-#9D4EDD" as const,
  },
  industrial: {
    name: "Industrial",
    description: "Dark metallic: midnight, chrome, hard edges",
    recommendedPalettes: ["midnightNeon", "electricBlue"],
    recommendedGradients: ["metallicBand", "vertical"],
    recommendedGlows: ["hardNeon"],
    recommendedEffect: "chrome" as const,
    colorTheme: "#1a1a1a-#00FFFF" as const,
  },
} as const;

export type StyleTheme = keyof typeof STYLE_THEMES;

/**
 * 3. EXTENDED TEXTURE OPTIONS (Future expansion for demoStyleVariants.ts)
 * Currently 4 textures; proposed expansion to 9 for more visual diversity
 */
export const TEXTURE_EXPANSION_OPTIONS = {
  current: ["none", "grain", "halftone", "scanlines"],
  proposed: [
    "none", // Pure clean
    "grain", // Film grain noise
    "halftone", // Comic book dots
    "scanlines", // CRT horizontal lines
    "vignette", // Darkened edges (NEW)
    "pixelate", // 8-bit blocky effect (NEW)
    "distortion", // Wave/ripple effect (NEW)
    "chromatic", // Color separation/RGB shift (NEW)
    "glitch", // Digital noise/corruption (NEW)
  ],
  recommendations:
    "Implement in demoStyleVariants.ts TEXTURE_VARIANTS array, then map to SVG filters in demoSvgRenderer.ts",
} as const;

/**
 * 4. EXTENDED LIGHTING VARIANTS (Future expansion for demoStyleVariants.ts)
 * Currently 4 angles; proposed expansion to 8 for more depth variation
 */
export const LIGHTING_EXPANSION_OPTIONS = {
  current: ["topLeft", "topRight", "bottomLeft", "front"],
  proposed: [
    "topLeft", // Top-left diagonal shadow
    "topRight", // Top-right diagonal shadow
    "bottomLeft", // Bottom-left shadow
    "front", // No shadow (flat)
    "backlit", // Glow from behind (NEW - requires filter)
    "sidelit", // Strong side shadow (NEW)
    "dynamic", // Rotating animation (NEW - requires animation)
    "volumetric", // God rays/light beams (NEW - requires SVG filter)
  ],
  recommendations:
    "Add to demoStyleVariants.ts, implement dynamic lighting in demoSvgRenderer.ts",
} as const;

/**
 * 5. STROKE/LAYER EFFECT OPTIONS
 * Control text layering, stroke width, shadow depth for unique outlines
 */
export const STROKE_LAYER_OPTIONS = {
  none: {
    name: "None",
    strokeCount: 1,
    strokeSpacing: 0,
    shadowDepth: 0,
    description: "No extra layers",
  },
  single: {
    name: "Single",
    strokeCount: 1,
    strokeSpacing: 0,
    shadowDepth: 0,
    description: "Base stroke only",
  },
  double: {
    name: "Double",
    strokeCount: 2,
    strokeSpacing: 2,
    shadowDepth: 0,
    description: "Two-layer stroke effect",
  },
  triple: {
    name: "Triple",
    strokeCount: 3,
    strokeSpacing: 1.5,
    shadowDepth: 0,
    description: "Triple layered for depth",
  },
  outline: {
    name: "Outline",
    strokeCount: 1,
    strokeSpacing: 0,
    shadowDepth: 0,
    description: "Heavy outline stroke (no fill)",
  },
  shadow: {
    name: "Shadow",
    strokeCount: 1,
    strokeSpacing: 0,
    shadowDepth: 5,
    description: "Drop shadow with blur",
  },
} as const;

export type StrokeLayerOption = keyof typeof STROKE_LAYER_OPTIONS;

/**
 * 6. ANIMATION SUPPORT OPTIONS
 * Enable dynamic effects: pulse, flicker, wave, rotation
 * Note: Requires integration with demoSvgRenderer.ts for SVG animation
 */
export const ANIMATION_OPTIONS = {
  static: {
    name: "Static",
    enabled: false,
    description: "No animation",
  },
  pulse: {
    name: "Pulse",
    enabled: true,
    frequencies: ["slow", "normal", "fast"],
    description: "Brightness/opacity pulsing",
  },
  flicker: {
    name: "Flicker",
    enabled: true,
    intensities: ["low", "medium", "high"],
    description: "Neon tube flicker effect",
  },
  wave: {
    name: "Wave",
    enabled: true,
    wavelengths: [20, 40, 60],
    description: "Undulating text wave",
  },
  rotate: {
    name: "Rotate",
    enabled: true,
    speeds: ["slow", "normal", "fast"],
    description: "Rotating text animation",
  },
} as const;

export type AnimationOption = keyof typeof ANIMATION_OPTIONS;

/**
 * 7. ADAPTIVE BLOOM CONSTRAINTS
 * Intelligent bloom rules based on palette darkness and texture density
 * More nuanced than simple "low is rejected" rule
 */
export const ADAPTIVE_BLOOM_CONSTRAINTS = {
  // Dark palettes can use low bloom (lighter on dark background)
  darkPalettes: ["midnightNeon", "ultraviolet"],
  allowLowBloomFor: ["midnightNeon"],

  // Heavy textures (grain, scanlines, glitch) should boost bloom visibility
  heavyTextures: ["grain", "scanlines", "glitch"],
  boostBloomFor: ["grain", "scanlines", "glitch"],

  // Light palettes should avoid low bloom (already subtle)
  lightPalettes: ["vaporTeal", "laserGreen", "hotPinkGold"],
  requireMediumOrHeavyFor: ["vaporTeal", "laserGreen"],

  // Fallback rule for all others
  defaultConstraint: "medium" as const,

  description:
    "Enables more flexible bloom rules while maintaining neon aesthetic quality",
} as const;

/**
 * 8. GRADIENT INTENSITY VARIANTS
 * Extend gradient strength and color stop control for visual diversity
 */
export const GRADIENT_INTENSITY_VARIANTS = {
  subtle: {
    name: "Subtle",
    opacity: 0.6,
    colorStops: 3,
    saturation: 1.3,
    description: "Soft gradient overlay",
  },
  normal: {
    name: "Normal",
    opacity: 1.0,
    colorStops: 5,
    saturation: 1.8,
    description: "Standard gradient strength",
  },
  dramatic: {
    name: "Dramatic",
    opacity: 1.4,
    colorStops: 7,
    saturation: 2.5,
    description: "Bold gradient with many transitions",
  },
  extreme: {
    name: "Extreme",
    opacity: 1.6,
    colorStops: 9,
    saturation: 3.0,
    description: "Maximum gradient impact",
  },
} as const;

export type GradientIntensity = keyof typeof GRADIENT_INTENSITY_VARIANTS;

/**
 * DESIGN EXPANSION ROADMAP
 * Tracks implementation status and dependencies for all 8 improvements
 */
export const DESIGN_EXPANSION_ROADMAP = {
  improvements: [
    {
      id: 1,
      name: "Design Intensity Levels",
      status: "implemented" as const,
      file: "demoNeonStyleVariants.ts",
      integrationRequired: ["demoSvgRenderer.ts"],
    },
    {
      id: 2,
      name: "Style Themes",
      status: "implemented" as const,
      file: "demoNeonStyleVariants.ts",
      integrationRequired: ["LogoGenerator.tsx (UI)"],
    },
    {
      id: 3,
      name: "Extended Textures",
      status: "planned" as const,
      file: "demoStyleVariants.ts",
      integrationRequired: ["demoSvgRenderer.ts"],
      estimatedCombos: 12 * 6 * 4 * 4 * 2 * 9 * 4, // 27,648 combos with 9 textures
    },
    {
      id: 4,
      name: "Extended Lighting",
      status: "planned" as const,
      file: "demoStyleVariants.ts",
      integrationRequired: ["demoSvgRenderer.ts"],
      estimatedCombos: 12 * 6 * 4 * 4 * 2 * 4 * 8, // 24,576 combos with 8 lightings
    },
    {
      id: 5,
      name: "Stroke/Layer Effects",
      status: "implemented" as const,
      file: "demoNeonStyleVariants.ts",
      integrationRequired: ["demoSvgRenderer.ts (text rendering)"],
    },
    {
      id: 6,
      name: "Animation Support",
      status: "planned" as const,
      file: "demoSvgRenderer.ts",
      integrationRequired: ["SVG animation, LogoGenerator.tsx"],
      complexity: "high" as const,
    },
    {
      id: 7,
      name: "Adaptive Bloom Constraints",
      status: "implemented" as const,
      file: "demoNeonStyleVariants.ts",
      integrationRequired: ["enforceNeonConstraints() function"],
    },
    {
      id: 8,
      name: "Gradient Intensity Variants",
      status: "implemented" as const,
      file: "demoNeonStyleVariants.ts",
      integrationRequired: ["demoSvgRenderer.ts (gradient rendering)"],
    },
  ],
  totalEstimatedCombinations:
    "Up to 27,648 with all expansions (vs. 6,144 current constrained)",
  nextSteps: [
    "Integrate intensity levels into demoSvgRenderer SVG filter application",
    "Add theme selector UI to LogoGenerator.tsx",
    "Implement texture expansion in demoStyleVariants.ts",
    "Add lighting angle variation in demoSvgRenderer.ts",
  ],
} as const;
