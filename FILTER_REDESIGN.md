# Pixel Logo Forge — Filter Bar Redesign

## Retro Arcade UX for Logo Discovery

---

## 1. Layout Structure

### Desktop Layout (≥1024px)

**Single horizontal bar** with all controls on one line:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔍 [Search field]    [Rarity Chips]   [Preset ▼]   [Quick Acts]  │
└──────────────────────────────────────────────────────────────────┘
```

**Dimensions & spacing:**

- Bar height: 56px (button-sized for touch)
- Padding: 16px horizontal, 12px vertical
- Gap between sections: 20px
- Left to right flow: Search → Rarity → Preset → Actions

### Mobile Layout (<1024px)

**Stacked sections** with full-width search:

```
[Search field - full width]
[Rarity Chips - scrollable row]
[Preset & Quick Actions - grid or wrapped row]
```

---

## 2. Component Architecture

### A. **FilterBar** (Container)

**Purpose:** Main horizontal container orchestrating layout  
**Props:**

- `onSearch: (query: string) => void`
- `onRarityChange: (rarity: string | null) => void`
- `onPresetChange: (preset: string | null) => void`
- `onAction: (action: 'random' | 'legendary' | 'surprise') => void`
- `activeFilters: { rarity?: string; preset?: string }`
- `resultCount: number`
- `totalFilters: number`

**Responsive class strategy:**

- Desktop: `flex flex-row items-center gap-5`
- Mobile: `flex flex-col gap-3`

---

### B. **SearchField** (Component)

**Purpose:** Primary text input for logo discovery  
**Props:**

- `onSearch: (query: string) => void`
- `placeholder?: string` (default: "Search by name, creator, or seed")
- `onEnter?: () => void`

**Features:**

- Label (visible, small): "Search logos"
- Text input with rounded corners
- Neon green border (2px) on focus
- Icon: magnifying glass (left side, 16px)
- Clear button (×) appears when text is present
- **Hover state:** Border glow effect (box-shadow with #00FF00 @ 50% opacity)
- **Focus state:** Bright glow, text cursor visible

**Copy:**

```
Label: "Search logos"
Placeholder: "Search by name, creator, or seed"
```

---

### C. **RarityControl** (Component)

**Purpose:** Filter by logo rarity level  
**Type:** Segmented control (chip-like buttons)  
**Props:**

- `selected: string | null` (value: 'all', 'common', 'rare', 'legendary')
- `onChange: (value: string) => void`

**Options:**
| Chip | Value | Icon | Badge Style (Small CAPS) |
|------|-------|------|--------------------------|
| ⭐ All | `null` | Star outline | (no badge shown) |
| Common | `'common'` | (no icon) | `COMMON` |
| Rare | `'rare'` | (no icon) | `RARE` |
| Legendary | `'legendary'` | (no icon) | `LEGENDARY` |

**Styling:**

- Unselected: Dark gray background, neon green text
- Selected: Neon green background, black text, outer glow (neon green box-shadow 0 0 8px #00FF00)
- Hover (unselected): Slight brightness increase
- Padding: 8px 16px per chip
- Border-radius: 4px (slightly retro)
- Font: TitleCase

---

### D. **PresetControl** (Component)

**Purpose:** Filter by logo generation preset  
**Type:** Dropdown select  
**Props:**

- `selected: string | null`
- `onChange: (value: string) => void`
- `options: Array<{ value: string; label: string }>`

**Dropdown trigger button:**

- Label: "Preset" (always visible)
- Icon: dropdown arrow (▼) or small joystick/palette icon
- Height: 40px
- Styling: Neon green border, black background, TitleCase label
- **Selected state:** Glow effect + label shows current selection if mobile-optimized

**Copy:**

```
Label: "Preset"
Trigger text: "Preset (All)" or "Preset: [Name]" when selected
```

---

### E. **QuickActions** (Component)

**Purpose:** One-click buttons for common discovery patterns  
**Props:**

- `onRandom: () => void`
- `onRandomLegendary: () => void`
- `onSurpriseMe: () => void`

**Buttons (3 total):**
| Button | Label | Icon | Action |
|--------|-------|------|--------|
| Random | "Random" | 🎲 | Fetch random logo |
| Legendary | "Random Legendary" | 🎲✨ | Fetch random legendary |
| Surprise | "Surprise Me" | 🎪 or ❓ | Random with preset variety |

**Styling:**

- Background: Black with neon green border (1px)
- Text: Neon green
- Height: 40px
- Padding: 8px 16px
- **Hover state:** Brighter glow (box-shadow 0 0 6px #00FF00), slightly larger scale (1.02)
- **Active state:** Solid neon green background, black text

**Responsive:**

- Desktop: Horizontal row (gap: 8px)
- Mobile: May wrap or condense; consider reducing to icons only below 600px

---

### F. **ActiveFilterPills** (Component)

**Purpose:** Show active filters as removable pills  
**Props:**

- `filters: Array<{ label: string; value: string; onRemove: () => void }>`
- `onClearAll: () => void`

**Display format:**

```
[Rarity: Rare ✕]  [Preset: Neon ✕]     Clear all
```

**Styling per pill:**

- Background: Dark gray (fade-in animation)
- Border: 1px neon green
- Text: Neon green, small (12px–14px)
- Icon (✕): Right-aligned, clickable, cursor: pointer
- **Hover state:** Brighter border, slight scale increase

**"Clear all" link:**

- Text color: Neon green
- Underline: On hover
- Cursor: pointer
- Font-size: 12px

**Visibility:**

- Show only when filters are active
- Position: Below the main filter bar, left-aligned

---

### G. **ResultCount** (Component)

**Purpose:** Feedback on filter results  
**Props:**

- `count: number`
- `totalFilters: number`
- `hasFilters: boolean`

**Display format:**

```
"17 logos  ·  2 filters active"
or
"42 logos"
```

**Styling:**

- Font-size: 13px
- Color: Neon green (#00FF00) with 70% opacity (for subtlety)
- Position: Next to or below active filter pills
- Inline with "Clear all" button

---

### H. **EmptyState** (Component)

**Purpose:** Graceful fallback when filters match no logos  
**Props:**

- `onClearFilters: () => void`
- `onTryRandom: () => void`

**Layout (centered):**

```
   ╔═══════════════════════════╗
   ║                           ║
   ║   🎮 Game Over! 🎮       ║
   ║                           ║
   ║ No logos match these      ║
   ║ filters.                  ║
   ║                           ║
   ║ Try adjusting rarity or   ║
   ║ preset, or start fresh.   ║
   ║                           ║
   ║ [Clear Filters] [Random]  ║
   ║                           ║
   ╚═══════════════════════════╝
