# Demo Logo Styles — Random Generation

## Updated Behavior

Demo logos now get **random style variants** instead of seed-determined ones.

### Generation Flow

```
User generates demo logo with seed: "a3f2b1c8..."
  ↓
generateRandomFingerprint() selects randomly from pools:
  {
    palette: randomFrom(12 palettes),
    gradient: randomFrom(6 gradients),
    glow: randomFrom(4 glows),
    chrome: randomFrom(4 chromes),
    bloom: randomFrom(3 blooms),
    texture: randomFrom(4 textures),
    lighting: randomFrom(4 lightings)
  }
  ↓
storeDemoLogoStyle(seed, result, logoId)
  ↓
INSERT INTO DemoLogoStyle VALUES (
  seed: "a3f2b1c8...",
  palette: "neonPinkBlue",
  gradient: "radial",
  glow: "pulseGlow",
  chrome: "rainbowChrome",
  bloom: "heavy",
  texture: "scanlines",
  lighting: "topLeft"
)
  ↓
✅ Style saved with seed
```

## Key Changes

### Before

- **Deterministic:** Same seed → same style (always)
- Used: `fingerprintFromSeed(seed)`
- Style variants locked to seed

### After

- **Random:** Each generation → new random style
- Uses: `generateRandomFingerprint()`
- Seed independent of style selection

## API Usage

```typescript
import { generateRandomFingerprint } from "@/lib/demoStyleVariants";
import { storeDemoLogoStyle } from "@/lib/demoLogoStyleManager";

// When demo logo is generated:
const fingerprint = generateRandomFingerprint();
// {
//   palette: "vaporTeal",
//   gradient: "sunsetFade",
//   glow: "auraGlow",
//   chrome: "mirrorChrome",
//   bloom: "heavy",
//   texture: "scanlines",
//   lighting: "topLeft"
// }

// Store with seed
await storeDemoLogoStyle(seed, result, logoId);
// Automatically uses generateRandomFingerprint() internally
```

## Database

Stores **seed + random style combination**:

```sql
INSERT INTO "DemoLogoStyle" (
  seed,
  palette,
  gradient,
  glow,
  chrome,
  bloom,
  texture,
  lighting,
  generatedLogoId,
  createdAt
) VALUES (
  'a3f2b1c8...',
  'neonPinkBlue',
  'radial',
  'pulseGlow',
  'rainbowChrome',
  'heavy',
  'scanlines',
  'topLeft',
  'logo-uuid',
  NOW()
);
```

## Example Variations

Same seed can now produce different styles:

```
Seed: "a3f2b1c8..."

Generation 1:
  palette: "retroRed"
  glow: "softNeon"
  chrome: "darkChrome"

Generation 2 (if seed reused):
  palette: "ultraviolet"
  glow: "auraGlow"
  chrome: "mirrorChrome"
```

## Style Distribution

With random selection, expect roughly equal distribution:

```
Palettes:  ~416 logos per palette (5000 ÷ 12)
Gradients: ~833 logos per gradient (5000 ÷ 6)
Glows:     ~1250 logos per glow (5000 ÷ 4)
Chromes:   ~1250 logos per chrome (5000 ÷ 4)
Blooms:    ~1667 logos per bloom (5000 ÷ 3)
Textures:  ~1250 logos per texture (5000 ÷ 4)
Lightings: ~1250 logos per lighting (5000 ÷ 4)
```

(Actual distribution will vary due to randomness)

## Analytics

Query style popularity:

```typescript
const stats = await getDemoLogoStyleStats();

// Top palettes used
stats.topPalettes; // Should be roughly equal

// Top glows used
stats.topGlows; // Should be roughly equal
```

## Files Changed

- [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts)
  - ✨ Added `generateRandomFingerprint()`
  - Kept `fingerprintFromSeed()` for legacy/testing

- [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts)
  - Updated `extractStyleFingerprint()` to use `generateRandomFingerprint()`
  - Now randomly selects on each generation

## No Database Changes

Schema remains the same:

```prisma
model DemoLogoStyle {
  id              String
  seed            String
  palette         String
  gradient        String
  glow            String
  chrome          String
  bloom           String
  texture         String
  lighting        String
  generatedLogoId String?
  createdAt       DateTime
}
```

## Benefits

✅ **Variety:** Each logo gets unique random style
✅ **Fairness:** Equal distribution across all variants
✅ **Excitement:** Players discover new combinations
✅ **Trackable:** Seed still stored, styles queryable
✅ **Reproducible:** All data saved for recreating logos

---

**Last Updated:** January 27, 2026
