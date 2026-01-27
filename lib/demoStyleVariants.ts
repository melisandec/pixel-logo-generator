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
 * Generate a random style fingerprint
 * Randomly selects from each of the 7 variant pools
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
/**
 * Generate SVG filter definitions from a style fingerprint
 *
 * Creates a complete SVG <defs> section with filters appropriate
 * for the given style fingerprint. Combines multiple filter primitives
 * to achieve the desired visual effect.
 *
 * @param fingerprint The style fingerprint
 * @returns SVG filter XML as string
 */
export function generateFilterDefsFromFingerprint(
  fingerprint: StyleFingerprint,
): string {
  // Create POWERFUL, DISTINCT SVG filters that create visual impact like CodePen reference
  // Each filter is applied in sequence: chrome → glow → bloom → texture

  const filters: string[] = [];

  // Map variants to intensities for VISIBLE, DRAMATIC effects
  const glowIntensityMap: Record<string, number> = {
    softNeon: 2,
    hardNeon: 8,
    pulseGlow: 4,
    auraGlow: 6,
  };

  const chromeIntensityMap: Record<string, number> = {
    mirrorChrome: 0.9,
    brushedMetal: 0.5,
    rainbowChrome: 0.85,
    darkChrome: 0.4,
  };

  const bloomIntensityMap: Record<string, number> = {
    low: 1.5,
    medium: 3,
    heavy: 5,
  };

  const glowIntensity = glowIntensityMap[fingerprint.glow] || 4;
  const chromeIntensity = chromeIntensityMap[fingerprint.chrome] || 0.7;
  const bloomIntensity = bloomIntensityMap[fingerprint.bloom] || 3;

  // ============= 1. CHROME REFLECTION FILTER =============
  // Creates glossy, reflective metallic surfaces with bright highlights
  filters.push(`
    <filter id="chromeReflection" x="-60%" y="-60%" width="220%" height="220%">
      <!-- Saturate colors for chrome effect -->
      <feColorMatrix type="saturate" values="1.8" />
      <!-- Specular lighting for chrome shine -->
      <feSpecularLighting in="SourceGraphic" surfaceScale="8" specularConstant="${chromeIntensity * 2}" specularExponent="30" lighting-color="#ffffff" result="specOut">
        <fePointLight x="-5000" y="-10000" z="30000" />
      </feSpecularLighting>
      <!-- Blend chrome highlight over original -->
      <feComposite in="specOut" in2="SourceGraphic" operator="arithmetic" k1="0" k2="${0.4 + chromeIntensity * 0.6}" k3="0.6" k4="0" result="chromeOut" />
      <!-- Add white edge highlight -->
      <feColorMatrix in="chromeOut" type="matrix" values="1 0 0 0 ${0.1 * chromeIntensity}
               0 1 0 0 ${0.1 * chromeIntensity}
               0 0 1 0 ${0.15 * chromeIntensity}
               0 0 0 1 0" result="chromeFinal" />
    </filter>
  `);

  // ============= 2. NEON GLOW FILTER =============
  // Creates intense, saturated neon glow with multi-layer blur for thickness
  filters.push(`
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Oversaturate for intense neon colors -->
      <feColorMatrix type="saturate" values="2.0" result="saturated" />
      <!-- Create multi-layer blur for glow -->
      <feGaussianBlur in="saturated" stdDeviation="${glowIntensity * 1.2}" result="blur1" />
      <!-- Boost brightness of glow -->
      <feColorMatrix in="blur1" type="linear" values="0 0 0 0 0.3
               0 0 0 0 0.3
               0 0 0 0 0.3
               0 0 0 1 0" result="glow1" />
      <!-- Merge glow with original for bright outline effect -->
      <feMerge result="merged1">
        <feMergeNode in="glow1" />
        <feMergeNode in="saturated" />
      </feMerge>
      <!-- Add secondary blur layer for wider glow -->
      <feGaussianBlur in="merged1" stdDeviation="${glowIntensity * 0.6}" result="blur2" />
      <feMerge result="glowFinal">
        <feMergeNode in="blur2" />
        <feMergeNode in="merged1" />
      </feMerge>
    </filter>
  `);

  // ============= 3. BLOOM/HALO FILTER =============
  // Creates bright expanding bloom aura around text for dreamy glow
  filters.push(`
    <filter id="bloomHalo" x="-70%" y="-70%" width="240%" height="240%">
      <!-- Create large blur for bloom -->
      <feGaussianBlur in="SourceGraphic" stdDeviation="${bloomIntensity * 3}" result="bloomBlur" />
      <!-- Boost alpha of bloom -->
      <feComponentTransfer in="bloomBlur" result="bloomBright">
        <feFuncA type="linear" slope="${0.4 + bloomIntensity * 0.2}" />
      </feComponentTransfer>
      <!-- Layer bloom under original for depth -->
      <feMerge result="bloomFinal">
        <feMergeNode in="bloomBright" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `);

  // ============= 4. TEXTURE OVERLAY FILTER =============
  let textureFilter = ``;
  if (fingerprint.texture === "scanlines") {
    // CRT scanline effect - horizontal lines
    textureFilter = `
      <filter id="textureOverlay">
        <!-- Horizontal scanlines using turbulence -->
        <feTurbulence type="fractalNoise" baseFrequency="0.0 0.8" numOctaves="3" result="scanlines" />
        <!-- Displace by scanlines -->
        <feDisplacementMap in="SourceGraphic" in2="scanlines" scale="2" result="displaced" />
        <!-- Add slight opacity variation for CRT look -->
        <feComponentTransfer in="displaced">
          <feFuncA type="linear" slope="0.95" />
        </feComponentTransfer>
      </filter>
    `;
  } else if (fingerprint.texture === "grain") {
    // Film grain effect - fine noise
    textureFilter = `
      <filter id="textureOverlay">
        <!-- Fine grain noise -->
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="grain" />
        <!-- Displace with grain -->
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.5" result="grained" />
        <!-- Subtly desaturate for film look -->
        <feColorMatrix in="grained" type="saturate" values="0.95" />
      </filter>
    `;
  } else if (fingerprint.texture === "halftone") {
    // Halftone dot pattern effect - comic book style
    textureFilter = `
      <filter id="textureOverlay">
        <!-- Halftone-like turbulence -->
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="halftone" />
        <!-- Displace with strong effect -->
        <feDisplacementMap in="SourceGraphic" in2="halftone" scale="3" result="halfCross" />
        <!-- Enhance contrast for halftone look -->
        <feComponentTransfer in="halfCross">
          <feFuncA type="gamma" amplitude="1.2" exponent="0.8" />
        </feComponentTransfer>
      </filter>
    `;
  } else {
    // No texture
    textureFilter = `<filter id="textureOverlay"><feIdentity /></filter>`;
  }
  filters.push(textureFilter);

  // ============= 5. MASTER COMPOSITE FILTER =============
  // Apply ALL effects in sequence: chrome → glow → bloom → texture
  // This creates the distinct visual styles seen in CodePen reference
  filters.push(`
    <filter id="demoFilterStack" x="-80%" y="-80%" width="260%" height="260%">
      <!-- Step 1: Apply neon glow to original -->
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity * 1.5}" result="glowBase" />
      <feColorMatrix in="glowBase" type="saturate" values="2.2" result="intenseGlow" />
      <feMerge result="withGlow">
        <feMergeNode in="intenseGlow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
      
      <!-- Step 2: Apply chrome reflections -->
      <feSpecularLighting in="withGlow" surfaceScale="6" specularConstant="${chromeIntensity * 1.8}" specularExponent="25" lighting-color="#ffffff" result="chromedGlow">
        <fePointLight x="-5000" y="-10000" z="25000" />
      </feSpecularLighting>
      <feComposite in="chromedGlow" in2="withGlow" operator="arithmetic" k1="0" k2="${0.35 + chromeIntensity * 0.5}" k3="0.5" k4="0" result="withChrome" />
      
      <!-- Step 3: Apply bloom halo -->
      <feGaussianBlur in="withChrome" stdDeviation="${bloomIntensity * 2.5}" result="bloomGlow" />
      <feComponentTransfer in="bloomGlow">
        <feFuncA type="linear" slope="${0.35 + bloomIntensity * 0.15}" />
      </feComponentTransfer>
      <feMerge result="withBloom">
        <feMergeNode in="bloomGlow" />
        <feMergeNode in="withChrome" />
      </feMerge>
      
      <!-- Step 4: Apply texture if needed -->
      <feTurbulence in="withBloom" type="fractalNoise" baseFrequency="${fingerprint.texture === "grain" ? "0.8" : fingerprint.texture === "halftone" ? "0.5" : "0.0"}" numOctaves="${fingerprint.texture === "grain" ? "4" : "3"}" result="textureNoise" />
      <feDisplacementMap in="withBloom" in2="textureNoise" scale="${fingerprint.texture === "scanlines" ? "2" : fingerprint.texture === "grain" ? "1.5" : fingerprint.texture === "halftone" ? "3" : "0"}" result="textured" />
      
      <!-- Final output - merge all layers -->
      <feComposite in="textured" in2="SourceGraphic" operator="lighten" />
    </filter>
  `);

  return filters.join("\n");
}
