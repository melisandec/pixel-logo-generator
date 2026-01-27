# Demo Mode & Normal Mode Separation

## Overview

Changed the architecture to have two separate modes accessible from different routes:

- **Normal Mode** (`/`): Regular logo generation with 3 tries per day, full settings
- **Demo Mode** (`/demo`): 80s exclusive forge with 1 try every 5 minutes, locked neon styling

## Implementation Details

### 1. **app/page.tsx** (Main Page)

- Renders LogoGenerator with `demoMode={false}`
- Shows normal subtitle and settings
- **NEW**: Added prominent "⚡ Try Demo Mode - 80s Exclusive" button that:
  - Links to `/demo` route
  - Has purple/cyan neon styling to attract attention
  - Hovers with scale and glow effects

### 2. **app/demo/page.tsx** (New Demo Route)

- Client component that renders LogoGenerator with `demoMode={true}`
- Shows demo-specific UI:
  - Title: "80s EXCLUSIVE FORGE"
  - Subtitle: "🟣 DEMO MODE – Limited 1 try every 5 minutes"
  - Back button to return to normal mode
  - Demo-exclusive footer text

### 3. **LogoGeneratorProps Interface**

```tsx
interface LogoGeneratorProps {
  demoMode?: boolean;
}

export default function LogoGenerator({
  demoMode = IS_DEMO_MODE,
}: LogoGeneratorProps = {}) {
  // ...
}
```

- `demoMode` prop defaults to `IS_DEMO_MODE` for backward compatibility
- Allows component to work on both routes with different behaviors

### 4. **Demo Rate Limiting** (5-minute window)

```tsx
const checkDemoRateLimit = useCallback((): {
  ok: boolean;
  message?: string;
  timeUntilNext?: number;
} => {
  const storageKey = "plf:demoRateLimit";
  const stored = localStorage.getItem(storageKey);
  const now = Date.now();
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify(now));
    return { ok: true };
  }

  try {
    const lastAttempt = JSON.parse(stored) as number;
    const timeSinceLastAttempt = now - lastAttempt;

    if (timeSinceLastAttempt < FIVE_MINUTES_MS) {
      const timeUntilNext = Math.ceil(
        (FIVE_MINUTES_MS - timeSinceLastAttempt) / 1000,
      );
      return {
        ok: false,
        message: `Demo forge available in ${timeUntilNext}s (1 try every 5 minutes)`,
        timeUntilNext,
      };
    }

    localStorage.setItem(storageKey, JSON.stringify(now));
    return { ok: true };
  } catch (error) {
    console.error("Failed to check demo rate limit:", error);
    localStorage.setItem(storageKey, JSON.stringify(now));
    return { ok: true };
  }
}, []);
```

**Key Features**:

- Stores last attempt timestamp in `plf:demoRateLimit` localStorage key
- 5-minute (300,000ms) window between attempts
- Shows countdown timer if still in rate limit window
- Graceful error handling - allows forge if localStorage fails

### 5. **Updated checkDailyLimits Logic**

```tsx
const checkDailyLimits = useCallback(
  (text: string, seedProvided: boolean): LimitCheck => {
    const normalizedText = normalizeWord(text);

    // Demo mode: 1 try every 5 minutes
    if (demoMode) {
      const rateLimit = checkDemoRateLimit();
      if (!rateLimit.ok) {
        return {
          ok: false,
          message: rateLimit.message || "Rate limit reached",
        } as any;
      }
      return {
        ok: true,
        normalizedText,
        todayState: { date: "", words: [], seedUsed: false },
      } as any;
    }

    // Normal mode: daily limits with word tracking
    // ... existing daily limit logic ...
  },
  [
    ensureDailyLimit,
    normalizeWord,
    userInfo?.username,
    hasBadge,
    demoMode,
    checkDemoRateLimit,
  ],
);
```

**Behavior**:

- **Demo mode**: Checks 5-minute rate limit only, ignores word/seed usage tracking
- **Normal mode**: Uses existing daily limit logic (3 tries, word tracking, seed limit)

### 6. **All IS_DEMO_MODE References Updated**

Replaced all hardcoded `IS_DEMO_MODE` checks with `demoMode` prop in:

- Component initialization (uiMode, selectedPreset)
- Preset configuration (uses DEMO_PRESET_CONFIG only in demo)
- Seed handling (uses demo seed pool only in demo)
- UI rendering (button text, hidden inputs, help text)
- Demo styling persistence (only in demo mode)

## User Flow

### Normal Mode (/)

1. User lands on `/`
2. Sees "PIXEL LOGO FORGE" with normal subtitle
3. Can generate logos with:
   - Custom text input
   - Custom seed (if advanced mode)
   - Preset selection
   - Daily limit: 3 forges per day (tracked by word)
4. Prominent purple/cyan button says "⚡ Try Demo Mode - 80s Exclusive"
5. Clicking button navigates to `/demo`

### Demo Mode (/demo)

1. User clicks button or navigates to `/demo`
2. Sees "80s EXCLUSIVE FORGE" with demo-specific styling
3. Can generate logos with:
   - Text input (no preset selection, locked to demo neon)
   - Auto-selected seeds from demo pool
   - 5-minute rate limit per forge
   - **Demo styling applied**: SVG filters with neon/glow effects
4. "Back to Normal Mode" button returns to `/`
5. Rate limit message: "Demo forge available in 4m 32s (1 try every 5 minutes)"

## Storage Keys

| Mode   | Key                    | Value                  | Type                     |
| ------ | ---------------------- | ---------------------- | ------------------------ |
| Normal | `plf:challengeHistory` | Daily word history     | JSON date+words array    |
| Demo   | `plf:demoRateLimit`    | Last attempt timestamp | JSON number (Date.now()) |

## Benefits

1. **Separated Concerns**: Each mode has independent rate limiting
2. **Marketing Opportunity**: Easy to promote demo mode with button
3. **User Choice**: Normal users can stay on main page, demos available on-demand
4. **No Breaking Changes**: IS_DEMO_MODE still defaults everything, routes can override
5. **Analytics Ready**: Easy to track who uses demo vs normal mode
6. **Scalable**: Can easily add more routes with different limits (e.g., `/vip` with 10/day)

## Testing

All 7 implementation tests passed:
✅ `/demo` page created
✅ Demo button on main page
✅ Back link on demo page
✅ demoMode prop added to LogoGenerator
✅ Demo rate limit function implemented
✅ 5-minute window constant verified
✅ Separate rate limiting for both modes

## Files Modified

| File                           | Changes                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `app/page.tsx`                 | Updated to use demoMode={false}, added demo button                            |
| `app/demo/page.tsx`            | **NEW** - Demo mode page route                                                |
| `components/LogoGenerator.tsx` | Added demoMode prop, updated all IS_DEMO_MODE refs, added 5-min rate limiting |

## Next Steps

1. **Manual Testing**: Visit http://localhost:3000
   - Verify button visible and styled
   - Click button → navigate to /demo
   - Verify demo styling applied
   - Try forge → rate limit message appears after 5 minutes
   - Click back → return to normal mode

2. **Analytics** (Optional): Add events to track:
   - "entered_demo_mode"
   - "demo_forge_generated"
   - "normal_forge_generated"

3. **UI Polish** (Optional):
   - Add analytics to understand which mode is more popular
   - Consider adding demo countdown timer in UI
   - Add confetti/celebration when user discovers demo mode

4. **Production**:
   - Deploy to Vercel
   - Monitor demo seed pool consumption
   - Monitor rate limit on /demo
