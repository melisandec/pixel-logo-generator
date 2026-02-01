/**
 * Demo Mode SVG Text Renderer
 * Generates smooth, font-based 80s-style logos using native SVG rendering
 * Completely bypasses canvas system for demo mode
 */

import type { StyleFingerprint } from "./demoStyleVariants";
import {
  PALETTE_VARIANTS,
  CHROME_VARIANTS,
  GLOW_VARIANTS,
  GRADIENT_VARIANTS,
  LIGHTING_VARIANTS,
  BLOOM_VARIANTS,
  TEXTURE_VARIANTS,
} from "./demoStyleVariants";
import type { DesignIntensity } from "./demoNeonStyleVariants";
import { getFilterIntensityMultiplier } from "./demoNeonStyleVariants";

// Re-export DesignIntensity for use in dependent modules
export type { DesignIntensity };

// Debug logging flag - disable in production for performance
const DEBUG = process.env.NODE_ENV === "development";

// ============= MAGIC NUMBERS AS NAMED CONSTANTS =============
/** Ratio of SVG width to use for text length adjustment */
const TEXT_LENGTH_RATIO = 0.85;
/** Font size adjustment threshold for long text (>6 chars) */
const FONT_SIZE_THRESHOLD_LONG = 6;
/** Font size adjustment threshold for medium text (>4 chars) */
const FONT_SIZE_THRESHOLD_MEDIUM = 4;
/** Minimum font size for very long text */
const MIN_FONT_SIZE = 80;
/** Stroke width taper minimum ratio (80% of base) */
const STROKE_WIDTH_MIN_RATIO = 0.8;
/** Stroke width taper maximum ratio (120% of base) */
const STROKE_WIDTH_MAX_RATIO = 1.2;
/** Medium text font size adjustment factor */
const MEDIUM_TEXT_ADJUSTMENT = 0.95;
/** Maximum text length before enabling long text optimization */
const MAX_TEXT_LENGTH = 20;
/** Default canvas width and height */
const DEFAULT_CANVAS_SIZE = 512;
/** Minimum canvas size for very long text */
const MIN_CANVAS_SIZE = 256;
/** Maximum canvas size for very short text */
const MAX_CANVAS_SIZE = 1024;
/** Absolute maximum text length to prevent rendering issues */
const ABSOLUTE_MAX_TEXT_LENGTH = 50;
/** SVG viewBox aspect ratio (always square) */
const VIEWBOX_ASPECT_RATIO = 1.0;

// ============= SVG FILTER MAGIC NUMBERS =============
/** Light blur for subtle glow effects (stdDeviation) */
const GLOW_BLUR_LIGHT = 3;
/** Medium blur for standard glow effects (stdDeviation) */
const GLOW_BLUR_MEDIUM = 3.5;
/** Heavy blur for intense glow effects (stdDeviation) */
const GLOW_BLUR_HEAVY = 4;
/** Extra heavy blur for bloom/aura effects (stdDeviation) */
const GLOW_BLUR_AURA = 8;
/** Light saturation boost for glow colors */
const GLOW_SATURATION_LIGHT = 2;
/** Medium saturation boost for glow colors */
const GLOW_SATURATION_MEDIUM = 2.2;
/** Heavy saturation boost for glow colors */
const GLOW_SATURATION_HEAVY = 2.5;
/** Light opacity for glow/bloom effects */
const GLOW_OPACITY_LIGHT = 0.4;
/** Medium opacity for glow effects */
const GLOW_OPACITY_MEDIUM = 0.5;
/** Heavy opacity for glow effects */
const GLOW_OPACITY_HEAVY = 0.6;
/** Extra heavy opacity for intense glow */
const GLOW_OPACITY_INTENSE = 0.7;

export interface DemoSvgConfig {
  text: string;
  fingerprint: StyleFingerprint;
  width?: number;
  height?: number;
  randomSeed?: number;
  // Feature: Design intensity level for filter effect scaling
  intensity?: DesignIntensity; // 'subtle', 'balanced', 'intense', 'extreme' (default: 'balanced')
  // Feature: Color customization - optional overrides for fill and stroke
  colorOverride?: {
    fill?: string; // Override effect fill color (e.g., "#FF00FF")
    stroke?: string; // Override effect stroke color (e.g., "#00FFFF")
  };
}

export interface DemoFontStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  letterSpacing: number;
  // Feature: Extended text transforms for creative styling
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize" | "reverse";
  textSkew?: number;
  textRotate?: number;
}

export interface DemoEffectStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  filterIds: string[];
  textAnchor: "start" | "middle" | "end";
  // Feature: Intensity control for filter effects (0-1 scale)
  intensity?: number; // 0 = subtle, 1 = maximum effect (default: 1)
}

// ============= PERFORMANCE: MODULE-LEVEL CONSTANTS =============
// HTML escape map - cached to avoid recreation on every call
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Filter ID regex - compiled once for validation
const FILTER_ID_REGEX = /<filter[^>]*id="([^"]+)"/g;

// Export filter regex - compiled once for filter extraction
const EXPORT_FILTER_REGEX = /<filter[^>]*id="([^"]*)"[^>]*>[\s\S]*?<\/filter>/g;

// ============= DEBUG LOGGING UTILITY =============
/**
 * Standardized debug logging with context prefix
 * @param context - Function or module context name
 * @param message - Log message
 * @param data - Optional data to log
 */
