# LogoGenerator.tsx Refactoring Guide

## Overview

This refactoring decomposes the 6,008-line `LogoGenerator.tsx` monolith into a maintainable, testable architecture with **zero visual or functional changes**.

**Target**: Reduce main component to ~500 lines; move business logic to reusable hooks and utilities.

---

## Architecture Layers

### 1. State Management (Hooks)
Located in `hooks/` directory:

- **`useGeneratorState.ts`** - Core generation: text, seed, logo result, entry ID, loading states
- **`useUIState.ts`** - UI: toasts, modals, moments, sound, mobile detection, preferences
- **`useSeedCrackAnimation.ts`** - Animation state: stage, rarity, variance values
- **`useFarcasterSDK.ts`** - Farcaster: SDK readiness, user info, cast preview, auto-reply
- **`useLeaderboardData.ts`** - Data: leaderboard entries, gallery, profile, filters
- **`useChallengeSystem.ts`** - Challenges: prompts, progress, streak, history
- **`useRewardTracking.ts`** - Badges: earned rewards, registry, animations, trends

**Import example**:
```tsx
import { useGeneratorState, useUIState, useFarcasterSDK } from "@/hooks";

export default function LogoGenerator() {
  const generator = useGeneratorState();
  const ui = useUIState();
  const farcaster = useFarcasterSDK();
  // ... rest of component
}
```

### 2. API & Persistence Layer
Located in `lib/` directory:

- **`apiClient.ts`** - Grouped API calls by domain (leaderboard, gallery, user, badges, challenges)
  - `leaderboardAPI.getLeaderboard()`, `.likeEntry()`, `.trackView()`
  - `galleryAPI.getGallery()`, `.search()`, `.createEntry()`
  - `userAPI.getUserStats()`, `.getUserProfile()`, `.getUserBadges()`
  - `badgeAPI.awardBadge()`, `challengeAPI.trackChallenge()`, etc.

- **`storageManager.ts`** - localStorage operations grouped by concern
  - `historyStorage`, `favoritesStorage`, `dailyLimitStorage`
  - `challengeStorage`, `preferencesStorage`, `progressStorage`
  - `identityStorage`, `cacheStorage`
  
  Usage:
  ```tsx
  import { historyStorage, favoritesStorage } from "@/lib/storageManager";
  
  const history = historyStorage.getHistory();
  favoritesStorage.addToFavorites(logoId);
  ```

- **`audioSystem.ts`** - Sound effects via Web Audio API
  - `playCrackSound()`, `playBloomSound()`, `playTicketSound()`, `playBeepSound()`

- **`seedCrackAnimation.ts`** - Animation orchestrator
  - `executeSeedCrackAnimation(config)` - Manages multi-stage timeline
  - Returns cleanup function for cancellation
  - Coordinates: stage transitions, sound timing, visual variance updates

### 3. Constants & Utilities
- **`logoGeneratorConstants.ts`** (enhanced)
  - Centralized: `TRIES_PER_DAY`, `PRESETS`, `RARITY_COLORS`, `BADGE_TYPES`, `MOMENT_IDS`
  - localStorage key definitions
  - API endpoint URLs
  - Timeouts, image sizes, pagination defaults

---

## Migration Path

### Phase 1: Hooks & API Layer (✅ DONE)
Extract state declarations → custom hooks
Extract API calls → `apiClient.ts`
Extract localStorage → `storageManager.ts`
Extract animations → `seedCrackAnimation.ts`

### Phase 2: Helper Components (🔄 IN PROGRESS)
Extract rendering logic into sub-components:
- `GeneratorForm` - Text input, seed, preset selector
- `ResultPanel` - Logo display, rarity badge, action buttons
- `SeedCrackDisplay` - Animation visualization
- `GalleryGrid` - Gallery list rendering
- `LeaderboardList` - Leaderboard display
- `ChallengesList` - Challenges UI
- `ModalDialogs` - Onboarding, feedback, how-it-works wrapper

### Phase 3: Main Component Refactor (🔄 PLANNED)
Reduce `LogoGenerator.tsx` to orchestrator:
- Import all hooks at top
- Import sub-components
- ~500 lines: effects (SDK init, timers, API calls), event handlers, JSX composition

---

## Usage Examples

### Using Multiple Hooks in LogoGenerator
```tsx
import {
  useGeneratorState,
  useUIState,
  useFarcasterSDK,
  useChallengeSystem,
  useLeaderboardData,
} from "@/hooks";
import { leaderboardAPI, galleryAPI, userAPI } from "@/lib/apiClient";
import { historyStorage, favoritesStorage } from "@/lib/storageManager";
import { executeSeedCrackAnimation } from "@/lib/seedCrackAnimation";

export default function LogoGenerator() {
  const generator = useGeneratorState();
  const ui = useUIState();
  const farcaster = useFarcasterSDK();
  const challenges = useChallengeSystem();
  const leaderboard = useLeaderboardData();

  // Effect: Load leaderboard
  useEffect(() => {
    leaderboardAPI.getLeaderboard("score", 50).then((entries) => {
      leaderboard.setLeaderboardEntries(entries);
    });
  }, []);

  // Effect: Start animation
  useEffect(() => {
    if (generator.logoResult) {
      const cleanup = executeSeedCrackAnimation({
        onStageChange: (stage) => animation.setSeedCrackStage(stage),
        onVarianceUpdate: (variance) => animation.setSeedCrackVariance(variance),
        soundEnabled: ui.soundEnabled,
      });
      return cleanup;
    }
  }, [generator.logoResult]);

  // Event: Save to favorites
  const handleAddFavorite = (logoId: string) => {
    favoritesStorage.addToFavorites(logoId);
    ui.showToast("Saved to favorites!", "success");
  };

  return (
    <div>
      <GeneratorForm
        text={generator.inputText}
        onTextChange={generator.setInputText}
        // ... more props
      />
      {generator.logoResult && (
        <ResultPanel
          logo={generator.logoResult}
          onAddFavorite={handleAddFavorite}
          // ... more props
        />
      )}
    </div>
  );
}
```

