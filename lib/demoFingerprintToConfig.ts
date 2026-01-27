import type { LogoConfig } from "./logoGenerator";
import type { StyleFingerprint } from "./demoStyleVariants";

// Inline the LightingDirection type to avoid circular imports
type LightingDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "left"
  | "right"
  | "bottom";

/**
 * Converts a demo style fingerprint into enhanced LogoConfig overrides
 * Maps each fingerprint component to specific canvas styling effects
 */
export function applyFingerprintToConfig(
  baseConfig: Partial<LogoConfig>,
  fingerprint: StyleFingerprint,
): Partial<LogoConfig> {
  const config = { ...baseConfig };

  // PALETTE → Color system adjustments
  const paletteGlowMap: Record<
    string,
    { glowColor: string; glowIntensity: number }
  > = {
    neonPinkBlue: { glowColor: "#FF1493", glowIntensity: 1.0 },
    magentaCyan: { glowColor: "#00FFFF", glowIntensity: 1.0 },
    hotPinkGold: { glowColor: "#FFD700", glowIntensity: 0.95 },
    sunsetPurple: { glowColor: "#DA70D6", glowIntensity: 0.95 },
    ultraviolet: { glowColor: "#9D00FF", glowIntensity: 0.95 },
    electricBlue: { glowColor: "#00BFFF", glowIntensity: 0.98 },
    cyberOrange: { glowColor: "#FF6347", glowIntensity: 0.98 },
    laserGreen: { glowColor: "#00FF00", glowIntensity: 0.98 },
    midnightNeon: { glowColor: "#00FFFF", glowIntensity: 1.0 },
  };

  const paletteConfig =
    paletteGlowMap[fingerprint.palette] || paletteGlowMap.midnightNeon;

  // Ensure depthConfig exists
  const depthConfig = config.depthConfig || {
    extrusion: true,
    extrusionLayers: 8,
    lighting: true,
    lightingDirection: "top-left" as const,
    atmosphericGlow: true,
    glowIntensity: 0.95,
    glowColor: "#00FFFF",
    innerShadow: true,
    pixelReflections: true,
    perspectiveTilt: true,
    floatingShadow: true,
    shadowBlur: 15,
    texture: "crt-phosphor" as const,
    depthPreset: "cyber-neon" as const,
    colorDepth: true,
    colorShades: [],
  };

  depthConfig.glowColor = paletteConfig.glowColor;
  depthConfig.glowIntensity = paletteConfig.glowIntensity;
  config.depthConfig = depthConfig;

  // GRADIENT → Text gradient intensity
  const gradientIntensityMap: Record<string, boolean> = {
    horizontal: true,
    vertical: true,
    diagonal: true,
    radial: true,
    sunsetFade: true,
  };
  config.textEffects = config.textEffects || {};
  config.textEffects.gradient =
    gradientIntensityMap[fingerprint.gradient] ?? true;

  // GLOW → Shadow blur, glow intensity, and extrusion layers (INCREASED for visible variation)
  const glowEffectMap: Record<
    string,
    {
      shadowBlur: number;
      glowIntensity: number;
      extrusionLayers: number;
      atmosphericGlow: boolean;
    }
  > = {
    softNeon: {
      shadowBlur: 16,
      glowIntensity: 0.65,
      extrusionLayers: 5,
      atmosphericGlow: true,
    },
    hardNeon: {
      shadowBlur: 32,
      glowIntensity: 1.0,
      extrusionLayers: 15,
      atmosphericGlow: true,
    },
    pulseGlow: {
      shadowBlur: 24,
      glowIntensity: 0.88,
      extrusionLayers: 10,
      atmosphericGlow: true,
    },
    auraGlow: {
      shadowBlur: 38,
      glowIntensity: 0.8,
      extrusionLayers: 13,
      atmosphericGlow: true,
    },
  };

  const glowConfig = glowEffectMap[fingerprint.glow] || glowEffectMap.hardNeon;
  config.depthConfig.shadowBlur = glowConfig.shadowBlur;
  config.depthConfig.glowIntensity = glowConfig.glowIntensity;
  config.depthConfig.extrusionLayers = glowConfig.extrusionLayers;
  config.depthConfig.atmosphericGlow = glowConfig.atmosphericGlow;

  // CHROME → Reflective effects (pixelReflections, innerShadow, perspectiveTilt, floatingShadow)
  const chromeEffectMap: Record<
    string,
    {
      innerShadow: boolean;
      pixelReflections: boolean;
      perspectiveTilt: boolean;
      floatingShadow: boolean;
    }
  > = {
    mirrorChrome: {
      innerShadow: true,
      pixelReflections: true,
      perspectiveTilt: true,
      floatingShadow: true,
    },
    brushedMetal: {
      innerShadow: false,
      pixelReflections: false,
      perspectiveTilt: false,
      floatingShadow: false,
    },
    rainbowChrome: {
      innerShadow: true,
      pixelReflections: true,
      perspectiveTilt: true,
      floatingShadow: true,
    },
    darkChrome: {
      innerShadow: false,
      pixelReflections: false,
      perspectiveTilt: false,
      floatingShadow: true,
    },
  };

  const chromeConfig =
    chromeEffectMap[fingerprint.chrome] || chromeEffectMap.mirrorChrome;
  config.depthConfig.innerShadow = chromeConfig.innerShadow;
  config.depthConfig.pixelReflections = chromeConfig.pixelReflections;
  config.depthConfig.perspectiveTilt = chromeConfig.perspectiveTilt;
  config.depthConfig.floatingShadow = chromeConfig.floatingShadow;

  // BLOOM → Extrusion and depth
  const bloomDepthMap: Record<string, number> = {
    low: 4,
    medium: 8,
    heavy: 12,
  };

  // BLOOM depth only applies if glow config didn't already set extrusion layers
  if (!glowConfig.extrusionLayers) {
    config.depthConfig.extrusionLayers = bloomDepthMap[fingerprint.bloom] || 8;
  }

  // TEXTURE → Canvas texture type with floatingShadow variation for distinct look
  const textureDetailMap: Record<
    string,
    {
      texture: "metal" | "plastic" | "crt-phosphor" | "none";
      floatingShadow: boolean;
    }
  > = {
    none: { texture: "none", floatingShadow: false },
    grain: { texture: "metal", floatingShadow: true }, // Grainy = metallic with floating shadow
    halftone: { texture: "plastic", floatingShadow: false }, // Halftone = flat plastic
    scanlines: { texture: "crt-phosphor", floatingShadow: true }, // Scanlines = CRT with floating shadow
  };
  const textureCfg =
    textureDetailMap[fingerprint.texture] || textureDetailMap.scanlines;
  config.depthConfig.texture = textureCfg.texture;
  config.depthConfig.floatingShadow = textureCfg.floatingShadow;

  // LIGHTING → Light direction
  const lightingDirectionMap: Record<string, LightingDirection> = {
    topLeft: "top-left",
    topRight: "top-right",
    bottomLeft: "bottom-left",
    front: "top",
  };

  config.depthConfig.lightingDirection =
    lightingDirectionMap[fingerprint.lighting] || "top-left";

  // Ensure demo constraints
  config.depthConfig.glowIntensity = Math.min(
    config.depthConfig.glowIntensity,
    1.0,
  );
  config.depthConfig.shadowBlur = Math.max(config.depthConfig.shadowBlur, 14);

  return config;
}