function debugLog(context: string, message: string, data?: unknown): void {
  if (DEBUG) {
    const logMessage = `[${context}] ${message}`;
    if (data !== undefined) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
}

/**
 * Standardized debug warning with context prefix
 * @param context - Function or module context name
 * @param message - Warning message
 * @param data - Optional data to log
 */
function debugWarn(context: string, message: string, data?: unknown): void {
  if (DEBUG) {
    const logMessage = `[${context}] ${message}`;
    if (data !== undefined) {
      console.warn(logMessage, data);
    } else {
      console.warn(logMessage);
    }
  }
}

/**
 * Standardized debug error with context prefix
 * @param context - Function or module context name
 * @param message - Error message
 * @param data - Optional error data
 */
function debugError(context: string, message: string, data?: unknown): void {
  if (DEBUG) {
    const logMessage = `[${context}] ${message}`;
    if (data !== undefined) {
      console.error(logMessage, data);
    } else {
      console.error(logMessage);
    }
  }
}

// ============= UTILITY FUNCTIONS =============
/**
 * Escapes HTML special characters to prevent SVG injection
 * @param text - Text to escape
 * @returns Escaped text safe for SVG
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Calculates optimal canvas dimensions based on text length
 * @param text - Text to render
 * @param defaultSize - Default size if not specified
 * @returns Optimal width and height
 */
function calculateOptimalDimensions(
  text: string,
  defaultSize: number = DEFAULT_CANVAS_SIZE,
): { width: number; height: number } {
  if (text.length > MAX_TEXT_LENGTH) {
    // Very long text: smaller canvas
    return { width: MIN_CANVAS_SIZE, height: MIN_CANVAS_SIZE };
  } else if (text.length <= 3) {
    // Very short text: larger canvas
    return { width: MAX_CANVAS_SIZE, height: MAX_CANVAS_SIZE };
  }
  // Normal text: use default
  return { width: defaultSize, height: defaultSize };
}

/**
 * Seeded random number generator for effect randomization
 * @param seed - Seed for reproducible randomness
 * @returns Random number 0-1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Selects a random key from a record using a seed
 * @param record - Record to select from
 * @param seed - Seed for reproducible selection
 * @returns Random key from record (always valid, never falsy)
 */
function selectRandomKey(record: Record<string, string>, seed: number): string {
  const keys = Object.keys(record);
  if (keys.length === 0) return "";
  const index = Math.floor(seededRandom(seed) * keys.length);
  return keys[Math.min(index, keys.length - 1)];
}

/**
 * Exports filter definitions as an array of filter elements
 * Useful for SVG reuse or separate rendering
 * @returns Array of filter XML strings
 */
export function exportFilterDefinitions(): string[] {
  const filters = generateDemoFilters();
  // Extract individual filter blocks from the full defs string
  // Using module-level EXPORT_FILTER_REGEX for performance (compiled once, not per-call)
  const matches = filters.match(EXPORT_FILTER_REGEX) || [];
  return matches;
}

/**
 * Map palette variant to color-specific glow filter ID
 * Enables 12 palettes × 12+ color glows = 144+ filter combinations
 * instead of applying 1 generic glow to all palettes
 */
export function getPaletteGlowFilter(palette: string): string {
  const paletteToGlowMap: Record<string, string> = {
    neonPinkBlue: "neonGlowPink",
    magentaCyan: "neonGlowCyan",
    sunsetPurple: "purpleGlow",
    electricBlue: "blueGlow",
    laserGreen: "neonGlowGreen",
    hotPinkGold: "neonGlowPink",
    cyberOrange: "neonGlowOrange",
    vaporTeal: "neonGlowCyan",
    midnightNeon: "purpleGlow",
    retroRed: "redGlow",
    arcadeYellow: "yellowGlow",
    ultraviolet: "purpleGlow",
  };
  return paletteToGlowMap[palette] || "neonGlow";
}

/**
 * Select filter IDs based on style fingerprint properties
 * Creates intelligent filter selection that varies across 6,144 styles
 * Returns array of filter IDs to apply to this particular logo
 */
export function getFilterIdsForFingerprint(
  fingerprint: StyleFingerprint,
): string[] {
  const filterIds: string[] = [];

  // Always include base neon glow (foundational effect)
  filterIds.push("neonGlow");

  // Add palette-specific color glow (14+ variants for 12 palettes)
  const paletteGlow = getPaletteGlowFilter(fingerprint.palette);
  if (paletteGlow && paletteGlow !== "neonGlow") {
    filterIds.push(paletteGlow);
  }

  // Add texture effect if present
  if (fingerprint.texture !== "none") {
    filterIds.push("textureOverlay");
  }

  // Add bloom aura for heavy bloom (intense, dramatic effect)
  if (fingerprint.bloom === "heavy") {
    filterIds.push("bloomAura");
  }

  // Add chrome reflection for metallic chromes
  if (
    fingerprint.chrome === "mirrorChrome" ||
    fingerprint.chrome === "rainbowChrome"
  ) {
    filterIds.push("chromeReflection");
  }

  // Add scanlines specifically for scanlines texture (CRT effect)
  if (fingerprint.texture === "scanlines") {
    filterIds.push("scanlinesEffect");
  }

  return filterIds;
}

/**
 * Extract a single filter by ID from the full filter defs string
 * Useful for selective filter application
 */
function extractFilterById(filtersString: string, filterId: string): string {
  const regex = new RegExp(
    `<filter[^>]*id="${filterId}"[^>]*>.*?<\/filter>`,
    "s",
  );
  const match = filtersString.match(regex);
  return match ? match[0] : "";
}

/**
 * Compose intelligent filter defs based on style fingerprint
 * Instead of applying same 5 static filters to all 6,144 logos,
 * this creates custom filter combinations for each style.
 *
 * Flow:
 * 1. Generate all available filters at desired intensity
 * 2. Select relevant filters based on fingerprint properties
 * 3. Return only the filters needed for this specific style
 *
 * Result: 6,144 fingerprints × 20+ filters × 4 intensity levels = 490K+ combinations
 */
export function composeLandingFilters(
  fingerprint: StyleFingerprint,
  intensity: DesignIntensity = "balanced",
): string {
  // Generate all available filters at the requested intensity level
  const allFilters = generateDemoFilters(intensity);

  // Get list of relevant filter IDs for this fingerprint
  const selectedFilterIds = getFilterIdsForFingerprint(fingerprint);

  // Extract only the relevant filters
  const relevantFilters = selectedFilterIds
    .map((filterId) => extractFilterById(allFilters, filterId))
    .filter((filter) => filter.length > 0) // Remove failed extractions
    .join("\n");

  // Return wrapped in <defs> tags for SVG compatibility
  return `<defs>\n${relevantFilters}\n</defs>`;
}

/**
 * Feature: Export metadata about available filters
 * Allows clients to introspect what filters are available
 * @returns Object with filter IDs, count, and categorization
 */
export function getAvailableFiltersMetadata(): {
  filterIds: string[];
  count: number;
  categories: Record<string, string[]>;
} {
  const availableFilters = new Set<string>();
  const filtersString = generateDemoFilters();

  // Extract all available filter IDs
  let match;
  const filterIdRegexCopy = /<filter[^>]*id="([^"]+)"/g;
  while ((match = filterIdRegexCopy.exec(filtersString)) !== null) {
    availableFilters.add(match[1]);
  }

  // Categorize filters by type
  const categories: Record<string, string[]> = {
    glow: [],
    bloom: [],
    effect: [],
    texture: [],
  };

  availableFilters.forEach((filterId) => {
    if (filterId.includes("Glow") || filterId.includes("glow")) {
      categories.glow.push(filterId);
    } else if (
      filterId.includes("Bloom") ||
      filterId.includes("bloom") ||
      filterId.includes("Aura")
    ) {
      categories.bloom.push(filterId);
    } else if (
      filterId.includes("Texture") ||
      filterId.includes("Noise") ||
      filterId.includes("Scanline") ||
      filterId.includes("Grid")
    ) {
      categories.texture.push(filterId);
    } else {
      categories.effect.push(filterId);
    }
  });

  return {
    filterIds: Array.from(availableFilters).sort(),
    count: availableFilters.size,
    categories,
  };
}

/**
 * Feature: Apply color overrides to an effect style
 * Allows customization of fill and stroke colors for special effects
 * @param effectStyle - Original effect style
 * @param colorOverride - Optional color overrides { fill?, stroke? }
 * @returns New effect style with applied overrides
 */
export function applyColorOverride(
  effectStyle: DemoEffectStyle,
  colorOverride?: { fill?: string; stroke?: string },
): DemoEffectStyle {
  if (!colorOverride || (!colorOverride.fill && !colorOverride.stroke)) {
    return effectStyle;
  }

  return {
    ...effectStyle,
    fillColor: colorOverride.fill || effectStyle.fillColor,
    strokeColor: colorOverride.stroke || effectStyle.strokeColor,
  };
}

/**
 * Feature: Apply intensity scaling to effect style
 * Scales stroke width based on intensity parameter (0-1)
 * @param effectStyle - Original effect style
 * @param intensity - Intensity scale (0 = subtle, 1 = normal, >1 = enhanced)
 * @returns New effect style with scaled stroke width
 */
export function applyIntensityScaling(
  effectStyle: DemoEffectStyle,
  intensity?: number,
): DemoEffectStyle {
  if (intensity === undefined || intensity === 1) {
    return effectStyle;
  }

  // Clamp intensity between 0.1 and 2.0 for reasonable results
  const clampedIntensity = Math.max(0.1, Math.min(2.0, intensity));

  return {
    ...effectStyle,
    strokeWidth: effectStyle.strokeWidth * clampedIntensity,
  };
}

/**
 * Feature: Apply text transform to text content
 * Supports extended transforms: capitalize, reverse, and standard ones
 * @param text - Original text
 * @param textTransform - Transform type
 * @returns Transformed text
 */
export function applyTextTransform(
  text: string,
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize" | "reverse",
): string {
  switch (textTransform) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    case "reverse":
      return text.split("").reverse().join("");
    case "none":
    default:
      return text;
  }
}

/**
 * Validates that all filter IDs referenced in an effect style exist
 * @param effectStyle - Effect style to validate
 * @throws Error if required filter IDs are missing
 */
