/**
 * Demo Mode SVG Text Renderer
 * Generates smooth, font-based 80s-style logos using native SVG rendering
 * Completely bypasses canvas system for demo mode
 */

import type { StyleFingerprint } from "./demoStyleVariants";

export interface DemoSvgConfig {
  text: string;
  fingerprint: StyleFingerprint;
  width?: number;
  height?: number;
}

export interface DemoFontStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: "normal" | "italic";
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase";
  textSkew?: number;
  textRotate?: number;
}

export interface DemoEffectStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  filterIds: string[];
  textAnchor: "start" | "middle" | "end";
  baselineShift?: number;
}

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
    textSkew: 0,
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
    filterIds: ["purpleGlow", "shadowEffect"],
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

// ============= SVG FILTER DEFINITIONS =============
function generateDemoFilters(): string {
  return `
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

      <!-- NEON GLOW EFFECTS -->
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2" result="saturated" />
        <feOffset in="saturated" dx="0" dy="0" result="offsetblur" />
        <feComponentTransfer in="offsetblur" result="opaque">
          <feFuncA type="linear" slope="0.5" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="opaque" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.5" result="saturated" />
        <feFlood flood-color="#00FF00" flood-opacity="0.5" result="greenFlood" />
        <feComposite in="saturated" in2="greenFlood" operator="in" result="greenGlow" />
        <feMerge>
          <feMergeNode in="greenGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowOrange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.5" result="saturated" />
        <feFlood flood-color="#FF8C00" flood-opacity="0.6" result="orangeFlood" />
        <feComposite in="saturated" in2="orangeFlood" operator="in" result="orangeGlow" />
        <feMerge>
          <feMergeNode in="orangeGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.2" result="saturated" />
        <feFlood flood-color="#0066FF" flood-opacity="0.5" result="blueFlood" />
        <feComposite in="saturated" in2="blueFlood" operator="in" result="blueGlow" />
        <feMerge>
          <feMergeNode in="blueGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="yellowGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2" result="saturated" />
        <feFlood flood-color="#FFFF00" flood-opacity="0.5" result="yellowFlood" />
        <feComposite in="saturated" in2="yellowFlood" operator="in" result="yellowGlow" />
        <feMerge>
          <feMergeNode in="yellowGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowPink" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.5" result="saturated" />
        <feFlood flood-color="#FF1493" flood-opacity="0.6" result="pinkFlood" />
        <feComposite in="saturated" in2="pinkFlood" operator="in" result="pinkGlow" />
        <feMerge>
          <feMergeNode in="pinkGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="neonGlowCyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.2" result="saturated" />
        <feFlood flood-color="#00FFFF" flood-opacity="0.5" result="cyanFlood" />
        <feComposite in="saturated" in2="cyanFlood" operator="in" result="cyanGlow" />
        <feMerge>
          <feMergeNode in="cyanGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2" result="saturated" />
        <feFlood flood-color="#DA70D6" flood-opacity="0.6" result="purpleFlood" />
        <feComposite in="saturated" in2="purpleFlood" operator="in" result="purpleGlow" />
        <feMerge>
          <feMergeNode in="purpleGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2.5" result="saturated" />
        <feFlood flood-color="#FF0000" flood-opacity="0.7" result="redFlood" />
        <feComposite in="saturated" in2="redFlood" operator="in" result="redGlow" />
        <feMerge>
          <feMergeNode in="redGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- BLOOM AURA EFFECT -->
      <filter id="bloomAura" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="coloredBlur" />
        <feColorMatrix in="coloredBlur" type="saturate" values="2" result="saturated" />
        <feOffset in="saturated" dx="0" dy="0" result="offsetblur" />
        <feComponentTransfer in="offsetblur" result="opaque">
          <feFuncA type="linear" slope="0.4" />
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
    </defs>
  `;
}

