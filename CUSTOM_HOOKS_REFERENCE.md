# Custom Hooks Quick Reference

## useDemoMode Hook
**Location**: `lib/hooks/useDemoMode.ts`
**Purpose**: Manage demo mode seed logic and consumption

### Usage
```typescript
const demoModeHook = useDemoMode(userInfo?.username);

// Resolve a seed to demo range (100M-104,999)
const resolvedSeed = demoModeHook.resolveDemoSeed(seed);

// Get effective preset key (returns DEMO_PRESET_KEY if available)
const preset = demoModeHook.getEffectivePreset(normalPreset);

// Atomically consume a seed from the pool
const demoSeed = await demoModeHook.consumeDemoSeed();

// Access constants
const presetConfig = demoModeHook.DEMO_PRESET_CONFIG;
const presetKey = demoModeHook.DEMO_PRESET_KEY;
```

### Returns
```typescript
{
  resolveDemoSeed: (value?: number) => number,
  getEffectivePreset: (normalPreset?: string | null) => string,
  consumeDemoSeed: () => Promise<string | null>,
  DEMO_PRESET_CONFIG: PresetConfig,
  DEMO_PRESET_KEY: string,
}
```

---

## useFilterState Hook
**Location**: `lib/hooks/useFilterState.ts`
**Purpose**: Manage gallery filter and search state

### Usage
```typescript
const filterStateHook = useFilterState();

// Get/set rarity filter
if (filterStateHook.galleryRarityFilter === "RARE") {
  // Filter is active
}
filterStateHook.setGalleryRarityFilter("all");

// Get/set search query
const query = filterStateHook.gallerySearchQuery;
filterStateHook.setGallerySearchQuery("new query");

// Use callback methods
filterStateHook.handleRarityChange(rarity);
filterStateHook.handleSearchChange(query);
filterStateHook.handleClearFilters();

// Get filter statistics
const activeCount = filterStateHook.getActiveFilterCount();

// Manage result count
filterStateHook.setFilteredResultCount(42);
const count = filterStateHook.filteredResultCount;
```

### Returns
```typescript
{
  galleryRarityFilter: string,
  setGalleryRarityFilter: (rarity: string) => void,
  gallerySearchQuery: string,
  setGallerySearchQuery: (query: string) => void,
  filteredResultCount: number,
  setFilteredResultCount: (count: number) => void,
  handleRarityChange: (rarity: string | null) => void,
  handleSearchChange: (query: string) => void,
  handleClearFilters: () => void,
  getActiveFilterCount: () => number,
}
```

---

## Integration in Components

### LogoGenerator.tsx Pattern
```typescript
export default function LogoGenerator() {
  // ... other state ...
  const [userInfo, setUserInfo] = useState<{ fid?: number; username?: string } | null>(null);
  
  // Initialize hooks AFTER userInfo declaration
  const demoModeHook = useDemoMode(userInfo?.username);
  const filterStateHook = useFilterState();
  
  // ... rest of component ...
}
```

### Using Demo Mode Hook
```typescript
const createLogoResult = useCallback(
  async (text: string, seed?: number, presetKey?: string | null) => {
    // Resolve seed to demo range if needed
    let seedToUse = demoMode ? demoModeHook.resolveDemoSeed(seed) : seed;
    
    // Consume seed from pool in demo mode
    if (demoMode) {
      const demoSeed = await demoModeHook.consumeDemoSeed();
      if (demoSeed) {
        seedToUse = stringToSeed(demoSeed);
      } else {
        throw new Error("Demo seed pool exhausted");
      }
    }
    
    // Generate logo with resolved seed
    return generateLogo({ text, seed: seedToUse, ... });
  },
  [demoModeHook, userInfo?.username],
);
```

