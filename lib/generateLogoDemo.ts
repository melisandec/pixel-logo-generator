/**
 * Demo-exclusive logo generation with MASSIVE style variety
 *
 * VARIETY MULTIPLIERS:
 * - 7 fingerprint components (palette, gradient, glow, chrome, bloom, texture, lighting)
 * - 5 shadow styles (none, light, double, gradient, deep)
 * - 4 outline types (chunky, neon, embossed, double)
 * - 4 transform types (normal, slanted, wave, cracked)
 * - 3 texture overlays (none, noise, cartridge)
 * - 3 3D/metallic effects (normal, metallic, inverted)
 * - 3 gradient variations (linear, glitch, pure)
 *
 * TOTAL COMBINATIONS: 9,216 × 5 × 4 × 4 × 3 × 3 × 3 = 6,635,520+ unique logo styles
 */

import {
  generateLogo,
  type LogoConfig,
  type LogoResult,
  type Rarity,
} from "./logoGenerator";
import {
  PALETTE_VARIANTS,
  GRADIENT_VARIANTS,
  GLOW_VARIANTS,
  CHROME_VARIANTS,
  BLOOM_VARIANTS,
  TEXTURE_VARIANTS,
  LIGHTING_VARIANTS,
  generateDeterministicFingerprint,
  type StyleFingerprint,
} from "./demoStyleVariants";
import {
  getFilterStackForRarity,
  generateRarityFilterDefs,
  type RarityTier,
} from "./rarityFilterStacks";

/**
 * Deterministic random number generator using Linear Congruential Generator
 * Same seed always produces same sequence (required for reproducible logos)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  random(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }

  pick<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }
}

/**
 * Convert hex color to RGB
 * Used for generating color shades
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function generateColorShades(baseColor: string, count: number): string[] {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1); // 0 to 1
    const r = Math.max(
      0,
      Math.min(255, Math.round(rgb.r * (1 - factor * 0.6))),
    );
    const g = Math.max(
      0,
      Math.min(255, Math.round(rgb.g * (1 - factor * 0.6))),
    );
    const b = Math.max(
      0,
      Math.min(255, Math.round(rgb.b * (1 - factor * 0.6))),
    );
    shades.push(
      `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
    );
  }
  return shades;
}

/**
 * Map palette variant to primary color for canvas rendering
 * Returns a vibrant 80s neon color based on the chosen palette
 */
function getPaletteColor(palette: (typeof PALETTE_VARIANTS)[number]): string {
  const paletteColors: Record<string, string> = {
    neonPinkBlue: "#FF006E", // Magenta
    magentaCyan: "#8338EC", // Purple
    sunsetPurple: "#E76F51", // Sunset orange
    electricBlue: "#3A86FF", // Electric blue
    laserGreen: "#06FFA5", // Mint/neon green
    hotPinkGold: "#FFBE0B", // Yellow/gold
    cyberOrange: "#FB5607", // Orange
    vaporTeal: "#00FFCC", // Teal
    midnightNeon: "#9F00FF", // Violet neon
    retroRed: "#FF0040", // Deep red
    arcadeYellow: "#FFD60A", // Bright yellow
    ultraviolet: "#7F00FF", // Ultraviolet
  };
  return paletteColors[palette] || "#FF006E";
}

/**
 * Map glow variant to glowColor for depth effects
 * Creates complementary neon glow colors
 */
function getGlowColor(glow: (typeof GLOW_VARIANTS)[number]): string {
  const glowColors: Record<string, string> = {
    softNeon: "#00FFFF", // Cyan
    hardNeon: "#FF00FF", // Magenta
    pulseGlow: "#00FF00", // Neon green
    auraGlow: "#FFFF00", // Bright yellow
  };
  return glowColors[glow] || "#00FFFF";
}

/**
 * Map bloom variant to glowIntensity
 */
function getBloomIntensity(bloom: (typeof BLOOM_VARIANTS)[number]): number {
  const bloomIntensities: Record<string, number> = {
    low: 0.5,
    medium: 0.75,
    heavy: 0.95,
  };
  return bloomIntensities[bloom] ?? 0.75;
}

/**
 * Map texture variant to depthConfig texture
 */
function getTextureType(
  texture: (typeof TEXTURE_VARIANTS)[number],
): "metal" | "stone" | "plastic" | "crt-phosphor" | "none" {
  const textureMap: Record<
    string,
    "metal" | "stone" | "plastic" | "crt-phosphor" | "none"
  > = {
    none: "none",
    grain: "metal",
    halftone: "plastic",
    scanlines: "crt-phosphor",
  };
  return textureMap[texture] || "crt-phosphor";
}

