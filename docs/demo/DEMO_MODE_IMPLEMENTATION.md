# Demo Mode Complete Implementation

Comprehensive guide to the 80s exclusive demo mode system with variant pools.

## What Is Demo Mode?

A limited-time 80s Synthwave-exclusive logo forge with:

- **5,000 unreleased seeds** (one-time consumption each)
- **9,216 possible style combinations** (deterministically derived)
- **Exclusive UI** ("⚡ Forge 80s Logo" button, locked preset)
- **Full style tracking** (palette, gradient, glow, chrome, bloom, texture, lighting)
- **Atomic transaction safety** (prevents race conditions)

## Architecture Overview

```
Demo Seed Pool (5000 seeds)
  ↓
User clicks "⚡ Forge 80s Logo"
  ↓
POST /api/demo/seed → Atomic SELECT+UPDATE (FOR UPDATE SKIP LOCKED)
  ↓
generateLogo(seed) → LogoResult
  ↓
fingerprintFromSeed(seed) → StyleFingerprint (7 variants)
  ↓
storeDemoLogoStyle() → Save to database
  ↓
✅ Logo + style saved, seed consumed
```

## Key Files

### Database & Migrations

- [prisma/schema.prisma](prisma/schema.prisma)
  - `DemoSeedPool` model (seed, used, usedAt, usedByUserId)
  - `DemoLogoStyle` model (seed + 7 style variants)
- [prisma/migrations/add_demo_seed_pool/migration.sql](prisma/migrations/add_demo_seed_pool/migration.sql)
- [prisma/migrations/add_demo_logo_style/migration.sql](prisma/migrations/add_demo_logo_style/migration.sql)

### Seed Management

- [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts)
  - `generateDemoSeeds(count)` — Generate 5000 cryptographic seeds
  - `getAndConsumeDemoSeed(userId)` — Atomic transaction with row locking
  - `getDemoSeedPoolStats()` — Pool analytics
- [lib/demoSeedClient.ts](lib/demoSeedClient.ts)
  - `requestAndConsumeDemoSeed(userId)` — Client-side HTTP wrapper
- [scripts/generate-demo-seeds.ts](scripts/generate-demo-seeds.ts)
  - Admin: Generate new seed batches
- [scripts/import-demo-seeds.ts](scripts/import-demo-seeds.ts)
  - Admin: Import seeds into database

### Style Variants

- [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts)
  - Variant pool constants (12 palettes, 6 gradients, 4 glows, etc.)
  - `fingerprintFromSeed(seed)` — Deterministic style derivation
  - TypeScript types for all variants
- [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts)
  - `storeDemoLogoStyle()` — Save style fingerprint
  - `getDemoLogoStyle()` — Retrieve by seed
  - `findStylesByVariant()` — Query by palette, glow, etc.
  - `getDemoLogoStyleStats()` — Analytics

### UI Integration

- [components/LogoGenerator.tsx](components/LogoGenerator.tsx)
  - Button: "⚡ Forge 80s Logo" (demo mode)
  - Seed input: hidden in demo mode
  - Presets: locked message in demo mode
  - Integration with `storeDemoLogoStyle()`

### Configuration

- [lib/demoMode.ts](lib/demoMode.ts)
  - `IS_DEMO_MODE` global flag
  - `DEMO_PRESET_CONFIG` & `DEMO_PRESET_KEY`
- [lib/logoGeneratorConstants.ts](lib/logoGeneratorConstants.ts)
  - Preset definitions

### API Endpoints

- [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts)
  - `GET /api/demo/seed` — Preview next seed
  - `POST /api/demo/seed` — Consume seed atomically
  - `GET /api/demo/seed/stats` — Pool statistics

## Variant Pools

### Palettes (12)

```
neonPinkBlue  magentaCyan  sunsetPurple  electricBlue
laserGreen    hotPinkGold  cyberOrange   vaporTeal
midnightNeon  retroRed     arcadeYellow  ultraviolet
```

### Gradients (6)

```
horizontal  vertical  diagonal  radial  metallicBand  sunsetFade
```

### Glows (4)

```
softNeon  hardNeon  pulseGlow  auraGlow
```

### Chromes (4)

```
mirrorChrome  brushedMetal  rainbowChrome  darkChrome
```

### Blooms (3)

```
low  medium  heavy
```

### Textures (4)

```
none  grain  halftone  scanlines
```

### Lightings (4)

```
topLeft  topRight  bottomLeft  front
```

**Total: 12 × 6 × 4 × 4 × 3 × 4 × 4 = 9,216 combinations**

## Setup Instructions

### 1. Deploy Database

```bash
# Apply migrations
npx prisma migrate deploy
# OR for development
npx prisma migrate dev
```

### 2. Initialize Seed Pool

```bash
# Generate seeds (crypto-random hex strings)
npx tsx scripts/generate-demo-seeds.ts 5000

# Outputs: scripts/data/demo-seeds-YYYY-MM-DD.json

# Import to database
npx tsx scripts/import-demo-seeds.ts scripts/data/demo-seeds-YYYY-MM-DD.json
```

