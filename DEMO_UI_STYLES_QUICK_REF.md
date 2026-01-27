# Demo Mode UI & Styles — Quick Reference

## Visual Changes in Demo Mode

### Button

```
Regular mode:  [FORGE]  [RANDOMIZE]
Demo mode:     [⚡ Forge 80s Logo]
               (randomize hidden, tooltip on hover)

Tooltip: "This uses unreleased 80s seeds. Each can only be used once."
```

### Seed Input

```
Regular mode: [Seed input field visible in Advanced mode]
Demo mode:    [Hidden completely]
```

### Style Presets

```
Regular mode: [All presets available: Default, Neon, Chrome, etc.]
Demo mode:    [Locked message: "Locked to neon synthwave chrome..."]
```

### Generation States

```
Not generating: "⚡ Forge 80s Logo"
Generating:     "FORGING 80s..."
```

## Database: DemoLogoStyle

Captures style fingerprint for each demo logo:

```prisma
model DemoLogoStyle {
  id              String   @id @default(cuid())
  seed            String   // From DemoSeedPool
  paletteId       String   // Color depth + rarity
  gradientId      String   // Gradient type
  glowId          String   // Glow radius + effects
  chromeId        String   // Metallic + bevel
  bloomId         String   // Rim glow + ambient shadow
  textureId       String   // Texture type + scratches + pixels
  lightingId      String   // Lighting angle + badge effects
  generatedLogoId String?  // Link to GeneratedLogo
  createdAt       DateTime
}
```

## API Integration

### Generate Flow

```
User clicks "⚡ Forge 80s Logo"
  ↓
createLogoResult() calls requestAndConsumeDemoSeed()
  ↓
POST /api/demo/seed → returns seed from pool (429 if exhausted)
  ↓
generateLogo(seed) → LogoResult
  ↓
persistGeneratedLogo() uploads image, saves to DB
  ↓
storeDemoLogoStyle(seed, result, logoId) saves style fingerprint
  ↓
✅ Logo + style saved
```

### Exhaustion Message

If all 5000 seeds consumed:

```
Status: 429 Too Many Requests
Message: "The 80s Forge has exhausted its unreleased seeds."

UI displays: Red error toast with above message
```

## Code Changes Summary

### Files Modified

1. **prisma/schema.prisma**
   - Added DemoLogoStyle model with 7 style fields + indices

2. **prisma/migrations/add_demo_logo_style/migration.sql**
   - CREATE TABLE DemoLogoStyle
   - Two indices: on seed and createdAt

3. **components/LogoGenerator.tsx**
   - Updated button to "⚡ Forge 80s Logo" in demo mode
   - Button shows "FORGING 80s..." while generating
   - Added tooltip: "This uses unreleased 80s seeds..."
   - Seed input already hidden in demo mode
   - Preset selector already hidden in demo mode (shows locked message)
   - Added storeDemoLogoStyle() call in persistGeneratedLogo()
   - Imported demoLogoStyleManager

### Files Created

1. **lib/demoLogoStyleManager.ts**
   - `extractStyleFingerprint()` — maps config to 7 IDs
   - `storeDemoLogoStyle()` — saves to DB
   - `getDemoLogoStyle()` — retrieve by seed
   - `getUserDemoLogoStyles()` — batch retrieve
   - `getDemoLogoStyleStats()` — analytics

2. **DEMO_LOGO_STYLES.md**
   - Full technical documentation
   - Style ID format examples
   - Integration guide
   - Analytics examples

## Style Fingerprint Examples

### Common Logo

```
paletteId:   "COMMON-palette-8"
gradientId:  "gradient-none-disabled"
glowId:      "glow-0-0-none"
chromeId:    "chrome-standard-bevel-0"
bloomId:     "bloom-rim-0-ambient-0"
textureId:   "texture-none-scratch-0-pixel-5"
lightingId:  "light-angle-0-badge-none-rot-0"
```

### Legendary Logo

```
paletteId:   "LEGENDARY-palette-24"
gradientId:  "gradient-radial-enabled"
glowId:      "glow-5-3-corner"
chromeId:    "chrome-metallic-bevel-3"
bloomId:     "bloom-rim-85-ambient-60"
textureId:   "texture-stars-scratch-40-pixel-20"
lightingId:  "light-angle-45-badge-glow-rot-8"
```

## Testing

### Manual Test

1. Start dev server: `npm run dev`
2. Visit http://localhost:3000
3. Observe:
   - Button text: "⚡ Forge 80s Logo" ✓
   - Seed input: hidden ✓
   - Presets: locked message ✓
   - Tooltip: "This uses unreleased 80s seeds..." ✓
4. Click button → "FORGING 80s..." ✓
5. After generation → style saved to DB ✓

### Database Check

```bash
# View stored styles
SELECT seed, paletteId, glowId FROM "DemoLogoStyle" LIMIT 5;

# Count by palette
SELECT paletteId, COUNT(*) FROM "DemoLogoStyle" GROUP BY paletteId;
```

## Deployment

1. ✅ Run migration: `npx prisma migrate deploy`
2. ✅ Regenerate Prisma client: (automatic with migration)
3. ✅ Deploy code to production
4. Test: Generate demo logo → verify style stored

## Rollback

If needed, rollback button text:

```typescript
// Temporary: Revert to "FORGE"
{IS_DEMO_MODE ? "FORGING 80s..." : "FORGING..."}
  →
"FORGING..."
```

Style storage is non-blocking (fire-and-forget), so disabling it doesn't break anything:

```typescript
// Remove this line from persistGeneratedLogo()
void storeDemoLogoStyle(seedString, result, data.entry.id);
```

## Files to Review

- [components/LogoGenerator.tsx](components/LogoGenerator.tsx#L1451) — Button + style storage
- [lib/demoLogoStyleManager.ts](lib/demoLogoStyleManager.ts) — Style extraction logic
- [DEMO_LOGO_STYLES.md](DEMO_LOGO_STYLES.md) — Full technical reference
- [prisma/schema.prisma](prisma/schema.prisma#L180) — DemoLogoStyle model

---

**Status:** ✅ Ready for deployment
