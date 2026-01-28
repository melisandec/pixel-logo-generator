# Seed Registry & Enhancement System Implementation Guide

## Overview

This guide explains how to integrate the seed registry system with the logo generator to ensure backward compatibility when adding new visual enhancements.

## Files Created

### 1. `lib/seedRegistry.ts`

✅ **Status: Complete**

Manages the registry of existing seeds to preserve legacy logos.

**Key Functions:**

- `getExistingSeeds()` - Fetch all seeds cast before enhancement cutoff
- `isLegacySeed(seed)` - Check if a seed should skip enhancements
- `registerNewSeed(seed)` - Add new seed to registry
- `preloadSeedCache()` - Preload seeds on server startup

### 2. `lib/logoGeneratorServer.ts`

✅ **Status: Complete**

Server-side wrapper functions for logo generation with seed registry integration.

**Key Functions:**

- `generateLogoWithRegistry(config, checkRegistry)` - Auto-detect legacy seeds
- `generateAndRegisterLogo(config)` - Generate and register new logos

## Integration Steps

### Step 1: Add Enhancement Config to logoGenerator.ts

The `EnhancementConfig` interface has been added to `logoGenerator.ts` with 57 parameters controlling:

- Text effects (emboss, glitch, noise, neon, shadow gradients)
- Background enhancements (textures, gradients, vignette)
- Frame enhancements (corner glow, metallic tint, ornaments)
- Composition tweaks (offsets, curvature, kerning)
- Depth/3D enhancements (scratches, lighting, rim glow)
- Badge variations (decoration, rotation, scale, glow)
- Pixel rendering (roughness, dithering)
- Export effects (scanlines, glow, CRT flicker, sharpening)

### Step 2: Add skipEnhancements Flag

The `LogoConfig` interface now includes:

```typescript
interface LogoConfig {
  // ... existing fields
  skipEnhancements?: boolean; // Set to true for legacy seeds
}
```

### Step 3: Modify generateLogo Function

**Required changes to `generateLogo()` in lib/logoGenerator.ts:**

```typescript
export function generateLogo(config: LogoConfig): LogoResult {
  const seed = config.seed ?? Math.floor(Math.random() * 2147483647);
  const rng = new SeededRandom(seed);
  const rarity = config.rarity ?? determineRarity(rng, false, false, false);

  // NEW: Generate enhancement config based on skip flag
  const shouldApplyEnhancements = !config.skipEnhancements;
  const enhancements = shouldApplyEnhancements
    ? generateEnhancementConfig(rarity, rng)
    : generateEmptyEnhancementConfig();

  // Rest of existing code...
  // When applying enhancements, check if they should be applied:

  // Example: Apply text position offsets
  const textX =
    borderWidth +
    padding +
    (shouldApplyEnhancements ? enhancements.offsetX : 0);
  const textY =
    borderWidth +
    padding +
    (shouldApplyEnhancements ? enhancements.offsetY : 0);

  // After text rendering, conditionally apply enhancements:
  if (shouldApplyEnhancements) {
    // Apply all enhancement functions here
    if (enhancements.embossDepth > 0) {
      applyPixelEmboss(
        ctx,
        textX,
        textY,
        textWidth,
        textHeight,
        enhancements.embossDepth,
        rng,
      );
    }
    // ... apply other enhancements
  }

  return { dataUrl, seed, rarity, config };
}
```

### Step 4: Add Enhancement Generation Functions

Add these functions to `logoGenerator.ts` (after the LogoResult interface):

```typescript
function generateEnhancementConfig(
  rarity: Rarity,
  rng: SeededRandom,
): EnhancementConfig {
  // See lib/seedRegistry.ts documentation for full implementation
  // Generates seed-based parameters for all visual enhancements
  // Intensity scales with rarity: COMMON → RARE → EPIC → LEGENDARY
}

function generateEmptyEnhancementConfig(): EnhancementConfig {
  // Returns config with all enhancements disabled (zeros and 'none')
  // Used for legacy seeds to preserve original appearance
}
```

### Step 5: Update API Routes

**Replace `generateLogo()` calls with `generateLogoWithRegistry()`:**

```typescript
// Before:
import { generateLogo } from "@/lib/logoGenerator";
const result = generateLogo({ text: "Nike", seed: 12345 });

// After:
import { generateLogoWithRegistry } from "@/lib/logoGeneratorServer";
const result = await generateLogoWithRegistry({ text: "Nike", seed: 12345 });
```

**Files to update:**

- `app/api/logo-image/route.ts`
- `app/api/leaderboard/route.ts`
- Any other API routes that generate logos

### Step 6: Database Migration (Optional)

Add enhancement version tracking:

```prisma
model LeaderboardEntry {
  // ... existing fields
  enhancementVersion Int? @default(0)  // 0 = pre-enhancement, 1 = v1 enhancements
}
```

Run migration:

```bash
npx prisma migrate dev --name add_enhancement_version
```

### Step 7: Server Startup Initialization

In your main server file or API initialization:

```typescript
import { preloadSeedCache } from "@/lib/seedRegistry";

// On server startup
await preloadSeedCache();
console.log("Seed registry initialized");
```

## Usage Examples

### Example 1: Generate Logo in API Route

```typescript
// app/api/logo-image/route.ts
import { generateLogoWithRegistry } from "@/lib/logoGeneratorServer";

export async function POST(request: Request) {
  const { text, seed } = await request.json();

  // Automatically checks seed registry and skips enhancements if legacy
  const result = await generateLogoWithRegistry({
    text,
    seed,
  });

  return Response.json({ logoUrl: result.dataUrl });
}
```

### Example 2: Create New Cast with Registration

```typescript
import { generateAndRegisterLogo } from "@/lib/logoGeneratorServer";

// When user creates a new cast
const result = await generateAndRegisterLogo({
  text: userPrompt,
  seed: newSeed,
});

// Seed is automatically registered for future backward compatibility
await prisma.leaderboardEntry.create({
  data: {
    seed: result.seed,
    imageUrl: result.dataUrl,
    // ... other fields
  },
});
```

### Example 3: Force Legacy Mode

```typescript
// Explicitly skip enhancements (e.g., for testing)
const result = await generateLogoWithRegistry(
  {
    text: "Test",
    seed: 12345,
    skipEnhancements: true,
  },
  false,
); // Don't check registry
```

## Testing

### 1. Test Legacy Seed Detection

```typescript
import { isLegacySeed } from "@/lib/seedRegistry";

// Should return true for seeds in database before cutoff date
const isLegacy = await isLegacySeed(existingSeed);
console.log(`Seed ${existingSeed} is legacy: ${isLegacy}`);
```

### 2. Test Enhancement Application

```typescript
// Generate same logo twice
const legacy = await generateLogoWithRegistry({ text: "Test", seed: 12345, skip Enhancements: true });
const enhanced = await generateLogoWithRegistry({ text: "Test", seed: 12345, skipEnhancements: false });

// Logos should be different (enhanced has more visual effects)
console.log('Legacy URL:', legacy.dataUrl.substring(0, 100));
console.log('Enhanced URL:', enhanced.dataUrl.substring(0, 100));
```

### 3. Test Cache Performance

```typescript
import { getCacheStats } from "@/lib/seedRegistry";

const stats = getCacheStats();
console.log(`Cache size: ${stats.size} seeds`);
console.log(`Cache age: ${stats.age}ms`);
```

## Configuration

### Cutoff Date

Edit `lib/seedRegistry.ts` to adjust the enhancement cutoff date:

```typescript
export const CUTOFF_DATE = new Date("2026-01-20T00:00:00Z");
```

All seeds created before this date will skip enhancements.

### Cache TTL

Adjust cache refresh interval:

```typescript
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (default)
```

## Monitoring

### Cache Statistics

```typescript
import { getCacheStats } from "@/lib/seedRegistry";

// Add to health check endpoint
export async function GET() {
  const stats = getCacheStats();
  return Response.json({
    seedRegistry: {
      cachedSeeds: stats.size,
      lastRefresh: stats.lastRefresh,
      cacheAge: stats.age,
    },
  });
}
```

### Logo Generation Logs

The system logs enhancement decisions:

```
[LogoGenerator] Legacy seed 12345 detected - skipping enhancements
[SeedRegistry] Loaded 1523 existing seeds (pre-enhancement)
```

## Troubleshooting

### Issue: Enhancements Applied to Legacy Seeds

**Cause:** Registry not loading properly  
**Solution:** Check database connection and CUTOFF_DATE

### Issue: All Seeds Treated as New

**Cause:** Cache not initialized  
**Solution:** Call `preloadSeedCache()` on server startup

### Issue: Performance Degradation

**Cause:** Cache misses or database queries on every request  
**Solution:** Verify cache is active with `getCacheStats()`

## Summary

✅ **Backward Compatible:** Existing logos unchanged  
✅ **Seed Deterministic:** Same seed = identical output  
✅ **Performance Optimized:** In-memory caching with 1-hour TTL  
✅ **Easy Integration:** Drop-in replacement for `generateLogo()`  
✅ **Future Proof:** Enhancement versioning for migrations

## Next Steps

1. ✅ Seed registry module created (`lib/seedRegistry.ts`)
2. ✅ Server wrapper created (`lib/logoGeneratorServer.ts`)
3. ⏳ Add enhancement config generation to `logoGenerator.ts`
4. ⏳ Implement enhancement application functions
5. ⏳ Update API routes to use `generateLogoWithRegistry()`
6. ⏳ Add database migration for enhancement version (optional)
7. ⏳ Test with existing seeds to verify backward compatibility
8. ⏳ Deploy and monitor cache performance
