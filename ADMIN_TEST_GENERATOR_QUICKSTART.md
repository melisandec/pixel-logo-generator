# Admin Test Generator - Quick Start

## What Was Built

A three-phase admin debugging tool for testing unlimited logo generation and diagnosing why 80s demo logos appear to only generate "legendary" style instead of distinctive neon styling.

## Status: Phase 1 Complete ✅

### Phase 1 (Complete)

- Admin dashboard at `/admin/test-generator`
- Unlimited logo generation (no rate limits)
- Mode selector (Normal | 80s Demo)
- Text input + seed control
- Live logo preview with metadata
- Debug information panel showing:
  - Render time (ms)
  - Total time (ms)
  - Seed used
  - Whether demo style was found
  - Whether SVG filters were generated
- Generation history (last 50)

### Phase 2 (Built, Not Integrated)

- Advanced styling form component
- Color system selector
- Background style dropdown
- Composition mode selector
- Ready to integrate for full control

### Phase 3 (Built, Not Integrated)

- Side-by-side comparison view
- History panel with clickable records
- Ready for visual debugging

## How to Use

### 1. Access Admin Dashboard

```
http://localhost:3001/admin/test-generator
```

### 2. Test a Logo

- Select mode (Normal or 80s Demo)
- Enter text (e.g., "LOGO")
- Click "Generate Logo"
- View debug info to see if demo styling was applied

### 3. Debug the 80s Issue

Check the debug info for:

- `hasDemoStyle: true` - Was the demo style found in DB?
- `hasFilters: true` - Were SVG filters generated?

If both are `true` but logo looks normal, the problem is CSS/SVG rendering, not data retrieval.

## API Endpoints

### POST /api/admin/test-logo (Unlimited Generation)

```bash
curl -X POST http://localhost:3001/api/admin/test-logo \
  -H "x-admin-user: ladymel" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "LOGO",
    "seed": 1234567890,
    "mode": "demo"
  }'
```

Returns: Logo image, seed, rarity, debug info, demo style, SVG filters

### GET /api/admin/styling-presets (Available Options)

```bash
curl http://localhost:3001/api/admin/styling-presets \
  -H "x-admin-user: ladymel"
```

Returns: Color systems, background styles, composition modes, presets

## Files Created

### Main Dashboard

- `app/admin/test-generator/page.tsx` - Main dashboard (~200 lines)

### Components

- `app/admin/test-generator/components/ModeSelector.tsx`
- `app/admin/test-generator/components/TextInputForm.tsx`
- `app/admin/test-generator/components/SeedControl.tsx`
- `app/admin/test-generator/components/LogoPreview.tsx`
- `app/admin/test-generator/components/DebugInfo.tsx`
- `app/admin/test-generator/components/StylingForm.tsx` (Phase 2)
- `app/admin/test-generator/components/ComparisonView.tsx` (Phase 3)
- `app/admin/test-generator/components/HistoryPanel.tsx` (Phase 3)

### State Management

- `app/admin/test-generator/hooks/useTestGenerator.ts` - Full state + API calls

### API Routes

- `app/api/admin/test-logo/route.ts` - Unlimited generation endpoint
- `app/api/admin/styling-presets/route.ts` - Styling options reference
- `app/admin/page.tsx` - Redirect to test-generator

## Debug Workflow

1. **Generate demo logo** → Check `hasDemoStyle` in debug info
2. **If true** → Demo style DB record exists
3. **Generate normal logo with same seed** → Compare visually
4. **If different** → Styling works correctly
5. **If same** → Problem is CSS/SVG filter application

## Test Cases

### Test 1: Demo Style Retrieval

```
Mode: Demo
Text: "TEST"
Expected: hasDemoStyle: true, hasFilters: true
```

### Test 2: Same Seed Comparison

```
1. Generate with seed 123456 in Normal mode → Note appearance
2. Generate with seed 123456 in Demo mode → Should look different
3. If identical → Styling not being applied
```

### Test 3: History Tracking

```
1. Generate multiple logos
2. Check history panel shows all
3. Click history item → Should restore that generation
```

## Next Steps to Complete

### Phase 2 Integration (30 min)

1. Uncomment `StylingForm` import
2. Add to layout
3. Test styling controls update state

### Phase 3 Integration (30 min)

1. Add comparison view
2. Add history panel
3. Test side-by-side comparison

### Full Setup (1 hour)

Integrate all three phases for complete debugging dashboard.

## Performance

Expected response times:

- **Render**: 30-60ms
- **Total**: 40-75ms
- **API**: <100ms

Investigate if exceeding these by checking database performance.

## Admin Auth

Protected via header:

```
x-admin-user: ladymel
```

Future: Move to session-based auth.

## Files Modified

- `app/page.tsx` - Added demo button (already done in previous session)
- `app/demo/page.tsx` - Demo mode route (already done in previous session)
- `components/LogoGenerator.tsx` - Added demoMode prop (already done in previous session)
- `app/api/admin/test-logo/route.ts` - Fixed type casting for demo style

## Build Status

✅ **Compiles successfully**

- 0 TypeScript errors
- 3 lint warnings (Next.js Image component recommendations - non-blocking)
- All imports resolve correctly

## Running Locally

```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:3001/admin/test-generator

# Or run build
npm run build
```

---

See [ADMIN_TEST_GENERATOR.md](./ADMIN_TEST_GENERATOR.md) for detailed documentation.