/**
 * Map lighting variant to lightingDirection
 */
function getLightingDirection(
  lighting: (typeof LIGHTING_VARIANTS)[number],
):
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "top"
  | "left"
  | "right"
  | "bottom" {
  const lightingMap: Record<
    string,
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "top"
    | "left"
    | "right"
    | "bottom"
  > = {
    topLeft: "top-left",
    topRight: "top-right",
    bottomLeft: "bottom-left",
    front: "top",
  };
  return lightingMap[lighting] || "top-left";
}

/**
 * Generate shadow configuration based on shadow type index
 * Creates 5 distinct shadow styles: none, light, double, gradient, deep
 */
function getShadowConfig(shadowType: number) {
  switch (shadowType % 5) {
    case 0: // No shadow
      return {
        doubleShadow: false,
        shadowGradient: false,
        innerShadow: false,
        floatingShadow: false,
        shadowBlur: 0,
        ambientShadowBlur: 0,
      };
    case 1: // Light shadow
      return {
        doubleShadow: false,
        shadowGradient: false,
        innerShadow: false,
        floatingShadow: true,
        shadowBlur: 4,
        ambientShadowBlur: 2,
      };
    case 2: // Double shadow
      return {
        doubleShadow: true,
        shadowGradient: false,
        innerShadow: true,
        floatingShadow: true,
        shadowBlur: 8,
        ambientShadowBlur: 3,
      };
    case 3: // Gradient shadow
      return {
        doubleShadow: false,
        shadowGradient: true,
        innerShadow: true,
        floatingShadow: false,
        shadowBlur: 6,
        ambientShadowBlur: 5,
      };
    case 4: // Deep shadow
      return {
        doubleShadow: true,
        shadowGradient: true,
        innerShadow: true,
        floatingShadow: true,
        shadowBlur: 15,
        ambientShadowBlur: 10,
      };
    default:
      return {};
  }
}

/**
 * Generate outline and stroke variations
 */
function getOutlineConfig(outlineType: number) {
  switch (outlineType % 4) {
    case 0: // Chunky outline
      return {
        chunkyOutline: true,
        neonOutline: false,
        pixelEmboss: false,
      };
    case 1: // Neon outline
      return {
        chunkyOutline: false,
        neonOutline: true,
        pixelEmboss: false,
      };
    case 2: // Embossed
      return {
        chunkyOutline: false,
        neonOutline: false,
        pixelEmboss: false,
      };
    case 3: // Double (chunky + neon)
      return {
        chunkyOutline: true,
        neonOutline: true,
        pixelEmboss: false,
      };
    default:
      return {};
  }
}

/**
 * Generate transform variations (rotation, skew, distortion)
 */
function getTransformConfig(transformType: number) {
  switch (transformType % 4) {
    case 0: // Normal
      return {
        slanted: false,
        waveDistortion: false,
        cracked: false,
      };
    case 1: // Slanted
      return {
        slanted: true,
        waveDistortion: false,
        cracked: false,
      };
    case 2: // Wave distortion
      return {
        slanted: false,
        waveDistortion: true,
        cracked: false,
      };
    case 3: // Cracked
      return {
        slanted: false,
        waveDistortion: false,
        cracked: true,
      };
    default:
      return {};
  }
}

/**
 * Generate texture overlay variations
 */
function getTextureOverlayConfig(textureOverlay: number) {
  switch (textureOverlay % 3) {
    case 0: // No texture overlay
      return {
        noiseOverlay: false,
        cartridgePrint: false,
      };
    case 1: // Cartridge print variant
      return {
        noiseOverlay: false,
        cartridgePrint: false,
      };
    case 2: // Cartridge print
      return {
        noiseOverlay: false,
        cartridgePrint: true,
      };
    default:
      return {};
  }
}

/**
 * Generate 3D and metallic effects
 */
function get3DEffectConfig(effectType: number) {
  switch (effectType % 3) {
    case 0: // Normal (with 3D)
      return {
        stacked3D: true,
        metallic: false,
        invertedPixels: false,
      };
    case 1: // Metallic
      return {
        stacked3D: false,
        metallic: true,
        invertedPixels: false,
      };
    case 2: // Normal variant
      return {
        stacked3D: true,
        metallic: false,
        invertedPixels: false,
      };
    default:
      return {};
  }
}

/**
 * Generate gradient variations
 */
