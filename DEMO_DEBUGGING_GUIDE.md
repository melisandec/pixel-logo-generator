# Demo Page — Font & Style Debugging Guide

## Quick Diagnostic Commands

### Check Font Loading

```javascript
// Open DevTools Console and run:
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.font = "bold 12px 'Press Start 2P', monospace";
console.log("Font set:", ctx.font); // Should show: bold 12px 'Press Start 2P', monospace
```

### Verify Press Start 2P Font

```javascript
// Check if font loaded from Google Fonts
const fontFace = Array.from(document.styleSheets)
  .find((sheet) => sheet.href?.includes("fonts.googleapis"))
  ?.cssRules.find((rule) => rule.fontFamily === "'Press Start 2P'");

console.log("Press Start 2P loaded:", !!fontFace);
```

### Test Deterministic Fingerprints

```javascript
// In LogoGenerator component state:
import { generateDeterministicFingerprint } from "@/lib/demoStyleVariants";

const seed = 100000042;
const fp1 = generateDeterministicFingerprint(seed);
const fp2 = generateDeterministicFingerprint(seed);

console.log("Fingerprint 1:", fp1);
console.log("Fingerprint 2:", fp2);
console.log("Match:", JSON.stringify(fp1) === JSON.stringify(fp2)); // Should be true
```

---

## What to Look For in the UI

### ✅ Correct Font Rendering

**You should see:**

- Text appears in a blocky, pixel-art style (Press Start 2P)
- Characters are monospaced and uniform
- Bold weight applied (thicker strokes)
- Text positioned centrally on the logo

**If fallback (monospace):**

- Text is still readable but less retro
- Characters are monospaced but not pixel-art style
- This is acceptable if Press Start 2P fails to load

### ✅ Correct Style Application

**Demo Logo Appearance:**

- Magenta/cyan/purple dominant colors (neon)
- Gradient fill across text (bright colors)
- Bright outline around text (neon glow)
- Shiny/metallic reflection effect
- 3D depth effect (layered appearance)
- Glitch/scanline effect on edges
- Soft glow halo around text

**Background:**

- Purple/pink vaporwave sky gradient
- Arcade bezel frame around logo
- CRT scanlines overlay

**Effects NOT visible in normal text:**

- Wave distortion (demo disabled)
- Slanted effect (demo disabled)
- All other effects should be active

---

## Debugging Checklist

### 1. Font Loading Issues

**Symptom:** Text looks blocky but not pixel-art retro  
**Diagnosis:** Press Start 2P font didn't load; using monospace fallback  
**Solution:**

```javascript
// Check app/layout.tsx for Google Fonts import:
import { Press_Start_2P } from 'next/font/google';
const pressStart2P = Press_Start_2P({ subsets: ['latin'] });

// Should be applied to html element:
<html className={pressStart2P.className}>
```

**Verification:**

```javascript
// In DevTools Elements tab, check <html> element has class like:
// __Press_Start_2P_xyz123
```

---

### 2. Gradient Not Appearing

**Symptom:** Text is solid color instead of gradient fill  
**Diagnosis:** textEffects.gradient = false or palette not loaded  
**Solution:**

```typescript
// Check DEMO_PRESET_CONFIG in lib/demoMode.ts:
textEffects: {
  gradient: true,  // ← MUST be true
  ...
}

// Verify palette is selected:
const palette = fingerprintStyleVariants.palette;
console.log('Selected palette:', palette);  // Should be "neonPinkBlue", "magentaCyan", etc.
```

---

### 3. No Neon Glow/Outline

**Symptom:** Text looks flat, no glow or outline  
**Diagnosis:** SVG filters not being applied or glowIntensity = 0  
**Solution:**

```typescript
// Check DEMO_PRESET_CONFIG:
depthConfig: {
  glowIntensity: 0.95,  // ← Should be high (0.8-1.0)
  glowColor: "#00FFFF", // ← Cyan glow
  ...
}

// Verify neonOutline enabled:
textEffects: {
  neonOutline: true,  // ← MUST be true
  ...
}
```

