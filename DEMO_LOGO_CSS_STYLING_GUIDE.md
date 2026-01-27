# Demo Logo CSS & Styling - Comprehensive Breakdown

## Overview

Demo logos in Pixel Logo Forge have **three layers of CSS/styling**:

1. **Canvas-based visual effects** (SVG filters and color transformations)
2. **Color palette and gradient system** (enforced neon variants)
3. **UI wrapper styling** (badges, banners, exclusivity indicators)

---

## 1. CANVAS-BASED VISUAL EFFECTS

### SVG Filter Primitives

Demo logos use advanced SVG filters applied at the canvas level. Each filter is created using primitive SVG elements:

#### **A. Neon Glow Filter** (`filterNeonGlow`)

```
Effect: Vibrant, glowing neon appearance
SVG Primitives Used:
  - feColorMatrix (saturate) → Increases color saturation 1-2.5x
  - feGaussianBlur → Creates 2-10px blur radius
  - feColorMatrix (linear) → Enhances glow brightness
  - feMerge → Combines original + blurred glow

Intensity Scaling (0-1):
  - Blur radius: 2 + (intensity × 8) px
  - Glow opacity: 0.3 + (intensity × 0.7)
  - Saturation: 1 + (intensity × 1.5)

Example (intensity=0.8):
  - Blur: 8.4px
  - Opacity: 0.86
  - Saturation: 2.2x
```

#### **B. Chrome Filter** (`filterChrome`)

```
Effect: Metallic, reflective mirror-like shine
SVG Primitives Used:
  - feSpecularLighting → Creates point light reflections
    - Light source: x=-5000, y=-10000, z=20000
    - Intensity varies with specular exponent
  - feColorMatrix (saturate) → Adds metallic saturation
  - feColorMatrix (linear) → Increases brightness

Intensity Scaling (0-1):
  - Specular constant: 0.5 + (intensity × 1.5)
  - Specular exponent: 10 + (intensity × 30)
  - Color intensity: 0.3 + (intensity × 0.7)

Example (intensity=0.7):
  - Specular constant: 1.55
  - Exponent: 31 (sharp highlights)
  - Brightness boost: 0.51
```

#### **C. Bloom Filter** (`filterBloom`)

```
Effect: Soft glow with halos around bright areas
SVG Primitives Used:
  - feColorMatrix (linear) → Extracts/brightens areas
  - feGaussianBlur → Creates 4-16px blur
  - feColorMatrix → Reduces opacity of bloom layer
  - feMerge → Blends with original

Intensity Scaling (0-1):
  - Blur radius: 4 + (intensity × 12) px
  - Bloom opacity: 0.2 + (intensity × 0.8)
  - Brightness boost: 0.15 + (intensity × 0.35)

Example (intensity=0.6):
  - Blur: 11.2px
  - Opacity: 0.68
  - Brightness: 0.36
```

#### **D. Halftone Filter** (`filterHalftone`)

```
Effect: Comic book/dot matrix appearance
SVG Primitives Used:
  - feTurbulence → Creates organic noise pattern
    - Frequency: 0.05 (large patterns)
    - Octaves: 4
  - feDisplacementMap → Distorts colors using noise
  - feColorMatrix → Adjusts saturation

Intensity Scaling (0-1):
  - Scale: 2 + (intensity × 10)
  - Amplitude: 2 + (intensity × 5)

Example (intensity=0.6):
  - Scale: 8
  - Amplitude: 5
```

#### **E. Scanlines Filter** (`filterScanlines`)

```
Effect: CRT monitor/retro TV scanlines
SVG Primitives Used:
  - feTurbulence → Creates horizontal line pattern
    - Type: "fractalNoise"
    - Frequency: 0.5 (creates stripes)
  - feDisplacementMap → Applies horizontal offset
  - feColorMatrix → Creates darkening effect

Intensity Scaling (0-1):
  - Darkening: 0.85 + (intensity × 0.15)
  - Line spacing varies

Example (intensity=0.5):
  - Darkening: 0.925
  - Creates visible dark horizontal lines
```

#### **F. Specular Filter** (`filterSpecular`)

