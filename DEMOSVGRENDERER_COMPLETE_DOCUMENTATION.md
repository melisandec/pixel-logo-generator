# DemoSvgRenderer.ts - Complete Documentation

## File Overview

**Location:** `lib/demoSvgRenderer.ts`  
**Purpose:** Generates smooth, font-based 80s-style neon logos using native SVG rendering for demo mode  
**Size:** 1,647 lines  
**Dependencies:** `demoStyleVariants.ts` (StyleFingerprint)

This module completely bypasses the canvas rendering system and instead generates high-quality SVG logos with advanced effects. It's the core rendering engine for Pixel Logo Forge's demo mode.

---

## Architecture

### High-Level Flow

```
DemoSvgConfig (input)
    ↓
generateDemoSvg() (main entry point)
    ↓
selectFontStyle() + selectEffectStyle()
    ↓
buildSvgDocument()
    ├─ buildGlowLayer()
    ├─ buildMainLayer()
    ├─ buildEffectLayers()
    └─ generateDemoFilters() (cached)
    ↓
SVG String (output)
    ↓
svgToDataUrl() (optional conversion to data URL)
```

### Key Design Principles

1. **Memoization:** Filter definitions are cached (never change)
2. **Deterministic:** Same input always produces same output via seeded randomness
3. **Performance:** Module-level regex compilation, no per-call object creation
4. **Type Safety:** Full TypeScript with no `any` types
5. **Extensibility:** Modular style mappings and effect selection

---

## Core Interfaces

### 1. DemoSvgConfig

**Purpose:** Configuration object passed to `generateDemoSvg()`

```typescript
export interface DemoSvgConfig {
  text: string; // Logo text (max 50 chars)
  fingerprint: StyleFingerprint; // Style selection determinant
  width?: number; // SVG width (default: 512)
  height?: number; // SVG height (default: 512)
  randomSeed?: number; // Optional randomization seed
  colorOverride?: {
    // Priority 4: Dynamic color customization
    fill?: string; // Override fill color (e.g., "#FF00FF")
    stroke?: string; // Override stroke color (e.g., "#00FFFF")
  };
}
```

**Usage:**

```typescript
const config: DemoSvgConfig = {
  text: "NEON",
  fingerprint: { palette: "cyan", chrome: "chrome1", glow: "glow1" },
  width: 512,
  colorOverride: { fill: "#FF00FF", stroke: "#00FFFF" },
};
```

### 2. DemoFontStyle

**Purpose:** Defines typography and text transformation properties

```typescript
export interface DemoFontStyle {
  fontFamily: string; // CSS font family
  fontSize: number; // Base font size in pixels
  fontWeight: string; // CSS font weight ("400", "700", "900")
  fontStyle: "normal" | "italic"; // Text style
  letterSpacing: number; // Letter spacing in pixels
  textTransform:
    | "none"
    | "uppercase" // Priority 4: Extended transforms
    | "lowercase"
    | "capitalize"
    | "reverse";
  textSkew?: number; // Skew angle in degrees
  textRotate?: number; // Rotation angle in degrees
}
```

**Available Fonts (11 total):**

- `lazerItalic` - Italic serif, skewed (futuristic)
- `hausChunky` - Heavy monospace, blocky
- `strangerOutline` - Bold outlined style
- `indizzlePerspective` - Italic with perspective skew
- `roadRageBold` - Aggressive monospace
- `synthwaveThin` - Thin elegant italic
- `chromeDreams` - Bold minimal spacing
- `neonNights` - Extra large minimal
- `retroWave` - Condensed italic serif
- `pixelDream` - Monospace classic
- `modern` - Fallback sans-serif

### 3. DemoEffectStyle

**Purpose:** Defines visual effects, colors, and filters

```typescript
export interface DemoEffectStyle {
  fillColor: string; // Fill color or gradient URL
  strokeColor: string; // Stroke color or gradient URL
  strokeWidth: number; // Stroke width in pixels
  filterIds: string[]; // Array of filter IDs to apply
  textAnchor: "start" | "middle" | "end"; // Text alignment
  intensity?: number; // Priority 4: Filter intensity (0-2)
}
```

**Available Effects (26 total):**