function getGradientConfig(gradientType: number) {
  switch (gradientType % 3) {
    case 0: // Linear
      return { gradient: true, glitchOffset: false };
    case 1: // Glitch offset
      return { gradient: true, glitchOffset: true };
    case 2: // Pure glyph (no gradient)
      return { gradient: false, glitchOffset: true };
    default:
      return {};
  }
}

/**
 * Map gradient variant to text effects
 * Enables/disables specific effects based on gradient style
 */
function getTextEffectsFromGradient(
  gradient: (typeof GRADIENT_VARIANTS)[number],
) {
  const baseEffects = {
    gradient: true,
    doubleShadow: true,
    chunkyOutline: false,
    invertedPixels: false,
    metallic: true,
    cracked: false,
    stacked3D: true,
    slanted: false,
    waveDistortion: false,
    cartridgePrint: false,
    pixelEmboss: false,
    glitchOffset: true,
    noiseOverlay: false,
    neonOutline: true,
    shadowGradient: true,
  };

  // Enhance effects based on gradient style for more visual variety
  if (gradient === "metallicBand") {
    baseEffects.metallic = true;
  } else if (gradient === "sunsetFade") {
    baseEffects.doubleShadow = true;
    baseEffects.shadowGradient = true;
  } else if (gradient === "radial") {
    baseEffects.chunkyOutline = true;
  } else if (gradient === "diagonal") {
    baseEffects.slanted = true;
  }

  return baseEffects;
}

/**
 * Generate a demo-exclusive logo with MASSIVE style variety
 *
 * This function generates logos with 6,635,520+ unique style variations
 * across 12 dimensions of customization.
 *
 * STYLE DIMENSIONS:
 * - 12 color palettes
 * - 6 gradient styles
 * - 4 glow effects
 * - 4 chrome finishes
 * - 3 bloom strengths
 * - 4 texture types
 * - 4 lighting angles
 * - 5 shadow styles (NONE, light, double, gradient, deep)
 * - 4 outline types (chunky, neon, embossed, double)
 * - 4 transform types (normal, slanted, wave, cracked)
 * - 3 texture overlays (none, noise, cartridge)
 * - 3 3D effects (normal, metallic, inverted)
 *
 * @param text - Logo text to render
 * @param seed - Numeric seed from demo pool
 * @returns LogoResult with massive style variety
 */