export function validateFilterIds(effectStyle: DemoEffectStyle): void {
  const availableFilters = new Set<string>();
  const filtersString = generateDemoFilters();

  // Extract only filter element IDs, not all id attributes (excludes gradients, patterns, etc.)
  // Using module-level FILTER_ID_REGEX for performance (compiled once, not per-call)
  let match;
  while ((match = FILTER_ID_REGEX.exec(filtersString)) !== null) {
    availableFilters.add(match[1]);
  }

  // Check each filter ID in the effect
  for (const filterId of effectStyle.filterIds) {
    if (!availableFilters.has(filterId)) {
      const errorMsg = `[validateFilterIds] Filter ID "${filterId}" not found in available filters. Available: ${Array.from(availableFilters).join(", ")}`;
      if (DEBUG) console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
}

/**
 * Truncates text if it exceeds maximum length with warning
 * @param text - Text to validate
 * @param maxLength - Maximum allowed length
 * @returns Truncated text or original if within limit
 */
export function validateTextLength(
  text: string,
  maxLength: number = ABSOLUTE_MAX_TEXT_LENGTH,
): string {
  if (text.length > maxLength) {
    if (DEBUG) {
      console.warn(
        `[validateTextLength] Text length (${text.length}) exceeds maximum (${maxLength}). Truncating.`,
      );
    }
    return text.substring(0, maxLength);
  }
  return text;
}

/**
 * Ensures SVG viewBox dimensions maintain aspect ratio
 * @param width - SVG width
 * @param height - SVG height
 * @returns Object with consistent width and height
 */
export function ensureViewboxConsistency(
  width: number,
  height: number,
): { width: number; height: number } {
  // Force square aspect ratio for consistent scaling
  const size = Math.max(width, height);
  if (DEBUG && width !== height) {
    console.warn(
      `[ensureViewboxConsistency] Non-square dimensions (${width}x${height}) normalized to square (${size}x${size})`,
    );
  }
  return { width: size, height: size };
}

// ============= TYPE GUARD =============
/**
 * Type guard to validate fingerprint has required properties
 * @param fingerprint - Unknown value to validate
 * @returns true if fingerprint is a valid StyleFingerprint
 */
function isFingerprintValid(
  fingerprint: unknown,
): fingerprint is StyleFingerprint {
  if (!fingerprint || typeof fingerprint !== "object") return false;
  const fp = fingerprint as Record<string, unknown>;
  return (
    typeof fp.palette === "string" &&
    typeof fp.chrome === "string" &&
    typeof fp.glow === "string"
  );
}

// ============= FONT/EFFECT LOOKUP CACHE =============
// Extract font/effect maps to module level to avoid recreating on each call
const GLOW_FONT_MAP: Record<string, string> = {
  softNeon: "modern",
  hardNeon: "hausChunky",
  pulseGlow: "roadRageBold",
  auraGlow: "indizzlePerspective",
};

const CHROME_FONT_MAP: Record<string, string> = {
  mirrorChrome: "hausChunky",
  brushedMetal: "strangerOutline",
  rainbowChrome: "hausChunky",
  darkChrome: "strangerOutline",
};

const PALETTE_FONT_MAP: Record<string, string> = {
  // All 12 actual palettes from PALETTE_VARIANTS in demoStyleVariants.ts
  neonPinkBlue: "lazerItalic",
  magentaCyan: "hausChunky",
  sunsetPurple: "indizzlePerspective",
  electricBlue: "strangerOutline",
  laserGreen: "roadRageBold",
  hotPinkGold: "lazerItalic",
  cyberOrange: "chromeDreams",
  vaporTeal: "neonNights", // Was missing - now mapped
  midnightNeon: "hausChunky",
  retroRed: "roadRageBold", // Was missing - now mapped
  arcadeYellow: "strangerOutline", // Was missing - now mapped
  ultraviolet: "indizzlePerspective",
};

const GLOW_EFFECT_MAP: Record<string, string> = {
  softNeon: "defaultNeon",
  hardNeon: "neonPinkScanlines",
  pulseGlow: "pinkBloom",
  auraGlow: "bloomAura",
};

const CHROME_EFFECT_MAP: Record<string, string> = {
  mirrorChrome: "chromeReflective",
  brushedMetal: "defaultNeon",
  rainbowChrome: "chromeReflective",
  darkChrome: "redOutlined",
};

const PALETTE_EFFECT_MAP: Record<string, string> = {
  // All 12 actual palettes from PALETTE_VARIANTS in demoStyleVariants.ts
  // Maps palette to color-specific glow filters from modern parametric system
  neonPinkBlue: "neonGlowPink",
  magentaCyan: "neonGlowCyan",
  sunsetPurple: "purpleGlow",
  electricBlue: "blueGlow",
  laserGreen: "neonGlowGreen",
  hotPinkGold: "neonGlowPink",
  cyberOrange: "neonGlowOrange",
  vaporTeal: "neonGlowCyan", // Was missing - now mapped
  midnightNeon: "purpleGlow",
  retroRed: "redGlow", // Was missing - now mapped
  arcadeYellow: "yellowGlow", // Was missing - now mapped
  ultraviolet: "purpleGlow",
};

// Maps gradient variants to effects (6 gradient types)
const GRADIENT_EFFECT_MAP: Record<string, string> = {
  horizontal: "neonCyan",
  vertical: "neonPink",
  diagonal: "glitchCyan",
  radial: "geometricBuild",
  metallicBand: "chromeReflective",
  sunsetFade: "neonOrange",
};

// Maps gradient variants to fonts (6 gradient types)
const GRADIENT_FONT_MAP: Record<string, string> = {
  horizontal: "lazerItalic",
  vertical: "strangerOutline",
  diagonal: "hausChunky",
  radial: "roadRageBold",
  metallicBand: "chromeDreams",
  sunsetFade: "indizzlePerspective",
};

// Maps lighting variants to effects (4 lighting types)
const LIGHTING_EFFECT_MAP: Record<string, string> = {
  topLeft: "chromeReflective",
  topRight: "geometricBuild",
  bottomLeft: "deepPurple",
  front: "neonCyan",
};

// Maps lighting variants to fonts (4 lighting types)
const LIGHTING_FONT_MAP: Record<string, string> = {
  topLeft: "hausChunky",
  topRight: "lazerItalic",
  bottomLeft: "strangerOutline",
  front: "roadRageBold",
};

// Maps bloom variants to effects (3 bloom levels)
const BLOOM_EFFECT_MAP: Record<string, string> = {
  low: "neonCyan",
  medium: "neonPink",
  heavy: "pinkBloom",
};

// Maps texture variants to effects (4 texture types)
const TEXTURE_EFFECT_MAP: Record<string, string> = {
  none: "defaultNeon",
  grain: "glitchCyan",
  halftone: "geometricBuild",
  scanlines: "neonPinkScanlines",
};

// ============= 80S FONT STYLES =============
// Expanded set of 80s-inspired fonts with better variety
export const DEMO_FONT_STYLES: Record<string, DemoFontStyle> = {
  // LAZER 84: Italic with scanlines - futuristic italic
  lazerItalic: {
    fontFamily: "Georgia, serif",
    fontSize: 120,
    fontWeight: "700",
    fontStyle: "italic",
    letterSpacing: 8,
    textTransform: "uppercase",
    textSkew: -15,
  },

  // HAUSER: Chunky block letters - blocky and heavy
  hausChunky: {
    fontFamily: "'Courier New', monospace",
    fontSize: 140,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 12,
    textTransform: "uppercase",
  },

  // STRANGER: Outlined/stroked text - bold outline style
  strangerOutline: {
    fontFamily: "Impact, sans-serif",
    fontSize: 130,
    fontWeight: "700",
    fontStyle: "normal",
    letterSpacing: 6,
    textTransform: "uppercase",
  },

  // INDIZZLE: Italic with perspective - skewed italic
  indizzlePerspective: {
    fontFamily: "Trebuchet MS, sans-serif",
    fontSize: 110,
    fontWeight: "400",
    fontStyle: "italic",
    letterSpacing: 4,
    textTransform: "uppercase",
    textSkew: -20,
    textRotate: -8,
  },

  // ROAD RAGE: Bold with bloom - aggressive monospace
  roadRageBold: {
    fontFamily: "'Courier New', monospace",
    fontSize: 95,
    fontWeight: "700",
    fontStyle: "normal",
    letterSpacing: 10,
    textTransform: "uppercase",
  },

  // SYNTHWAVE: Thin elegant lines
  synthwaveThin: {
    fontFamily: "Arial, sans-serif",
    fontSize: 110,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 3,
    textTransform: "uppercase",
    textRotate: 5,
  },

  // CHROME DREAMS: Bold with minimal spacing
  chromeDreams: {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 125,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // NEON NIGHTS: Extra large, minimal
  neonNights: {
    fontFamily: "Verdana, sans-serif",
    fontSize: 150,
    fontWeight: "700",
    fontStyle: "normal",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // RETRO WAVE: Condensed style
  retroWave: {
    fontFamily: "Times New Roman, serif",
    fontSize: 105,
    fontWeight: "700",
    fontStyle: "italic",
    letterSpacing: 5,
    textTransform: "uppercase",
    textSkew: -10,
  },

  // PIXEL DREAM: Monospace classic
  pixelDream: {
    fontFamily: "monospace",
    fontSize: 100,
    fontWeight: "400",
    fontStyle: "normal",
    letterSpacing: 8,
    textTransform: "uppercase",
  },

  // Fallback - modern sans-serif
  modern: {
    fontFamily: "Arial, sans-serif",
    fontSize: 110,
    fontWeight: "700",
    fontStyle: "normal",
    letterSpacing: 5,
    textTransform: "uppercase",
  },
};

// ============= EFFECT CONFIGURATIONS =============
export const DEMO_EFFECT_STYLES: Record<string, DemoEffectStyle> = {
  // ===== NEON GLOW STYLES =====
  neonCyan: {
    fillColor: "#00FFFF",
    strokeColor: "#00FFFF",
    strokeWidth: 1,
    filterIds: ["neonGlowCyan"],
    textAnchor: "middle",
  },

  neonPink: {
    fillColor: "#FF1493",
    strokeColor: "#FF69B4",
    strokeWidth: 1.5,
    filterIds: ["neonGlowPink"],
    textAnchor: "middle",
  },

  neonPurple: {
    fillColor: "#DA70D6",
    strokeColor: "#FF00FF",
    strokeWidth: 1.5,
    filterIds: ["purpleGlow"],
    textAnchor: "middle",
  },

  neonGreen: {
    fillColor: "#00FF00",
    strokeColor: "#32FF32",
    strokeWidth: 1,
    filterIds: ["neonGlowGreen"],
    textAnchor: "middle",
  },

  neonOrange: {
    fillColor: "#FF8C00",
    strokeColor: "#FFB347",
    strokeWidth: 2,
    filterIds: ["neonGlowOrange"],
    textAnchor: "middle",
  },

  // ===== GRADIENT/CHROME STYLES =====
  chromeReflective: {
    fillColor: "url(#chromeGradient)",
    strokeColor: "#00FFFF",
    strokeWidth: 2,
    filterIds: ["chromeReflection", "neonGlowCyan"],
    textAnchor: "middle",
  },

  goldChrome: {
    fillColor: "url(#goldGradient)",
    strokeColor: "#FFD700",
    strokeWidth: 2,
    filterIds: ["chromeReflection"],
    textAnchor: "middle",
  },

  rainbowChrome: {
    fillColor: "url(#rainbowGradient)",
    strokeColor: "#FFFFFF",
    strokeWidth: 1.5,
    filterIds: ["chromeReflection", "neonGlowCyan"],
    textAnchor: "middle",
  },

  // ===== SOLID COLOR STYLES =====
  solidRed: {
    fillColor: "#FF0000",
    strokeColor: "#FF3333",
    strokeWidth: 2,
    filterIds: ["redGlow"],
    textAnchor: "middle",
  },

  solidBlue: {
    fillColor: "#0066FF",
    strokeColor: "#00AAFF",
    strokeWidth: 2,
    filterIds: ["blueGlow"],
    textAnchor: "middle",
  },

  solidYellow: {
    fillColor: "#FFFF00",
    strokeColor: "#FFFF33",
    strokeWidth: 2,
    filterIds: ["yellowGlow"],
    textAnchor: "middle",
  },

  // ===== OUTLINED/STROKE STYLES =====
  redOutlined: {
    fillColor: "none",
    strokeColor: "#FF0000",
    strokeWidth: 4,
    filterIds: ["redGlow", "outlineEffect"],
    textAnchor: "middle",
  },

  cyanOutlined: {
    fillColor: "none",
    strokeColor: "#00FFFF",
    strokeWidth: 3,
    filterIds: ["neonGlowCyan", "outlineEffect"],
    textAnchor: "middle",
  },

  whiteOutlined: {
    fillColor: "none",
    strokeColor: "#FFFFFF",
    strokeWidth: 3,
    filterIds: ["outlineEffect"],
    textAnchor: "middle",
  },

  // ===== BLOOM/AURA STYLES =====
  pinkBloom: {
    fillColor: "#FF69B4",
    strokeColor: "#FF1493",
    strokeWidth: 2,
    filterIds: ["bloomAura", "neonGlowPink"],
    textAnchor: "middle",
  },

  purpleBloom: {
    fillColor: "#9D4EDD",
    strokeColor: "#DA70D6",
    strokeWidth: 2,
    filterIds: ["bloomAura", "purpleGlow"],
    textAnchor: "middle",
  },

  cyanBloom: {
    fillColor: "#00FFFF",
    strokeColor: "#00BFFF",
    strokeWidth: 2,
    filterIds: ["bloomAura", "neonGlowCyan"],
    textAnchor: "middle",
  },

  // ===== SHADOW/DEPTH STYLES =====
  shadowChrome: {
    fillColor: "url(#chromeGradient)",
    strokeColor: "#00FFFF",
    strokeWidth: 2,
    filterIds: ["chromeReflection", "shadowEffect"],
    textAnchor: "middle",
  },

  deepPurple: {
    fillColor: "#6A0572",
    strokeColor: "#DA70D6",
    strokeWidth: 3,
    filterIds: ["purpleGlow", "perspectiveEffect"],
    textAnchor: "middle",
  },

  // ===== GLITCH & EXPERIMENTAL STYLES =====
  glitchCyan: {
    fillColor: "#00FFFF",
    strokeColor: "#FF0000",
    strokeWidth: 2,
    filterIds: ["neonGlowCyan", "chromaticAberration"],
    textAnchor: "middle",
  },

  geometricBuild: {
    fillColor: "url(#rainbowGradient)",
    strokeColor: "#00FFFF",
    strokeWidth: 1.5,
    filterIds: ["chromeReflection", "perspectiveEffect"],
    textAnchor: "middle",
  },

  neonPinkScanlines: {
    fillColor: "#FF1493",
    strokeColor: "#FF69B4",
    strokeWidth: 1.5,
    filterIds: ["neonGlowPink", "scanlinesEffect"],
    textAnchor: "middle",
  },

  purplePerspective: {
    fillColor: "#9D4EDD",
    strokeColor: "#DA70D6",
    strokeWidth: 2,
    filterIds: ["purpleGlow", "perspectiveEffect"],
    textAnchor: "middle",
  },

  // ===== DEFAULT =====
  defaultNeon: {
    fillColor: "#00FFFF",
    strokeColor: "#00FFFF",
    strokeWidth: 1,
    filterIds: ["neonGlowCyan"],
    textAnchor: "middle",
  },
};

// ============= CONSOLIDATED STYLE MAPPINGS =============
const STYLE_MAPPINGS = {
  fonts: {
    palette: {
      // Original 9 palettes
      neonPinkBlue: "lazerItalic",
      magentaCyan: "hausChunky",
      hotPinkGold: "lazerItalic",
      sunsetPurple: "indizzlePerspective",
      ultraviolet: "indizzlePerspective",
      electricBlue: "strangerOutline",
      cyberOrange: "roadRageBold",
      laserGreen: "strangerOutline",
      midnightNeon: "hausChunky",
      // Synthwave (pink/purple/cyan)
      synthwave: "lazerItalic",
      // Vaporwave (pastel)
      vaporwave: "chromeDreams",
      // Cyberpunk (neon + dark)
      cyberpunk: "strangerOutline",
      // Retro (orange/brown/gold)
      retro: "retroWave",
      // Icy (cyan/blue/white)
      icy: "neonNights",
      // Molten (red/orange/yellow)
      molten: "roadRageBold",
    } as Record<string, string>,
    chrome: {
      mirrorChrome: "hausChunky",
      brushedMetal: "strangerOutline",
      rainbowChrome: "hausChunky",
      darkChrome: "strangerOutline",
    } as Record<string, string>,
    glow: {
      softNeon: "modern",
      hardNeon: "hausChunky",
      pulseGlow: "roadRageBold",
      auraGlow: "indizzlePerspective",
    } as Record<string, string>,
  },
  effects: {
    palette: {
      // Original 9 palettes
      neonPinkBlue: "neonCyan",
      magentaCyan: "chromeReflective",
      hotPinkGold: "pinkBloom",
      sunsetPurple: "purpleBloom",
      ultraviolet: "deepPurple",
      electricBlue: "chromeReflective",
      cyberOrange: "neonOrange",
      laserGreen: "neonGreen",
      midnightNeon: "shadowChrome",
      // Synthwave (pink/purple/cyan)
      synthwave: "neonPink",
      // Vaporwave (pastel)
      vaporwave: "cyanBloom",
      // Cyberpunk (neon + dark)
      cyberpunk: "glitchCyan",
      // Retro (orange/brown/gold)
      retro: "neonOrange",
      // Icy (cyan/blue/white)
      icy: "chromeReflective",
      // Molten (red/orange/yellow)
      molten: "solidRed",
    } as Record<string, string>,
    chrome: {
      mirrorChrome: "chromeReflective",
      brushedMetal: "defaultNeon",
      rainbowChrome: "geometricBuild",
      darkChrome: "shadowChrome",
    } as Record<string, string>,
    glow: {
      softNeon: "defaultNeon",
      hardNeon: "neonPurple",
      pulseGlow: "pinkBloom",
      auraGlow: "cyanBloom",
    } as Record<string, string>,
  },
} as const;

// ============= SVG FILTER DEFINITIONS =============
// Memoized filter cache - now keyed by intensity level
let DEMO_FILTERS_CACHE: Record<DesignIntensity, string> = {
  subtle: "",
  balanced: "",
  intense: "",
  extreme: "",
};

function generateDemoFilters(intensity: DesignIntensity = "balanced"): string {
  // Return cached result if available
  if (DEMO_FILTERS_CACHE[intensity]) {
    return DEMO_FILTERS_CACHE[intensity];
  }

  // Get intensity multipliers for scaling filter values
  const multiplier = getFilterIntensityMultiplier(intensity);

  // Use the multiplier values directly for blur, saturation, and opacity
  const blurScaled = multiplier.stdDeviation.toFixed(2);
  const saturationScaled = multiplier.saturation.toFixed(2);
  const opacityScaled = Math.min(multiplier.bloomOpacity, 1).toFixed(2);
  const bloomBlurScaled = (multiplier.glowSpread * 2).toFixed(2); // Scale glow spread to blur units

  const filtersString = `
    <defs>
      <!-- GRADIENTS -->
      <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#00BFFF;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#00FFFF;stop-opacity:1" />
      </linearGradient>

      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#FFFF99;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
      </linearGradient>

      <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#FF0000;stop-opacity:1" />
        <stop offset="20%" style="stop-color:#FF7700;stop-opacity:1" />
        <stop offset="40%" style="stop-color:#FFFF00;stop-opacity:1" />
        <stop offset="60%" style="stop-color:#00FF00;stop-opacity:1" />
        <stop offset="80%" style="stop-color:#0000FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#FF00FF;stop-opacity:1" />
      </linearGradient>

      <!-- NEON GLOW EFFECTS (intensity-scaled) -->
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurScaled}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${saturationScaled}" result="saturated" />
        <feOffset in="saturated" dx="0" dy="0" result="offsetblur" />
        <feComponentTransfer in="offsetblur" result="opaque">
          <feFuncA type="linear" slope="${opacityScaled}" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="opaque" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurScaled}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.5 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#00FF00" flood-opacity="${opacityScaled}" result="greenFlood" />
        <feComposite in="saturated" in2="greenFlood" operator="in" result="greenGlow" />
        <feMerge>
          <feMergeNode in="greenGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowOrange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(multiplier.stdDeviation * 1.33).toFixed(2)}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.5 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#FF8C00" flood-opacity="${Math.min(0.6 * multiplier.bloomOpacity, 1).toFixed(2)}" result="orangeFlood" />
        <feComposite in="saturated" in2="orangeFlood" operator="in" result="orangeGlow" />
        <feMerge>
          <feMergeNode in="orangeGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(3.5 * (multiplier.stdDeviation / 3)).toFixed(2)}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.2 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#0066FF" flood-opacity="${opacityScaled}" result="blueFlood" />
        <feComposite in="saturated" in2="blueFlood" operator="in" result="blueGlow" />
        <feMerge>
          <feMergeNode in="blueGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="yellowGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurScaled}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${saturationScaled}" result="saturated" />
        <feFlood flood-color="#FFFF00" flood-opacity="${opacityScaled}" result="yellowFlood" />
        <feComposite in="saturated" in2="yellowFlood" operator="in" result="yellowGlow" />
        <feMerge>
          <feMergeNode in="yellowGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowPink" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(4 * (multiplier.stdDeviation / 3)).toFixed(2)}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.5 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#FF1493" flood-opacity="${Math.min(0.6 * multiplier.bloomOpacity, 1).toFixed(2)}" result="pinkFlood" />
        <feComposite in="saturated" in2="pinkFlood" operator="in" result="pinkGlow" />
        <feMerge>
          <feMergeNode in="pinkGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowCyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(3.5 * (multiplier.stdDeviation / 3)).toFixed(2)}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.2 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#00FFFF" flood-opacity="${opacityScaled}" result="cyanFlood" />
        <feComposite in="saturated" in2="cyanFlood" operator="in" result="cyanGlow" />
        <feMerge>
          <feMergeNode in="cyanGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurScaled}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${saturationScaled}" result="saturated" />
        <feFlood flood-color="#DA70D6" flood-opacity="${Math.min(0.6 * multiplier.bloomOpacity, 1).toFixed(2)}" result="purpleFlood" />
        <feComposite in="saturated" in2="purpleFlood" operator="in" result="purpleGlow" />
        <feMerge>
          <feMergeNode in="purpleGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${(4 * (multiplier.stdDeviation / 3)).toFixed(2)}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2.5 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feFlood flood-color="#FF0000" flood-opacity="${Math.min(0.7 * multiplier.bloomOpacity, 1).toFixed(2)}" result="redFlood" />
        <feComposite in="saturated" in2="redFlood" operator="in" result="redGlow" />
        <feMerge>
          <feMergeNode in="redGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- BLOOM AURA EFFECT (intensity-scaled) -->
      <filter id="bloomAura" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${bloomBlurScaled}" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="${(2 * multiplier.saturation).toFixed(2)}" result="saturated" />
        <feOffset in="saturated" dx="0" dy="0" result="offsetblur" />
        <feComponentTransfer in="offsetblur" result="opaque">
          <feFuncA type="linear" slope="${(0.4 * multiplier.bloomOpacity).toFixed(2)}" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="opaque" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- SCANLINES EFFECT -->
      <filter id="scanlinesEffect" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0 0.8" numOctaves="2" result="scanlines" />
        <feDisplacementMap in="SourceGraphic" in2="scanlines" scale="2" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <!-- CHROME REFLECTION EFFECT -->
      <filter id="chromeReflection" x="-50%" y="-50%" width="200%" height="200%">
        <feSpecularLighting in="SourceGraphic" surfaceScale="5" specularConstant="0.9" specularExponent="25" lighting-color="#ffffff" result="spec">
          <fePointLight x="-5000" y="-10000" z="20000" />
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.5" k3="0.5" k4="0" result="litPaint" />
        <feMerge>
          <feMergeNode in="litPaint" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- TEXTURE OVERLAYS -->
      <!-- SCANLINE TEXTURE PATTERN -->
      <pattern id="scanlineTexture" x="0" y="0" width="100%" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#000000" stroke-width="1" opacity="0.15"/>
      </pattern>

      <!-- GRID TEXTURE PATTERN -->
      <pattern id="gridTexture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#000000" stroke-width="0.5" opacity="0.1"/>
      </pattern>

      <!-- NOISE TEXTURE FILTER -->
      <filter id="noiseTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" seed="1" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <!-- CHROMATIC ABERRATION TEXTURE -->
      <filter id="chromaticAberration" x="-50%" y="-50%" width="200%" height="200%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="displacement" />
        <feOffset in="SourceGraphic" dx="2" dy="0" result="offsetR" />
        <feFlood flood-color="#FF0000" flood-opacity="0.3" result="redFlood" />
        <feComposite in="redFlood" in2="offsetR" operator="in" result="red" />
        <feOffset in="SourceGraphic" dx="-2" dy="0" result="offsetB" />
        <feFlood flood-color="#0000FF" flood-opacity="0.3" result="blueFlood" />
        <feComposite in="blueFlood" in2="offsetB" operator="in" result="blue" />
        <feMerge>
          <feMergeNode in="red" />
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="blue" />
        </feMerge>
      </filter>

      <!-- OUTLINE EFFECT -->
      <filter id="outlineEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="coloredBlur" />
        <feOffset in="coloredBlur" dx="0" dy="0" result="offsetblur" />
        <feMerge>
          <feMergeNode in="offsetblur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- PERSPECTIVE EFFECT (3D skew) -->
      <filter id="perspectiveEffect" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feOffset in="blur" dy="3" dx="2" result="shadow" />
        <feComponentTransfer in="shadow" result="shadow2">
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- SHADOW EFFECT (Depth shadow) -->
      <filter id="shadowEffect" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="coloredBlur" />
        <feOffset in="coloredBlur" dx="3" dy="4" result="offsetblur" />
        <feFlood floodColor="#000000" floodOpacity="0.3" result="offsetColor" />
        <feComposite in="offsetColor" in2="offsetblur" operator="in" result="offsetBlur" />
        <feComposite in="offsetBlur" in2="SourceGraphic" operator="arithmetic" k2="1" k3="1" result="shadow" />
        <feGaussianBlur in="shadow" stdDeviation="2" result="finalShadow" />
        <feMerge>
          <feMergeNode in="finalShadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  // Cache the result and return
  DEMO_FILTERS_CACHE[intensity] = filtersString;
  return filtersString;
}

// ============= ADVANCED SVG FEATURE HELPERS =============
/**
 * Determines if pixelated bitmap rendering should be used
 */
function shouldUsePixelated(fontStyle: DemoFontStyle): boolean {
  return (
    fontStyle.fontFamily.includes("Courier") && fontStyle.letterSpacing > 10
  );
}

/**
 * Calculates dynamic stroke width based on character position
 * Creates tapering effect from start to end
 */
function calculateDynamicStrokeWidth(
  index: number,
  totalChars: number,
  baseWidth: number,
): number {
  if (totalChars <= 1) return baseWidth;
  const ratio = index / (totalChars - 1);
  return (
    baseWidth *
    (STROKE_WIDTH_MIN_RATIO +
      ratio * (STROKE_WIDTH_MAX_RATIO - STROKE_WIDTH_MIN_RATIO))
  );
}

// ============= SVG BUILDER HELPER =============
interface SvgBuildConfig {
  text: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  fontStyle: DemoFontStyle;
  effectStyle: DemoEffectStyle;
  transformAttr: string;
  adjustedFontSize: number;
  intensity?: DesignIntensity; // Design intensity level for filter effect scaling
  fingerprint: StyleFingerprint; // Added to enable intelligent filter composition
}

/**
 * Builds the complete SVG document with all layers and effects
 */
function buildSvgDocument(config: SvgBuildConfig): string {
  const {
    text,
    width,
    height,
    centerX,
    centerY,
    fontStyle,
    effectStyle,
    transformAttr,
    adjustedFontSize,
    intensity = "balanced",
    fingerprint,
  } = config;

  const styleBlock = buildSvgStyles(fontStyle, effectStyle, adjustedFontSize);
  const glowLayer = buildGlowLayer(text, centerX, centerY, effectStyle);
  const mainLayer = buildMainLayer(
    text,
    centerX,
    centerY,
    transformAttr,
    effectStyle,
    width,
  );
  const effectLayers = buildEffectLayers(
    text,
    centerX,
    centerY,
    transformAttr,
    effectStyle,
    width,
  );

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}">
      <defs>
      </defs>
      ${styleBlock}
      ${composeLandingFilters(fingerprint, intensity)}
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#000000" />
      
      ${glowLayer}
      ${mainLayer}
      ${effectLayers}
    </svg>
  `;
}

/**
 * Builds the CSS style block for text rendering
 */
function buildSvgStyles(
  fontStyle: DemoFontStyle,
  effectStyle: DemoEffectStyle,
  adjustedFontSize: number,
): string {
  return `<style>
        text {
          font-family: ${fontStyle.fontFamily};
          font-size: ${adjustedFontSize}px;
          font-weight: ${fontStyle.fontWeight};
          font-style: ${fontStyle.fontStyle};
          letter-spacing: ${fontStyle.letterSpacing}px;
          text-transform: ${fontStyle.textTransform};
          text-anchor: ${effectStyle.textAnchor};
          dominant-baseline: middle;
          fill: ${effectStyle.fillColor};
          stroke: ${effectStyle.strokeColor};
          stroke-width: ${effectStyle.strokeWidth};
          stroke-linecap: round;
          stroke-linejoin: round;
          paint-order: stroke;
          ${shouldUsePixelated(fontStyle) ? "image-rendering: pixelated; font-kerning: none;" : ""}
        }
      </style>`;
}

/**
 * Builds the glow background layer for bloom effects
 */
function buildGlowLayer(
  text: string,
  centerX: number,
  centerY: number,
  effectStyle: DemoEffectStyle,
): string {
  if (!effectStyle.filterIds.includes("bloomAura")) return "";

  return `<!-- Glow background layer (for bloom effects) -->
      <text x="${centerX}" y="${centerY}" filter="url(#bloomAura)" opacity="0.6">
        ${text}
      </text>`;
}

/**
 * Builds the main text layer with primary filter
 */
function buildMainLayer(
  text: string,
  centerX: number,
  centerY: number,
  transformAttr: string,
  effectStyle: DemoEffectStyle,
  width: number,
): string {
  return `<!-- Main text with applied filters -->
      <text 
        x="${centerX}" 
        y="${centerY}"${transformAttr}
        ${effectStyle.filterIds.length > 0 ? `filter="url(#${effectStyle.filterIds[0]})"` : ""}
        textLength="${width * TEXT_LENGTH_RATIO}"
        lengthAdjust="spacingAndGlyphs"
      >
        ${text}
      </text>`;
}

/**
 * Builds secondary and tertiary effect layers for depth
 */
function buildEffectLayers(
  text: string,
  centerX: number,
  centerY: number,
  transformAttr: string,
  effectStyle: DemoEffectStyle,
  width: number,
): string {
  if (effectStyle.filterIds.length <= 1) return "";

  return `<!-- Secondary effect layer for depth -->
      <text 
        x="${centerX}" 
        y="${centerY}"${transformAttr}
        filter="url(#${effectStyle.filterIds[1]})"
        opacity="0.6"
        textLength="${width * TEXT_LENGTH_RATIO}"
        lengthAdjust="spacingAndGlyphs"
      >
        ${text}
      </text>
      <!-- Tertiary effect layer for shadow -->
      <text 
        x="${centerX + 2}" 
        y="${centerY + 2}"
        opacity="0.3"
        textLength="${width * TEXT_LENGTH_RATIO}"
        lengthAdjust="spacingAndGlyphs"
      >
        ${text}
      </text>`;
}

// ============= MAIN RENDERER =============
export function generateDemoSvg(config: DemoSvgConfig): string {
  try {
    // Validate and escape text for SVG safety
    const validatedText = validateTextLength(config.text);
    const escapedText = escapeHtml(validatedText);

    // Calculate optimal dimensions based on text length and ensure consistency
    const optimalDims = calculateOptimalDimensions(
      escapedText,
      config.width || DEFAULT_CANVAS_SIZE,
    );
    const { width: rawWidth, height: rawHeight } = ensureViewboxConsistency(
      config.width || optimalDims.width,
      config.height || optimalDims.height,
    );

    const { text, fingerprint, randomSeed } = config;
    const width = rawWidth;
    const height = rawHeight;

    debugLog("generateDemoSvg", "Starting SVG generation with text:", text);
    debugLog("generateDemoSvg", "Fingerprint:", fingerprint);

    // Select font style based on fingerprint (with optional randomization)
    debugLog("generateDemoSvg", "Selecting font style");
    const fontStyle = selectFontStyle(fingerprint, randomSeed);
    debugLog("generateDemoSvg", "Selected font style:", fontStyle);

    let effectStyle = selectEffectStyle(fingerprint, randomSeed);
    debugLog("generateDemoSvg", "Selected effect style:", effectStyle);

    // Feature: Apply color overrides if provided
    if (config.colorOverride) {
      effectStyle = applyColorOverride(effectStyle, config.colorOverride);
      debugLog(
        "generateDemoSvg",
        "Applied color override:",
        config.colorOverride,
      );
    }

    // Feature: Apply intensity scaling if provided
    if (effectStyle.intensity !== undefined && effectStyle.intensity !== 1) {
      effectStyle = applyIntensityScaling(effectStyle, effectStyle.intensity);
      debugLog(
        "generateDemoSvg",
        "Applied intensity scaling:",
        effectStyle.intensity,
      );
    }

    // Validate filter IDs exist in the generated filters and apply fallback if invalid
    try {
      validateFilterIds(effectStyle);
    } catch (filterError) {
      debugError(
        "generateDemoSvg",
        "Filter validation failed for effect, switching to defaultNeon",
        filterError,
      );
      // Fall back to safe default effect
      effectStyle = DEMO_EFFECT_STYLES.defaultNeon;
      debugLog("generateDemoSvg", "Using safe fallback effect:", effectStyle);
    }

    // Dynamically calculate font size based on text length for better centering
    // Shorter text = larger, longer text = smaller
    let adjustedFontSize = fontStyle.fontSize;
    if (text.length > FONT_SIZE_THRESHOLD_LONG) {
      adjustedFontSize = Math.max(
        MIN_FONT_SIZE,
        fontStyle.fontSize * (FONT_SIZE_THRESHOLD_LONG / text.length),
      );
    } else if (text.length > FONT_SIZE_THRESHOLD_MEDIUM) {
      adjustedFontSize = fontStyle.fontSize * MEDIUM_TEXT_ADJUSTMENT;
    }
    adjustedFontSize = Math.round(adjustedFontSize);

    // Calculate text positioning with proper centering
    const centerX = width / 2;
    // Use dominant-baseline="middle" with adjusted centerY for better vertical centering
    const centerY = height / 2;
    debugLog(
      "generateDemoSvg",
      `Text positioning - centerX: ${centerX}, centerY: ${centerY}, fontSize: ${adjustedFontSize}`,
    );

    // Build the SVG with fonts embedded properly for data URLs
    // Build transform string combining skew and rotate if both exist
    const transformParts: string[] = [];
    if (fontStyle.textSkew) transformParts.push(`skewX(${fontStyle.textSkew})`);
    if (fontStyle.textRotate)
      transformParts.push(
        `rotate(${fontStyle.textRotate} ${centerX} ${centerY})`,
      );
    const transformAttr =
      transformParts.length > 0
        ? ` transform="${transformParts.join(" ")}"`
        : "";

    const svg = buildSvgDocument({
      text,
      width,
      height,
      centerX,
      centerY,
      fontStyle,
      effectStyle,
      transformAttr,
      adjustedFontSize,
      intensity: config.intensity,
      fingerprint,
    });

    if (DEBUG) {
      debugLog(
        "generateDemoSvg",
        `SVG generated successfully (${svg.length} bytes)`,
      );
    }
    return svg;
  } catch (error) {
    debugError("generateDemoSvg", "Error generating SVG:", error);
    throw error;
  }
}

// ============= HASH-BASED STYLE SELECTION =============
/**
 * Convert variant names to deterministic indices for hash computation
 */
function getVariantIndex<T extends string>(
  variantValue: T,
  variantPool: readonly T[],
): number {
  const index = variantPool.indexOf(variantValue);
  return index >= 0 ? index : 0; // Default to 0 if not found
}

/**
 * Compute deterministic hash from all 7 fingerprint dimensions
 * Combines all dimensions into single index for perfect distribution
 * Ensures each fingerprint maps to effects/fonts with minimal collision
 *
 * Formula: palette + chrome*12 + glow*48 + gradient*192 + lighting*1152 + bloom*4608 + texture*13824
 * Range: 0 to 55,295 (covers all 9,216 unique fingerprints with even distribution)
 */
function computeFingerprintHash(fingerprint: StyleFingerprint): number {
  const paletteIdx = getVariantIndex(fingerprint.palette, PALETTE_VARIANTS);
  const chromeIdx = getVariantIndex(fingerprint.chrome, CHROME_VARIANTS);
  const glowIdx = getVariantIndex(fingerprint.glow, GLOW_VARIANTS);
  const gradientIdx = getVariantIndex(fingerprint.gradient, GRADIENT_VARIANTS);
  const lightingIdx = getVariantIndex(fingerprint.lighting, LIGHTING_VARIANTS);
  const bloomIdx = getVariantIndex(fingerprint.bloom, BLOOM_VARIANTS);
  const textureIdx = getVariantIndex(fingerprint.texture, TEXTURE_VARIANTS);

  // Weighted sum ensuring each dimension contributes independently
  const hash =
    paletteIdx +
    chromeIdx * PALETTE_VARIANTS.length +
    glowIdx * PALETTE_VARIANTS.length * CHROME_VARIANTS.length +
    gradientIdx *
      PALETTE_VARIANTS.length *
      CHROME_VARIANTS.length *
      GLOW_VARIANTS.length +
    lightingIdx *
      PALETTE_VARIANTS.length *
      CHROME_VARIANTS.length *
      GLOW_VARIANTS.length *
      GRADIENT_VARIANTS.length +
    bloomIdx *
      PALETTE_VARIANTS.length *
      CHROME_VARIANTS.length *
      GLOW_VARIANTS.length *
      GRADIENT_VARIANTS.length *
      LIGHTING_VARIANTS.length +
    textureIdx *
      PALETTE_VARIANTS.length *
      CHROME_VARIANTS.length *
      GLOW_VARIANTS.length *
      GRADIENT_VARIANTS.length *
      LIGHTING_VARIANTS.length *
      BLOOM_VARIANTS.length;

  return hash;
}

// ============= STYLE ARRAYS FOR HASH-BASED INDEXING =============
/**
 * Convert DEMO_EFFECT_STYLES Record to array for deterministic index-based access
 * Maintains order by converting keys to array and sorting for consistency
 */
const EFFECT_STYLES_ARRAY = Object.values(DEMO_EFFECT_STYLES);

/**
 * Convert DEMO_FONT_STYLES Record to array for deterministic index-based access
 */
const FONT_STYLES_ARRAY = Object.values(DEMO_FONT_STYLES);

// ============= GENERIC STYLE SELECTION (DRY) =============
/**
 * Generic style selection by priority with multiple fallback maps
 * Eliminates code duplication between font and effect style selection
 * @param fingerprint - Style fingerprint for deterministic selection
 * @param maps - Map arrays ordered by priority [palette, chrome, glow]
 * @param styles - Style definitions record to select from
 * @param fallbackKey - Fallback style key if no mapping found
 * @param randomSeed - Optional seed for random selection
 * @returns Selected style or fallback
 */
function selectStyleByPriority<T>(
  fingerprint: StyleFingerprint,
  maps: Record<string, string>[],
  styles: Record<string, T>,
  fallbackKey: string,
  randomSeed?: number,
): T {
  // If random seed provided, select a random style
  if (randomSeed !== undefined) {
    const randomKey = selectRandomKey(maps[0], randomSeed); // Use first map for random pool
    return styles[randomKey] || styles[fallbackKey];
  }

  // Priority-based selection: try each dimension in order
  // Maps correspond to: [palette, chrome, glow, gradient, lighting, bloom, texture]
  const dimensionKeys = [
    fingerprint.palette,
    fingerprint.chrome,
    fingerprint.glow,
    fingerprint.gradient,
    fingerprint.lighting,
    fingerprint.bloom,
    fingerprint.texture,
  ];

  for (let i = 0; i < Math.min(maps.length, dimensionKeys.length); i++) {
    const selectedKey = maps[i][dimensionKeys[i]];
    if (selectedKey) {
      const style = styles[selectedKey];
      if (style) return style;
    }
  }

  return styles[fallbackKey];
}

// ============= STYLE SELECTION WRAPPERS =============
function selectFontStyle(
  fingerprint: StyleFingerprint,
  randomSeed?: number,
): DemoFontStyle {
  // Validate fingerprint exists and has required properties
  if (!isFingerprintValid(fingerprint)) {
    debugWarn("selectFontStyle", "Invalid fingerprint, using default font");
    return DEMO_FONT_STYLES.modern;
  }

  // Use hash-based selection for perfect distribution
  // Compute deterministic hash from all 7 fingerprint dimensions
  const hash = computeFingerprintHash(fingerprint);

  // Index into font styles array - deterministically maps any fingerprint to a font
  const fontIndex = hash % FONT_STYLES_ARRAY.length;
  const fontStyle = FONT_STYLES_ARRAY[fontIndex] || DEMO_FONT_STYLES.modern;

  debugLog(
    "selectFontStyle",
    `Selected font style via hash (hash=${hash}, index=${fontIndex})`,
    fontStyle,
  );
  return fontStyle;
}

function selectEffectStyle(
  fingerprint: StyleFingerprint,
  randomSeed?: number,
): DemoEffectStyle {
  // Validate fingerprint exists and has required properties
  if (!isFingerprintValid(fingerprint)) {
    debugWarn("selectEffectStyle", "Invalid fingerprint, using default effect");
    return DEMO_EFFECT_STYLES.defaultNeon;
  }

  // Use hash-based selection for perfect distribution
  // Compute deterministic hash from all 7 fingerprint dimensions
  const hash = computeFingerprintHash(fingerprint);

  // Index into effect styles array - deterministically maps any fingerprint to an effect
  const effectIndex = hash % EFFECT_STYLES_ARRAY.length;
  let effectStyle =
    EFFECT_STYLES_ARRAY[effectIndex] || DEMO_EFFECT_STYLES.defaultNeon;

  debugLog(
    "selectEffectStyle",
    `Selected effect style via hash (hash=${hash}, index=${effectIndex})`,
    effectStyle,
  );

  // Validate that all referenced filter IDs exist in the filter definitions
  try {
    validateFilterIds(effectStyle);
  } catch (validationError) {
    debugError(
      "selectEffectStyle",
      `Filter validation failed for effect (${effectStyle}), falling back to defaultNeon`,
      validationError,
    );
    // Return safe default if validation fails
    return DEMO_EFFECT_STYLES.defaultNeon;
  }

  return effectStyle;
}

// ============= CONVERT SVG STRING TO DATA URL =============
export function svgToDataUrl(svgString: string): string {
  try {
    if (DEBUG)
      console.log(
        "[svgToDataUrl] Converting SVG to data URL, SVG length:",
        svgString.length,
      );

    // Trim leading/trailing whitespace
    const trimmedSvg = svgString.trim();
    if (DEBUG)
      console.log("[svgToDataUrl] After trim, SVG length:", trimmedSvg.length);

    if (!trimmedSvg || trimmedSvg.length === 0) {
      throw new Error("SVG string is empty");
    }

    // Validate SVG has required structure
    if (!trimmedSvg.includes("<svg") || !trimmedSvg.includes("</svg>")) {
      throw new Error("SVG string is missing <svg> tags");
    }

    let base64: string;
    if (typeof window !== "undefined") {
      // Browser environment
      try {
        // First try direct btoa
        base64 = btoa(trimmedSvg);
        if (DEBUG) console.log("[svgToDataUrl] Direct btoa successful");
      } catch (directError) {
        if (DEBUG)
          console.log(
            "[svgToDataUrl] Direct btoa failed, trying with encoding:",
            directError,
          );
        // Fallback: use encodeURIComponent + unescape for UTF-8 handling
        try {
          base64 = btoa(unescape(encodeURIComponent(trimmedSvg)));
          if (DEBUG)
            console.log(
              "[svgToDataUrl] Encoded btoa successful after encodeURIComponent",
            );
        } catch (encodedError) {
          console.error(
            "[svgToDataUrl] Encoded btoa also failed:",
            encodedError,
          );
          throw encodedError;
        }
      }
    } else {
      // Node.js environment (for SSR/API)
      base64 = Buffer.from(trimmedSvg).toString("base64");
      if (DEBUG) console.log("[svgToDataUrl] Using Node.js Buffer");
    }

    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    if (DEBUG)
      console.log(
        "[svgToDataUrl] Data URL created, length:",
        dataUrl.length,
        "first 100 chars:",
        dataUrl.substring(0, 100),
      );

    // Validate that we can decode the base64 back to SVG
    if (DEBUG && typeof window !== "undefined") {
      try {
        const decodedString = atob(base64);
        console.log(
          "[svgToDataUrl] Validation: Successfully decoded base64, length:",
          decodedString.length,
        );
        if (decodedString.includes("<svg")) {
          console.log(
            "[svgToDataUrl] Validation: Decoded content contains <svg>",
          );
        } else {
          console.warn(
            "[svgToDataUrl] Validation: Decoded content missing <svg>",
          );
        }
      } catch (decodeError) {
        console.error(
          "[svgToDataUrl] Validation: Failed to decode base64:",
          decodeError,
        );
      }
    }

    return dataUrl;
  } catch (error) {
    console.error("[svgToDataUrl] Error converting SVG:", error);
    throw error;
  }
}
