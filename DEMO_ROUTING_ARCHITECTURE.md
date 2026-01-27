# Demo Mode Architecture Diagram

## Route Structure

```
localhost:3000/
├── / (Main Page)
│   ├── Normal Mode (demoMode={false})
│   ├── 3 tries per day
│   ├── Custom seeds + presets
│   └── Button → /demo
│
└── /demo (Demo Page)
    ├── Demo Mode (demoMode={true})
    ├── 1 try every 5 minutes
    ├── Locked neon styling
    └── Button → /
```

## Data Flow

### Normal Mode (/)

```
User Input
    ↓
checkDailyLimits()
    ├─ Check plf:challengeHistory
    ├─ Verify word not used today
    ├─ Verify < 3 tries today
    └─ Return ok/error
    ↓
generateLogo() [normal config]
    ↓
persistGeneratedLogo()
    ↓
Update plf:challengeHistory
    ↓
Display Logo
```

### Demo Mode (/demo)

```
User Input
    ↓
checkDemoRateLimit()
    ├─ Check plf:demoRateLimit
    ├─ Get last attempt timestamp
    ├─ Calculate time since last forge
    ├─ If < 5 minutes: return countdown
    └─ If >= 5 minutes: update timestamp
    ↓
generateLogo() [DEMO_PRESET_CONFIG]
    ↓
persistGeneratedLogo()
    ├─ Save to database
    └─ Store demo styling fingerprint
    ↓
DemoLogoDisplay renders with SVG filters
    ├─ Fetch stored style from /api/demo-logo-style/[seed]
    ├─ Generate SVG filter defs
    └─ Apply to logo image
    ↓
Display Styled Logo
```

## Component Props

### LogoGenerator.tsx

```tsx
interface LogoGeneratorProps {
  demoMode?: boolean; // NEW: defaults to IS_DEMO_MODE
}

export default function LogoGenerator({
  demoMode = IS_DEMO_MODE,
}: LogoGeneratorProps = {}) {
  // demoMode affects:
  // - getPresetConfig() → uses DEMO_PRESET_CONFIG
  // - checkDailyLimits() → uses 5-min rate limit
  // - createLogoResult() → uses demo seed pool
  // - UI rendering → shows/hides seed input, changes button text
  // - persistGeneratedLogo() → stores demo styles
}
```

## State Management

### localStorage Keys

| Key                    | Mode   | Purpose                 | Value                        |
| ---------------------- | ------ | ----------------------- | ---------------------------- |
| `plf:challengeHistory` | Normal | Daily word tracking     | `{date, words[], seedUsed}`  |
| `plf:demoRateLimit`    | Demo   | Last attempt time       | Millisecond timestamp        |
| `plf:uiMode`           | Normal | UI mode preference      | `"simple"\|"advanced"`       |
| `plf:demoHistory`      | Demo   | (Optional) Demo history | Similar to challenge history |

### Component State

```tsx
const [demoMode, setDemoMode] = React.useState(IS_DEMO_MODE);

// Affected states
const [uiMode, setUiMode] = useState(demoMode ? "advanced" : "simple");
const [selectedPreset, setSelectedPreset] = useState(
  demoMode ? DEMO_PRESET_KEY : null,
);
```

## Rate Limiting Algorithm

### Normal Mode (Daily)

```
Today = new Date().toISOString().split("T")[0]
History = localStorage.getItem("plf:challengeHistory")

if (History.date !== Today) {
  Reset to {date: Today, words: [], seedUsed: false}
}

if (History.words.includes(normalizedText)) {
  Return error "Already used today"
}

if (History.words.length >= TRIES_PER_DAY) {
  Return error "Daily limit reached"
}

// Allowed
History.words.push(normalizedText)
Save to localStorage
```

### Demo Mode (5-Minute Window)

```
Now = Date.now()
LastAttempt = localStorage.getItem("plf:demoRateLimit")
FIVE_MINUTES = 5 * 60 * 1000 = 300000

if (!LastAttempt) {
  // First attempt
  localStorage.setItem("plf:demoRateLimit", Now)
  Return ok
}

TimeSinceLastAttempt = Now - LastAttempt

if (TimeSinceLastAttempt < FIVE_MINUTES) {
  TimeUntilNext = (FIVE_MINUTES - TimeSinceLastAttempt) / 1000
  Return error with countdown
}

// Allowed (>= 5 minutes)
localStorage.setItem("plf:demoRateLimit", Now)
Return ok
```

## Button Navigation

### Normal Mode Button

```jsx
<Link href="/demo">⚡ Try Demo Mode - 80s Exclusive Forge</Link>

// Styling:
// - background: #f0f (magenta)
// - border: 2px solid #0ff (cyan)
// - color: #000 (black)
// - boxShadow: 0 0 20px rgba(255, 0, 255, 0.5)
// - Hover: scale(1.05) + stronger glow
```

### Demo Mode Button

```jsx
<Link href="/">← Back to Normal Mode</Link>

// Styling:
// - background: #333 (dark)
// - border: 2px solid #0ff (cyan)
// - color: #0ff (cyan)
// - Simple neon look
```

## Conditional Rendering

### UI Elements Hidden/Shown Based on demoMode

```tsx
{
  !demoMode && uiMode === "advanced" && (
    // Seed input - HIDDEN in demo mode
    <SeedInput />
  );
}

{
  demoMode ? (
    // Demo-specific help text
    <p>Demo mode locks every forge to neon 80s chrome</p>
  ) : (
    // Normal help text
    <p>Custom seeds and presets available</p>
  );
}

{
  isGenerating
    ? demoMode
      ? "FORGING 80s..."
      : "FORGING..."
    : demoMode
      ? "⚡ Forge 80s Logo"
      : "FORGE";
}

{
  demoMode ? "LOCKED" : <PresetSelector />;
}
```

## Error Messages

### Normal Mode Errors

- "Enter text first"
- "Already generated for this text today"
- "Daily limit reached. Please wait until tomorrow."
- "Seed already used today. Please wait until tomorrow."

### Demo Mode Error

- "Demo forge available in {countdown}s (1 try every 5 minutes)"

---

## Summary

| Aspect  | Normal                 | Demo                |
| ------- | ---------------------- | ------------------- |
| Route   | `/`                    | `/demo`             |
| Limit   | 3/day (word-based)     | 1/5min (time-based) |
| Presets | Selectable             | Locked to demo      |
| Seeds   | Custom                 | Auto-selected       |
| Styling | Normal                 | Neon/Glow filters   |
| Button  | Purple/cyan → demo     | Simple back link    |
| Storage | `plf:challengeHistory` | `plf:demoRateLimit` |

All controlled by single `demoMode` prop in LogoGenerator component.