| Category                | Effects                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| **Neon Glow**           | neonCyan, neonPink, neonPurple, neonGreen, neonOrange            |
| **Chrome/Gradient**     | chromeReflective, goldChrome, rainbowChrome                      |
| **Solid Colors**        | solidRed, solidBlue, solidYellow                                 |
| **Outlined**            | redOutlined, cyanOutlined, whiteOutlined                         |
| **Bloom/Aura**          | pinkBloom, purpleBloom, cyanBloom                                |
| **Shadow/Depth**        | shadowChrome, deepPurple                                         |
| **Glitch/Experimental** | glitchCyan, geometricBuild, neonPinkScanlines, purplePerspective |
| **Default**             | defaultNeon                                                      |

---

## Constants & Configuration

### Rendering Parameters

```typescript
// Text sizing (lines 14-28)
TEXT_LENGTH_RATIO = 0.85; // SVG width ratio for text adjustment
FONT_SIZE_THRESHOLD_LONG = 6; // Long text starts at 6+ chars
FONT_SIZE_THRESHOLD_MEDIUM = 4; // Medium text starts at 4+ chars
MIN_FONT_SIZE = 80; // Minimum font size
MEDIUM_TEXT_ADJUSTMENT = 0.95; // Adjustment factor for 4-5 char text
MAX_TEXT_LENGTH = 20; // Before long text optimization
DEFAULT_CANVAS_SIZE = 512; // Default width/height
MIN_CANVAS_SIZE = 256; // For very long text (>20 chars)
MAX_CANVAS_SIZE = 1024; // For short text (<=3 chars)
ABSOLUTE_MAX_TEXT_LENGTH = 50; // Hard limit to prevent rendering issues
```

### Filter Effect Parameters

```typescript
// Blur effects (lines 42-48)
GLOW_BLUR_LIGHT = 3; // Subtle glow blur
GLOW_BLUR_MEDIUM = 3.5; // Standard glow blur
GLOW_BLUR_HEAVY = 4; // Intense glow blur
GLOW_BLUR_AURA = 8; // Extra heavy bloom/aura blur

// Saturation (lines 50-54)
GLOW_SATURATION_LIGHT = 2; // Light saturation boost
GLOW_SATURATION_MEDIUM = 2.2; // Medium saturation boost
GLOW_SATURATION_HEAVY = 2.5; // Heavy saturation boost

// Opacity (lines 56-62)
GLOW_OPACITY_LIGHT = 0.4; // Light glow opacity
GLOW_OPACITY_MEDIUM = 0.5; // Medium glow opacity
GLOW_OPACITY_HEAVY = 0.6; // Heavy glow opacity
GLOW_OPACITY_INTENSE = 0.7; // Extra intense glow
```

### Performance Optimizations

```typescript
// Module-level regex (compiled once, reused)
const HTML_ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ... }
const FILTER_ID_REGEX = /<filter[^>]*id="([^"]+)"/g
const EXPORT_FILTER_REGEX = /<filter...><\/filter>/g

// Memoization
let DEMO_FILTERS_CACHE: string | null = null
// Filters are generated once and cached forever
```

---

## Public API Functions

### 1. generateDemoSvg()

**Primary entry point for SVG generation**

```typescript
export function generateDemoSvg(config: DemoSvgConfig): string;
```

**Parameters:**

- `config` - DemoSvgConfig object with text, fingerprint, and optional overrides

**Returns:** Complete SVG string with dimensions and all effects

**Process:**

1. Validates and escapes text for SVG safety
2. Calculates optimal dimensions based on text length
3. Selects font and effect styles based on fingerprint
4. Applies color overrides if provided (Priority 4)
5. Applies intensity scaling if specified (Priority 4)
6. Validates filter IDs exist
7. Builds multi-layer SVG with glow, main, and effect layers
8. Returns as data-URL-ready SVG string

**Example:**

```typescript
const svg = generateDemoSvg({
  text: "NEON",
  fingerprint: { palette: "magenta", chrome: "chrome1", glow: "glow1" },
  colorOverride: { fill: "#FF00FF", stroke: "#00FFFF" },
});
// Returns: '<svg width="512" height="512"...>...</svg>'
```

### 2. svgToDataUrl()

**Converts SVG string to data URL**

```typescript
export function svgToDataUrl(svgString: string): string;
```