```
Effect: Shiny, reflective surface highlights
SVG Primitives Used:
  - feSpecularLighting → Precise point light reflections
  - feColorMatrix → Enhances shine

Intensity Scaling (0-1):
  - Specular exponent: 20 + (intensity × 40)

Example (intensity=0.9):
  - Exponent: 56 (very sharp, glossy)
```

---

## 2. RARITY-BASED FILTER STACKS

Filters are applied **progressively by rarity tier**:

### **COMMON** (Subtle)

```
Filters Applied:
  - Neon Glow (intensity: 0.5)

Result: Basic neon glow with subtle saturation boost
Visual Effect: Slightly glowing, vibrant but not overwhelming
```

### **RARE** (Enhanced)

```
Filters Applied:
  - Neon Glow (intensity: 0.6)
  - Bloom (intensity: 0.5)

Result: Neon glow + soft halos around bright areas
Visual Effect: Glowing with visible bloom halo effect
```

### **EPIC** (Striking)

```
Filters Applied:
  - Chrome (intensity: 0.7) → Applied first
  - Neon Glow (intensity: 0.8) → Combined with chrome
  - Halftone (intensity: 0.6) → Adds pattern

Result: Metallic shine + intense glow + comic pattern
Visual Effect: Shiny, vibrant, textured appearance with heavy effects
```

### **LEGENDARY** (Maximum Impact)

```
Filters Applied (in order):
  1. Chrome (intensity: 0.9) → Heavy specular lighting
  2. Neon Glow (intensity: 1.0) → Maximum saturation/blur
  3. Bloom (intensity: 0.85) → Large halos
  4. Specular (intensity: 0.9) → Extra shine highlights
  5. Halftone (intensity: 0.8) → Strong pattern

Result: All effects at near-maximum intensity
Visual Effect: Extremely vibrant, glowing, shiny, textured, overwhelming
```

---

## 3. COLOR PALETTE & GRADIENT SYSTEM

### **Enforced Neon Palettes** (9 options)

All demo logos use **ONLY these high-contrast, vibrant palettes**:

#### Magenta-Dominant

```
"neonPinkBlue"
  Primary: Hot magenta (#ff0080 or similar)
  Secondary: Electric blue (#00ffff)
  Use: High-energy, cyberpunk feel

"magentaCyan"
  Primary: Pure magenta (#ff00ff)
  Secondary: Cyan (#00ffff)
  Use: Classic neon, maximum contrast

"hotPinkGold"
  Primary: Hot pink (#ff1493)
  Secondary: Gold (#ffd700)
  Use: Warm neon with luxury feel
```

#### Purple-Dominant

```
"sunsetPurple"
  Primary: Purple (#8800ff)
  Secondary: Warm orange/red
  Use: Warm, atmospheric, gradient-heavy

"ultraviolet"
  Primary: Deep purple (#4400ff)
  Secondary: Bright purple (#ff00ff)
  Use: Very vibrant, electric look
```

#### Cyan-Dominant

```
"electricBlue"
  Primary: Cyan (#00ffff)
  Secondary: Dark blue (#0055ff)
  Use: Cool, sharp, technical feel

"cyberOrange"
  Primary: Cyan (#00ffff)
  Secondary: Hot orange (#ff5500)
  Use: Extreme contrast, cyberpunk aesthetic
```

#### Hybrid Neon

```
"laserGreen"
  Primary: Bright green (#00ff00)
  Secondary: Contrasting color (often magenta)
  Use: Laser/sci-fi feel

"midnightNeon"
  Primary: Very dark color (near black)
  Secondary: Bright neon color (any)
  Use: Silhouette with bright accent
```

### **Enforced Gradients** (5 options)

All gradients are **dynamic and neon-compatible**:

```
"horizontal"
  Direction: Left to right
  Effect: Classic neon stripe appearance
  CSS: linear-gradient(90deg, color1, color2)

"vertical"
  Direction: Top to bottom
  Effect: Vertical neon flow
  CSS: linear-gradient(180deg, color1, color2)

"diagonal"
  Direction: 45-135 degrees
  Effect: Dynamic diagonal neon sweep
  CSS: linear-gradient(45deg, color1, color2)

"radial"
  Direction: Center outward
  Effect: Explosive neon burst from center
  CSS: radial-gradient(circle, color1, color2)

"sunsetFade"
  Direction: Complex multi-stop
  Effect: Smooth neon fade across multiple colors
  CSS: linear-gradient(to right, color1 0%, color2 50%, color3 100%)
```

