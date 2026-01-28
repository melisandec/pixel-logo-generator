# Demo Mode: 80s Exclusive Forge Branch Setup

## Overview

Created a special `demo` branch with a limited-edition 80s Synthwave exclusive version of Pixel Logo Forge.

## Key Files Created

- **[lib/demoMode.ts](lib/demoMode.ts)** – Global demo mode constants and configuration

## Global Constants

- `IS_DEMO_MODE = true` – Master flag to enable all demo restrictions
- `DEMO_MODE_LABEL = "🟣 DEMO MODE – 80s EXCLUSIVE FORGE"` – UI label
- `DEMO_PRESET_KEY = "demo-80s-exclusive"` – Locked preset identifier
- `DEMO_EXCLUSIVE_SEEDS` – Array of 8 unreleased curated seeds (1983–1989)
- `DEMO_PRESET_CONFIG` – Hardcoded Vaporwave/neon chrome aesthetic

## Demo Mode Features

### UI & Preset Behavior

✅ Header subtitle replaced with `DEMO_MODE_LABEL`  
✅ UI mode locked to **Advanced** (no Simple/Advanced toggle)  
✅ Mode toggle replaced with neon purple demo badge  
✅ Preset selector locked to exclusive config (no selection UI)  
✅ Seed input field completely hidden

### Generation Logic

✅ All logos forced to exclusive **Vaporwave** + **cyber-neon** depth  
✅ Neon outline, chrome glow, arcade marquee effects always enabled  
✅ All artifacts get **LEGENDARY** rarity treatment  
✅ Random seed selection pulls only from `DEMO_EXCLUSIVE_SEEDS`  
✅ Custom seed input ignored; seeds resolved from curated vault  
✅ Seed preservation: if already in exclusive set, kept as-is  
✅ Gallery entries inherit demo preset when opened

### Daily Limits

✅ Respects existing daily generation limits (3 per day)  
✅ Seed-per-day limit bypassed (no user input)  
✅ User still sees daily limits in UI

### How It Works Modal

✅ Updated copy to reflect demo constraints  
✅ Explains neon 80s lock-in  
✅ Clarifies unreleased vault seeds  
✅ Notes daily limits still apply

## Implementation Details

### Controlled Seed Resolution

The `resolveDemoSeed()` function intelligently handles seeds:

- If value is already in `DEMO_EXCLUSIVE_SEEDS`, return as-is
- Otherwise, map to nearest exclusive seed using modulo math
- If no value, pick a random exclusive seed

### Safe Config Spreading

Preset configs are cloned (deep copy) before generation to avoid mutations:

- `textEffects` object cloned
- `depthConfig` and `colorShades` array cloned
- `badges` array cloned
- Safe spread with nullish coalescing (`...presetConfigCopy ?? {}`)

### Branch Strategy

- Created on `refactor/component-decomposition` branch context
- Named `demo` for special edition visibility
- All changes scoped to demo mode flag—safe merge with `main` later

## Testing the Demo

1. Checkout `demo` branch
2. Set `IS_DEMO_MODE = true` in [lib/demoMode.ts](lib/demoMode.ts)
3. Run `npm run dev`
4. Visit http://localhost:3000
5. Observe:
   - Header shows "🟣 DEMO MODE – 80s EXCLUSIVE FORGE"
   - UI locked to advanced mode
   - Neon purple demo badge in place of mode toggle
   - Preset section locked with message
   - Seed input hidden
   - All generated logos feature vaporwave neon chrome

## Future: Disable Demo Mode

Simply change [lib/demoMode.ts](lib/demoMode.ts):

```ts
export const IS_DEMO_MODE = false;
```

All restrictions lift, UI returns to normal.