**Parameters:**

- `svgString` - SVG markup

**Returns:** `data:image/svg+xml;base64,...` data URL

**Purpose:** Creates embeddable URL for images, canvas rendering, or network transfer

### 3. getAvailableFiltersMetadata()

**Priority 4 feature: Runtime filter introspection**

```typescript
export function getAvailableFiltersMetadata(): {
  filterIds: string[];
  count: number;
  categories: Record<string, string[]>;
};
```

**Returns:**

```typescript
{
  filterIds: ["bloomAura", "chromeEffect", "glowCyan", ...],
  count: 24,
  categories: {
    glow: ["glowCyan", "glowMagenta", ...],
    bloom: ["bloomAura", "bloomIntense", ...],
    effect: ["chromeEffect", ...],
    texture: ["noiseTexture", ...]
  }
}
```

**Use Cases:**

- Validate effects before rendering
- Generate UI dropdowns of available filters
- Check filter availability at runtime

### 4. exportFilterDefinitions()

**Priority 4 feature: Export raw filter XML**

```typescript
export function exportFilterDefinitions(): string[];
```

**Returns:** Array of individual `<filter>` element strings

**Purpose:** Reuse filters in other SVG contexts or separate rendering

### 5. applyColorOverride()

**Priority 4 feature: Dynamic color customization**

```typescript
export function applyColorOverride(
  effectStyle: DemoEffectStyle,
  colorOverride?: { fill?: string; stroke?: string },
): DemoEffectStyle;
```

**Parameters:**

- `effectStyle` - Original effect style
- `colorOverride` - Partial color overrides

**Returns:** New effect style with applied overrides

**Behavior:**

- Partial overrides (fill XOR stroke) preserved
- Non-overridden colors kept from original
- Returns original if override is empty

**Example:**

```typescript
const original = DEMO_EFFECT_STYLES.neonCyan; // #00FFFF fill
const custom = applyColorOverride(original, { fill: "#FF00FF" });
// Result: { ...original, fillColor: '#FF00FF' }
```

### 6. applyIntensityScaling()

**Priority 4 feature: Filter intensity control**

```typescript
export function applyIntensityScaling(
  effectStyle: DemoEffectStyle,
  intensity?: number,
): DemoEffectStyle;
```

**Parameters:**

- `effectStyle` - Original effect style
- `intensity` - Multiplier (0.1 = subtle, 1 = normal, 2 = enhanced)

**Returns:** New effect style with scaled stroke width

**Behavior:**

- Clamps intensity between 0.1 and 2.0
- Multiplies `strokeWidth` by intensity
- Returns original if intensity is 1 or undefined

**Example:**

```typescript
const subtle = applyIntensityScaling(effectStyle, 0.5); // 50% intensity
const enhanced = applyIntensityScaling(effectStyle, 1.5); // 150% intensity
```

### 7. applyTextTransform()

**Priority 4 feature: Extended text transforms**

```typescript
export function applyTextTransform(
  text: string,
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize" | "reverse",
): string;
```

**Transform Behaviors:**

| Transform    | Input       | Output      |
| ------------ | ----------- | ----------- |
| `uppercase`  | hello       | HELLO       |
| `lowercase`  | HELLO       | hello       |
| `capitalize` | hello world | Hello World |
| `reverse`    | hello       | olleh       |
| `none`       | hello       | hello       |

**Example:**

```typescript
applyTextTransform("pixel forge", "capitalize"); // 'Pixel Forge'
applyTextTransform("neon", "reverse"); // 'noen'
```

### 8. validateFilterIds()

**Validates that all filter IDs exist**

```typescript
export function validateFilterIds(effectStyle: DemoEffectStyle): void;
```

**Behavior:**

- Throws error if any referenced filter ID is missing
- Used to prevent invalid effect rendering

**Example:**

```typescript
try {
  validateFilterIds(effectStyle);
} catch (error) {
  console.error("Invalid filter:", error.message);
}
```

### 9. validateTextLength()

**Truncates text exceeding maximum length**

```typescript
export function validateTextLength(
  text: string,
  maxLength: number = ABSOLUTE_MAX_TEXT_LENGTH,
): string;
```

**Default:** 50 character maximum

**Behavior:**

