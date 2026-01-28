# Demo Mode Routing Architecture

**Consolidated from:** DEMO_ROUTING_ARCHITECTURE.md, DEMO_ROUTING_QUICK_REF.md

---

## 🎯 Quick Reference

| Route                         | Type | Purpose                                 |
| ----------------------------- | ---- | --------------------------------------- |
| `/`                           | Page | Normal mode (3 tries/day, custom seeds) |
| `/demo`                       | Page | Demo mode (1 try/5 min, locked styling) |
| `/api/demo/seed`              | GET  | Get next available seed (preview)       |
| `/api/demo/seed`              | POST | Consume next seed atomically            |
| `/api/demo/seed/stats`        | GET  | Pool statistics                         |
| `/api/demo-logo-style/[seed]` | GET  | Fetch stored style fingerprint          |

---

## Route Structure

```
localhost:3000/
├── / (Normal Mode Page)
│   ├── demoMode = false
│   ├── 3 tries per day (daily limit)
│   ├── Custom seeds + presets
│   ├── All styling options available
│   └── [Generate] button → /demo
│
└── /demo (Demo Mode Page)
    ├── demoMode = true
    ├── 1 try every 5 minutes (rate limit)
    ├── Locked 80s neon styling
    ├── Seed from pool (100_000_000+)
    └── [Back] button → /
```

---

## Data Flow

### Normal Mode (`/`)

User generates a logo with normal settings:

```
User Input (text, preset)
    ↓
checkDailyLimits()
    ├─ Check localStorage: plf:challengeHistory
    ├─ Verify word hasn't been generated today
    ├─ Verify < 3 tries used today
    └─ Return ok/error
    ↓
[if limits ok]
generateLogo() [NORMAL config]
    ├─ Use custom seed or random
    ├─ Apply selected styling (user choice)
    ↓
persistGeneratedLogo()
    ├─ Save to database (GeneratedLogo)
    ├─ Record user info if logged in
    ↓
Update localStorage: plf:challengeHistory
    ├─ Add today's entry
    ├─ Increment try count
    ↓
Display Logo
    ├─ Show result
    ├─ [Demo Mode] button to switch to /demo
    └─ [Gallery] button to view all
```

---

### Demo Mode (`/demo`)

User generates a logo with demo exclusive settings:

```
User Click: "Try 80s Exclusive"
    ↓
checkDemoRateLimit()
    ├─ Check localStorage: plf:demoRateLimit
    ├─ Get last demo generation timestamp
    ├─ Calculate elapsed time
    ├─ If < 5 minutes: show countdown timer, return
    └─ If >= 5 minutes: allow generation
    ↓
[if rate limit ok]
requestAndConsumeDemoSeed(userId)
    ├─ Call POST /api/demo/seed
    ├─ Server uses transaction + row locking
    ├─ Returns consumed seed or null if exhausted
    ↓
[if seed obtained]
generateLogo() [DEMO_PRESET_CONFIG]
    ├─ Use demo seed (100_000_000+)
    ├─ Apply locked neon styling
    ├─ Store style fingerprint in database
    ↓
persistGeneratedLogo()
    ├─ Save to database (GeneratedLogo)
    ├─ Save DemoLogoStyle (palette, gradient, glow, etc.)
    ├─ Record demo metadata
    ↓
Update localStorage: plf:demoRateLimit
    ├─ Record generation timestamp
    ├─ Calculate next available time (now + 5 min)
    ↓
DemoLogoDisplay renders with SVG filters
    ├─ Fetch GET /api/demo-logo-style/[seed]
    ├─ Retrieve stored fingerprint
    ├─ Generate SVG filter definitions
    ├─ Apply filters to canvas
    ↓
Display Styled Logo
    ├─ Show 80s neon exclusive badge
    ├─ Show "Generated in X seconds" timer
    └─ [Remix] button (consumes another seed)
```

---

## Component Architecture

### LogoGenerator Component

The main component that handles both normal and demo modes:

```typescript
interface LogoGeneratorProps {
  demoMode?: boolean; // Defaults to IS_DEMO_MODE
}

export default function LogoGenerator({
  demoMode = IS_DEMO_MODE,
}: LogoGeneratorProps = {}) {
  // demoMode affects:
  // - Which styling options are available
  // - Rate limiting behavior (daily vs every 5 min)
  // - Seed consumption from pool
  // - Badge and messaging displayed
}
```