```

**Elements:**

1. **Icon/Emoji:** Arcade-style (🎮, 👾, or pixel art equivalent)
2. **Headline:** "Game Over! No Logos Found" (or variant)
3. **Body:** "No logos match these filters. Try adjusting rarity or preset, or start fresh."
4. **Buttons:**
   - Primary: "Clear Filters" (solid neon green bg, black text)
   - Secondary: "Try Random" (neon green border, black bg)

**Styling:**

- Container: Black background, neon green border (2px)
- Text: Neon green
- Headline: Larger, bold (18px–20px)
- Body: 14px, slightly dimmed (#00FF00 @ 80% opacity)
- Buttons: 40px height, rounded corners, spacing 12px between

---

## 3. Copy & Labels (Retro Arcade Tone)

### Filter Labels & Placeholders

```yaml
SearchField:
  Label: "Search logos"
  Placeholder: "Search by name, creator, or seed"
  ClearButton: "✕"

RarityControl:
  Label: "Rarity"
  Options:
    - "⭐ All"
    - "Common"
    - "Rare"
    - "Legendary"

PresetControl:
  Label: "Preset"
  DefaultText: "(All)"

QuickActions:
  - Label: "Random"
    Tooltip: "Feel lucky? Grab a random logo."
  - Label: "Random Legendary"
    Tooltip: "Only the rarest of the rare."
  - Label: "Surprise Me"
    Tooltip: "Pick a preset at random. Live dangerously."

