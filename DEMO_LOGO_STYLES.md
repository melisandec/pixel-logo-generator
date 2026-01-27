# Demo Logo Styles — 80s Exclusive Fingerprints

## Overview

The demo logo system captures style fingerprints for each generated 80s logo, enabling:

- ✅ Complete recreation of exact visual style from seed
- ✅ Gallery display of user's exclusive 80s creations
- ✅ Analytics on which styles are most popular
- ✅ Deterministic reproduction without regeneration

## Data Model

### DemoLogoStyle Table

```sql
CREATE TABLE "DemoLogoStyle" (
  "id" TEXT PRIMARY KEY,
  "seed" TEXT NOT NULL,
  "paletteId" TEXT NOT NULL,
  "gradientId" TEXT NOT NULL,
  "glowId" TEXT NOT NULL,
  "chromeId" TEXT NOT NULL,
  "bloomId" TEXT NOT NULL,
  "textureId" TEXT NOT NULL,
  "lightingId" TEXT NOT NULL,
  "generatedLogoId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### Style Fingerprint Components

Each demo logo stores 7 style identifiers that define its visual characteristics:

| Component    | Purpose                          | Example                            |
| ------------ | -------------------------------- | ---------------------------------- |
| `paletteId`  | Color depth and rarity level     | `EPIC-palette-16`                  |
| `gradientId` | Gradient type and enabled status | `gradient-radial-enabled`          |
| `glowId`     | Glow radius and corner effects   | `glow-4-2-corner`                  |
| `chromeId`   | Metallicness and bevel depth     | `chrome-metallic-bevel-2`          |
| `bloomId`    | Rim glow and ambient shadow      | `bloom-rim-75-ambient-50`          |
| `textureId`  | Micro texture, scratches, pixels | `texture-dust-scratch-25-pixel-15` |
| `lightingId` | Lighting angle and badge effects | `light-angle-30-badge-glow-rot-5`  |

## How It Works

### 1. Generation Phase

User clicks **⚡ Forge 80s Logo** → generates with seed from pool:

```
DemoSeedPool.getAndConsumeDemoSeed(userId)
  ↓ Atomically locks and consumes seed
  ↓
Logo generated with seed
  ↓
extractStyleFingerprint(result) extracts 7 style IDs
  ↓
storeDemoLogoStyle(seed, result, logoId) saves to DB
```

### 2. Extraction Phase

`extractStyleFingerprint()` analyzes the `LogoResult` and maps to deterministic IDs:

```typescript
paletteId = `${rarity}-palette-${colorDepth}`;
// Example: "EPIC-palette-16" or "LEGENDARY-palette-24"

gradientId = `gradient-${gradientVariation}-${usesGradient ? "enabled" : "disabled"}`;
// Example: "gradient-radial-enabled" or "gradient-linear-disabled"

glowId = `glow-${postGlowRadius}-${neonGlowRadius}-${cornerGlow ? "corner" : "none"}`;
// Example: "glow-4-2-corner" or "glow-0-0-none"

chromeId = `chrome-${metallicTint ? "metallic" : "standard"}-bevel-${bevelVariation}`;
// Example: "chrome-metallic-bevel-2" or "chrome-standard-bevel-0"

bloomId = `bloom-rim-${rimGlow * 100}-ambient-${ambientShadow * 100}`;
// Example: "bloom-rim-75-ambient-50"

textureId = `texture-${textureType}-scratch-${scratchIntensity * 100}-pixel-${pixelRoughness * 100}`;
// Example: "texture-dust-scratch-25-pixel-15"

lightingId = `light-angle-${lightingAngle}-badge-${badgeGlow ? "glow" : "none"}-rot-${badgeRotation}`;
// Example: "light-angle-30-badge-glow-rot-5"
```

### 3. Storage Phase

Fingerprint stored with seed and optional GeneratedLogo link:

```json
{
  "seed": "a3f2b1c8d9e4f7a6b2c1d8e9f4a7b3c6d2e1f8a9b4c7d0e3f6a9b2c5d8e1f",
  "paletteId": "EPIC-palette-16",
  "gradientId": "gradient-radial-enabled",
  "glowId": "glow-4-2-corner",
  "chromeId": "chrome-metallic-bevel-2",
  "bloomId": "bloom-rim-75-ambient-50",
  "textureId": "texture-dust-scratch-25-pixel-15",
  "lightingId": "light-angle-30-badge-glow-rot-5",
  "generatedLogoId": "uuid-of-logo",
  "createdAt": "2026-01-27T12:34:56.000Z"
}
```

### 4. Retrieval Phase

Later, when displaying from gallery:

```typescript
// Retrieve stored style
const style = await getDemoLogoStyle(seed);