### **Enforced Glows** (4 options)

```
"softNeon"
  Effect: Subtle, barely visible glow
  Use: Minimal visual enhancement

"hardNeon"
  Effect: Intense, sharp edge glow
  Use: Maximum neon pop

"pulseGlow"
  Effect: Animated pulsing glow
  CSS Animation: opacity alternates 0.5-1.0 over time

"auraGlow"
  Effect: Soft halos around shape edges
  Use: Ethereal neon appearance
```

### **Enforced Chromes** (4 options)

```
"mirrorChrome"
  Effect: Reflective mirror-like surface
  Specular exponent: 20-40

"rainbowChrome"
  Effect: Rainbow reflections (VERY neon)
  Creates multiple color highlights

"brushedMetal"
  Effect: Directional metallic sheen
  Linear streaking pattern

"darkChrome"
  Effect: Dark surface with glossy highlights
  Low overall brightness, sharp shine points
```

### **Enforced Blooms** (2 options - removed "low")

```
"medium"
  Blur radius: 8-14px
  Opacity: 0.6-0.8
  Use: Noticeable glow halos

"heavy"
  Blur radius: 14-20px
  Opacity: 0.8-1.0
  Use: Dramatic, overwhelming bloom
```

### **Enforced Textures** (4 options)

```
"none"
  Effect: Pure solid/gradient colors
  Use: Clean, sharp neon look

"grain"
  Effect: Vintage grainy texture overlay
  Pattern: Random noise, fine grain

"halftone"
  Effect: Comic book dot matrix pattern
  Pattern: Regular or irregular dots

"scanlines"
  Effect: CRT monitor horizontal lines
  Pattern: Regularly-spaced dark lines
```

### **Enforced Lightings** (4 angles)

```
"topLeft"
  Light source position: Top-left corner
  Effect: Shadows fall bottom-right
  Use: Upper-left highlight emphasis

"topRight"
  Light source position: Top-right corner
  Effect: Shadows fall bottom-left
  Use: Upper-right highlight emphasis

"bottomLeft"
  Light source position: Bottom-left corner
  Effect: Shadows fall top-right
  Use: Lower-left highlight emphasis

"front"
  Light source position: Directly in front
  Effect: Even, frontal lighting
  Use: Flat, direct illumination
```

---

## 4. UI WRAPPER STYLING

### **Exclusivity Badge**

```
Display: Inline badge on logo cards
Styling:
  Background: Linear gradient (magenta → cyan)
  Color: Black on gradient background
  Padding: 4px 8px
  Border-radius: 3px
  Font: Bold, uppercase, 11-12px
  Glow: 0 0 10px rgba(255, 0, 255, 0.8)

Content: "🎖️ EXCLUSIVE" or "80s EXCLUSIVE"
```

### **Exclusivity Banner** (Full page)

```
Display: Large banner above logo detail
Styling:
  Background: Dark gradient with magenta/cyan blend
  Padding: 20px
  Border-top: 3px solid cyan
  Border-bottom: 3px solid magenta

Text Components:
  - Headline: White, 18px bold
  - Message: "This logo was forged using an unreleased 80s seed"
  - Subtext: "Once used, it can never be recreated"

Animation: Subtle shimmer/glow pulsing
```

### **Scarcity Counter**

```
Display: Persistent UI element showing remaining seeds
Components:
  1. Progress Bar
     - Background: #333
     - Fill gradient: Green → Yellow → Red
     - Fill %: Calculated from (forged / 9000) × 100
     - Height: 8px
     - Animated width transition

  2. Stats Grid (3 columns)
     Background: rgba(0, 255, 255, 0.05)
     Columns:
       - Forged count (cyan text)
       - Remaining count (cyan text)
       - Total (always 9000)

  3. Urgency State Classes
     - "low": Green, calm messaging
     - "low-medium": Green/yellow, available
     - "medium-high": Yellow/red, running low
     - "high": Red pulsing
     - "critical": Red rapid pulse

Animation on Critical:
  @keyframes pulse-critical {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  Duration: Varies by severity (0.5-1.5s)
```

