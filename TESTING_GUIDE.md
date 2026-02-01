# Testing Guide: Demo Mode Fixes

## Quick Start

The following 5 fixes have been implemented in demo mode. This guide helps you verify each one works correctly.

---

## Test 1: Deterministic Seed Styles

**Goal**: Verify that the same seed always produces the exact same visual style

### Steps

1. Navigate to `http://localhost:3000/demo`
2. Enter text: `"pixel"`
3. Click "Generate" and wait for logo to render
4. Note the seed displayed (e.g., `12345678`)
5. Note the visual style: colors, gradient direction, glow type, chrome effect, bloom amount
6. Refresh the page (don't clear logs)
7. Enter text: `"different"` and use **same seed** (12345678)
8. Click "Generate"

### Expected Result

✅ The visual style should be **exactly identical** even though the text is different:

- Same color palette (e.g., neonPinkBlue)
- Same gradient direction (e.g., horizontal)
- Same glow effect (e.g., hardNeon)
- Same chrome (e.g., mirrorChrome)
- Same bloom intensity
- Same texture pattern
- Same lighting angle

### Why This Matters

With deterministic fingerprints, users can share seeds and always get the same exclusive visual style in demo mode.

**Check Database**:

```sql
SELECT seed, palette, gradient, glow, chrome, bloom, texture, lighting
FROM "DemoLogoStyle"
WHERE seed = '12345678';
```

Should see same values each time seed 12345678 is used.

---

## Test 2: Seed Consumption & Atomicity

**Goal**: Verify seeds are consumed from the pool atomically

### Steps

1. Open browser DevTools → Console
2. Navigate to `/demo`
3. Check browser console for logs: `[LogoGenerator] Requesting demo seed`
4. Generate a logo with any text
5. Check browser console for: `[LogoGenerator] Demo seed response: [hex-string]`
6. Check browser console for: `[LogoGenerator] Converted demo seed: [hex] to: [number]`

### Expected Result

✅ You should see in order:

```
[LogoGenerator] Requesting demo seed for user: yourname
[LogoGenerator] Demo seed response: a1b2c3d4... type: string
[LogoGenerator] Converted demo seed: a1b2c3d4... to: 123456789
[LogoGenerator] About to generate logo with seed: 123456789
```

### Database Check

```sql
SELECT COUNT(*) as total_seeds,
       COUNT(*) FILTER (WHERE used = false) as available,
       COUNT(*) FILTER (WHERE used = true) as consumed
FROM "DemoSeedPool";
```

After each generation, `available` count should decrease by 1.

---

## Test 3: Style Storage Completion

**Goal**: Verify style fingerprints are stored when generation completes

### Steps

1. Open DevTools → Console
2. Generate a logo in `/demo`
3. Check server logs for: `[storeLogoDemoStyle] Stored demo style for seed`
4. Check browser console for: `[LogoGenerator] Demo style stored successfully`

### Expected Result

✅ Both messages appear (server-side and client-side)

### Database Check

```sql
SELECT id, seed, palette, gradient, glow, chrome, bloom, texture, lighting, "createdAt"
FROM "DemoLogoStyle"
ORDER BY "createdAt" DESC
LIMIT 1;
```

Should show fresh entry with all 7 style columns populated.

---

## Test 4: Rate Limiting Without Seed Waste

**Goal**: Verify rate limit is checked BEFORE seed consumption

### Steps

1. Navigate to `/demo`
2. Generate a logo (wait for it to complete)
3. Immediately try to generate again
4. Should see toast: `"Demo forge available in Xs (1 try every 5 minutes)"`
5. Check database seed count

### Expected Result

✅ Error message appears immediately  
✅ Seed is NOT consumed (check `DemoSeedPool` usage)  
✅ Second generation fails without wasting a seed

### Verify in Database

```sql
SELECT COUNT(*) FILTER (WHERE used = true) as just_used_seeds
FROM "DemoSeedPool"
WHERE "usedAt" > NOW() - INTERVAL '1 minute';
```

Should show only 1 seed from first generation (not 2).

---

## Test 5: Same Database, Different Modes

**Goal**: Verify both normal and demo modes store to same database

### Steps

1. Generate logo in `/demo` with text `"test"`
2. Note the seed (e.g., 100001234 - demo range)
3. Navigate to `/` (normal mode)
4. Generate logo with text `"another"`
5. Note the seed (e.g., 987654 - normal range)
6. Both should appear in `GeneratedLogo` table

### Expected Result

✅ Both logos in same table with different seeds

### Database Check

```sql
SELECT id, text, seed, "presetKey", "createdAt"
FROM "GeneratedLogo"
ORDER BY "createdAt" DESC
LIMIT 10;
```

Should show:

- Demo logos with seed range 100_000_000+
- Normal logos with seed range < 100_000_000
- Both with their respective `presetKey` values

---

## Test 6: Regenerate from Seed (Determinism Proof)

**Goal**: Prove same seed always produces same style

### Steps

1. In `/demo`, generate `"hello"` and get seed `S1`
2. Take screenshot of visual style
3. Generate `"world"` with seed `S1` manually (if supported)
4. Take screenshot

### Expected Result

✅ Identical visual styles despite different text

**OR check database**:

```sql
-- Get a recent demo seed
SELECT seed FROM "DemoLogoStyle"
ORDER BY "createdAt" DESC LIMIT 1;

-- Should match the fingerprint
SELECT palette, gradient, glow, chrome, bloom, texture, lighting
FROM "DemoLogoStyle"
WHERE seed = '[above-seed]';

-- Generate again with same seed and text
-- Visual output should be identical
```

---

## Troubleshooting

### Issue: Rate limit not working

**Check**:

```sql
SELECT * FROM "DemoSeedPool" WHERE "usedAt" > NOW() - INTERVAL '5 minutes';
```

If multiple seeds used recently, rate limit logic may have issues.

### Issue: Styles not deterministic

**Check**:

```sql
SELECT seed, palette, gradient, glow, chrome, bloom, texture, lighting
FROM "DemoLogoStyle"
WHERE seed = '[your-seed]'
ORDER BY "createdAt" DESC
LIMIT 5;
```

If multiple rows have different styles for same seed, deterministic function failing.

### Issue: Seeds being wasted

**Check**:

```sql
SELECT COUNT(*) FROM "DemoSeedPool" WHERE used = false;
```

If dropping too fast, rate limit may not be working correctly.

### Issue: Storage not completing

**Check server logs** for:

```
Failed to store demo logo style: [error message]
```

If errors appear, database connection or Prisma issue.

---

## Performance Expectations

- **Seed consumption**: < 100ms (database transaction)
- **Fingerprint generation**: < 1ms (simple LCG algorithm)
- **Style storage**: < 500ms (database insert)
- **Total generation time**: ~2-3 seconds (canvas rendering dominates)

---

## Success Criteria

All tests pass when:

- ✅ Same seed = same visual style always
- ✅ Seeds consumed atomically (one per generation)
- ✅ Style storage completes before response
- ✅ Rate limit blocks before seed waste
- ✅ Both demo and normal modes share same database
- ✅ Error handling graceful (no crashes)
- ✅ Logs show proper flow through system

---

## Files to Monitor During Testing

1. **Browser Console**: `[LogoGenerator]` logs
2. **Server Logs**: `[storeLogoDemoStyle]` logs
3. **Database Tables**:
   - `DemoSeedPool` - seed consumption
   - `DemoLogoStyle` - style fingerprints
   - `GeneratedLogo` - final storage

---

**Ready to test!** 🚀