// Use style IDs to inform re-rendering or analytics
console.log(style.glowId); // "glow-4-2-corner"
```

## API

### `extractStyleFingerprint(result: LogoResult)`

Analyzes logo and returns 7 style IDs.

```typescript
const fingerprint = extractStyleFingerprint(result);
console.log(fingerprint.paletteId); // "EPIC-palette-16"
console.log(fingerprint.glowId); // "glow-4-2-corner"
```

### `storeDemoLogoStyle(seed, result, generatedLogoId?)`

Saves style fingerprint to database. Non-blocking (errors logged, not thrown).

```typescript
await storeDemoLogoStyle(
  "a3f2b1c8...", // seed from DemoSeedPool
  result, // LogoResult from generateLogo()
  "logo-uuid", // optional: link to GeneratedLogo
);
```

### `getDemoLogoStyle(seed)`

Retrieves stored style by seed.

```typescript
const style = await getDemoLogoStyle("a3f2b1c8...");
if (style) {
  console.log(style.paletteId, style.glowId);
}
```

### `getUserDemoLogoStyles(logoIds)`

Gets all styles for user's logos (batch retrieve).

```typescript
const styles = await getUserDemoLogoStyles(["logo-1", "logo-2", "logo-3"]);
// Returns DemoLogoStyle[] ordered by createdAt DESC
```

### `getDemoLogoStyleStats()`

Analytics: top palettes and glows.

```typescript
const stats = await getDemoLogoStyleStats();
console.log(stats.topPalettes); // Most common palette IDs
console.log(stats.topGlows); // Most common glow IDs
```

## Integration

### In LogoGenerator Component

```typescript
import { storeDemoLogoStyle } from "@/lib/demoLogoStyleManager";

// After persistGeneratedLogo completes:
if (IS_DEMO_MODE && data.entry?.id) {
  const seedString = result.seed.toString();
  void storeDemoLogoStyle(seedString, result, data.entry.id);
}
```

### Automatic on Generate

1. User clicks **⚡ Forge 80s Logo**
2. `createLogoResult()` fetches seed from `DemoSeedPool` (atomic)
3. Logo generated with seed
4. `persistGeneratedLogo()` uploads image and saves to DB
5. `storeDemoLogoStyle()` extracts and saves style fingerprint
   - Non-blocking (fire-and-forget with void)
   - Errors logged to console, don't break UI

## Example Flow

```
User generates demo logo:
  ↓
POST /api/demo/seed → returns seed "a3f2b1c8..."
  ↓
generateLogo(seed) → LogoResult with config
  ↓
persistGeneratedLogo() → saves to GeneratedLogo table, gets ID
  ↓
extractStyleFingerprint(result):
  {
    paletteId: "LEGENDARY-palette-24",
    gradientId: "gradient-radial-enabled",
    glowId: "glow-5-3-corner",
    chromeId: "chrome-metallic-bevel-3",
    bloomId: "bloom-rim-85-ambient-60",
    textureId: "texture-stars-scratch-40-pixel-20",
    lightingId: "light-angle-45-badge-glow-rot-8"
  }
  ↓
storeDemoLogoStyle() → saves to DemoLogoStyle table
  ↓
✅ Style fingerprint stored with seed
```

## Gallery Display

When viewing user's demo logos in gallery:

```typescript
// Get user's logos
const userLogos = await getUserDemos(userId);

// Get their styles
const styles = await getUserDemoLogoStyles(userLogos.map((l) => l.id));

// Display with style info
userLogos.forEach((logo) => {
  const style = styles.find((s) => s.generatedLogoId === logo.id);
  console.log(`Palette: ${style?.paletteId}`); // "EPIC-palette-16"
});
```

## Analytics

Monitor most popular style combinations:

```typescript
const stats = await getDemoLogoStyleStats();

stats.topPalettes.forEach((p) => {
  console.log(`${p.paletteId}: ${p._count.paletteId} times`);
  // "LEGENDARY-palette-24: 42 times"
  // "EPIC-palette-16: 89 times"
  // "RARE-palette-8: 156 times"
});
```

## Seed Uniqueness

Each seed → deterministic styles (no randomness):

- Seed "abc123" always → same palette, glow, chrome, etc.
- Can be reproduced exactly by regenerating with same seed
- Style IDs serve as compressed representation of full config

## Storage

**Table size estimate** (5000 seeds max):

- 5000 rows × ~400 bytes = ~2 MB
- Indices on seed and createdAt add ~50 KB
- Total: minimal footprint

**Retention:** Kept indefinitely (low cost)

## Troubleshooting

**Issue: Style not stored**

- Check logs: "Failed to store demo logo style:"
- Database may be unavailable
- Non-blocking operation, doesn't crash app

**Issue: Can't retrieve style**

```typescript
const style = await getDemoLogoStyle(seed);
// Returns null if not found
// Check seed value matches DemoSeedPool
```

**Issue: Analytics query slow**

- Add index if missing: `CREATE INDEX idx_demo_palette ON "DemoLogoStyle"(paletteId)`
- Limit `take` in queries for large datasets

---

**Related Files:**

- [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts) — Implementation
- [prisma/schema.prisma](prisma/schema.prisma) — DemoLogoStyle model
- [prisma/migrations/add_demo_logo_style/migration.sql](prisma/migrations/add_demo_logo_style/migration.sql) — Migration
- [components/LogoGenerator.tsx](components/LogoGenerator.tsx) — Integration point

**Last Updated:** January 27, 2026