### **Prestige Badge Types**

```
"exclusive"
  Background: Magenta-cyan gradient
  Color: Black
  Glow: Magenta/purple
  Text: "🎖️ EXCLUSIVE"

"limited-edition"
  Background: Gold/orange (#ffaa00)
  Color: Black
  Glow: Gold
  Text: "🏅 LIMITED EDITION"

"unreleased"
  Background: Hot red (#ff0055)
  Color: White
  Glow: Red
  Text: "🚀 UNRELEASED"

"collectible"
  Background: Purple gradient
  Color: White
  Glow: Purple
  Text: "💎 COLLECTIBLE"
```

### **Forge Lock Display** (When exhausted)

```
Display: Full-screen overlay when all seeds are consumed
Styling:
  Background: Semi-transparent dark overlay (rgba(0,0,0,0.7))
  Icon: Large lock emoji (🔒) with pulsing glow
  Text: "SOLD OUT - Forge Locked Forever"
  Color: Red (#ff4444)
  Font: Bold, uppercase, 18-24px

Animation: Steady red glow
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.8)
```

---

## 5. TOTAL VISUAL COMBINATION

### **What Makes Demo Logos Unique**

**1,800 Possible Combinations** from:

- 9 palettes × 5 gradients × 4 glows × 4 chromes × 2 blooms × 4 textures × 4 lightings = 1,800

**Each combo includes:**

1. **Base Colors**: Enforced neon palette (magenta/cyan/purple)
2. **Gradient Direction**: Dynamic flow (horizontal/vertical/diagonal/radial/fade)
3. **Glow Intensity**: Neon saturation and blur applied
4. **Chrome Shine**: Metallic specular highlights
5. **Bloom Halo**: Soft or heavy glow around edges
6. **Texture Overlay**: None, grain, halftone, or scanlines
7. **Light Direction**: From any of 4 angles

**Plus Rarity-Based Filter Stack**:

- COMMON: 1 filter (glow at 0.5)
- RARE: 2 filters (glow + bloom)
- EPIC: 3 filters (chrome + glow + halftone)
- LEGENDARY: 5 filters (all effects at max intensity)

---

## 6. CSS ANIMATION EFFECTS

### **Pulsing Scarcity** (High Urgency)

```css
@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

Applied to: Border, text, or entire counter
Duration: Varies
  - Medium urgency: 1.5s
  - High urgency: 1s
  - Critical: 0.5s
```

### **Shimmer Effect** (Prestige Badge)

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

Applied to: Badge backgrounds
Duration: 2-3s
Direction: Left to right
```

### **Glow Pulse** (Forge Lock)

```css
@keyframes glow-critical {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
}

Applied to: Lock display
Duration: 0.5-1.5s continuous
```

---

## 6A. ADVANCED SVG FILTER TECHNIQUES

These patterns build on practical implementations (inspired by [Coding Dude SVG Filters](https://www.coding-dude.com/wp/css/svg-filters/)) with neon color adaptations:

### **1. Turbulent Liquid Distortion** (Inspired by Liquify Effect)

**Perfect for**: Legendary tier logos with morphing neon effect

```xml
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Turbulence-based liquid effect -->
    <filter id="liquidNeon">
      <!-- Create flowing noise pattern -->
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.03"
        numOctaves="5"
        result="noise"
        seed="2"
      />

      <!-- Animate the turbulence for flowing motion -->
      <animate
        attributeName="baseFrequency"
        values="0.03; 0.08; 0.03"
        dur="4s"
        repeatCount="indefinite"
      />

      <!-- Displace pixels using noise -->
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="8"
        xChannelSelector="R"
        yChannelSelector="G"
      />

      <!-- Add neon saturation boost -->
      <feColorMatrix
        type="saturate"
        values="1.8"
      />
    </filter>
  </defs>

  <!-- Apply to logo element -->
  <circle cx="200" cy="200" r="100" fill="#00ffff" filter="url(#liquidNeon)" />