---

### 4. 3D Effect Not Visible

**Symptom:** Text looks flat, no depth  
**Diagnosis:** extrusion = false or extrusionLayers = 0  
**Solution:**

```typescript
// Check DEMO_PRESET_CONFIG:
depthConfig: {
  extrusion: true,           // ← MUST be true
  extrusionLayers: 8,        // ← Should be 8
  stacked3D: true,           // ← textEffects.stacked3D MUST be true
  ...
}
```

---

### 5. Seed Not Deterministic

**Symptom:** Same seed produces different styles on regeneration  
**Diagnosis:** Using random generation instead of deterministic  
**Solution:**

```typescript
// In demoLogoStyleManager.ts, verify:
function extractStyleFingerprint(result: LogoResult): StyleFingerprint {
  // ✅ CORRECT:
  const fingerprint = generateDeterministicFingerprint(result.seed);

  // ❌ WRONG:
  // const fingerprint = generateRandomFingerprint();
}
```

---

### 6. Database Not Persisting Styles

**Symptom:** Generate logo, then query doesn't show DemoLogoStyle record  
**Diagnosis:** storeLogoDemoStyle not awaited or database error  
**Solution:**

```typescript
// In LogoGenerator.tsx persistGeneratedLogo():
if (demoMode) {
  try {
    // ✅ CORRECT (awaited):
    await storeLogoDemoStyle(seedString, result, data.entry.id);

    // ❌ WRONG (fire-and-forget):
    // void storeLogoDemoStyle(seedString, result, data.entry.id);
  } catch (error) {
    console.error("Failed to store style:", error);
  }
}
```

---

### 7. Seed Consumption Order Wrong

**Symptom:** Different seeds used than expected, or seed pool depleting fast  
**Diagnosis:** Seed consumed AFTER generation instead of BEFORE  
**Solution:**

```typescript
// In LogoGenerator.tsx createLogoResult():
// ✅ CORRECT ORDER:
if (demoMode) {
  const consumedSeed = await demoModeHook.consumeDemoSeed();  // STEP 1
  seedToUse = stringToSeed(consumedSeed);                     // STEP 2
}
const result = generateLogo({text, seed: seedToUse, ...});    // STEP 3

// ❌ WRONG ORDER:
// const result = generateLogo({text, seed, ...});
// const consumedSeed = await consumeDemoSeed();  // Too late!
```

---

## Advanced Debugging

### Check Determinism Mathematically

```javascript
// LCG algorithm used:
function testDeterminism(seed, iterations = 7) {
  let hash = seed;
  const steps = [];

  for (let i = 0; i < iterations; i++) {
    hash = (hash * 9301 + 49297) % 233280;
    steps.push(hash);
  }

  return steps;
}

// Example:
const seed = 100000042;
const indices1 = testDeterminism(seed);
const indices2 = testDeterminism(seed);

console.log("Step 1 palette idx:", indices1[0] % 9); // Should match
console.log("Step 2 gradient idx:", indices1[1] % 5); // Should match
console.log(
  "Deterministic:",
  JSON.stringify(indices1) === JSON.stringify(indices2),
);
```

### Inspect DemoLogoStyle Record

```sql
-- PostgreSQL query:
SELECT id, seed, palette, gradient, glow, chrome, bloom, texture, lighting
FROM "DemoLogoStyle"
ORDER BY "createdAt" DESC
LIMIT 1;

-- Should show all 7 components filled:
-- id        | seed             | palette       | gradient | glow     | chrome        | bloom  | texture | lighting
-- xyz123    | 60a1b2c3...     | neonPinkBlue  | diagonal | hardNeon | rainbowChrome | medium | halftone| topLeft
```

### Check Seed Pool Status

```sql
-- PostgreSQL query:
SELECT
  COUNT(*) as total_seeds,
  COUNT(CASE WHEN used = false THEN 1 END) as available_seeds,
  COUNT(CASE WHEN used = true THEN 1 END) as consumed_seeds,
  MAX(usedAt) as last_consumed
FROM "DemoSeedPool";

-- Expected:
-- total_seeds | available_seeds | consumed_seeds | last_consumed
-- 9000        | 8999            | 1              | 2026-01-29 ...
```

