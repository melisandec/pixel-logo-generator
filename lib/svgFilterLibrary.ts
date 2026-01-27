/**
 * Reusable SVG Filter Library
 *
 * Provides a collection of adjustable SVG filters using filter primitives:
 * - feGaussianBlur, feMerge, feColorMatrix
 * - feSpecularLighting, feTurbulence, feDisplacementMap
 *
 * Each filter accepts an intensity parameter (0-1 or 0-100) for customization.
 */

export interface FilterConfig {
  id: string;
  intensity: number; // 0-1 or 0-100 depending on filter
}

/**
 * NEON GLOW FILTER
 * Creates a vibrant, glowing neon effect using Gaussian blur and color matrix.
 * Uses: feGaussianBlur, feMerge, feColorMatrix
 *
 * @param id - Unique filter identifier
 * @param intensity - Glow strength (0-1, where 1 is maximum glow)
 * @returns SVG filter element string
 */
export function filterNeonGlow(id: string, intensity: number = 0.8): string {
  const blurRadius = 2 + intensity * 8; // 2-10px blur
  const glowOpacity = 0.3 + intensity * 0.7; // 0.3-1.0 opacity
  const saturateAmount = 1 + intensity * 1.5; // 1-2.5 saturation

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Increase saturation for vibrant neon colors -->
      <feColorMatrix
        type="saturate"
        values="${saturateAmount}"
      />
      
      <!-- Create the glow blur -->
      <feGaussianBlur
        in="SourceGraphic"
        stdDeviation="${blurRadius}"
        result="coloredBlur"
      />
      
      <!-- Enhance glow brightness -->
      <feColorMatrix
        in="coloredBlur"
        type="linear"
        values="0 0 0 0 ${0.2 + intensity * 0.3}
                0 0 0 0 ${0.2 + intensity * 0.3}
                0 0 0 0 ${0.2 + intensity * 0.3}
                0 0 0 ${glowOpacity} 0"
        result="glowMatrix"
      />
      
      <!-- Merge original and glow -->
      <feMerge>
        <feMergeNode in="glowMatrix" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * CHROME FILTER
 * Creates a metallic chrome/mirror effect using specular lighting.
 * Uses: feSpecularLighting, feColorMatrix
 *
 * @param id - Unique filter identifier
 * @param intensity - Chrome reflectivity (0-1, where 1 is mirror-like)
 * @returns SVG filter element string
 */
export function filterChrome(id: string, intensity: number = 0.7): string {
  const specularConstant = 0.5 + intensity * 1.5; // 0.5-2.0
  const specularExponent = 10 + intensity * 30; // 10-40
  const colorIntensity = 0.3 + intensity * 0.7; // 0.3-1.0

  return `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
      <!-- Apply specular lighting for metallic shine -->
      <feSpecularLighting
        in="SourceGraphic"
        surfaceScale="5"
        specularConstant="${specularConstant}"
        specularExponent="${specularExponent}"
        lighting-color="#ffffff"
        result="spec"
      >
        <fePointLight x="-5000" y="-10000" z="20000" />
      </feSpecularLighting>
      
      <!-- Blend with original and enhance contrast -->
      <feColorMatrix
        in="spec"
        type="saturate"
        values="${0.5 + intensity * 1.5}"
        result="chromeSaturated"
      />
      
      <!-- Increase brightness for chrome effect -->
      <feColorMatrix
        in="chromeSaturated"
        type="linear"
        values="1 0 0 0 ${0.1 * intensity}
                0 1 0 0 ${0.1 * intensity}
                0 0 1 0 ${0.1 * intensity}
                0 0 0 1 0"
      />
    </filter>
  `;
}

/**
 * BLOOM FILTER
 * Creates a soft bloom/glow effect with halos around bright areas.
 * Uses: feGaussianBlur, feMerge, feColorMatrix
 *
 * @param id - Unique filter identifier
 * @param intensity - Bloom intensity (0-1, where 1 is maximum bloom)
 * @returns SVG filter element string
 */
export function filterBloom(id: string, intensity: number = 0.6): string {
  const blurRadius = 4 + intensity * 12; // 4-16px blur
  const bloomOpacity = 0.2 + intensity * 0.8; // 0.2-1.0
  const brightnessBoost = 0.15 + intensity * 0.35; // 0.15-0.5

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Extract bright areas using color matrix threshold -->
      <feColorMatrix
        in="SourceGraphic"
        type="linear"
        values="1 0 0 0 ${brightnessBoost}
                0 1 0 0 ${brightnessBoost}
                0 0 1 0 ${brightnessBoost}
                0 0 0 1 0"
        result="brightened"
      />
      
      <!-- Blur the bright areas for bloom effect -->
      <feGaussianBlur
        in="brightened"
        stdDeviation="${blurRadius}"
        result="bloomBlur"
      />
      
      <!-- Reduce opacity of bloom layer -->
      <feColorMatrix
        in="bloomBlur"
        type="linear"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 ${bloomOpacity} 0"
        result="bloomAdjusted"
      />
      
      <!-- Merge bloom with original -->
      <feMerge>
        <feMergeNode in="bloomAdjusted" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * HALFTONE FILTER
 * Creates a halftone/dotted pattern effect using turbulence and displacement.
 * Uses: feTurbulence, feDisplacementMap, feColorMatrix
 *
 * @param id - Unique filter identifier
 * @param intensity - Pattern intensity (0-1, where 1 is maximum effect)
 * @returns SVG filter element string
 */
export function filterHalftone(id: string, intensity: number = 0.5): string {
  const scale = 2 + intensity * 8; // 2-10 scale
  const displacement = 2 + intensity * 8; // 2-10px displacement
  const frequencies = 4 - intensity * 2; // 4-2 octaves (more complex at high intensity)

  return `
    <filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <!-- Generate turbulent noise pattern -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="${frequencies / 100}"
        numOctaves="3"
        result="noise"
        seed="42"
      />
      
      <!-- Displace pixels based on noise to create halftone effect -->
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="${displacement}"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      
      <!-- Increase contrast for stronger halftone appearance -->
      <feColorMatrix
        in="displaced"
        type="linear"
        values="${1 + intensity * 0.5} 0 0 0 0
                0 ${1 + intensity * 0.5} 0 0 0
                0 0 ${1 + intensity * 0.5} 0 0
                0 0 0 1 0"
      />
    </filter>
  `;
}

/**
 * SCANLINES FILTER
 * Creates retro scanline effect using turbulence and color matrix patterns.
 * Uses: feTurbulence, feColorMatrix
 *
 * @param id - Unique filter identifier
 * @param intensity - Scanline intensity (0-1, where 1 is maximum opacity)
 * @returns SVG filter element string
 */
export function filterScanlines(id: string, intensity: number = 0.4): string {
  const lineSpacing = 2 + intensity * 4; // 2-6px spacing
  const darkening = 0.2 + intensity * 0.6; // 0.2-0.8 darkening

  return `
    <filter id="${id}" x="0%" y="0%" width="100%" height="100%">
      <!-- Generate horizontal line pattern -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0 ${1 / lineSpacing}"
        numOctaves="1"
        result="lines"
        seed="123"
      />
      
      <!-- Convert turbulence to sharp lines using threshold-like effect -->
      <feColorMatrix
        in="lines"
        type="linear"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 ${-0.5}"
        result="linePattern"
      />
      
      <!-- Apply scanlines as overlay darkening -->
      <feColorMatrix
        in="SourceGraphic"
        type="linear"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 1 ${-darkening}"
      />
    </filter>
  `;
}

/**
 * SPECULAR FILTER
 * Creates a specular/shiny surface effect with highlights.
 * Uses: feSpecularLighting, feColorMatrix, feGaussianBlur
 *
 * @param id - Unique filter identifier
 * @param intensity - Specularity (0-1, where 1 is maximum shine)
 * @returns SVG filter element string
 */
export function filterSpecular(id: string, intensity: number = 0.75): string {
  const specularConstant = 1 + intensity * 2; // 1-3
  const specularExponent = 20 + intensity * 60; // 20-80
  const blurAmount = 1 + intensity * 3; // 1-4px blur

  return `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
      <!-- Create specular highlight -->
      <feSpecularLighting
        in="SourceGraphic"
        surfaceScale="3"
        specularConstant="${specularConstant}"
        specularExponent="${specularExponent}"
        lighting-color="#ffffff"
        result="specOut"
      >
        <fePointLight x="-5000" y="-10000" z="30000" />
      </feSpecularLighting>
      
      <!-- Soften the highlight with blur -->
      <feGaussianBlur
        in="specOut"
        stdDeviation="${blurAmount}"
        result="specBlurred"
      />
      
      <!-- Blend highlight with original -->
      <feColorMatrix
        in="specBlurred"
        type="linear"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 ${0.3 + intensity * 0.4} 0"
        result="specAdjusted"
      />
      
      <!-- Final composite -->
      <feMerge>
        <feMergeNode in="specAdjusted" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * SVG FILTER DEFS CONTAINER
 *
 * Generates a complete <defs> element containing all specified filters.
 * Use this to inject all filters into your SVG at once.
 *
 * @param filterIds - Object mapping filter names to IDs and intensities
 * @returns Complete SVG defs string
 *
 * @example
 * const defs = generateFilterDefs({
 *   glow: { id: 'neon-glow', intensity: 0.8 },
 *   chrome: { id: 'chrome-effect', intensity: 0.7 },
 *   bloom: { id: 'bloom-effect', intensity: 0.6 },
 * });
 */
export function generateFilterDefs(filterIds: {
  neonGlow?: { id: string; intensity?: number };
  chrome?: { id: string; intensity?: number };
  bloom?: { id: string; intensity?: number };
  halftone?: { id: string; intensity?: number };
  scanlines?: { id: string; intensity?: number };
  specular?: { id: string; intensity?: number };
  liquidNeon?: { id: string; intensity?: number };
  comicBook?: { id: string; intensity?: number };
  waveRipple?: { id: string; intensity?: number };
  holographicShine?: { id: string; intensity?: number };
  neonGlowAdvanced?: { id: string; intensity?: number };
  shadowDepth?: { id: string; intensity?: number };
  neonOutline?: { id: string; intensity?: number; color?: string };
}): string {
  let content = "<defs>";

  if (filterIds.neonGlow) {
    content += filterNeonGlow(
      filterIds.neonGlow.id,
      filterIds.neonGlow.intensity ?? 0.8,
    );
  }

  if (filterIds.chrome) {
    content += filterChrome(
      filterIds.chrome.id,
      filterIds.chrome.intensity ?? 0.7,
    );
  }

  if (filterIds.bloom) {
    content += filterBloom(
      filterIds.bloom.id,
      filterIds.bloom.intensity ?? 0.6,
    );
  }

  if (filterIds.halftone) {
    content += filterHalftone(
      filterIds.halftone.id,
      filterIds.halftone.intensity ?? 0.5,
    );
  }

  if (filterIds.scanlines) {
    content += filterScanlines(
      filterIds.scanlines.id,
      filterIds.scanlines.intensity ?? 0.4,
    );
  }

  if (filterIds.specular) {
    content += filterSpecular(
      filterIds.specular.id,
      filterIds.specular.intensity ?? 0.75,
    );
  }

  // Advanced filters
  if (filterIds.liquidNeon) {
    content += filterLiquidNeon(
      filterIds.liquidNeon.id,
      filterIds.liquidNeon.intensity ?? 0.7,
    );
  }

  if (filterIds.comicBook) {
    content += filterComicBook(
      filterIds.comicBook.id,
      filterIds.comicBook.intensity ?? 0.6,
    );
  }

  if (filterIds.waveRipple) {
    content += filterWaveRipple(
      filterIds.waveRipple.id,
      filterIds.waveRipple.intensity ?? 0.4,
    );
  }

  if (filterIds.holographicShine) {
    content += filterHolographicShine(
      filterIds.holographicShine.id,
      filterIds.holographicShine.intensity ?? 0.75,
    );
  }

  if (filterIds.neonGlowAdvanced) {
    content += filterNeonGlowAdvanced(
      filterIds.neonGlowAdvanced.id,
      filterIds.neonGlowAdvanced.intensity ?? 0.7,
    );
  }

  if (filterIds.shadowDepth) {
    content += filterShadowDepth(
      filterIds.shadowDepth.id,
      filterIds.shadowDepth.intensity ?? 0.5,
    );
  }

  if (filterIds.neonOutline) {
    content += filterNeonOutline(
      filterIds.neonOutline.id,
      filterIds.neonOutline.intensity ?? 0.7,
      filterIds.neonOutline.color ?? "#ff00ff",
    );
  }

  content += "</defs>";
  return content;
}

/**
 * APPLY FILTER TO CANVAS
 *
 * Helper function to apply SVG filters to canvas context using canvg or similar.
 * For canvas-based rendering, filters need to be applied as CSS filters or
 * through canvas filter primitives.
 *
 * @param canvasContext - 2D canvas context
 * @param filterName - Name of filter to apply
 * @param intensity - Intensity value (0-1)
 * @returns Canvas filter string
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * ctx.filter = getCanvasFilterString('neonGlow', 0.8);
 * ctx.drawImage(...);
 */
export function getCanvasFilterString(
  filterName:
    | "neonGlow"
    | "chrome"
    | "bloom"
    | "halftone"
    | "scanlines"
    | "specular",
  intensity: number = 0.5,
): string {
  // Clamp intensity to 0-1
  const i = Math.max(0, Math.min(1, intensity));

  switch (filterName) {
    case "neonGlow":
      // CSS filter approximation for neon glow
      const blurAmount = 2 + i * 8;
      const brightness = 0.9 + i * 0.2;
      return `blur(${blurAmount}px) brightness(${brightness}) saturate(${1.5 + i * 1.5})`;

    case "bloom":
      // CSS filter approximation for bloom
      const bloomBlur = 4 + i * 12;
      return `blur(${bloomBlur}px) brightness(${1 + i * 0.3})`;

    case "chrome":
      // CSS filter approximation for chrome
      return `contrast(${1.2 + i * 0.8}) brightness(${0.95 + i * 0.1})`;

    case "halftone":
      // CSS filter approximation for halftone
      return `contrast(${1 + i * 0.5}) saturate(${0.8 + i * 0.5})`;

    case "scanlines":
      // Scanlines are hard to approximate with CSS filters
      // Use opacity reduction to simulate darkening
      return `brightness(${1 - i * 0.3})`;

    case "specular":
      // CSS filter approximation for specular
      return `brightness(${1 + i * 0.15}) contrast(${1.1 + i * 0.4})`;

    default:
      return "none";
  }
}

/**
 * ADVANCED FILTERS (Section 6A from CSS Styling Guide)
 * Practical implementations inspired by Coding Dude SVG Filters
 */

/**
 * TURBULENT LIQUID DISTORTION FILTER
 * Creates flowing morphing effects with animated turbulence.
 * Perfect for: Legendary tier logos with dynamic neon effect
 *
 * @param id - Unique filter identifier
 * @param intensity - Distortion intensity (0-1)
 * @returns SVG filter element string
 */
export function filterLiquidNeon(id: string, intensity: number = 0.7): string {
  const scale = 4 + intensity * 8; // 4-12px displacement
  const frequency = 0.03 + intensity * 0.02; // 0.03-0.05 for smooth waves

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Create flowing noise pattern -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="${frequency}"
        numOctaves="5"
        result="noise"
        seed="2"
      />
      
      <!-- Displace pixels using noise -->
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="${scale}"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      
      <!-- Add neon saturation boost -->
      <feColorMatrix
        in="displaced"
        type="saturate"
        values="${1.5 + intensity * 0.5}"
      />
    </filter>
  `;
}

/**
 * MORPHOLOGICAL EROSION/DILATION FILTER
 * Comic book effect with bold outlines and textured appearance.
 * Perfect for: Epic tier logos with stylized neon
 *
 * @param id - Unique filter identifier
 * @param intensity - Effect intensity (0-1)
 * @returns SVG filter element string
 */
export function filterComicBook(id: string, intensity: number = 0.6): string {
  const erodeRadius = 1 + intensity * 1.5; // 1-2.5
  const dilateRadius = 1.5 + intensity * 1.5; // 1.5-3
  const colorBoost = 1.1 + intensity * 0.2; // 1.1-1.3

  return `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
      <!-- Create halftone pattern with turbulence -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.1"
        numOctaves="3"
        result="noise"
      />
      
      <!-- Erode (shrink) bright areas -->
      <feMorphology
        operator="erode"
        radius="${erodeRadius}"
        in="SourceGraphic"
        result="eroded"
      />
      
      <!-- Dilate (expand) for bold comic effect -->
      <feMorphology
        operator="dilate"
        radius="${dilateRadius}"
        in="eroded"
        result="dilated"
      />
      
      <!-- Enhance neon colors -->
      <feColorMatrix
        in="dilated"
        type="matrix"
        values="${colorBoost} 0 0 0 ${0.05 * intensity}
                0 ${colorBoost} 0 0 ${0.05 * intensity}
                0 0 ${colorBoost} 0 ${0.05 * intensity}
                0 0 0 1 0"
        result="enhanced"
      />
      
      <!-- Merge original + effect for layered look -->
      <feMerge>
        <feMergeNode in="enhanced" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * WAVE RIPPLE DISTORTION FILTER
 * Creates undulating wave effects for dynamic logos.
 * Perfect for: Rare tier logos with subtle motion
 *
 * @param id - Unique filter identifier
 * @param intensity - Wave intensity (0-1)
 * @returns SVG filter element string
 */
export function filterWaveRipple(id: string, intensity: number = 0.4): string {
  const scale = 2 + intensity * 6; // 2-8px wave height
  const frequency = 0.05 - intensity * 0.02; // 0.05-0.03 lower freq = larger waves

  return `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
      <!-- Generate wave pattern -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="${frequency}"
        numOctaves="2"
        result="noise"
        seed="1"
      />
      
      <!-- Apply wave displacement -->
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="${scale}"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      
      <!-- Add color shift for neon effect -->
      <feColorMatrix
        in="displaced"
        type="saturate"
        values="${1.4 + intensity * 0.4}"
      />
    </filter>
  `;
}

/**
 * HOLOGRAPHIC SHINE FILTER
 * Creates rainbow/holographic reflections with specular lighting.
 * Perfect for: Epic/Legendary tier with chrome effect
 *
 * @param id - Unique filter identifier
 * @param intensity - Shine intensity (0-1)
 * @returns SVG filter element string
 */
export function filterHolographicShine(
  id: string,
  intensity: number = 0.75,
): string {
  const specConstant = 0.8 + intensity * 1.2; // 0.8-2.0
  const specExponent = 20 + intensity * 35; // 20-55
  const saturation = 1.8 + intensity * 0.5; // 1.8-2.3

  return `
    <filter id="${id}" x="-25%" y="-25%" width="150%" height="150%">
      <!-- Point light source for specular highlights -->
      <feSpecularLighting
        surfaceScale="5"
        specularConstant="${specConstant}"
        specularExponent="${specExponent}"
        lighting-color="#ffffff"
        result="spec"
      >
        <!-- Light at top-left -->
        <fePointLight x="-50" y="-50" z="300" />
      </feSpecularLighting>
      
      <!-- Apply high-saturation colors to highlights -->
      <feColorMatrix
        in="spec"
        type="saturate"
        values="${saturation}"
        result="specColor"
      />
      
      <!-- Composite specular over original -->
      <feComposite
        in="SourceGraphic"
        in2="specColor"
        operator="arithmetic"
        k1="0" k2="1" k3="1" k4="0"
      />
    </filter>
  `;
}

/**
 * NEON GLOW ENHANCED FILTER
 * Advanced version with multi-stage blur and color shifting.
 * Perfect for: Common/Rare tier baseline glow
 *
 * @param id - Unique filter identifier
 * @param intensity - Glow intensity (0-1)
 * @returns SVG filter element string
 */
export function filterNeonGlowAdvanced(
  id: string,
  intensity: number = 0.7,
): string {
  const blurAmount = 3 + intensity * 6; // 3-9px
  const saturation = 1.7 + intensity * 0.8; // 1.7-2.5

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- First blur for soft glow -->
      <feGaussianBlur
        in="SourceGraphic"
        stdDeviation="${blurAmount}"
        result="coloredBlur"
      />
      
      <!-- Boost color saturation in glow -->
      <feColorMatrix
        in="coloredBlur"
        type="saturate"
        values="${saturation}"
        result="saturated"
      />
      
      <!-- Combine blurred glow with original -->
      <feFlood fill="#00ffff" floodOpacity="${0.3 + intensity * 0.4}" result="floodColor" />
      <feComposite
        in="floodColor"
        in2="saturated"
        operator="in"
        result="colorFlood"
      />
      <feComposite
        in="colorFlood"
        in2="SourceGraphic"
        operator="lighten"
      />
    </filter>
  `;
}

/**
 * SHADOW DEPTH FILTER
 * Creates layered shadows for 3D depth perception.
 * Perfect for: All tiers for depth layering
 *
 * @param id - Unique filter identifier
 * @param intensity - Depth intensity (0-1)
 * @returns SVG filter element string
 */
export function filterShadowDepth(id: string, intensity: number = 0.5): string {
  const offsetAmount = 1 + intensity * 3; // 1-4px offset
  const blurAmount = 2 + intensity * 4; // 2-6px blur
  const shadowOpacity = 0.3 + intensity * 0.4; // 0.3-0.7

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Create offset shadow -->
      <feOffset
        in="SourceGraphic"
        dx="${offsetAmount}"
        dy="${offsetAmount}"
        result="offsetShadow"
      />
      
      <!-- Blur the shadow -->
      <feGaussianBlur
        in="offsetShadow"
        stdDeviation="${blurAmount}"
        result="blurredShadow"
      />
      
      <!-- Darken shadow -->
      <feColorMatrix
        in="blurredShadow"
        type="matrix"
        values="0.2 0 0 0 0
                0 0.2 0 0 0
                0 0 0.2 0 0
                0 0 0 ${shadowOpacity} 0"
        result="darkShadow"
      />
      
      <!-- Layer: shadow + original -->
      <feMerge>
        <feMergeNode in="darkShadow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * NEON OUTLINE FILTER
 * Creates bold neon borders around shapes.
 * Perfect for: Any tier for bold neon borders
 *
 * @param id - Unique filter identifier
 * @param intensity - Outline intensity (0-1)
 * @param outlineColor - Neon color for outline (hex or named color)
 * @returns SVG filter element string
 */
export function filterNeonOutline(
  id: string,
  intensity: number = 0.7,
  outlineColor: string = "#ff00ff",
): string {
  const dilateRadius = 1 + intensity * 2; // 1-3px
  const blurAmount = 0.5 + intensity * 2; // 0.5-2.5px
  const glowOpacity = 0.6 + intensity * 0.4; // 0.6-1.0

  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Duplicate shape for outline -->
      <feFlood
        floodColor="${outlineColor}"
        floodOpacity="1"
        result="neonColor"
      />
      
      <!-- Apply neon color to outline -->
      <feComposite
        in="neonColor"
        in2="SourceGraphic"
        operator="in"
        result="neonOutlineColor"
      />
      
      <!-- Expand outline with morphology -->
      <feMorphology
        in="neonOutlineColor"
        operator="dilate"
        radius="${dilateRadius}"
        result="expandedOutline"
      />
      
      <!-- Blur for glow -->
      <feGaussianBlur
        in="expandedOutline"
        stdDeviation="${blurAmount}"
        result="glowingOutline"
      />
      
      <!-- Composite: outline + original -->
      <feMerge>
        <feMergeNode in="glowingOutline" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
}

/**
 * FILTER PRESETS
 *
 * Common intensity configurations for different use cases
 */
export const FILTER_PRESETS = {
  SUBTLE: {
    neonGlow: 0.3,
    chrome: 0.4,
    bloom: 0.2,
    halftone: 0.2,
    scanlines: 0.2,
    specular: 0.4,
  },
  MODERATE: {
    neonGlow: 0.6,
    chrome: 0.6,
    bloom: 0.5,
    halftone: 0.5,
    scanlines: 0.4,
    specular: 0.6,
  },
  INTENSE: {
    neonGlow: 0.9,
    chrome: 0.85,
    bloom: 0.8,
    halftone: 0.8,
    scanlines: 0.7,
    specular: 0.9,
  },
  EXTREME: {
    neonGlow: 1.0,
    chrome: 1.0,
    bloom: 1.0,
    halftone: 1.0,
    scanlines: 1.0,
    specular: 1.0,
  },
} as const;

/**
 * COMBINE FILTERS
 *
 * Chain multiple filters together by creating a composite filter ID.
 * Note: SVG filters can be chained by using the result of one as input to another.
 *
 * @param filters - Array of filter definitions
 * @returns Combined filter string
 */
export function combineFilters(...filters: string[]): string {
  return `<defs>${filters.join("")}</defs>`;
}