</svg>
```

**CSS Usage:**

```css
.legendary-logo {
  filter: url(#liquidNeon);
  animation: liquidPulse 4s ease-in-out infinite;
}

@keyframes liquidPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}
```

---

### **2. Morphological Erosion/Dilation** (Comic Book Effect)

**Perfect for**: Epic tier logos with textured neon

```xml
<filter id="comicBook">
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
    radius="1.5"
    in="SourceGraphic"
    result="eroded"
  />

  <!-- Dilate (expand) for bold comic effect -->
  <feMorphology
    operator="dilate"
    radius="2"
    in="eroded"
    result="dilated"
  />

  <!-- Enhance neon colors -->
  <feColorMatrix
    type="matrix"
    values="
      1.2  0    0    0  0.1
      0    1.2  0    0  0.1
      0    0    1.2  0  0.1
      0    0    0    1  0
    "
  />

  <!-- Merge original + effect for layered look -->
  <feMerge>
    <feMergeNode in="dilated" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

---

### **3. Displacement Map with Animated Offset** (Wave Ripple)

**Perfect for**: Rare tier logos with subtle motion

```xml
<filter id="waveRipple">
  <!-- Generate wave pattern -->
  <feTurbulence
    type="fractalNoise"
    baseFrequency="0.05"
    numOctaves="2"
    result="noise"
    seed="1"
  />

  <!-- Apply wave displacement -->
  <feDisplacementMap
    in="SourceGraphic"
    in2="noise"
    scale="4"
    xChannelSelector="R"
    yChannelSelector="G"
  />

  <!-- Add color shift for neon effect -->
  <feColorMatrix
    type="saturate"
    values="1.6"
  />
</filter>

<!-- Animated offset for dynamic wave -->
<style>
  @keyframes waveShift {
    0% { filter: url(#waveRipple); }
    50% { filter: url(#waveRipple) translateY(2px); }
    100% { filter: url(#waveRipple); }
  }
</style>
```

---

### **4. Specular Lighting with Color Shift** (Holographic Shine)

**Perfect for**: Epic/Legendary tier with chrome effect

```xml
<filter id="holographicShine">
  <!-- Point light source for specular highlights -->
  <feSpecularLighting
    surfaceScale="5"
    specularConstant="1"
    specularExponent="25"
    lighting-color="#ffffff"
    result="spec"
  >
    <!-- Light at top-left, moving -->
    <fePointLight x="-50" y="-50" z="300" />
  </feSpecularLighting>

  <!-- Apply high-saturation colors to highlights -->
  <feColorMatrix
    in="spec"
    type="saturate"
    values="2.0"
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
```

---

### **5. Gaussian Blur + Color Shift** (Neon Glow Enhanced)

**Perfect for**: Common/Rare tier baseline glow

```xml
<filter id="neonGlowAdvanced">
  <!-- First blur for soft glow -->
  <feGaussianBlur
    stdDeviation="4"
    result="coloredBlur"
  />

  <!-- Boost color saturation in glow -->
  <feColorMatrix
    in="coloredBlur"
    type="saturate"
    values="2"
  />

  <!-- Combine blurred glow with original -->
  <feFlood fill="#00ffff" result="floodColor" />
  <feComposite
    in="floodColor"
    in2="coloredBlur"
    operator="in"
    result="colorFlood"
  />
  <feComposite
    in="colorFlood"
    in2="SourceGraphic"
    operator="lighten"
  />
</filter>
```

---

### **6. Offset + Merge** (Shadow Depth)

**Perfect for**: All tiers for depth layering

```xml
<filter id="shadowDepth">
  <!-- Create offset shadow -->
  <feOffset
    in="SourceGraphic"
    dx="2"
    dy="2"
    result="offsetShadow"
  />

  <!-- Blur the shadow -->
  <feGaussianBlur
    in="offsetShadow"
    stdDeviation="3"
    result="blurredShadow"
  />

  <!-- Darken shadow -->
  <feColorMatrix
    in="blurredShadow"
    type="matrix"
    values="
      0.2  0    0    0  0
      0    0.2  0    0  0
      0    0    0.2  0  0
      0    0    0    1  0
    "
    result="darkShadow"
  />

  <!-- Layer: shadow + glow + original -->
  <feMerge>
    <feMergeNode in="darkShadow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

---

### **7. Flood + Composite** (Neon Outline)

**Perfect for**: Any tier for bold neon borders

```xml
<filter id="neonOutline">
  <!-- Duplicate shape for outline -->
  <feFlood
    floodColor="#ff00ff"
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
    radius="2"
    result="expandedOutline"
  />

  <!-- Blur for glow -->
  <feGaussianBlur
    in="expandedOutline"
    stdDeviation="2"
    result="glowingOutline"
  />

  <!-- Composite: outline + original -->
  <feMerge>
    <feMergeNode in="glowingOutline" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