**Key Methods:**

| Method               | Normal         | Demo         | Notes                 |
| -------------------- | -------------- | ------------ | --------------------- |
| `handleGenerate()`   | Daily limit    | 5-min limit  | Different rate checks |
| `handleRandomize()`  | Random seed    | Consume pool | Demo uses seed pool   |
| `handleRemixCast()`  | Custom         | Pool seed    | Farcaster cast        |
| `openGalleryEntry()` | Normal gallery | Demo gallery | Different filters     |

---

## API Endpoints Detail

### Seed Management

#### `GET /api/demo/seed` - Preview Next Seed

**Purpose:** Check what the next available seed is WITHOUT consuming it

**Response (200):**

```json
{ "seed": "100000042" }
```

**Response (429 - Exhausted):**

```json
{ "error": "The 80s Forge has exhausted its unreleased seeds." }
```

**Use Case:** UI previews, checking availability

---

#### `POST /api/demo/seed` - Consume Seed Atomically

**Purpose:** Get and consume next seed using transaction safety

**Request:**

```json
{
  "userId": "optional-user-id"
}
```

**Response (200):**

```json
{ "seed": "100000042" }
```

**Response (429 - Exhausted):**

```json
{ "error": "The 80s Forge has exhausted its unreleased seeds." }
```

**Technical Details:**

- Uses `SELECT ... FOR UPDATE SKIP LOCKED`
- Atomic transaction (no race conditions)
- Returns null if pool exhausted
- Invalidates forge lock cache on success

---

#### `GET /api/demo/seed/stats` - Pool Statistics

**Purpose:** Get real-time pool statistics

**Response (200):**

```json
{
  "total": 5000,
  "used": 1234,
  "available": 3766,
  "percentageUsed": 24.68
}
```

**Use Case:** Display progress, lock status UI

---

### Styling Endpoint

#### `GET /api/demo-logo-style/[seed]` - Get Stored Style

**Purpose:** Retrieve style fingerprint for a given seed

**Path Params:**

- `seed` - The demo seed (100_000_000+)

**Response (200):**

```json
{
  "palette": "neonPinkBlue",
  "gradient": "horizontal",
  "glow": "softNeon",
  "chrome": "mirrorChrome",
  "bloom": "medium",
  "texture": "scan",
  "lighting": "topLight"
}
```

**Response (404 - Not Found):**

```json
{ "error": "Demo style not found for this seed" }
```

**Response (403 - Demo Disabled):**

```json
{ "error": "Demo mode is not enabled" }
```

**Use Case:** Display stored logo from gallery with correct styling

---

## Rate Limiting

### Normal Mode: Daily Limit

```typescript
function checkDailyLimits(): { ok: boolean; remaining: number } {
  const history = localStorage.getItem("plf:challengeHistory");
  const entries = JSON.parse(history || "{}");

  const today = new Date().toISOString().split("T")[0];
  const todayCount = entries[today]?.length || 0;

  return {
    ok: todayCount < 3,
    remaining: Math.max(0, 3 - todayCount),
  };
}
```

**Behavior:**

- 3 tries per day (resets at midnight)
- After 3 tries, show "Check back tomorrow" message
- Tries stored in localStorage (offline-capable)

---

### Demo Mode: 5-Minute Limit

```typescript
function checkDemoRateLimit(): { ok: boolean; nextAvailable: Date } {
  const lastTry = localStorage.getItem("plf:demoRateLimit");

  if (!lastTry) {
    return { ok: true, nextAvailable: new Date() };
  }

  const lastTime = new Date(lastTry).getTime();
  const elapsedMs = Date.now() - lastTime;
  const fiveMinMs = 5 * 60 * 1000;

  if (elapsedMs < fiveMinMs) {
    const next = new Date(lastTime + fiveMinMs);
    return { ok: false, nextAvailable: next };
  }

  return { ok: true, nextAvailable: new Date() };
}
```

**Behavior:**

- 1 try every 5 minutes
- Countdown timer shows if not ready
- Timer stored in localStorage (persists across refreshes)

---

