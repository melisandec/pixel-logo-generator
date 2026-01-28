# 🎮 ADMIN TOOLS QUICK REFERENCE

## Access the Dashboard

### Direct Link

```
https://yourapp.vercel.app/admin/generated-logos
```

### Local Development

```bash
npm run dev
# Then visit: http://localhost:3000/admin/generated-logos
```

---

## Command Reference

### Data Integrity Monitor (Recommended Daily)

```bash
node data-integrity-monitor.js
```

**What it does:**

- Detects missing rarity values
- Finds missing image URLs
- Identifies orphaned entries
- Spots potential duplicates
- Shows timeline analysis
- Calculates health score (0-100%)

**When to run:**

- Daily health check
- After user reports missing data
- When adding new entries
- Before backups

---

### Recovery Tool (For Fixing Issues)

```bash
node recover-missing-entry.js
```

**Modes:**

- **1** = View current database
- **2** = Manually restore missing entry
- **3** = Fix incomplete entries

**When to use:**

- Recover missing logos
- Fix entries with ⚠️ UNKNOWN rarity
- Add data from external source

---

### Database Diagnostic

```bash
node db-diagnostic.js
```

**Shows:**

- Entry counts & timeline
- Data completeness metrics
- Rarity distribution chart
- User statistics
- Data quality score

**When to use:**

- Detailed analysis needed
- Trend analysis
- User activity patterns

---

## Dashboard Features Map

```
┌─ ADMIN DASHBOARD ──────────────────────────────────────┐
│                                                         │
│  [📊 Stats] [📋 Table] [🎨 Gallery] [🔄 Refresh] [📥] │
│                                                         │
│  🔍 [Filter Username] [Filter Rarity] [Sort By]       │
│                                                         │
│  ┌─ Stats Panel (Expandable) ─────────────────────────┐│
│  │ Total: 35  Users: 8  Legendary: 2  Epic: 4  etc  ││
│  └───────────────────────────────────────────────────┘│
│                                                         │
│  [View Mode: Table / Gallery / List]                  │
│                                                         │
│  📊 TABLE VIEW (sortable columns):                    │
│  ┌──────────┬──────────┬────────┬─────────────────┐  │
│  │ Username │ Text     │ Seed   │ Rarity │ Action│  │
│  ├──────────┼──────────┼────────┼─────────────────┤  │
│  │ ladymel  │ "Matrix" │ 12345  │ EPIC   │ [View]│  │
│  │ jpechi   │ "Crt"    │ 68037  │ ⚠️ UNK │ [View]│  │
│  │ 111iks   │ "Coucou" │ 960660 │ ❌ MISS│ [View]│  │
│  └──────────┴──────────┴────────┴─────────────────┘  │
│                                                         │
│  🎨 GALLERY VIEW (visual):                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ [Image] │ │ [Image] │ │ NoImage │                │
│  │ "Matrix"│ │ "Crt"   │ │"Coucou" │                │
│  │ ladymel │ │jpechi   │ │ 111iks  │                │
│  │ EPIC    │ │⚠️ UNKNOWN│ │❌ MISS   │                │
│  │❤️5 📢2  │ │❤️0 📢0  │ │❤️0 📢0  │                │
│  └─────────┘ └─────────┘ └─────────┘                │
│                                                         │
│  [Details Modal - Click any entry]                    │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Logo preview image                              │ │
│  │ ID: abc123...                                   │ │
│  │ Text: "Matrix"                                  │ │
│  │ Seed: 2055809392                                │ │
│  │ Username: ladymel                               │ │
│  │ Rarity: EPIC                                    │ │
│  │ Created: 1/18/2026 3:53 PM                      │ │
│  │ Likes: 5 | Recasts: 2 | Casted: ✅             │ │
│  │ [Image URL Link] [Delete] [Close]               │ │
│  └─────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Color Legend

### Rarity Colors

```
🟨 LEGENDARY  = #FFD700 (Gold)
🟣 EPIC       = #9933FF (Purple)
🔵 RARE       = #3366FF (Blue)
🟢 COMMON     = #00FF00 (Bright Green)
🟠 UNKNOWN    = #ff6600 (Orange) ⚠️
```

### Status Indicators

```
✅ = Complete/OK
⚠️  = Warning (incomplete)
❌ = Error (missing)
🟣 = Epic
🌟 = Legendary
💎 = Rare
✓  = Common
📢 = Casted
❤️  = Likes
```

---

## Common Workflows

### 📋 Morning Health Check

```bash
# 1. Run monitor
node data-integrity-monitor.js

# 2. Check output
# If Health Score < 90%, run recovery:
node recover-missing-entry.js
```

### 🔍 Investigate Missing Logo

```bash
# 1. Open dashboard
# https://app.com/admin/generated-logos

# 2. Search username in filter
# (e.g., "111iks")