ActiveFilterPills:
  Format: "{Label}: {Value} ✕"
  ClearAllText: "Clear all"
  Example: "Rarity: Legendary ✕"

ResultCount:
  Format: "{count} logos  ·  {filters} filters active"
  NoFilters: "{count} logos"

EmptyState:
  Icon: "🎮" or "👾"
  Headline: "Game Over! No Logos Found"
  Body: "No logos match these filters. Try adjusting rarity or preset, or start fresh."
  Buttons:
    Primary: "Clear Filters"
    Secondary: "Try Random"
```

---

## 4. Visual Style & Micro-Interactions

### Color Palette

- **Background:** Pure black (`#000000`)
- **Neon Green:** `#00FF00` (primary interactive color)
- **Text (default):** Neon green (`#00FF00`)
- **Text (secondary):** Neon green @ 70% opacity (`rgba(0, 255, 0, 0.7)`)
- **Borders (inactive):** Neon green @ 50% opacity
- **Borders (active/hover):** Neon green @ 100% with glow

### Glow Effects

```css
/* Hover glow on buttons */
box-shadow:
  0 0 8px rgba(0, 255, 0, 0.5),
  inset 0 0 4px rgba(0, 255, 0, 0.2);

/* Active glow on filter chips */
box-shadow:
  0 0 12px rgba(0, 255, 0, 0.8),
  inset 0 0 6px rgba(0, 255, 0, 0.3);

/* Focus state on input */
box-shadow:
  0 0 16px rgba(0, 255, 0, 0.6),
  inset 0 0 4px rgba(0, 255, 0, 0.1);
```

### Hover & Focus States

- **Text inputs:** Border brightens, inner glow activates
- **Buttons & chips:** Slight upward movement (2px), glow intensifies
- **Interactive icons:** Rotate or pulse subtly (optional)
- **Pill close (✕):** Highlight on hover (bright neon)

### Animations

- **Filter change:** 200ms ease-out fade-in for pills
- **Result count update:** 300ms fade transition
- **Empty state:** 400ms ease-in-out slide-up
- **Button press:** 100ms scale pulse (1.0 → 1.05 → 1.0)

### Typography

- **Labels:** `TitleCase`, 12px–13px, semi-bold
- **Button text:** `TitleCase`, 14px, semi-bold
- **Placeholder:** `Sentence case`, 14px, italicized, 60% opacity
- **Rarity badges:** `SMALL CAPS`, 10px–11px, semi-bold (in gallery cards, not in filter bar)
- **Result count:** 13px, regular weight, 70% opacity

---

## 5. Responsive Design Breakpoints

### Desktop (≥1024px)

- All controls on single horizontal line
- Search field: ~300px width
- Rarity chips: Auto width (4 chips)
- Preset dropdown: 140px
- Quick action buttons: 3 × 140px
- Spacing: 20px between sections

### Tablet (768px–1023px)

- Search: Full width
- Filters row: Rarity + Preset on second line
- Actions: Wrapped or condensed (consider icon-only)
- Stacking with 12px gaps

### Mobile (<768px)

- Search: Full width
- Rarity chips: Horizontal scrollable container (16px left/right padding)
- Preset + Actions: Stack or wrap
- Icon-only buttons if space-constrained
- Touch targets: Minimum 44px × 44px

---

## 6. Component Implementation Checklist

### Components to Create/Update

- [ ] **FilterBar.tsx** — Main container (orchestrates all sub-components)
- [ ] **SearchField.tsx** — Text input with icon & clear button
- [ ] **RarityControl.tsx** — Segmented chips (All, Common, Rare, Legendary)
- [ ] **PresetControl.tsx** — Dropdown select
- [ ] **QuickActions.tsx** — Action buttons (Random, Legendary, Surprise)
- [ ] **ActiveFilterPills.tsx** — Removable filter pills + "Clear all" link
- [ ] **ResultCount.tsx** — Logo count & filter status text
- [ ] **EmptyState.tsx** — No-results fallback with buttons

