# Demo Style Variants — Predefined Pools

## Overview

Each demo logo is assigned variants from 7 predefined pools, creating **9,216 unique style combinations** (12 × 6 × 4 × 4 × 3 × 4 × 4).

The variants are deterministically derived from the seed, ensuring consistent reproducibility.

## Variant Pools

### Palettes (12)

Color schemes for the logo:

```
1. neonPinkBlue     — Bright pink to cyan gradient
2. magentaCyan      — Deep magenta to cyan
3. sunsetPurple     — Orange to purple fade
4. electricBlue     — Vibrant electric blue
5. laserGreen       — Neon green laser effect
6. hotPinkGold      — Pink with gold accents
7. cyberOrange      — Cyberpunk orange
8. vaporTeal        — Vaporwave teal
9. midnightNeon     — Dark blue with neon accents
10. retroRed        — Classic arcade red
11. arcadeYellow    — Bright arcade yellow
12. ultraviolet     — UV purple spectrum
```

### Gradients (6)

Direction and style of gradient fills:

```
1. horizontal       — Left to right
2. vertical         — Top to bottom
3. diagonal         — Corner to corner
4. radial           — Center outward
5. metallicBand     — Metallic/reflective band
6. sunsetFade       — Multi-color fade
```

### Glow Styles (4)

Neon glow effect types:

```
1. softNeon         — Subtle, blurred glow
2. hardNeon         — Sharp, defined glow
3. pulseGlow        — Animated pulse effect
4. auraGlow         — Ambient halo effect
```

### Chrome Styles (4)

Metallic/reflective surface effects:

```
1. mirrorChrome     — Mirror-like reflection
2. brushedMetal     — Brushed metal texture
3. rainbowChrome    — Iridescent chromatic
4. darkChrome       — Dark metallic finish
```

### Bloom Strengths (3)

Bloom/light bloom intensity:

```
1. low              — Subtle bloom
2. medium           — Balanced bloom
3. heavy            — Intense glow
```

### Textures (4)

Surface texture overlays:

```
1. none             — Clean, no texture
2. grain            — Film grain effect
3. halftone         — Halftone dot pattern
4. scanlines        — CRT scanline effect
```

### Lighting Angles (4)

Direction of lighting/shadow:

```
1. topLeft          — Light from top-left
2. topRight         — Light from top-right
3. bottomLeft       — Light from bottom-left
4. front            — Light from front (flat)
```

## Deterministic Generation

Each seed produces **exactly one style combination**:

```typescript
import { fingerprintFromSeed } from "@/lib/demoStyleVariants";

const seed = 100000000;
const style = fingerprintFromSeed(seed);

// Always produces:
{
  palette: "retroRed",
  gradient: "horizontal",
  glow: "softNeon",
  chrome: "darkChrome",
  bloom: "low",
  texture: "none",
  lighting: "front"
}
```

**Same seed = same style (forever)**

## Variant Selection Algorithm

```
seed → hash₁ % 12    → palette index
hash₂ % 6            → gradient index
hash₃ % 4            → glow index
hash₄ % 4            → chrome index
hash₅ % 3            → bloom index
hash₆ % 4            → texture index
hash₇ % 4            → lighting index
```

Uses seeded LCG (Linear Congruential Generator) for determinism.

## Example Fingerprints

### Common Logo (seed: 100000000)

```json
{
  "seed": "seed-100000000",
  "palette": "retroRed",
  "gradient": "horizontal",
  "glow": "softNeon",
  "chrome": "darkChrome",
  "bloom": "low",
  "texture": "none",
  "lighting": "front"
}
```

### Rare Logo (seed: 100000512)

```json
{
  "seed": "seed-100000512",
  "palette": "neonPinkBlue",
  "gradient": "diagonal",
  "glow": "hardNeon",
  "chrome": "brushedMetal",
  "bloom": "medium",
  "texture": "grain",
  "lighting": "topLeft"
}
```

### Epic Logo (seed: 100001024)

```json
{
  "seed": "seed-100001024",
  "palette": "ultraviolet",
  "gradient": "radial",
  "glow": "pulseGlow",
  "chrome": "rainbowChrome",
  "bloom": "medium",
  "texture": "halftone",
  "lighting": "topRight"
}
```

### Legendary Logo (seed: 100002048)

```json
{
  "seed": "seed-100002048",
  "palette": "vaporTeal",
  "gradient": "sunsetFade",
  "glow": "auraGlow",
  "chrome": "mirrorChrome",
  "bloom": "heavy",
  "texture": "scanlines",
  "lighting": "topLeft"
}
```

## Database Storage