- Logs warning if truncation occurs
- Returns original if within limit

### 10. ensureViewboxConsistency()

**Forces square aspect ratio**

```typescript
export function ensureViewboxConsistency(
  width: number,
  height: number,
): { width: number; height: number };
```

**Behavior:**

- Uses `Math.max(width, height)` for both dimensions
- Ensures 1:1 aspect ratio for consistent scaling
- Logs warning if dimensions weren't square

---

## Private Functions (Internal)

### Debug Logging (Lines 122-164)

```typescript
function debugLog(context, message, data?); // Enabled in development
function debugWarn(context, message, data?); // Warning logs
function debugError(context, message, data?); // Error logs
```

**Usage Pattern:**

```typescript
debugLog("generateDemoSvg", "Text positioning", { centerX, centerY, fontSize });
```

### Utility Functions

#### escapeHtml() (Line 173)

Escapes HTML special characters to prevent SVG injection attacks.

```typescript
escapeHtml('<script>alert("xss")</script>');
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

#### calculateOptimalDimensions() (Line 183)

Adjusts canvas size based on text length for better centering.

```typescript
// Long text (>20 chars): reduces to MIN_CANVAS_SIZE (256)
// Short text (<=3 chars): expands to MAX_CANVAS_SIZE (1024)
// Normal: uses DEFAULT_CANVAS_SIZE (512)
```

#### seededRandom() (Line 203)

Generates reproducible random numbers using sine-based algorithm.

```typescript
seededRandom(12345); // Always returns same value for same seed
```

#### selectRandomKey() (Line 214)

Selects random key from record using seed for deterministic randomness.

#### isFingerprintValid() (Line 429)

Type guard validating StyleFingerprint structure.

### Style Selection Functions

#### selectStyleByPriority() (Lines 1483-1510)

Generic DRY style selection with fallback chain.

**Priority order:** palette → chrome → glow → fallback

**Example:**

```typescript
const fontStyle = selectStyleByPriority(
  fingerprint,
  [PALETTE_FONT_MAP, CHROME_FONT_MAP, GLOW_FONT_MAP],
  DEMO_FONT_STYLES,
  "modern", // fallback
);
```

#### selectFontStyle() (Lines 1517-1534)

Selects DemoFontStyle based on fingerprint.

#### selectEffectStyle() (Lines 1540-1571)

Selects DemoEffectStyle based on fingerprint.

### SVG Building Functions

#### buildSvgDocument() (Lines 1196-1242)

Constructs complete SVG with structure:

```
<svg>
  <defs>
    <style>...</style>
    <filters>...</filters>
    <gradients>...</gradients>
  </defs>
  <rect fill="#000000" />  <!-- Background -->
  <text filter="bloomAura" />  <!-- Glow layer -->
  <text filter="primary" />  <!-- Main layer -->
  <text filter="secondary" />  <!-- Effect layer -->
  <text />  <!-- Shadow layer -->
</svg>
```

#### buildGlowLayer() (Lines 1282-1288)

Creates background glow for bloom effects (conditional).

#### buildMainLayer() (Lines 1301-1311)

Creates primary text layer with main filter effect.

#### buildEffectLayers() (Lines 1324-1347)

Creates 2-3 secondary/tertiary effect layers for depth.

#### buildSvgStyles() (Lines 1252-1271)

Generates CSS `<style>` block with:

- Font properties
- Text styling
- Fill/stroke colors
- Paint order (stroke → fill)
- Pixelation settings (if needed)

#### shouldUsePixelated() (Lines 1156-1159)

Determines if pixelated rendering applies (certain monospace fonts).

#### calculateDynamicStrokeWidth() (Lines 1170-1177)

Creates tapering effect from text start to end for visual depth.

#### generateDemoFilters() (Lines 920-1149)

Generates all SVG filter definitions (70+ filters across categories):

**Filter Categories:**

- Neon Glow (Cyan, Pink, Purple, Green, Orange)
- Chrome/Reflective Effects
- Bloom & Aura Effects
- Scanlines & Texture
- Perspective & Distortion
- Shadow & Depth
- Chromatic Aberration (Glitch)
- Gradients (Chrome, Gold, Rainbow)

**Caching:**
Filters are generated once and cached in `DEMO_FILTERS_CACHE` (never changes).

---

## Style Mapping System

### Font Mapping (Lines 443-477)

Maps style fingerprint properties to font selections:

```typescript
const GLOW_FONT_MAP = {
  softNeon: "modern",
  hardNeon: "hausChunky",
  pulseGlow: "roadRageBold",
  auraGlow: "indizzlePerspective"
};