---

### **CSS Integration Patterns**

Apply these filters dynamically based on rarity:

```css
/* Common: Basic glow */
.demo-logo.common {
  filter: url(#neonGlowAdvanced);
}

/* Rare: Glow + wave */
.demo-logo.rare {
  filter: url(#neonGlowAdvanced) url(#waveRipple);
}

/* Epic: Chrome + comic effect */
.demo-logo.epic {
  filter: url(#holographicShine) url(#comicBook);
}

/* Legendary: Everything + liquid distortion */
.demo-logo.legendary {
  filter: url(#liquidNeon) url(#holographicShine) url(#neonOutline);
  animation: legendaryPulse 3s ease-in-out infinite;
}

@keyframes legendaryPulse {
  0%,
  100% {
    filter: url(#liquidNeon) url(#holographicShine) url(#neonOutline);
  }
  50% {
    filter: url(#liquidNeon) url(#holographicShine) url(#neonOutline)
      brightness(1.1);
  }
}
```

---

### **Performance Optimization**

For smooth animations on multiple filters:

1. **Cache filters in `<defs>`**: Define once, reuse many times
2. **Limit `feTurbulence` octaves**: Keep to 2-5 for performance
3. **Use `result` attributes**: Prevents redundant calculations
4. **Animate baseFrequency, not scale**: Cheaper computation
5. **Apply to canvas, not DOM**: Reduces browser repaints

```xml
<!-- ✅ Good: Cached, result attributes -->
<svg>
  <defs>
    <filter id="reusable">
      <feTurbulence baseFrequency="0.05" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
    </filter>
  </defs>
</svg>

<!-- ❌ Avoid: Inline, no caching -->
<svg>
  <filter>
    <feTurbulence baseFrequency="0.05" numOctaves="8" />
    <feDisplacementMap scale="15" />
  </filter>
</svg>
```

---

### **Blend Mode Enhancements** (CSS Only)

For non-SVG filter fallbacks:

```css
/* Lighten blend for glow effect */
.demo-logo.glow {
  mix-blend-mode: lighten;
  filter: brightness(1.1);
}

/* Screen blend for bloom */
.demo-logo.bloom {
  mix-blend-mode: screen;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
}

/* Multiply blend for shadows */
.demo-logo.shadow {
  mix-blend-mode: multiply;
}

/* Overlay for high contrast */
.demo-logo.contrast {
  mix-blend-mode: overlay;
}

/* Color dodge for neon intensity */
.demo-logo.neon-intense {
  mix-blend-mode: color-dodge;
  filter: saturate(1.8);
}
```

---

## 7. RESPONSIVE SCALING

All demo logos adapt to container size:

```css
Logo Display:
  - Mobile (< 480px): 100-200px
  - Tablet (480-768px): 200-400px
  - Desktop (> 768px): 400-600px

SVG Filters:
  - Scale proportionally with container
  - Blur radius maintains visual ratio
  - Glow spread maintains intensity

Text Elements:
  - Font sizes scale: 11px → 14px → 18px
  - Padding scales: 8px → 12px → 16px
  - Border width stays: 2-3px (consistent)
```

---

## Summary

Demo logos combine:

1. **Canvas-level SVG filters** (6 types, intensity-scaled)
2. **Rarity-based filter stacks** (1, 2, 3, or 5 filters)
3. **Enforced neon color palettes** (9 options)
4. **Dynamic gradients** (5 directions)
5. **Texture overlays** (4 types)
6. **Chrome/bloom/glow effects** (multiple options)
7. **UI badges and banners** (psychological framing)
8. **Animations** (pulsing, shimmer, glow effects)

= **1,800 unique visual combinations × 4 rarity tiers × 5 filter types = Highly distinctive, exclusive visual experience**
