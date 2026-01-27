import type { LogoConfig } from "./logoGenerator";
import {
  DEMO_NEON_PALETTES,
  DEMO_NEON_GRADIENTS,
  DEMO_NEON_GLOWS,
  DEMO_NEON_CHROMES,
  DEMO_NEON_BLOOMS,
  DEMO_NEON_TEXTURES,
  DEMO_NEON_LIGHTINGS,
} from "./demoNeonStyleVariants";
import {
  SCARCITY_MESSAGES,
  PRESTIGE_COPY,
  COLLECTIBILITY_FEATURES,
  getScarcityMessage,
} from "./demoLimitedEditionPsychology";
import { createDemoMetadata, DEMO_EXCLUSIVITY_MESSAGE } from "./demoMetadata";

export const IS_DEMO_MODE = true;

export const DEMO_MODE_LABEL = "🟣 DEMO MODE – 80s EXCLUSIVE FORGE";

export const DEMO_PRESET_KEY = "demo-80s-exclusive";

// Demo seed pool range: 100_000_000 to 100_008_999 (9000 seeds)
// These seeds are reserved for demo mode and managed by DemoSeedPool database model.
// Refer to lib/demoSeedPoolManager.ts for seed management functions.
export const DEMO_SEED_BASE = 100_000_000;
export const DEMO_SEED_TOTAL = 9000;
export const DEMO_SEED_MAX = DEMO_SEED_BASE + DEMO_SEED_TOTAL - 1;

/**
 * DEMO MODE STYLE POOLS
 * Connected to enforced neon constraints for visual exclusivity
 */
export const DEMO_STYLE_POOLS = {
  palettes: DEMO_NEON_PALETTES,
  gradients: DEMO_NEON_GRADIENTS,
  glows: DEMO_NEON_GLOWS,
  chromes: DEMO_NEON_CHROMES,
  blooms: DEMO_NEON_BLOOMS,
  textures: DEMO_NEON_TEXTURES,
  lightings: DEMO_NEON_LIGHTINGS,
} as const;

/**
 * DEMO MESSAGING & PSYCHOLOGY
 * Scarcity, prestige, and collectibility framing
 */
export const DEMO_PSYCHOLOGY = {
  scarcityMessages: SCARCITY_MESSAGES,
  prestigeCopy: PRESTIGE_COPY,
  collectibilityFeatures: COLLECTIBILITY_FEATURES,
  getScarcityMessage,
} as const;

/**
 * DEMO METADATA & EXCLUSIVITY
 * Applied to all demo-generated logos
 */
export const DEMO_EXCLUSIVE = {
  createMetadata: createDemoMetadata,
  exclusivityMessage: DEMO_EXCLUSIVITY_MESSAGE,
} as const;

export const DEMO_PRESET_CONFIG: Partial<LogoConfig> = {
  pixelSize: 1,
  colorSystem: "Vaporwave",
  backgroundStyle: "vaporwave-sky",
  frameStyle: "arcade-bezel",
  compositionMode: "badge-emblem",
  textEffects: {
    gradient: true,
    doubleShadow: true,
    neonOutline: true,
    metallic: true,
    stacked3D: true,
    shadowGradient: true,
    glitchOffset: true,
    slanted: false,
    waveDistortion: false,
  },
  depthConfig: {
    extrusion: true,
    extrusionLayers: 8,
    lighting: true,
    lightingDirection: "top-left",
    atmosphericGlow: true,
    glowIntensity: 0.95,
    glowColor: "#00FFFF",
    innerShadow: true,
    pixelReflections: true,
    perspectiveTilt: true,
    floatingShadow: true,
    shadowBlur: 15,
    texture: "crt-phosphor",
    depthPreset: "cyber-neon",
    colorDepth: true,
    colorShades: [],
  },
  badges: ["star", "bolt", "version"],
  rarity: undefined, // Let logoGenerator determine rarity naturally
};

/**
 * DEMO MODE CONSTRAINTS & RULES
 * Enforces visual and functional restrictions for demo-exclusive branding
 */
export const DEMO_CONSTRAINTS = {
  // Seed restrictions
  seedPoolRange: {
    min: DEMO_SEED_BASE,
    max: DEMO_SEED_MAX,
    total: DEMO_SEED_TOTAL,
  },

  // Visual restrictions (enforced)
  enforcedVisuals: {
    minGlowIntensity: 0.9,
    minShadowBlur: 14,
    requiredTexture: "crt-phosphor",
    requiredColorSystem: "Vaporwave",
    forbiddenColorSystems: [] as string[],
  },

  // Rarity restrictions
  rarityOverride: {
    // Demo logos get natural rarity distribution (COMMON, RARE, EPIC, LEGENDARY)
    // This makes rarity filters meaningful and adds collectibility/prestige
    forcedRarity: null,
    distributionWeights: {
      COMMON: 0.5, // 50% - baseline abundance
      RARE: 0.3, // 30% - harder to find
      EPIC: 0.15, // 15% - very rare
      LEGENDARY: 0.05, // 5% - ultra-rare prestige
    },
  },

  // Badge restrictions
  minBadges: 2,
  maxBadges: 4,
  allowedBadges: ["star", "bolt", "version", "crown", "flame"] as const,

  // Metadata
  requiresMetadata: true,
  requiresStyleFingerprint: true,
  requiresExclusivityMarking: true,
} as const;