## Switching Between Modes

### Normal → Demo

User clicks "Try 80s Exclusive" button:

```typescript
function switchToDemo() {
  // Navigate to demo page
  router.push("/demo");

  // OR: Toggle demoMode prop if same component
  setDemoMode(true);
}
```

---

### Demo → Normal

User clicks "Back to Normal" button:

```typescript
function switchToNormal() {
  // Navigate back to main page
  router.push("/");

  // OR: Toggle demoMode prop if same component
  setDemoMode(false);
}
```

---

## Styling Lock (Demo Only)

### What's Locked?

In demo mode, these UI controls are **disabled**:

```typescript
const isDemo = demoMode === true;

// Disabled in demo
<PaletteSelector disabled={isDemo} />
<GradientSelector disabled={isDemo} />
<GlowSelector disabled={isDemo} />
<ChromeSelector disabled={isDemo} />
<BloomSelector disabled={isDemo} />
<TextureSelector disabled={isDemo} />
<LightingSelector disabled={isDemo} />

// Available in both
<PresetSelector /> // Can choose preset
<RandomButton />   // Can randomize (consumes seed)
<RemixButton />    // Can remix (consumes seed)
```

**Why?** Demo exclusivity - users get whatever style their seed generates

---

## Seed Consumption Scenarios

### Scenario 1: Normal Generation

```
User clicks [Generate]
  └─ Normal mode
    ├─ Uses random seed from normal range
    ├─ Styling based on user selections
    └─ No seed pool consumption
```

---

### Scenario 2: Demo Generation

```
User clicks [Try 80s Exclusive]
  └─ Demo mode
    ├─ Rate limit check (5 min)
    ├─ POST /api/demo/seed
    ├─ Consumes seed from pool
    ├─ Generates with demo seed
    └─ Stores style in database
```

---

### Scenario 3: Demo Remix

```
User clicks [Remix] in demo
  └─ Already in demo mode
    ├─ Rate limit check (5 min)
    ├─ POST /api/demo/seed (new seed)
    ├─ Consumes another seed
    ├─ Same user, different style
    └─ Updates localStorage timestamp
```

---

### Scenario 4: Seed Pool Exhausted

```
User clicks [Try 80s Exclusive]
  └─ All 5,000 seeds consumed
    ├─ POST /api/demo/seed returns 429
    ├─ isForgeLockedError = true
    ├─ UI shows: "🔒 The Forge is locked"
    ├─ Explains all exclusive seeds used
    └─ [Back] button to normal mode
```

---

## Status Tracking

### Forge Lock Status

```typescript
// From lib/demoForgeLock.ts
export async function getDemoForgeLockStatus() {
  const stats = await getDemoSeedPoolStats();

  return {
    isLocked: stats.available === 0,
    totalSeeds: 9000,
    usedSeeds: stats.used,
    availableSeeds: stats.available,
    percentageUsed: stats.percentageUsed,
    message: isLocked
      ? "🔒 The Forge is locked. All seeds consumed."
      : `⚡ ${stats.available} seeds remaining`,
  };
}
```

### UI Display

- **Normal mode:** Show progress indicator (% used)
- **Demo mode:** Show seed count or lock message
- **After exhaustion:** Show "Forge Locked" badge

---

## Integration with Other Features

### Farcaster Integration

Demo mode with cast:

```typescript
async function handleRemixCast() {
  if (demoMode) {
    // Consume seed from pool
    const seed = await requestAndConsumeDemoSeed(userFid);
    // Generate with demo seed
    // Cast to Farcaster with exclusive badge
  }
}
```

---

### Analytics/Leaderboard

Track demo generations:

```typescript
// Record in leaderboard
await recordDemoGeneration({
  userId: user.id,
  seed: demoSeed,
  timestamp: new Date(),
  isExclusive: true,
});
```

---

## Summary

The demo routing system:

✅ **Separates** normal and demo experiences  
✅ **Enforces** different rate limits (daily vs 5-min)  
✅ **Consumes** seeds atomically with transaction safety  
✅ **Stores** styles deterministically for reproducibility  
✅ **Locks** styling options for exclusivity  
✅ **Tracks** seed consumption with analytics

All while maintaining a seamless user experience switching between modes.
