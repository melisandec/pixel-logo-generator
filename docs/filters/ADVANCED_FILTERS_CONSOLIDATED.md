# Advanced Filtering System

**Consolidated from:** ADVANCED_FILTERS_IMPLEMENTATION.md, ADVANCED_FILTERS_QUICK_REFERENCE.md

---

## 📋 Quick Reference

| Filter                 | Effect                                     | Complexity   |
| ---------------------- | ------------------------------------------ | ------------ |
| **Liquid Neon**        | Flowing morphing effects                   | Advanced     |
| **Comic Book**         | Bold outlines with erosion/dilation        | Advanced     |
| **Wave Ripple**        | Undulating wave effects                    | Advanced     |
| **Holographic Shine**  | Rainbow reflections with specular lighting | Advanced     |
| **Neon Glow Enhanced** | Multi-stage glow with saturation           | Advanced     |
| **Shadow Depth**       | Layered shadows for 3D depth               | Advanced     |
| **Neon Outline**       | Bold neon borders                          | Intermediate |

---

## 🎯 Quick Start

### Using Basic Filters

```typescript
import {
  filterLiquidNeon,
  filterComicBook,
  generateFilterDefs,
} from "@/lib/svgFilterLibrary";

const svgString = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    ${generateFilterDefs({
      liquidNeon: { id: "liquid-effect", intensity: 0.7 },
    })}
    <circle cx="200" cy="200" r="100" fill="#00ffff" filter="url(#liquid-effect)" />
  </svg>
`;
```

---

### Getting Recommended Filters for Rarity

```typescript
import { getRecommendedAdvancedFilters } from "@/lib/rarityFilterStacks";

// Get filters recommended for Legendary rarity
const legendaryFilters = getRecommendedAdvancedFilters("Legendary");
// Returns: ["Liquid Neon", "Holographic Shine", "Neon Glow Enhanced"]
```

---

### Combining Multiple Filters

```typescript
import {
  filterLiquidNeon,
  filterHolographicShine,
  generateFilterDefs,
} from "@/lib/svgFilterLibrary";

const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg">
    ${generateFilterDefs({
      liquidNeon: { id: "liquid", intensity: 0.6 },
      holographicShine: { id: "holo", intensity: 0.8 },
    })}
    <!-- First apply liquid neon, then holographic shine -->
    <image filter="url(#liquid) url(#holo)" />
  </svg>
`;
```

---

## Overview

Advanced SVG filters provide sophisticated visual effects based on patterns from the Coding Dude SVG Filters reference. They're integrated into the demo logo system for exclusive visual enhancement.

### Filter Registry

**File:** `lib/rarityFilterStacks.ts`

```typescript
type AdvancedFilterVariant =
  | "liquidNeon"
  | "comicBook"
  | "waveRipple"
  | "holographicShine"
  | "neonGlowAdvanced"
  | "shadowDepth"
  | "neonOutline";

const ADVANCED_FILTERS: Record<
  AdvancedFilterVariant,
  {
    name: string;
    description: string;
    intensity: number;
    rarities: string[];
  }
> = {
  liquidNeon: {
    name: "Liquid Neon",
    description: "Flowing morphing effects",
    intensity: 0.7,
    rarities: ["Legendary", "Epic"],
  },
  // ... more filters
};
```

---

## Filter Details

### 1. Liquid Neon

**Effect:** Flowing, morphing liquid-like effects with neon colors

**SVG Implementation:**

```xml
<filter id="liquidNeon">
  <!-- Turbulence for organic movement -->
  <feTurbulence baseFrequency="0.02" numOctaves="5" result="noise"/>

  <!-- Displacement creates flowing effect -->
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="15"/>

  <!-- Color shift for neon look -->
  <feColorMatrix type="saturate" values="1.8"/>
</filter>
```

**Intensity Scaling (0-1):**

- Turbulence frequency: `0.01 + (intensity × 0.04)`
- Displacement scale: `10 + (intensity × 20)`
- Saturation: `1 + (intensity × 1)`

**Best For:** Legendary logos, dynamic presentation

---

### 2. Comic Book

**Effect:** Bold outlines with erosion/dilation for comic book style

**SVG Implementation:**

```xml
<filter id="comicBook">
  <!-- Morphology for bold outlines -->
  <feMorphology operator="dilate" radius="2"/>

  <!-- Color posterization -->
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
    <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
    <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
  </feComponentTransfer>

  <!-- Black outline -->
  <feFlood flood-color="black" result="flood"/>
  <feComposite in="flood" in2="SourceGraphic" operator="in"/>
</filter>
```

**Intensity Scaling (0-1):**