const CHROME_FONT_MAP = { ... };  // 4 entries
const PALETTE_FONT_MAP = { ... }; // 15 entries
```

### Effect Mapping (Lines 481-511)

Maps style fingerprint properties to effect selections:

```typescript
const GLOW_EFFECT_MAP = {
  softNeon: "defaultNeon",
  hardNeon: "neonPurple",
  pulseGlow: "pinkBloom",
  auraGlow: "cyanBloom"
};

const CHROME_EFFECT_MAP = { ... };  // 4 entries
const PALETTE_EFFECT_MAP = { ... }; // 15 entries
```

### Consolidated Style Mappings (Lines 515-550)

Nested object grouping all mappings:

```typescript
const STYLE_MAPPINGS = {
  fonts: {
    palette: { ... },
    chrome: { ... },
    glow: { ... }
  },
  effects: {
    palette: { ... },
    chrome: { ... },
    glow: { ... }
  }
};
```

---

## SVG Filter Library (Lines 920-1149)

### Filter Categories

#### 1. Gradients

- `chromeGradient` - Cyan to white to cyan gradient
- `goldGradient` - Gold to yellow to orange gradient
- `rainbowGradient` - Full spectrum gradient

#### 2. Neon Glow Effects

- `neonGlowCyan` - Cyan-specific glow
- `neonGlowPink` - Pink-specific glow
- `neonGlowGreen` - Green-specific glow
- `neonGlowOrange` - Orange-specific glow
- Plus 5+ variations (soft, hard, pulse)

#### 3. Bloom & Aura

- `bloomAura` - Soft bloom effect
- `bloomIntense` - Intense bloom
- Various color-specific blooms

#### 4. Special Effects

- `scanlinesEffect` - Horizontal line texture
- `chromaticAberration` - RGB channel separation (glitch)
- `perspectiveEffect` - 3D perspective skew
- `shadowEffect` - Depth shadow
- `outlineEffect` - Stroke enhancement

#### 5. Texture Effects

- `noiseTexture` - Procedural noise
- `gridPattern` - Grid overlay

### Filter Implementation Pattern

Each filter uses SVG `<filter>` element with:

```xml
<filter id="filterName" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="3" />
  <feColorMatrix type="saturate" values="2" />
  <feOffset dx="0" dy="0" />
  <feComponentTransfer>
    <feFuncA type="linear" slope="0.5" />
  </feComponentTransfer>
  <feComposite operator="in" in2="SourceGraphic" />
</filter>
```

---

## Performance Characteristics

### Time Complexity

| Operation                       | Complexity | Notes                                       |
| ------------------------------- | ---------- | ------------------------------------------- |
| `generateDemoSvg()`             | O(n)       | n = text length, mainly SVG string building |
| `getAvailableFiltersMetadata()` | O(f)       | f = number of filters (~70)                 |
| `applyColorOverride()`          | O(1)       | Simple property spread                      |
| `applyIntensityScaling()`       | O(1)       | Single multiplication                       |
| `applyTextTransform()`          | O(n)       | n = text length                             |
| `svgToDataUrl()`                | O(s)       | s = SVG string length                       |

### Optimizations Implemented

1. **Filter Caching:** Filters generated once, cached forever
2. **Regex Compilation:** Module-level regexes avoid per-call compilation
3. **Hash Maps:** DEMO_FONT_STYLES and DEMO_EFFECT_STYLES are pre-computed
4. **Early Returns:** Memoization checks prevent unnecessary computation
5. **String Escaping:** HTML_ESCAPE_MAP avoids object creation per character

### Memory Usage

- **DEMO_FILTERS_CACHE:** ~20-30KB (generated once)
- **DEMO_FONT_STYLES:** ~5KB (11 font definitions)
- **DEMO_EFFECT_STYLES:** ~8KB (26 effect definitions)
- **Style Mappings:** ~3KB (consolidated maps)
- **Per-call overhead:** ~1-2KB (SVG string varies by text length)

---

## Integration Points

### Dependencies

- **Imports:** `StyleFingerprint` from `demoStyleVariants`
- **Used By:**
  - `components/LogoGenerator.tsx` - Main UI component
  - `app/api/logo-image/route.ts` - Server-side image rendering
  - `lib/demoSeedPoolManager.ts` - Seed pool operations

### Data Flow

```
User Input (LogoGenerator.tsx)
    ↓
