# Demo Style Variants — Quick Reference

## 7 Style Components × Multiple Options = 9,216 Unique Combinations

### Quick Lookup

| Component    | Options     | Example                                         |
| ------------ | ----------- | ----------------------------------------------- |
| **Palette**  | 12 colors   | `neonPinkBlue`, `vaporTeal`, `retroRed`         |
| **Gradient** | 6 styles    | `radial`, `diagonal`, `sunsetFade`              |
| **Glow**     | 4 effects   | `softNeon`, `hardNeon`, `pulseGlow`, `auraGlow` |
| **Chrome**   | 4 finishes  | `mirrorChrome`, `brushedMetal`, `rainbowChrome` |
| **Bloom**    | 3 strengths | `low`, `medium`, `heavy`                        |
| **Texture**  | 4 overlays  | `none`, `grain`, `halftone`, `scanlines`        |
| **Lighting** | 4 angles    | `topLeft`, `topRight`, `bottomLeft`, `front`    |

## Deterministic Fingerprinting

Same seed = same style (forever):

```typescript
fingerprintFromSeed(100000000);
// → { palette: "retroRed", gradient: "horizontal", glow: "softNeon", ... }

fingerprintFromSeed(100000000); // Later
// → Same result!
```

## All Palette Variants

```
1. neonPinkBlue     6. hotPinkGold       11. arcadeYellow
2. magentaCyan      7. cyberOrange       12. ultraviolet
3. sunsetPurple     8. vaporTeal
4. electricBlue     9. midnightNeon
5. laserGreen      10. retroRed
```

## All Gradient Variants

```
horizontal  vertical  diagonal  radial  metallicBand  sunsetFade
```

## All Glow Variants

```
softNeon  hardNeon  pulseGlow  auraGlow
```

## All Chrome Variants

```
mirrorChrome  brushedMetal  rainbowChrome  darkChrome
```

## All Bloom Variants

```
low  medium  heavy
```

## All Texture Variants

```
none  grain  halftone  scanlines
```

## All Lighting Variants

```
topLeft  topRight  bottomLeft  front
```

## Import & Usage

```typescript
import {
  PALETTE_VARIANTS,
  GRADIENT_VARIANTS,
  fingerprintFromSeed,
  type StyleFingerprint,
} from "@/lib/demoStyleVariants";

import {
  storeDemoLogoStyle,
  getDemoLogoStyle,
  findStylesByVariant,
  getDemoLogoStyleStats,
} from "@/lib/demoLogoStyleManager";

// Generate fingerprint from seed
const fp = fingerprintFromSeed(100000000);
// { palette: "retroRed", gradient: "horizontal", ... }

// Store in database
await storeDemoLogoStyle(seed, logoResult, logoId);

// Query by variant
const tealLogos = await findStylesByVariant("palette", "vaporTeal");

// Get stats
const stats = await getDemoLogoStyleStats();
```

## Database Schema

```sql
CREATE TABLE "DemoLogoStyle" (
  id VARCHAR PRIMARY KEY,
  seed VARCHAR,
  palette VARCHAR,    -- One of 12 PALETTE_VARIANTS
  gradient VARCHAR,   -- One of 6 GRADIENT_VARIANTS
  glow VARCHAR,       -- One of 4 GLOW_VARIANTS
  chrome VARCHAR,     -- One of 4 CHROME_VARIANTS
  bloom VARCHAR,      -- One of 3 BLOOM_VARIANTS
  texture VARCHAR,    -- One of 4 TEXTURE_VARIANTS
  lighting VARCHAR,   -- One of 4 LIGHTING_VARIANTS
  generatedLogoId VARCHAR,
  createdAt TIMESTAMP
);
```

## Example Styles

### Common Style

```json
{
  "palette": "retroRed",
  "gradient": "horizontal",
  "glow": "softNeon",
  "chrome": "darkChrome",
  "bloom": "low",
  "texture": "none",
  "lighting": "front"
}
```

### Legendary Style

```json
{
  "palette": "vaporTeal",
  "gradient": "sunsetFade",
  "glow": "auraGlow",
  "chrome": "mirrorChrome",
  "bloom": "heavy",
  "texture": "scanlines",
  "lighting": "topLeft"
}
```

## Types

```typescript
import type {
  PaletteVariant, // "neonPinkBlue" | "magentaCyan" | ...
  GradientVariant, // "horizontal" | "vertical" | ...
  GlowVariant, // "softNeon" | "hardNeon" | ...
  ChromeVariant, // "mirrorChrome" | "brushedMetal" | ...
  BloomVariant, // "low" | "medium" | "heavy"
  TextureVariant, // "none" | "grain" | ...
  LightingVariant, // "topLeft" | "topRight" | ...
  StyleFingerprint, // All 7 variants combined
} from "@/lib/demoStyleVariants";
```

## Counts

```
Total Palettes:  12
Total Gradients:  6
Total Glows:      4
Total Chromes:    4
Total Blooms:     3
Total Textures:   4
Total Lightings:  4

Total Combinations: 12 × 6 × 4 × 4 × 3 × 4 × 4 = 9,216
Demo Seeds Used: 5,000 (54.3% coverage)
```

## Analytics

```typescript
// Get top 10 palettes
const stats = await getDemoLogoStyleStats();
stats.topPalettes; // [{ palette: "...", _count: 234 }, ...]

// Get top 10 glows
stats.topGlows; // [{ glow: "softNeon", _count: 189 }, ...]

// Get top 10 chromes
stats.topChromes;

// Get top 10 lightings
stats.topLightings;
```

## File Locations

- **Variants defined:** [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts)
- **Storage API:** [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts)
- **Database model:** [prisma/schema.prisma](prisma/schema.prisma)
- **Integration:** [components/LogoGenerator.tsx](components/LogoGenerator.tsx)
- **Full docs:** [DEMO_STYLE_VARIANTS.md](DEMO_STYLE_VARIANTS.md)

---

**Status:** ✅ Ready to use
