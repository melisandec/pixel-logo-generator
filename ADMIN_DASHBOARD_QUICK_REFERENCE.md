# Admin Dashboard - Quick Reference Guide

## 🚀 Quick Start

### Access Dashboard

```
URL: http://localhost:3002/admin/test-generator
Header: x-admin-user: ladymel
Status: ✅ READY
```

### Start Dev Server

```bash
npm run dev
# Ready on http://localhost:3002
```

### Build & Verify

```bash
npm run build
# BUILD SUCCESSFUL (0 errors)
```

---

## 📍 File Locations

### Main Dashboard

- **Location**: `app/admin/test-generator/page.tsx`
- **Size**: 234 lines
- **Purpose**: Main UI and layout

### Styling System

- **Location**: `app/admin/styles/admin-dashboard.css`
- **Size**: 620 lines
- **Purpose**: All visual styling

### State Management

- **Location**: `app/admin/test-generator/hooks/useTestGenerator.ts`
- **Size**: 172 lines
- **Purpose**: Logo generation state

### API Endpoints

- **Location**: `app/api/admin/test-logo/route.ts`
- **Purpose**: Logo generation (unlimited)
- **Location**: `app/api/admin/styling-presets/route.ts`
- **Purpose**: Reference data

### Components (10 total)

```
app/admin/test-generator/components/
├── ModeSelector.tsx           (Mode toggle)
├── TextInputForm.tsx          (Text input)
├── SeedControl.tsx            (Seed management)
├── LogoPreview.tsx            (Display)
├── DebugInfo.tsx              (Metrics)
├── ConfigDisplay.tsx          (JSON fingerprint)
├── QuickComparisonButton.tsx  (One-click comparison)
├── StylingForm.tsx            (8 controls)
├── ComparisonView.tsx         (Side-by-side)
└── HistoryPanel.tsx           (History)
```

---

## 🎮 How to Use

### 1. Generate a Logo

1. Type text in "Logo Text" field
2. Click "Generate Logo"
3. See result in preview area

### 2. Test with Seed

1. Click "Randomize" or enter seed manually
2. Click "Generate Logo"
3. Same seed = same result

### 3. Switch Modes

1. Toggle between "Normal Mode" and "Demo Mode"
2. Click "Generate Logo"
3. See styling differences

### 4. Customize Styling

1. Adjust all 8 controls:
   - Color System dropdown
   - Glow Intensity slider
   - Chrome Style selector
   - Bloom Level slider
   - Texture selector
   - Lighting grid (9-point)
2. Click "Apply & Generate"
3. See custom result

### 5. Compare Modes

1. Click "Quick Comparison" button
2. Or click "Comparison" tab
3. See Normal and Demo side-by-side

### 6. Debug Issues

1. Open "Debug" tab
2. View:
   - Current preset
   - SVG filters (if demo)
   - Render time
   - Database status
3. Copy JSON config for analysis

### 7. Browse History

1. Scroll through "Generation History"
2. Click any entry to reload
3. Click "Clear History" to reset

---

## 🔧 Styling Controls Reference

### Color Systems

- **Vaporwave** - Purple/Cyan palette
- **Cyberpunk** - Neon/Electric
- **Pastel** - Soft colors
- **Neon** - Bright colors
- **Retro** - 80s aesthetic

### Chrome Styles

- **Glossy** - Shiny surface
- **Matte** - Flat finish
- **Metallic** - Silver-like
- **Mirror** - Reflective

### Textures

- **Smooth** - No texture
- **Rough** - Uneven surface
- **Grain** - Film grain effect
- **Fabric** - Woven pattern
- **Noise** - Random pattern

### Lighting Directions

```
NW  N  NE      (Top row)
W   C  E       (Middle row)
SW  S  SE      (Bottom row)
```

- Center = Direct light
- Corners = Angled light
- Edges = Side light

### Slider Values

- **Glow Intensity**: 0.0 (none) → 1.0 (maximum)
- **Bloom Level**: 0.0 (none) → 1.0 (maximum)

---

## 📊 Debug Information Explained

### Current Preset

Shows which preset is active:

- `null` = Custom config applied
- `"vaporwave"` = Preset name

### SVG Filters

Shows the actual filter definitions applied in Demo mode:

- Can copy for analysis
- Shows filter ID references
- Includes all blur, glow, color effects

### Render Time

Performance metric in milliseconds:

- Typical: 10-50ms
- Normal logos: Usually faster
- Demo logos with filters: Slightly slower

### Has Demo Style

Database indicator:

- ✅ `true` = Record found in database
- ❌ `false` = No record (problem!)

### Has Filters

Filter indicator:

- ✅ `true` = SVG filters applied
- ❌ `false` = No filters (demo should have them!)

---

## 🔍 Debugging Workflow

### Problem: Demo logos look like Normal logos

1. **Check Config**
   - Open ConfigDisplay
   - Verify styling values are non-default
   - Check hasDemoStyle = true

2. **Check Filters**
   - Open SVG Filter Definitions
   - Verify filters are present
   - Check hasFilters = true

3. **Compare Visually**
   - Click "Quick Comparison"
   - Look for glow/bloom differences
   - Check chrome appearance

4. **Check Seed Mapping**
   - Get seed from history
   - Generate with Demo mode
   - Verify database record matches

### Problem: Settings aren't being applied