- Dilation radius: `1 + (intensity × 3)`
- Posterization levels: `3 + Math.floor(intensity × 5)`
- Outline strength: `0.3 + (intensity × 0.7)`

**Best For:** Comic/artistic style, high contrast

---

### 3. Wave Ripple

**Effect:** Undulating wave patterns across the logo

**SVG Implementation:**

```xml
<filter id="waveRipple">
  <!-- Sine wave pattern -->
  <feTurbulence baseFrequency="0.03" numOctaves="3" result="noise"/>

  <!-- Displace with wave effect -->
  <feDisplacementMap
    in="SourceGraphic"
    in2="noise"
    scale="20"
    xChannelSelector="R"
    yChannelSelector="G"/>
</filter>
```

**Intensity Scaling (0-1):**

- Wave frequency: `0.01 + (intensity × 0.05)`
- Displacement: `5 + (intensity × 30)`
- Ripple count: `1 + Math.floor(intensity × 4)`

**Best For:** Water/liquid themes, organic effects

---

### 4. Holographic Shine

**Effect:** Rainbow reflections with specular lighting for holographic appearance

**SVG Implementation:**

```xml
<filter id="holographicShine">
  <!-- Specular lighting for reflections -->
  <feSpecularLighting
    surfaceScale="5"
    specularConstant="0.75"
    specularExponent="20"
    lighting-color="white"
    result="specOut">
    <fePointLight x="-5000" y="-10000" z="20000"/>
  </feSpecularLighting>

  <!-- Color shift for rainbow effect -->
  <feColorMatrix type="hueRotate" values="45"/>

  <!-- Merge with original -->
  <feComposite in="specOut" in2="SourceGraphic" operator="screen"/>
</filter>
```

**Intensity Scaling (0-1):**

- Specular constant: `0.5 + (intensity × 0.5)`
- Specular exponent: `10 + (intensity × 20)`
- Light z-depth: `10000 + (intensity × 30000)`
- Rainbow shift amount: `0 + (intensity × 360)`

**Best For:** Legendary/Mythic, premium feel

---

### 5. Neon Glow Enhanced

**Effect:** Multi-stage glow with enhanced saturation for extreme neon look

**SVG Implementation:**

```xml
<filter id="neonGlowEnhanced">
  <!-- Stage 1: Saturation boost -->
  <feColorMatrix type="saturate" values="2.5"/>

  <!-- Stage 2: Glow layers -->
  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="largeBlur"/>

  <!-- Stage 3: Merge all layers -->
  <feMerge>
    <feMergeNode in="largeBlur"/>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>

  <!-- Brightness adjustment -->
  <feColorMatrix type="matrix" values="
    1.2 0 0 0 0.1
    0 1.2 0 0 0.1
    0 0 1.2 0 0.1
    0 0 0 1 0
  "/>
</filter>
```

**Intensity Scaling (0-1):**

- Saturation: `1 + (intensity × 2.5)`
- Small blur: `1 + (intensity × 5)` px
- Large blur: `3 + (intensity × 10)` px
- Brightness: `0.1 + (intensity × 0.4)`

**Best For:** Neon aesthetic, glow effects

---

### 6. Shadow Depth

**Effect:** Layered shadows for 3D depth perception

**SVG Implementation:**

```xml
<filter id="shadowDepth">
  <!-- Drop shadow for depth -->
  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
  <feOffset dx="4" dy="4" result="offsetblur"/>
  <feFlood flood-color="black" flood-opacity="0.5" result="offsetColor"/>
  <feComposite in="offsetColor" in2="offsetblur" operator="in" result="offsetblur"/>

  <!-- Inner shadow for depth -->
  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
  <feOffset dx="-2" dy="-2" result="innerShadow"/>

  <!-- Merge layers -->
  <feMerge>
    <feMergeNode in="offsetblur"/>
    <feMergeNode in="SourceGraphic"/>
    <feMergeNode in="innerShadow"/>
  </feMerge>
</filter>
```

**Intensity Scaling (0-1):**

- Outer blur: `2 + (intensity × 4)` px
- Outer offset: `2 + (intensity × 6)` px
- Outer opacity: `0.3 + (intensity × 0.5)`
- Inner blur: `1 + (intensity × 3)` px

**Best For:** 3D effect, depth perception

---

### 7. Neon Outline

**Effect:** Bold neon borders around shapes

**SVG Implementation:**