// ============= MAIN RENDERER =============
export function generateDemoSvg(config: DemoSvgConfig): string {
  try {
    const { text, fingerprint, width = 512, height = 512 } = config;
    console.log("[generateDemoSvg] Starting SVG generation with text:", text);
    console.log("[generateDemoSvg] Fingerprint:", fingerprint);

    // Select font style based on fingerprint
    console.log("[generateDemoSvg] Selecting font style");
    const fontStyle = selectFontStyle(fingerprint);
    console.log("[generateDemoSvg] Selected font style:", fontStyle);

    const effectStyle = selectEffectStyle(fingerprint);
    console.log("[generateDemoSvg] Selected effect style:", effectStyle);

    // Dynamically calculate font size based on text length for better centering
    // Shorter text = larger, longer text = smaller
    let adjustedFontSize = fontStyle.fontSize;
    if (text.length > 6) {
      adjustedFontSize = Math.max(80, fontStyle.fontSize * (6 / text.length));
    } else if (text.length > 4) {
      adjustedFontSize = fontStyle.fontSize * 0.95;
    }
    adjustedFontSize = Math.round(adjustedFontSize);

    // Calculate text positioning with proper centering
    const centerX = width / 2;
    // Use dominant-baseline="middle" with adjusted centerY for better vertical centering
    const centerY = height / 2;
    console.log(
      "[generateDemoSvg] Text positioning - centerX:",
      centerX,
      "centerY:",
      centerY,
      "adjustedFontSize:",
      adjustedFontSize,
    );

    // Build the SVG with fonts embedded properly for data URLs
    // Build transform string combining skew and rotate if both exist
    const transformParts: string[] = [];
    if (fontStyle.textSkew) transformParts.push(`skewX(${fontStyle.textSkew})`);
    if (fontStyle.textRotate) transformParts.push(`rotate(${fontStyle.textRotate} ${centerX} ${centerY})`);
    const transformAttr = transformParts.length > 0 ? ` transform="${transformParts.join(" ")}"` : "";

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}">
      <defs>
      </defs>
      <style>
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
        }
      </style>
      
      ${generateDemoFilters()}
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#000000" />
      
      <!-- Glow background layer (for bloom effects) -->
      ${
        effectStyle.filterIds.includes("bloomAura")
          ? `
        <text x="${centerX}" y="${centerY}" filter="url(#bloomAura)" opacity="0.6">
          ${text}
        </text>
      `
          : ""
      }
      
      <!-- Main text with applied filters -->
      <text 
        x="${centerX}" 
        y="${centerY}"${transformAttr}
        ${effectStyle.filterIds.length > 0 ? `filter="url(#${effectStyle.filterIds[0]})"` : ""}
        textLength="${width * 0.85}"
        lengthAdjust="spacingAndGlyphs"
      >
        ${text}
      </text>

      <!-- Secondary effect layer if multiple filters -->
      ${
        effectStyle.filterIds.length > 1
          ? `
        <text 
          x="${centerX}" 
          y="${centerY}"${transformAttr}
          filter="url(#${effectStyle.filterIds[1]})"
          opacity="0.7"
          textLength="${width * 0.85}"
          lengthAdjust="spacingAndGlyphs"
        >
          ${text}
        </text>
      `
          : ""
      }
    </svg>
  `;

    console.log(
      "[generateDemoSvg] SVG generated successfully, length:",
      svg.length,
    );
    console.log(
      "[generateDemoSvg] SVG preview (first 500 chars):",
      svg.substring(0, 500),
    );
    console.log(
      "[generateDemoSvg] SVG ending (last 200 chars):",
      svg.substring(svg.length - 200),
    );
    return svg;
  } catch (error) {
    console.error("[generateDemoSvg] Error generating SVG:", error);
    throw error;
  }
}

// ============= HELPER FUNCTIONS =============
function selectFontStyle(fingerprint: StyleFingerprint): DemoFontStyle {
  // Map fingerprint components to font styles
  const glowFontMap: Record<string, string> = {
    softNeon: "modern",
    hardNeon: "hausChunky",
    pulseGlow: "roadRageBold",
    auraGlow: "indizzlePerspective",
  };

  const chromeFontMap: Record<string, string> = {
    mirrorChrome: "hausChunky",
    brushedMetal: "strangerOutline",
    rainbowChrome: "hausChunky",
    darkChrome: "strangerOutline",
  };

  const paletteFontMap: Record<string, string> = {
    neonPinkBlue: "lazerItalic",
    magentaCyan: "hausChunky",
    hotPinkGold: "lazerItalic",
    sunsetPurple: "indizzlePerspective",
    ultraviolet: "indizzlePerspective",
    electricBlue: "strangerOutline",
    cyberOrange: "roadRageBold",
    laserGreen: "strangerOutline",
    midnightNeon: "hausChunky",
  };

  // Priority: palette > chrome > glow
  let fontKey = paletteFontMap[fingerprint.palette];
  if (!fontKey) fontKey = chromeFontMap[fingerprint.chrome];
  if (!fontKey) fontKey = glowFontMap[fingerprint.glow];
  if (!fontKey) fontKey = "modern";

  return DEMO_FONT_STYLES[fontKey] || DEMO_FONT_STYLES.modern;
}

function selectEffectStyle(fingerprint: StyleFingerprint): DemoEffectStyle {
  // Map fingerprint components to effect styles
  const paletteEffectMap: Record<string, string> = {
    neonPinkBlue: "neonPinkScanlines",
    magentaCyan: "chromeReflective",
    hotPinkGold: "pinkBloom",
    sunsetPurple: "purplePerspective",
    ultraviolet: "purplePerspective",
    electricBlue: "chromeReflective",
    cyberOrange: "redOutlined",
    laserGreen: "defaultNeon",
    midnightNeon: "chromeReflective",
  };

  const chromeEffectMap: Record<string, string> = {
    mirrorChrome: "chromeReflective",
    brushedMetal: "defaultNeon",
    rainbowChrome: "chromeReflective",
    darkChrome: "redOutlined",
  };

  const glowEffectMap: Record<string, string> = {
    softNeon: "defaultNeon",
    hardNeon: "neonPinkScanlines",
    pulseGlow: "pinkBloom",
    auraGlow: "bloomAura",
  };

  // Priority: palette > glow > chrome
  let effectKey = paletteEffectMap[fingerprint.palette];
  if (!effectKey) effectKey = glowEffectMap[fingerprint.glow];
  if (!effectKey) effectKey = chromeEffectMap[fingerprint.chrome];
  if (!effectKey) effectKey = "defaultNeon";

  return DEMO_EFFECT_STYLES[effectKey] || DEMO_EFFECT_STYLES.defaultNeon;
}

// ============= CONVERT SVG STRING TO DATA URL =============
export function svgToDataUrl(svgString: string): string {
  try {
    console.log(
      "[svgToDataUrl] Converting SVG to data URL, SVG length:",
      svgString.length,
    );
    
    // Trim leading/trailing whitespace
    const trimmedSvg = svgString.trim();
    console.log(
      "[svgToDataUrl] After trim, SVG length:",
      trimmedSvg.length,
    );
    
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
        console.log("[svgToDataUrl] Direct btoa successful");
      } catch (directError) {
        console.log(
          "[svgToDataUrl] Direct btoa failed, trying with encoding:",
          directError,
        );
        // Fallback: use encodeURIComponent + unescape for UTF-8 handling
        try {
          base64 = btoa(unescape(encodeURIComponent(trimmedSvg)));
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
      console.log("[svgToDataUrl] Using Node.js Buffer");
    }

    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    console.log(
      "[svgToDataUrl] Data URL created, length:",
      dataUrl.length,
      "first 100 chars:",
      dataUrl.substring(0, 100),
    );
    
    // Validate that we can decode the base64 back to SVG
    if (typeof window !== "undefined") {
      try {
        const decodedString = atob(base64);
        console.log(
          "[svgToDataUrl] Validation: Successfully decoded base64, length:",
          decodedString.length,
        );
        if (decodedString.includes("<svg")) {
          console.log("[svgToDataUrl] Validation: Decoded content contains <svg>");
        } else {
          console.warn("[svgToDataUrl] Validation: Decoded content missing <svg>");
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
