# Demo Mode Routing - Quick Reference

## What Changed

✅ **Normal Mode (/)**

- 3 tries per day
- Custom seeds available
- Preset selection
- Text input only

✅ **Demo Mode (/demo)**

- 1 try every 5 minutes
- Auto-selected demo seeds
- Locked neon styling
- 80s exclusive branding

## Button on Main Page

```tsx
<Link href="/demo" className="neon-button">
  ⚡ Try Demo Mode - 80s Exclusive Forge
</Link>
```

**Styling**: Purple/cyan neon with hover animation

## Rate Limiting

| Mode   | Limit           | Storage                |
| ------ | --------------- | ---------------------- |
| Normal | 3/day (by word) | `plf:challengeHistory` |
| Demo   | 1/5min          | `plf:demoRateLimit`    |

## Component Usage

```tsx
// Normal mode (main page)
<LogoGenerator demoMode={false} />

// Demo mode (/demo page)
<LogoGenerator demoMode={true} />

// Backward compatible (defaults to IS_DEMO_MODE from env)
<LogoGenerator />
```

## Key Implementation Files

| File                           | Purpose                       |
| ------------------------------ | ----------------------------- |
| `app/page.tsx`                 | Main page with button         |
| `app/demo/page.tsx`            | Demo route                    |
| `components/LogoGenerator.tsx` | Core logic with demoMode prop |

## Testing the Implementation

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Click "⚡ Try Demo Mode" button
# You should be on /demo with different styling

# Try to forge twice within 5 minutes
# Second attempt should show: "Demo forge available in Xm Xs"

# Click "Back to Normal Mode" button
# Should return to / with normal mode
```

## Files Modified

1. ✏️ `app/page.tsx` - Added button, set demoMode={false}
2. ✨ `app/demo/page.tsx` - NEW route file
3. ✏️ `components/LogoGenerator.tsx` - Added demoMode prop, 5-min rate limit
4. 📝 `DEMO_MODE_ROUTING.md` - Full documentation (this file)

## What Still Works

- All existing demo styling (SVG filters)
- Demo seed pool consumption
- Logo generation and persistence
- Gallery and leaderboard
- All normal mode features
- Farcaster integration

## No Breaking Changes

- `IS_DEMO_MODE` constant still works
- Existing code path unaffected
- Backward compatible via default prop
- Can disable demo with single flag change

---

**Status**: ✅ Ready for testing and deployment