```sql
CREATE TABLE "DemoLogoStyle" (
  id VARCHAR PRIMARY KEY,
  seed VARCHAR NOT NULL,
  palette VARCHAR NOT NULL,      -- e.g. "neonPinkBlue"
  gradient VARCHAR NOT NULL,     -- e.g. "diagonal"
  glow VARCHAR NOT NULL,         -- e.g. "hardNeon"
  chrome VARCHAR NOT NULL,       -- e.g. "rainbowChrome"
  bloom VARCHAR NOT NULL,        -- e.g. "medium"
  texture VARCHAR NOT NULL,      -- e.g. "halftone"
  lighting VARCHAR NOT NULL,     -- e.g. "topLeft"
  generatedLogoId VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_palette ON "DemoLogoStyle"(palette);
CREATE INDEX idx_glow ON "DemoLogoStyle"(glow);
CREATE INDEX idx_seed ON "DemoLogoStyle"(seed);
CREATE INDEX idx_createdAt ON "DemoLogoStyle"(createdAt);
```

**Indices** enable fast queries by variant type.

## API Usage

### Extract Fingerprint from Seed

```typescript
import { fingerprintFromSeed } from "@/lib/demoStyleVariants";

const fp = fingerprintFromSeed(100000000);
console.log(fp.palette); // "retroRed"
console.log(fp.glow); // "softNeon"
```

### Store Style in Database

```typescript
import { storeDemoLogoStyle } from "@/lib/demoLogoStyleManager";

await storeDemoLogoStyle(
  "a3f2b1c8...", // seed from DemoSeedPool
  result, // LogoResult
  "logo-id", // optional generatedLogoId
);
```

### Query by Variant

```typescript
import { findStylesByVariant } from "@/lib/demoLogoStyleManager";

// All logos with ultraviolet palette
const ultravioletLogos = await findStylesByVariant("palette", "ultraviolet");

// All logos with pulseGlow
const pulseGlowLogos = await findStylesByVariant("glow", "pulseGlow");
```

### Analytics

```typescript
import { getDemoLogoStyleStats } from "@/lib/demoLogoStyleManager";

const stats = await getDemoLogoStyleStats();

// Most popular palettes
stats.topPalettes.forEach((p) => {
  console.log(`${p.palette}: ${p._count.palette} times`);
  // "vaporTeal: 156 times"
  // "ultraviolet: 142 times"
  // "neonPinkBlue: 89 times"
});

// Most popular glows
stats.topGlows.forEach((g) => {
  console.log(`${g.glow}: ${g._count.glow} times`);
  // "softNeon: 234 times"
  // "hardNeon: 189 times"
});
```

## Combination Coverage

With 5000 demo seeds out of 9216 possible combinations:

- **54.3%** of style space covered
- Each combination appears 0-1 times (no duplicates)
- Ensures variety across all demo logos

## Future Extensions

### Add More Variants

To add variant options (e.g., 15 palettes instead of 12):

1. Update `PALETTE_VARIANTS` in [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts)
2. Rerun seed generation: `npx tsx scripts/generate-demo-seeds.ts 5000`
3. New seeds → new style combinations (existing seeds unchanged)

### Weighted Distribution

To bias toward certain styles (e.g., legendary glows):

```typescript
// Pseudo-code example
const glowIndex = weightedSelect(glowVariants, [0.3, 0.3, 0.2, 0.2]);
// softNeon 30%, hardNeon 30%, pulseGlow 20%, auraGlow 20%
```

## Type Safety

Fully typed variant system:

```typescript
import type {
  PaletteVariant,
  GradientVariant,
  StyleFingerprint,
} from "@/lib/demoStyleVariants";

const style: StyleFingerprint = {
  palette: "neonPinkBlue", // ✅ Valid
  // palette: "invalidColor",    // ❌ TypeScript error
};
```

## Constants Reference

```typescript
// From lib/demoStyleVariants.ts

export const PALETTE_VARIANTS; // 12 colors
export const GRADIENT_VARIANTS; // 6 gradients
export const GLOW_VARIANTS; // 4 glows
export const CHROME_VARIANTS; // 4 chromes
export const BLOOM_VARIANTS; // 3 blooms
export const TEXTURE_VARIANTS; // 4 textures
export const LIGHTING_VARIANTS; // 4 lightings

export function fingerprintFromSeed(seed: number): StyleFingerprint;
export function selectVariantByIndex<T>(variants: T[], index: number): T;
export function getTotalStyleCombinations(): number; // 9216
```

---

**Related Files:**

- [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts) — Variant definitions
- [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts) — Storage & retrieval
- [prisma/schema.prisma](prisma/schema.prisma) — DemoLogoStyle model
- [components/LogoGenerator.tsx](components/LogoGenerator.tsx) — Integration

**Last Updated:** January 27, 2026