---

## Performance Profiling

### Canvas Rendering Time

```javascript
// Measure generation speed:
const start = performance.now();
const result = await generateLogo({text: "NEON", seed: 100000042, ...});
const end = performance.now();

console.log(`Generation took ${end - start}ms`);
// Expected: 200-500ms on modern hardware
```

### SVG Filter Rendering

```javascript
// Check filter application time:
const filters = generateFilterDefsFromFingerprint(fingerprint);
const start = performance.now();
// Apply filters to canvas...
const end = performance.now();

console.log(`Filter rendering took ${end - start}ms`);
// Expected: 50-150ms
```

---

## Network Debugging

### Monitor Image Upload

```javascript
// DevTools → Network tab → Filter by "logo-image"
// Should see:
// - POST /api/logo-image
// - Status: 200 OK
// - Response: {imageUrl: "https://..."}
// - Time: 100-300ms
```

### Monitor Leaderboard Persistence

```javascript
// DevTools → Network tab → Filter by "leaderboard"
// Should see:
// - POST /api/leaderboard
// - Status: 200 OK
// - Response: {entry: {id, username, ...}}
// - Time: 50-200ms
```

---

## Browser Console Errors to Ignore

### ✅ Safe to Ignore

- CORS warnings for external fonts (Google Fonts)
- Canvas width/height deprecation warnings
- localStorage quota warnings (if max reached)

### ❌ Must Fix

- "Press Start 2P is not defined"
- "Cannot read property 'seed' of undefined"
- "DemoSeedPool exhausted" (if not expected)
- "Failed to store demo logo style" (database connection issue)

---

## Testing Scenario Walkthrough

### Scenario 1: Normal Generation

```
1. Open http://localhost:3001/demo
2. See: "80s EXCLUSIVE FORGE" title with cyan glow
3. See: Scanlines overlay on page
4. Input text: "NEON"
5. Click: Generate
   ✓ Should show logo with:
     - Pixelated Press Start 2P font
     - Magenta/cyan gradient
     - Bright neon glow
     - 3D depth effect
     - 8 layers of extrusion
   ✓ Should show: Seed number (e.g., "100000042")
   ✓ Should show: Rarity badge (COMMON/RARE/EPIC/LEGENDARY)
6. Click: Generate again
   ✓ Should show DIFFERENT logo with DIFFERENT seed
   ✓ Should show DIFFERENT style (different palette, glow, etc.)
```

### Scenario 2: Reproduce from Seed

```
1. Note seed from previous generation: "100000042"
2. Share URL: /demo?seed=100000042
3. Click: Generate
   ✓ Should produce IDENTICAL logo
   ✓ Should have SAME palette, gradient, glow, etc.
   ✓ Should have SAME visual appearance
```

### Scenario 3: Rate Limiting

```
1. Generate logo (seed consumed)
2. Try to generate again immediately
   ✓ Should see: "Only 1 try every 5 minutes"
   ✓ Should show: Countdown timer
3. Wait 5+ minutes
4. Try to generate again
   ✓ Should work with new seed
```

---

## Summary Checklist

- [ ] Font is Press Start 2P (pixel-art style) or monospace fallback
- [ ] Gradient fills text with neon colors (magenta, cyan, purple)
- [ ] Neon glow outline visible around text
- [ ] 3D depth effect visible (layered appearance)
- [ ] Same seed produces identical style every time
- [ ] Different seeds produce different styles (1,440 combinations)
- [ ] Rate limiting enforced (1 try per 5 minutes)
- [ ] DemoLogoStyle records persisted to database
- [ ] Seed pool status healthy (9000 total, decreasing as used)
- [ ] Image upload working (Vercel Blob or in-memory)
- [ ] No critical console errors

**All checks passing = Demo page fully operational** ✅