### Using API Client
```tsx
import { leaderboardAPI, userAPI, badgeAPI } from "@/lib/apiClient";

// Fetch leaderboard
const entries = await leaderboardAPI.getLeaderboard("trending", 24);

// Like an entry
const result = await leaderboardAPI.likeEntry(entryId);

// Get user profile
const profile = await userAPI.getUserProfile(username);

// Award a badge
await badgeAPI.awardBadge({
  userId: username,
  badgeType: "first_cast",
  metadata: { timestamp: Date.now() },
});
```

### Using Storage Manager
```tsx
import {
  historyStorage,
  favoritesStorage,
  challengeStorage,
  preferencesStorage,
  progressStorage,
} from "@/lib/storageManager";

// History
historyStorage.addToHistory({ result: logo, createdAt: Date.now() });
const history = historyStorage.getHistory();

// Challenges
challengeStorage.toggleChallenge("nike-prompt-1", true);
const progress = challengeStorage.getChallengeProgress();

// Preferences
preferencesStorage.setSoundEnabled(false);
const soundOn = preferencesStorage.isSoundEnabled();

// Progress tracking
progressStorage.incrementGenerations();
progressStorage.addMomentSeen("first_rare");
```

---

## Testing Strategy

### Unit Tests (Hooks)
```tsx
// __tests__/hooks/useGeneratorState.test.ts
import { renderHook, act } from "@testing-library/react";
import { useGeneratorState } from "@/hooks";

test("resetForNewGeneration clears logo result", () => {
  const { result } = renderHook(() => useGeneratorState());
  
  act(() => {
    result.current.setLogoResult(mockLogoResult);
    result.current.resetForNewGeneration();
  });

  expect(result.current.logoResult).toBeNull();
});
```

### Integration Tests (API + Storage)
```tsx
// __tests__/integration/leaderboard.test.ts
test("likeEntry updates storage and API", async () => {
  const entryId = "test-123";
  
  // API call
  const result = await leaderboardAPI.likeEntry(entryId);
  
  // Storage verification
  const liked = likedEntriesStorage.isLiked(entryId);
  expect(liked).toBe(true);
});
```

### Component Tests
```tsx
// __tests__/components/GeneratorForm.test.tsx
test("submits form with input text", () => {
  render(
    <GeneratorForm
      text="Nike"
      onTextChange={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  
  fireEvent.click(screen.getByText("Generate"));
  expect(onSubmit).toHaveBeenCalledWith("Nike");
});
```

---

## Key Principles

### 1. No Appearance Changes ✅
- All rendering stays identical
- Only internal structure improves
- Visual output pixel-perfect match
- User experience unchanged

### 2. Single Responsibility
Each hook manages one concern:
- Generator state ≠ UI state ≠ Farcaster state
- Each API domain isolated (leaderboard, gallery, user, etc.)
- Storage operations grouped by feature

### 3. Testability
- Hooks can be tested in isolation
- API client mocked easily in tests
- Storage operations synchronous, no side effects
- Animation logic pure functions

### 4. Reusability
- Hooks exported from `@/hooks` barrel
- API client can be used in server components if needed
- Storage manager can be extended for IndexedDB later
- Constants centralized for easy updates

---

## File Structure

```
components/
├── LogoGenerator.tsx (6008 → ~500 lines, orchestrator)
├── GeneratorForm.tsx (extracted)
├── ResultPanel.tsx (extracted)
├── SeedCrackDisplay.tsx (extracted)
├── GalleryGrid.tsx (extracted)
├── LeaderboardList.tsx (extracted)
├── ChallengesList.tsx (extracted)
└── ModalDialogs.tsx (extracted)

hooks/
├── index.ts (barrel export)
├── useGeneratorState.ts
├── useUIState.ts
├── useSeedCrackAnimation.ts
├── useFarcasterSDK.ts
├── useLeaderboardData.ts
├── useChallengeSystem.ts
└── useRewardTracking.ts

lib/
├── logoGeneratorConstants.ts (enhanced)
├── apiClient.ts (new)
├── storageManager.ts (new)
├── audioSystem.ts (new)
└── seedCrackAnimation.ts (new)
```

---

## Rollback Plan

If issues arise, this branch preserves original code on `main`:
```bash
git checkout main  # Return to original
git branch -D refactor/component-decomposition  # Discard if needed
```

Or, revert specific files:
```bash
git checkout main -- components/LogoGenerator.tsx  # Restore from main
```

---

## Next Steps

1. ✅ Create hooks
2. ✅ Create API/persistence layer
3. 🔄 Extract helper components
4. 🔄 Refactor main component
5. 🔄 Test all features
6. 🔄 Create PR and merge

---

**Questions?** Refer to specific hook/module docstrings for detailed usage.