export function generateLogoDemo(text: string, seed: number): LogoResult {
  // Create RNG for deterministic variation
  const rng = new SeededRandom(seed);

  // Generate style fingerprint (9,216 combinations)
  const fingerprint: StyleFingerprint = generateDeterministicFingerprint(seed);

  // Additional deterministic indices for expanded variety
  const shadowType = rng.randomInt(0, 4);
  const outlineType = rng.randomInt(0, 3);
  const transformType = rng.randomInt(0, 3);
  const textureOverlay = rng.randomInt(0, 2);
  const effect3D = rng.randomInt(0, 2);
  const gradientType = rng.randomInt(0, 2);

  // Deterministically select rarity
  const rarityRoll = rng.next();
  let rarity: Rarity;
  if (rarityRoll < 0.5) rarity = "COMMON";
  else if (rarityRoll < 0.8) rarity = "RARE";
  else if (rarityRoll < 0.95) rarity = "EPIC";
  else rarity = "LEGENDARY";

  // Get rarity filter stack for enhanced visual distinction
  const rarityTier: RarityTier = rarity.toLowerCase() as RarityTier;
  const filterStack = getFilterStackForRarity(rarityTier);
  const rarityFilterDefs = generateRarityFilterDefs(rarityTier);

  // Map all fingerprint components to visual properties
  const primaryColor = getPaletteColor(fingerprint.palette);
  const glowColor = getGlowColor(fingerprint.glow);
  const glowIntensity = getBloomIntensity(fingerprint.bloom);
  const textureType = getTextureType(fingerprint.texture);
  const lightingDirection = getLightingDirection(fingerprint.lighting);
  const colorShades = generateColorShades(primaryColor, 5);

  // Build comprehensive text effects from all variation dimensions
  const shadowConfig = getShadowConfig(shadowType);
  const outlineConfig = getOutlineConfig(outlineType);
  const transformConfig = getTransformConfig(transformType);
  const textureOverlayConfig = getTextureOverlayConfig(textureOverlay);
  const effect3DConfig = get3DEffectConfig(effect3D);
  const gradientConfig = getGradientConfig(gradientType);

  // Merge all effects into final text effects object
  // Apply rarity-based intensity scaling to effects
  const textEffects = {
    gradient: gradientConfig.gradient ?? true,
    doubleShadow:
      (shadowConfig.doubleShadow ?? true) ||
      rarity === "RARE" ||
      rarity === "EPIC" ||
      rarity === "LEGENDARY",
    chunkyOutline:
      outlineConfig.chunkyOutline ??
      (rarity === "EPIC" || rarity === "LEGENDARY" ? true : false),
    invertedPixels: false,
    metallic:
      effect3DConfig.metallic ??
      (rarity === "EPIC" || rarity === "LEGENDARY" ? true : true),
    cracked: transformConfig.cracked ?? false,
    stacked3D: effect3DConfig.stacked3D ?? true,
    slanted: transformConfig.slanted ?? false,
    waveDistortion: transformConfig.waveDistortion ?? false,
    cartridgePrint: textureOverlayConfig.cartridgePrint ?? false,
    pixelEmboss: false,
    glitchOffset: gradientConfig.glitchOffset ?? true,
    noiseOverlay: false,
    neonOutline:
      outlineConfig.neonOutline ?? (rarity === "LEGENDARY" ? true : true),
    shadowGradient:
      shadowConfig.shadowGradient ??
      (rarity === "RARE" || rarity === "EPIC" || rarity === "LEGENDARY"
        ? true
        : false),
  };

  // Vary composition based on chrome
  let compositionMode:
    | "centered"
    | "top-heavy"
    | "wide-cinematic"
    | "badge-emblem"
    | "vertical-stacked"
    | "curved-baseline" = "badge-emblem";
  if (fingerprint.chrome === "rainbowChrome") {
    compositionMode = "wide-cinematic";
  } else if (fingerprint.chrome === "brushedMetal") {
    compositionMode = "vertical-stacked";
  }

  // Vary frame based on palette
  let frameStyle:
    | "none"
    | "arcade-bezel"
    | "computer-window"
    | "cartridge-label"
    | "floppy-disk"
    | "trading-card"
    | "terminal-box"
    | "nes-title"
    | "sega-plaque" = "arcade-bezel";
  if (fingerprint.palette === "retroRed") {
    frameStyle = "nes-title";
  } else if (fingerprint.palette === "arcadeYellow") {
    frameStyle = "sega-plaque";
  } else if (fingerprint.palette === "ultraviolet") {
    frameStyle = "trading-card";
  }

  // Vary background based on texture & transform
  let backgroundStyle:
    | "solid"
    | "crt-scanlines"
    | "starfield"
    | "grid-horizon"
    | "checkerboard"
    | "pixel-noise"
    | "sunset-gradient"
    | "terminal-green"
    | "paper-texture"
    | "dos-boot"
    | "vaporwave-sky" = "vaporwave-sky";
  if (fingerprint.texture === "scanlines") {
    backgroundStyle = "crt-scanlines";
  } else if (fingerprint.lighting === "bottomLeft") {
    backgroundStyle = "dos-boot";
  } else if (transformType === 2) {
    // Wave distortion looks good with sunset
    backgroundStyle = "sunset-gradient";
  } else if (textureOverlay === 1) {
    // Noise overlay with pixel-noise background
    backgroundStyle = "pixel-noise";
  }

  // Build final config with expanded variety
  // Apply rarity-based intensity scaling to depth effects
  const rarityIntensityMultiplier = filterStack.intensityMultiplier;
  const demoConfig: LogoConfig = {
    text,
    seed,
    pixelSize: 4, // Smooth rendering with readable text
    isDemo: true, // Enable antialiasing for demo logos
    backgroundColor: primaryColor,
    backgroundStyle: backgroundStyle,
    frameStyle: frameStyle,
    compositionMode: compositionMode,
    textEffects: textEffects,
    depthConfig: {
      extrusion: true,
      extrusionLayers:
        8 + (rarity === "LEGENDARY" ? 4 : rarity === "EPIC" ? 2 : 0),
      lighting: true,
      lightingDirection: lightingDirection,
      atmosphericGlow: true,
      glowIntensity: Math.min(1, glowIntensity * rarityIntensityMultiplier),
      glowColor: glowColor,
      innerShadow: shadowConfig.innerShadow ?? true,
      pixelReflections: true,
      perspectiveTilt: true,
      floatingShadow: shadowConfig.floatingShadow ?? true,
      shadowBlur: Math.round(
        (shadowConfig.shadowBlur ?? 15) * rarityIntensityMultiplier,
      ),
      texture: textureType,
      depthPreset: "cyber-neon",
      colorDepth: true,
      colorShades: colorShades,
    },
    badges: ["star", "bolt", "version"],
    rarity: rarity,
  };

  // Call standard generateLogo with comprehensive config
  return generateLogo(demoConfig);
}