# 3. Look for entries with:
# - ❌ UNKNOWN rarity
# - ❌ No Image placeholder
# - ❌ Missing data fields

# 4. Click entry to see details
# 5. Check image URLs

# 6. If recoverable, run:
node recover-missing-entry.js
# Select mode 2 to restore
```

### 📊 Analyze User Activity

```bash
# 1. Open dashboard
# 2. Check stats panel (click to expand)
# 3. See rarity distribution
# 4. Filter by username to see user logos
# 5. Export CSV for detailed analysis
```

### 🛠️ Fix Incomplete Entry

```bash
# 1. Run monitor to find issue
node data-integrity-monitor.js

# 2. Look for "Missing Rarity" section
# Example output:
#   ⚠️  jpechi1191 | "Crt" | Seed: 68037

# 3. Run recovery tool
node recover-missing-entry.js

# 4. Select mode 3 (Fix incomplete)
# 5. Enter correct rarity value
```

### 📥 Backup All Data

```bash
# 1. Open dashboard
# 2. Remove all filters
# 3. Click "📥 Export CSV"
# 4. Save file with date:
#    logos-backup-2026-01-22.csv

# 5. (Optional) Upload to cloud storage
```

---

## Interpretation Guide

### Table View Reading

```
Username: jpechi1191
├─ Text: "Crt"
├─ Seed: 68037
├─ Rarity: ⚠️ UNKNOWN      ← Issue: Should be LEGENDARY/EPIC/RARE/COMMON
├─ Created: 1/18 3:53 PM
├─ Likes: 0
└─ Action: [View] to see more

What to do: Run recovery tool, mode 3 to fix rarity
```

### Gallery View Reading

```
Card shows:
├─ Logo image (or "No Image" ❌)
├─ Text: "Coucou"
├─ User: @111iks
├─ Seed: 960660649
├─ Rarity badge (color-coded)
├─ Engagement: ❤️0 📢0
└─ Status: ✅ Casted or ⏳ Pending

If "No Image" shown: Entry wasn't properly saved
If rarity is UNKNOWN: Database issue
If status shows ⏳: Not cast to Farcaster yet
```

### Monitor Health Score

```
✅ 95-100%  = Excellent (0 issues)
✅ 85-94%   = Good (1-2 minor issues)
⚠️  75-84%   = Acceptable (3-4 issues)
❌ <75%     = Needs attention (5+ issues)

Issues = Missing rarity + Missing images + Duplicates × 10
```

---

## Keyboard Shortcuts

**In Dashboard:**

- `Ctrl+F` or `Cmd+F` = Browser find (search page)
- Click entry = Open detail modal
- Click outside modal = Close modal
- `Escape` = Close modal

**In Terminal:**

- `Ctrl+C` = Stop running command
- `↑` Arrow = Repeat last command
- `Tab` = Auto-complete command

---

## Troubleshooting Quick Fixes

### Dashboard won't load

```bash
# Check API is working
curl http://localhost:3000/api/generated-logos?limit=10
# Should return JSON with entries
```

### No images showing

```bash
# Verify Blob storage
# Check entries have imageUrl, logoImageUrl, or cardImageUrl
# Click entry to see full URLs

# Test Blob URL directly in browser
# (URL shown in detail modal)
```

### Monitor shows errors

```bash
# Verify database connection
npm run dev

# Check Prisma is working
npx prisma studio
```

### Export produces empty file

```bash
# Remove filters and try again
# Or check: Are there actually entries in DB?
# Run: node data-integrity-monitor.js
```

---

## File Locations

| Tool                | Path                                  | Command                          |
| ------------------- | ------------------------------------- | -------------------------------- |
| Admin Dashboard     | `/app/admin/generated-logos/page.tsx` | Visit `/admin/generated-logos`   |
| Integrity Monitor   | `data-integrity-monitor.js`           | `node data-integrity-monitor.js` |
| Recovery Tool       | `recover-missing-entry.js`            | `node recover-missing-entry.js`  |
| Database Diagnostic | `db-diagnostic.js`                    | `node db-diagnostic.js`          |
| This Guide          | `ADMIN_DASHBOARD_GUIDE.md`            | Reference                        |

---

## Pro Tips

✨ **Tip 1:** Run monitor before bed, review results in morning
✨ **Tip 2:** Set up scheduled check (cron job) for daily monitoring
✨ **Tip 3:** Keep CSV exports as backups (one per week)
✨ **Tip 4:** Review "Timeline Analysis" for system downtime patterns
✨ **Tip 5:** Check "User Statistics" to celebrate top contributors
✨ **Tip 6:** Use Gallery View to spot visual issues quickly
✨ **Tip 7:** Sort by "Rarest First" to showcase epic finds
✨ **Tip 8:** Export CSV and import to Google Sheets for sharing

---

**Updated:** January 22, 2026  
**Status:** All tools tested and working ✅  
**Next:** Run `node data-integrity-monitor.js` to get started!