```xml
<filter id="neonOutline" x="-50%" y="-50%" width="200%" height="200%">
  <!-- Dilate for outline -->
  <feMorphology operator="dilate" radius="2" result="dilated"/>

  <!-- Gaussian blur for soft edge -->
  <feGaussianBlur in="dilated" stdDeviation="1" result="blurred"/>

  <!-- Color the outline (e.g., bright green) -->
  <feFlood flood-color="#00ff88" result="greenFill"/>
  <feComposite in="greenFill" in2="blurred" operator="in" result="outline"/>

  <!-- Add glow -->
  <feGaussianBlur in="outline" stdDeviation="3" result="glow"/>

  <!-- Merge original + glowing outline -->
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

**Intensity Scaling (0-1):**

- Dilation: `1 + (intensity × 3)` px
- Blur: `0.5 + (intensity × 3)` px
- Glow: `1 + (intensity × 5)` px
- Outline opacity: `0.5 + (intensity × 0.5)`

**Best For:** Emphasis, neon aesthetic

---

## Rarity-Based Filter Stacks

### Recommendations by Rarity

**Common:**

```typescript
getRecommendedAdvancedFilters("Common");
// Returns: ["neonOutline"] (single filter)
```

**Rare:**

```typescript
getRecommendedAdvancedFilters("Rare");
// Returns: ["neonGlowEnhanced", "neonOutline"]
```

**Epic:**

```typescript
getRecommendedAdvancedFilters("Epic");
// Returns: ["liquidNeon", "shadowDepth", "neonGlowEnhanced"]
```

**Legendary:**

```typescript
getRecommendedAdvancedFilters("Legendary");
// Returns: ["liquidNeon", "holographicShine", "neonGlowEnhanced", "shadowDepth"]
```

---

## Implementation Details

### Filter Function Signature

```typescript
function filterName(
  id: string, // Unique identifier for this filter instance
  intensity: number, // 0-1 scaling factor
): string {
  // Return SVG filter XML
  return `<filter id="${id}">...</filter>`;
}
```

### Creating Custom Filters

```typescript
export function filterCustom(id: string, intensity: number): string {
  const blurAmount = 5 + intensity * 10;

  return `
    <filter id="${id}">
      <feGaussianBlur stdDeviation="${blurAmount}"/>
    </filter>
  `;
}
```

---

## Performance Considerations

### SVG Filter Performance

**Cost:** O(pixels × filter_complexity)

**Expensive operations:**

- `feTurbulence` - Computationally heavy
- `feDisplacementMap` - Requires pixel mapping
- `feSpecularLighting` - Complex lighting calculations

**Optimization:**

1. **Reduce Effect Area:**

```xml
<filter id="myFilter" x="0%" y="0%" width="100%" height="100%">
```

2. **Use Cached Results:**

```xml
<feGaussianBlur in="SourceGraphic" result="blurred"/>
<feColorMatrix in="blurred"/>  <!-- Reuse blurred result -->
```

3. **Minimize Filter Chains:**

- Combine related operations
- Avoid stacking too many filters
- Cache intermediate results

---

## Browser Support

| Filter             | Chrome | Firefox | Safari | Edge |
| ------------------ | ------ | ------- | ------ | ---- |
| Liquid Neon        | ✅     | ✅      | ✅     | ✅   |
| Comic Book         | ✅     | ✅      | ✅     | ✅   |
| Wave Ripple        | ✅     | ✅      | ✅     | ✅   |
| Holographic Shine  | ✅     | ✅      | ⚠️     | ✅   |
| Neon Glow Enhanced | ✅     | ✅      | ✅     | ✅   |
| Shadow Depth       | ✅     | ✅      | ✅     | ✅   |
| Neon Outline       | ✅     | ✅      | ✅     | ✅   |

**Safari Note:** `feSpecularLighting` may have rendering differences

---

## Troubleshooting

### Issue: Filter not applying

**Check:**

1. Filter ID matches in filter attribute
2. SVG namespace is correct (`xmlns="http://www.w3.org/2000/svg"`)
3. Browser supports the filter primitive

### Issue: Performance degradation

**Solutions:**

1. Reduce intensity (lower computational cost)
2. Apply to smaller canvas
3. Use simpler filter (fewer primitives)
4. Cache rendered output

### Issue: Colors look wrong

**Debug:**

1. Verify color values in feColorMatrix
2. Check feFlood colors
3. Test with solid color first (no gradients)

---

## Summary

Advanced filters provide:

✅ **Sophisticated Effects** - Professional visual enhancements  
✅ **Rarity Integration** - Matched to logo rarity  
✅ **Performance Optimized** - Configurable intensity  
✅ **Reproducible** - Deterministic rendering  
✅ **Extensible** - Easy to add new filters

Perfect for creating exclusive, visually impressive logos in the demo system.