1. Make sure to click **"Apply & Generate"** after adjusting controls
2. Check current preset (should be `null` for custom config)
3. Verify all values changed in JSON config

### Problem: History isn't saving

1. History is session-only (clears on page refresh)
2. Click "Clear History" and regenerate to refresh list
3. This is by design (no persistence needed)

---

## 🎨 CSS Classes Quick Reference

### Layout Classes

```
.admin-container      - Main container
.admin-header         - Header area
.admin-main-content   - Main content area
.admin-preview-column - Logo display area
.admin-controls       - Control sidebar
.admin-footer         - Footer area
```

### Component Classes

```
.admin-section        - Card container
.admin-button         - Button styling
.admin-input          - Input field
.admin-select         - Dropdown
.admin-slider         - Range slider
.admin-tabs           - Tab navigation
.admin-details        - Accordion/collapsible
.admin-code-block     - Code display
```

### Utility Classes

```
.admin-flex-center    - Center flex
.admin-gap-md         - Medium gap
.admin-mt-lg          - Margin top large
.admin-mb-xl          - Margin bottom extra large
.admin-text-cyan      - Cyan text
.admin-text-primary   - Primary text
```

---

## 🌍 Responsive Breakpoints

### Desktop (>1024px)

- Full sidebar on right
- Side-by-side layout
- All controls visible

### Tablet (640-1024px)

- Narrower sidebar
- Adjusted spacing
- Same layout structure

### Mobile (<640px)

- Full-width stacked layout
- Sidebar moves below preview
- Responsive grid adjustments

---

## ⚙️ Configuration

### Environment Variables

```
NEXT_PUBLIC_PORT=3002           # Dev server port
DATABASE_URL=postgresql://...   # Database connection
```

### API Response Structure

```json
{
  "image": "data:image/png;base64,..."
  "imageUrl": "blob:http://...",
  "config": {
    "text": "string",
    "seed": 123,
    "mode": "demo",
    "styling": {...}
  },
  "debugInfo": {
    "preset": null,
    "renderTime": 25,
    "hasDemoStyle": true,
    "hasFilters": true
  }
}
```

---

## 🔐 Authentication

### How It Works

- Checks `x-admin-user` header in request
- Value must be valid username
- Compared against configured admin list

### Test Header

```
x-admin-user: ladymel
```

### To Change

Edit in API routes:

```typescript
const adminUser = req.headers["x-admin-user"];
if (adminUser !== process.env.ADMIN_USERNAME) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 🐛 Troubleshooting

### Dashboard doesn't load

- Check server is running: `npm run dev`
- Verify port 3002 is available
- Clear browser cache
- Check dev tools for errors

### Generation fails

- Check API route is accessible
- Verify database connection
- Check browser console for errors
- Verify text isn't empty

### Comparison not working

- Make sure to generate in both modes first
- Check "Comparison" tab is active
- Try clicking "Quick Comparison" button

### Styling not applied

- Remember to click **"Apply & Generate"**
- Check JSON config shows your values
- Verify mode is correct
- Check browser console

### Performance issues

- Close other tabs
- Check system memory usage
- Try generating simpler text
- Check render time in DebugInfo

---

## 📈 Performance Metrics

### Expected Response Times

- **Normal logo**: 10-25ms
- **Demo logo**: 15-40ms
- **With custom styling**: 20-50ms

### Expected File Sizes

- **Page**: ~4.6 kB
- **Shared JS**: ~87.4 kB
- **Image output**: ~50-100 kB (base64)

---

## 🔄 Update Workflow

### After Database Schema Changes

1. Update `DemoLogoStyle` type
2. Update API query in `test-logo/route.ts`
3. Restart dev server
4. Verify in dashboard

### After Styling Changes

1. Update `logoGenerator.ts` logic
2. Test with dashboard
3. Verify both modes work
4. Check comparison looks right

---

## 🚨 Important Notes

### Session Data

- ⚠️ History clears on page refresh
- ⚠️ This is intentional (dev tool)
- Use browser DevTools to preserve session

### Rate Limiting

- Admin routes have **NO rate limiting**
- This is intentional for testing
- Production routes still rate-limited

### Styling Fingerprint

- JSON shows exact styling used
- Can be shared for debugging
- Helps identify config issues

---

## 📚 Additional Resources

### Files

- [Implementation Checklist](ADMIN_DASHBOARD_IMPLEMENTATION_CHECKLIST.md)
- [Final Summary](ADMIN_DASHBOARD_FINAL_SUMMARY.md)
- [Plan Verification](ADMIN_DASHBOARD_PLAN_VERIFICATION.md)
- [Status Report](ADMIN_DASHBOARD_STATUS.md)

### Code

- CSS: `app/admin/styles/admin-dashboard.css`
- Components: `app/admin/test-generator/components/`
- API: `app/api/admin/*/`

---

## ✅ Checklist Before Going Live

- [ ] Dev server running: `npm run dev`
- [ ] Dashboard loads: `http://localhost:3002/admin/test-generator`
- [ ] Can generate logos
- [ ] Can switch modes
- [ ] Can adjust styling
- [ ] Can view comparison
- [ ] Can see debug info
- [ ] Can browse history
- [ ] Build succeeds: `npm run build`
- [ ] No console errors (except hydration warning)

---

**Last Updated**: January 27, 2025  
**Status**: ✅ READY  
**Support**: Check documentation files above