### 3. Verify

```bash
# Check pool status
curl http://localhost:3000/api/demo/seed/stats

# Expected:
# {
#   "total": 5000,
#   "used": 0,
#   "available": 5000,
#   "percentageUsed": 0
# }
```

### 4. Test Generation

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Demo mode enabled if IS_DEMO_MODE = true
# Click "⚡ Forge 80s Logo" → style saved to DB
```

## Usage Examples

### Generate Demo Logo

```typescript
// In component
const seed = await requestAndConsumeDemoSeed(userId);
const result = generateLogo({ text, seed });
// Style automatically fingerprinted and stored
```

### Query Popular Styles

```typescript
const stats = await getDemoLogoStyleStats();

// Top palettes
stats.topPalettes.forEach((p) => {
  console.log(`${p.palette}: ${p._count.palette} uses`);
});

// Top glows
stats.topGlows.forEach((g) => {
  console.log(`${g.glow}: ${g._count.glow} uses`);
});
```

### Find Logos by Style

```typescript
// All logos with vaporTeal palette
const tealLogos = await findStylesByVariant("palette", "vaporTeal");

// All logos with auraGlow
const auraLogos = await findStylesByVariant("glow", "auraGlow");
```

## Race Condition Prevention

The system uses **database-level row locking** to prevent seed duplication:

```sql
BEGIN;
  SELECT seed FROM "DemoSeedPool"
  WHERE used = false
  FOR UPDATE SKIP LOCKED  -- Lock row, skip if already locked
  LIMIT 1;

  UPDATE "DemoSeedPool"
  SET used = true, usedAt = NOW()
  WHERE seed = $1;
COMMIT;
```

**Result:** Each user gets unique seed, no conflicts under load.

## Error Handling

### Pool Exhaustion

```
Status: 429 Too Many Requests
Body: {
  "error": "The 80s Forge has exhausted its unreleased seeds."
}
```

### No Seeds Available

```typescript
const seed = await requestAndConsumeDemoSeed(userId);
if (!seed) {
  console.log("Pool exhausted");
  // Handle: show message, disable button, etc.
}
```

## Monitoring

### Real-time Status

```bash
curl http://localhost:3000/api/demo/seed/stats
```

### Database Queries

```sql
-- Remaining seeds
SELECT COUNT(*) FROM "DemoSeedPool" WHERE used = false;

-- Recent consumptions
SELECT seed, "usedAt", "usedByUserId"
FROM "DemoSeedPool"
WHERE used = true
ORDER BY "usedAt" DESC
LIMIT 20;

-- Style distribution
SELECT palette, COUNT(*) FROM "DemoLogoStyle" GROUP BY palette;

-- Most popular glows
SELECT glow, COUNT(*) FROM "DemoLogoStyle" GROUP BY glow ORDER BY COUNT(*) DESC LIMIT 10;
```

## Deployment Checklist

- [ ] Run `npx prisma migrate deploy`
- [ ] Run seed initialization scripts
- [ ] Verify `IS_DEMO_MODE` setting
- [ ] Test button text ("⚡ Forge 80s Logo")
- [ ] Test seed input is hidden
- [ ] Test presets show locked message
- [ ] Generate test logo → verify style saved
- [ ] Check `/api/demo/seed/stats` endpoint
- [ ] Load test with concurrent users
- [ ] Monitor error logs for failed transactions

## Documentation Map

| Topic                    | File                                                       |
| ------------------------ | ---------------------------------------------------------- |
| Seed Pool & Transactions | [DEMO_TRANSACTION_LOCKING.md](DEMO_TRANSACTION_LOCKING.md) |
| Style Variants Overview  | [DEMO_STYLE_VARIANTS.md](DEMO_STYLE_VARIANTS.md)           |
| Admin Scripts            | [ADMIN_SEEDS_SCRIPTS.md](ADMIN_SEEDS_SCRIPTS.md)           |
| UI Changes               | [DEMO_UI_STYLES_QUICK_REF.md](DEMO_UI_STYLES_QUICK_REF.md) |
| Quick Reference          | [DEMO_VARIANTS_QUICK_REF.md](DEMO_VARIANTS_QUICK_REF.md)   |
| Original Design          | [DEMO_SEED_POOL.md](DEMO_SEED_POOL.md)                     |

## Support

**Questions about:**

- **Seed generation** → See [ADMIN_SEEDS_SCRIPTS.md](ADMIN_SEEDS_SCRIPTS.md)
- **Transactions & race conditions** → See [DEMO_TRANSACTION_LOCKING.md](DEMO_TRANSACTION_LOCKING.md)
- **Style variants & pools** → See [DEMO_STYLE_VARIANTS.md](DEMO_STYLE_VARIANTS.md)
- **UI changes** → See [DEMO_UI_STYLES_QUICK_REF.md](DEMO_UI_STYLES_QUICK_REF.md)
- **Quick lookup** → See [DEMO_VARIANTS_QUICK_REF.md](DEMO_VARIANTS_QUICK_REF.md)

---

**Status:** ✅ Complete and ready for deployment
**Last Updated:** January 27, 2026