convertToFingerprint()
    ↓
generateDemoSvg(config)
    ↓
SVG String
    ↓
POST /api/logo-image (optional)
    ↓
Vercel Blob Storage (optional)
    ↓
Download/Share
```

---

## Common Use Cases

### 1. Generate Basic Logo

```typescript
import { generateDemoSvg } from "./lib/demoSvgRenderer";

const svg = generateDemoSvg({
  text: "PIXEL",
  fingerprint: {
    palette: "neonPinkBlue",
    chrome: "mirrorChrome",
    glow: "softNeon",
  },
});
```

### 2. Generate with Custom Colors

```typescript
const svg = generateDemoSvg({
  text: "FORGE",
  fingerprint: {
    palette: "synthwave",
    chrome: "rainbowChrome",
    glow: "hardNeon",
  },
  colorOverride: { fill: "#00FFFF", stroke: "#FF00FF" },
});
```

### 3. Apply Intensity Control

```typescript
import { generateDemoSvg, applyIntensityScaling } from "./lib/demoSvgRenderer";

const baseEffect = selectEffectStyle(fingerprint);
const subtleEffect = applyIntensityScaling(baseEffect, 0.6);
```

### 4. Check Available Filters

```typescript
import { getAvailableFiltersMetadata } from "./lib/demoSvgRenderer";

const metadata = getAvailableFiltersMetadata();
console.log(`Using ${metadata.count} filters`);
console.log("Glow effects:", metadata.categories.glow);
```

### 5. Text Transform

```typescript
import { applyTextTransform } from "./lib/demoSvgRenderer";

const capitalized = applyTextTransform("hello world", "capitalize");
// Result: 'Hello World'
```

### 6. Convert to Data URL

```typescript
import { generateDemoSvg, svgToDataUrl } from "./lib/demoSvgRenderer";

const svg = generateDemoSvg(config);
const dataUrl = svgToDataUrl(svg);

// Use in <img>
const img = document.createElement("img");
img.src = dataUrl;
```

---

## Error Handling

### Validation Strategy

1. **Text Length:** Validates and truncates if exceeds 50 chars
2. **Fingerprint:** Type guard checks for required properties
3. **Filter IDs:** Validates all referenced filters exist
4. **Aspect Ratio:** Forces square dimensions
5. **Safe Defaults:** Falls back to `defaultNeon` if style selection fails

### Error Scenarios

| Scenario            | Behavior                                   |
| ------------------- | ------------------------------------------ |
| Invalid fingerprint | Uses defaults (cyan, chrome1, glow1)       |
| Missing filter ID   | Throws error with available filters listed |
| Text too long (>50) | Truncates with console warning             |
| Invalid SVG config  | Validates before rendering                 |
| Rendering error     | Returns error object with context          |

---

## Testing Considerations

### Unit Testing

```typescript
// Test deterministic generation
const seed = stringToSeed("test");
const svg1 = generateDemoSvg({ text: "test", fingerprint });
const svg2 = generateDemoSvg({ text: "test", fingerprint });
expect(svg1).toBe(svg2);

// Test color override
const svg = generateDemoSvg({
  text: "test",
  fingerprint,
  colorOverride: { fill: "#FF00FF" },
});
expect(svg).toContain("FF00FF");

// Test text transform
const result = applyTextTransform("hello", "capitalize");
expect(result).toBe("Hello");

// Test intensity scaling
const scaled = applyIntensityScaling(effect, 0.5);
expect(scaled.strokeWidth).toBe(effect.strokeWidth * 0.5);
```

### Integration Testing

```typescript
// Test full pipeline
const svg = generateDemoSvg(config);
const dataUrl = svgToDataUrl(svg);
expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);