### Integration Points

- [ ] Update `LogoGenerator.tsx` to render `FilterBar`
- [ ] Connect state management (URL params or React Context) for filter persistence
- [ ] Wire search/filter handlers to API endpoints
- [ ] Add accessibility: ARIA labels, keyboard navigation, focus outlines

---

## 7. Example Usage (Pseudo-code)

```tsx
<FilterBar
  onSearch={(query) => setSearchQuery(query)}
  onRarityChange={(rarity) => setRarityFilter(rarity)}
  onPresetChange={(preset) => setPresetFilter(preset)}
  onAction={(action) => handleQuickAction(action)}
  activeFilters={{ rarity: "legendary", preset: null }}
  resultCount={17}
  totalFilters={1}
/>;

{
  hasActiveFilters && (
    <ActiveFilterPills
      filters={[
        { label: "Rarity", value: "Legendary", onRemove: () => clearRarity() },
      ]}
      onClearAll={() => clearAllFilters()}
    />
  );
}

<ResultCount count={17} totalFilters={1} hasFilters={true} />;

{
  logos.length === 0 && (
    <EmptyState
      onClearFilters={() => clearAllFilters()}
      onTryRandom={() => handleQuickAction("random")}
    />
  );
}
```

---

## 8. Accessibility & Keyboard Navigation

- **Search field:** Tab-first control, Escape clears, Enter submits
- **Rarity chips:** Arrow keys cycle through options, Enter/Space selects
- **Preset dropdown:** Arrow keys open/navigate, Enter selects
- **Action buttons:** Tab-accessible, Space/Enter activates
- **Filter pills (✕):** Tab-accessible, Enter/Space removes
- **ARIA labels:** All buttons and icons have descriptive labels
- **Focus outline:** Visible neon green outline (2px) on all interactive elements

---

## Notes for Implementation

1. **Mobile-first approach:** Design base styles for mobile, layer desktop enhancements.
2. **State persistence:** Consider storing active filters in URL query params (e.g., `?rarity=rare&preset=neon`) for shareable links.
3. **Debounce search:** Delay API calls by 300ms while user types.
4. **Animations:** Keep under 400ms to feel snappy; avoid overwhelming neon flicker.
5. **Icons:** Use Unicode/emoji for quick deployment; consider sprite-based pixel art icons later.
6. **Dark mode:** Already dark; ensure green is bright enough for WCAG AA contrast (typically ≥4.5:1).

---

## Visual Reference Summary

```
═══════════════════════════════════════════════════════════════════
                    DESKTOP FILTER BAR
═══════════════════════════════════════════════════════════════════
│ 🔍 [Search by name, creator, or seed ____] │ ⭐All │ Rare │ Legendary │ [Preset ▼] │ [Random] [Random Leg.] [Surprise Me] │
═══════════════════════════════════════════════════════════════════

[Rarity: Legendary ✕]                            17 logos  ·  1 filter active     Clear all

═══════════════════════════════════════════════════════════════════
                    MOBILE FILTER BAR (Stacked)
═══════════════════════════════════════════════════════════════════
┌────────────────────────────────────────────────────────────────┐
│ 🔍 [Search by name, creator, or seed __________]               │
├────────────────────────────────────────────────────────────────┤
│ ⭐All  │ Common │ Rare │ Legendary  [Preset ▼]                 │
├────────────────────────────────────────────────────────────────┤
│ [Random] [Random Leg.] [Surprise Me]                           │
├────────────────────────────────────────────────────────────────┤
│ [Rarity: Legendary ✕]                  Clear all               │
│                                                                 │
│ 17 logos  ·  1 filter active                                   │
└────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                      EMPTY STATE
═══════════════════════════════════════════════════════════════════
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🎮 Game Over! 🎮                        │
│                                                                 │
│           No logos match these filters.                         │
│                                                                 │
│           Try adjusting rarity or preset, or                   │
│           start fresh.                                         │
│                                                                 │
│             [Clear Filters]    [Try Random]                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```