### Using Filter State Hook
```typescript
const handleRarityFilter = (rarity: string) => {
  filterStateHook.handleRarityChange(rarity);
  setGalleryPage(1); // Reset pagination
};

const handleClearAllFilters = () => {
  filterStateHook.handleClearFilters();
  setGalleryPage(1);
};

// Use in FilterBar component
<FilterBar
  onRarityChange={handleRarityFilter}
  onClearFilters={handleClearAllFilters}
  resultCount={filteredEntries.length}
  totalFilters={filterStateHook.getActiveFilterCount()}
/>
```

### Filtering Gallery Entries
```typescript
const filteredGalleryEntries = galleryEntries.filter((entry) => {
  const rarityValue = entry.rarity ? String(entry.rarity).toUpperCase() : "UNKNOWN";
  const matchesRarity =
    filterStateHook.galleryRarityFilter === "all" ||
    (filterStateHook.galleryRarityFilter === "Unknown"
      ? rarityValue === "UNKNOWN"
      : rarityValue === filterStateHook.galleryRarityFilter);
  return matchesRarity;
});
```

---

## Migration Checklist

If you're using these hooks in a new component:

- [ ] Import the hook: `import { useDemoMode } from "@/lib/hooks/useDemoMode";`
- [ ] Import the hook: `import { useFilterState } from "@/lib/hooks/useFilterState";`
- [ ] Initialize userInfo state BEFORE hooks (if using useDemoMode)
- [ ] Initialize hooks after userInfo: `const demoModeHook = useDemoMode(userInfo?.username);`
- [ ] Replace all `resolveDemoSeed()` calls with `demoModeHook.resolveDemoSeed()`
- [ ] Replace all `requestAndConsumeDemoSeed()` calls with `demoModeHook.consumeDemoSeed()`
- [ ] Replace all `setGalleryRarityFilter()` calls with `filterStateHook.handleRarityChange()`
- [ ] Replace all `galleryRarityFilter` references with `filterStateHook.galleryRarityFilter`
- [ ] Add hooks to useCallback dependencies: `[demoModeHook, ...]` and `[filterStateHook, ...]`
- [ ] Test demo mode: Create logos in demo, verify seeds consumed
- [ ] Test filters: Filter by rarity, verify results update
- [ ] Run build: `npm run build` to verify TypeScript compilation
- [ ] Test routes: Verify /api/* and /demo routes still work

---

## Common Patterns

### Pattern 1: Conditional Demo Mode Logic
```typescript
const seedToUse = demoMode
  ? demoModeHook.resolveDemoSeed()
  : Math.floor(Math.random() * 2147483647);
```

### Pattern 2: Error Handling for Seed Pool
```typescript
try {
  const demoSeed = await demoModeHook.consumeDemoSeed();
  if (!demoSeed) throw new Error("Pool exhausted");
  seedToUse = stringToSeed(demoSeed);
} catch (error) {
  showToast("Demo forge unavailable", "error");
  throw error;
}
```

### Pattern 3: Filter State in JSX
```typescript
<div>
  {filterStateHook.getActiveFilterCount() > 0 && (
    <button onClick={() => filterStateHook.handleClearFilters()}>
      Clear {filterStateHook.getActiveFilterCount()} filters
    </button>
  )}
</div>
```

### Pattern 4: Reactive Dependencies
```typescript
useEffect(() => {
  // Re-run when username changes and affects seed consumption
}, [demoModeHook, userInfo?.username]);
```

---

## Troubleshooting

**Q: "Hook initialization failed" error**
A: Check that userInfo state is declared BEFORE hook initialization.

**Q: Demo seed not consuming**
A: Ensure `demoModeHook.consumeDemoSeed()` is called (not `requestAndConsumeDemoSeed()`).

**Q: Filters not updating**
A: Verify `filterStateHook.galleryRarityFilter` is used (not local `galleryRarityFilter`).

**Q: TypeScript errors about missing dependencies**
A: Add `demoModeHook` and `filterStateHook` to useCallback dependency arrays.

**Q: Build fails with "Cannot find name"**
A: Check that you're importing and initializing the hooks in your component.

---

Last Updated: January 28, 2026