// Test metadata export
const metadata = getAvailableFiltersMetadata();
expect(metadata.count).toBeGreaterThan(0);
expect(metadata.filterIds.length).toBe(metadata.count);
```

---

## Configuration Guide

### Customizing Fonts

Add to `DEMO_FONT_STYLES`:

```typescript
export const DEMO_FONT_STYLES: Record<string, DemoFontStyle> = {
  // ... existing fonts ...
  myCustomFont: {
    fontFamily: "'My Font', sans-serif",
    fontSize: 120,
    fontWeight: "700",
    fontStyle: "normal",
    letterSpacing: 5,
    textTransform: "uppercase",
  },
};
```

Then add to `PALETTE_FONT_MAP`:

```typescript
const PALETTE_FONT_MAP: Record<string, string> = {
  // ... existing mappings ...
  myPalette: "myCustomFont",
};
```

### Customizing Effects

Add to `DEMO_EFFECT_STYLES`:

```typescript
export const DEMO_EFFECT_STYLES: Record<string, DemoEffectStyle> = {
  // ... existing effects ...
  myCustomEffect: {
    fillColor: "#FF00FF",
    strokeColor: "#00FFFF",
    strokeWidth: 2,
    filterIds: ["neonGlowCyan", "customFilter"],
    textAnchor: "middle",
  },
};
```

### Adding SVG Filters

Extend `generateDemoFilters()`:

```typescript
function generateDemoFilters(): string {
  if (DEMO_FILTERS_CACHE !== null) {
    return DEMO_FILTERS_CACHE;
  }

  const filtersString = `
    <defs>
      <!-- ... existing filters ... -->
      
      <!-- NEW CUSTOM FILTER -->
      <filter id="customFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
        <feColorMatrix type="hueRotate" values="45" />
      </filter>
    </defs>
  `;

  DEMO_FILTERS_CACHE = filtersString;
  return DEMO_FILTERS_CACHE;
}
```

---

## Priority 4 Features Summary

### 1. Filter Intensity Control

- **Location:** `DemoEffectStyle.intensity`
- **Type:** Optional number (0-2 range, clamped)
- **Effect:** Multiplies stroke width
- **Usage:** `applyIntensityScaling(effect, 0.5)` for 50% intensity

### 2. Color Customization

- **Location:** `DemoSvgConfig.colorOverride`
- **Type:** Optional `{ fill?, stroke? }`
- **Effect:** Overrides effect colors per render
- **Usage:** `{ colorOverride: { fill: '#FF00FF' } }`

### 3. Text Transforms

- **Location:** `DemoFontStyle.textTransform`
- **Types:** uppercase, lowercase, capitalize, reverse, none
- **Effect:** Applied via CSS text-transform property
- **Usage:** `applyTextTransform(text, 'capitalize')`

### 4. Filter Metadata Export

- **Location:** `getAvailableFiltersMetadata()`
- **Returns:** `{ filterIds, count, categories }`
- **Purpose:** Runtime filter introspection
- **Usage:** Validate effects before rendering

---

## Troubleshooting

### Issue: SVG not rendering

**Cause:** Invalid filter IDs referenced  
**Solution:** Call `validateFilterIds()` before rendering

### Issue: Text appears truncated

**Cause:** Text length > 50 characters  
**Solution:** Reduce text length or check `MAX_TEXT_LENGTH` constant

### Issue: Wrong colors applied

**Cause:** Color override format incorrect  
**Solution:** Verify hex color format (e.g., `#FF00FF` not `FF00FF`)

### Issue: Blurry text

**Cause:** SVG scaled to non-integer dimensions  
**Solution:** Use `ensureViewboxConsistency()` before rendering

---

## Version History

- **v1.0** (Initial) - SVG rendering with 11 fonts, 26 effects, 70+ filters
- **v2.0** (Priority 4) - Added color override, intensity control, text transforms, filter metadata

---

## Related Files

- [demoStyleVariants.ts](lib/demoStyleVariants.ts) - Style fingerprint definitions
- [LogoGenerator.tsx](components/LogoGenerator.tsx) - UI component integration
- [logo-image/route.ts](app/api/logo-image/route.ts) - Server rendering endpoint
- [PRIORITY_4_FEATURES.md](PRIORITY_4_FEATURES.md) - Feature documentation
