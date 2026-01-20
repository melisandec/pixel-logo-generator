# Pixel Logo Forge – User Journey

This document walks through the full user journey, page by page, including the main actions available.

## 1) Entry Point

1. Open the app (Farcaster mini‑app or web).
2. You land on **Home** by default.
3. Bottom navigation is always available:
   - **Home** (🏠)
   - **Gallery** (🖼️)
   - **Leaderboard** (🏆)
   - **Challenge** (🎯)
   - **Profile** (👤)

## 2) Home (Main Generator)

### A. Daily context
1. See **tries left today**.
2. See **Prompt of the day** and tap **Use prompt** to auto‑fill the input.

### B. Create a logo
1. Enter text (max 30 chars).
2. Optional **Seed** (one custom seed per day).
3. Toggle **Remix** if you want to cast the remix using a specific seed + text.
4. Tap **Generate** or **Randomize**.

### C. Seed cracking animation
When generating, the seed animates in stages:
1. Crack line appears (short).
2. Crack line grows (mid).
3. Crack line reaches bottom (full).
4. Seed shakes.
5. Seed blooms open from the top.
6. **Rarity ticket** appears with the final seed number.

### D. Result panel (after generation)
1. **Rarity badge** (Common / Rare / Epic / Legendary).
2. **Generated logo** preview (clean pixel art, no UI chrome).
3. **Seed** shown under the logo (tap to copy).
4. **Actions**
   - **Cast this logo** to Farcaster (shares with card image + embeds).
   - **Download image** (desktop download or native iOS save to Photos via Web Share API).
   - **Share** (link / share flow).
   - **Save** (adds to Favorites).
   - **Auto‑reply toggle** (adds app link when casting).
   - **Add to collection** (Farcaster mini‑app action if available).

### E. Top casts today
1. See the **Top 3 casts today** preview grid in arcade styling.
2. Each card shows trophy-style image with rarity highlights.
3. Tap a card to view the full cast details.

## 3) Gallery

### A. Cast Gallery
1. Shows recent casts from the community with **clean pixel logo art** (no frame/UI).
2. Filters:
   - **Rarity** (All / Common / Rare / Epic / Legendary / Unknown)
   - **Preset** (All / Arcade / Vaporwave / Game Boy / Unknown)
3. Pagination for large lists.
4. Each card:
   - Clean logo image preview (gallery-focused view)
   - Username + time
   - Rarity + preset chips with glow effects
   - **Share to Warpcast** button (shares card image version)

### B. Favorites + Recent logos (local)
1. **Favorites** strip: tap to reopen a saved logo.
2. **Recent logos** strip: tap to reopen recent work.
3. Opening a card returns you to **Home** with the logo loaded.

## 4) Leaderboard

1. **Today's Winners** (top 3 ranked casts for today) with arcade rank badges.
2. **Global leaderboard** (last 7 days).
3. Gallery displays **clean pixel logos** (art-focused, no card frame).
4. Sort controls:
   - **Trending**
   - **Recent**
   - **Most likes**
5. Pagination for the global list.
6. **Recent casts** list with quick links to open in Warpcast.

## 5) Challenge

1. **Mini‑Series Challenge** overview (6 prompts per day).
2. Shows:
   - Streak count
   - Progress counter
   - Reset timer (daily reset)
3. Challenge list:
   - Each prompt has a short description
   - Checkbox to mark complete
   - **Generate** button (jumps to Home with that prompt filled)
4. Completion reward:
   - **Daily Champion** badge
5. **Recent history** grid (past days completion status).

## 6) Profile (Tab)

1. If signed in with Farcaster:
   - Shows username, cast count, total likes
   - **Forge rank** (D → C → B → A → S → S+) based on engagement
   - **Rarity Master** status (if all 4 rarities collected)
   - **Current level** based on total casts
   - Link to open the full profile page
2. If not signed in:
   - Displays a sign‑in prompt

## 7) Profile Page (`/profile/[username]`)

### A. Header Section
1. **Visit state indicator**: "YOUR FORGE" (own profile) or "VIEWING @[USERNAME]'S FORGE" (other profile).
2. **Aura effect**: Subtle gradient background matching best rarity achieved (Rare = cyan, Epic = purple, Legendary = gold).
3. **Username** with large monospace font and text glow.
4. **Emblems**:
   - ⭐ (Star) if user has **Legendary rarity** logos
   - 🔥 (Fire) if user cast 3+ logos in last 7 days
5. **Follow button** (visible on other profiles, clickable for Farcaster integration).
6. **Back link** to Home.

### B. Stats Section (Arcade Console Style)
Monospace counters with glow effects:
- **LEVEL**: Floor(totalCasts / 5) + 1
- **FORGE RANK**: D / C / B / A / S / S+ (weighted algorithm: casts + best rarity + legendaries)
- **BEST RARITY**: Latest best rarity achieved

### C. Rarity Collection Progress
1. **Compact 4-column progress console**:
   - Common: X entries (green glow)
   - Rare: X entries (cyan glow)
   - Epic: X entries (purple glow)
   - Legendary: X entries (gold glow)
2. **Progress bars** with rarity-colored gradient and animated glow.
3. **Rarity Master badge** panel (unlocked when all 4 rarities collected):
   - Golden "RARITY MASTER" banner
   - ★ symbol
   - Unlock animation on first completion

### D. Signature Logo Section
1. **Select signature logo** button opens modal.
2. **Signature logo display**:
   - Large framed image with rarity-based border color
   - Player quote: "This is my identity."
   - Optional signature preset selection
3. **Modal grid** shows top entries with rarity indicators for selection.
4. Selected logo appears in **player card** when sharing.

### E. Unlocked Rewards (Pixel Cards)
Arcade-style reward badges showing achievement progression:
- **Level milestones** (5, 10, 20+ casts)
- **Rarity achievements** (First Rare, Epic, Legendary)
- **Challenge completions** (Daily streaks)
- **Social badges** (Recasts, likes milestones)

### F. Next Objective Panel
1. Displays motivational directive if collection incomplete.
2. Examples: "Collect your first Rare!", "Find an Epic!", "Complete the Rarity Master set!"
3. Disappears when objective completed.

### G. Latest Cast Highlight ("SHOWCASE")
1. **Largest display** of most recent cast.
2. Shows **card image version** (framed with rarity branding) for visual impact.
3. Displays:
   - Cast date
   - Rarity with color glow
   - Like count
4. Scale-up hover effect.

### H. Filters & Gallery
1. **Filter controls**:
   - **Rarity** (All / Common / Rare / Epic / Legendary)
   - **Preset** (All / Arcade / Vaporwave / Game Boy)
   - **Recent only** (last 7 days)
2. **Gallery grid** displays all entries:
   - **Clean pixel logos** (no frame, pure art for collection browsing)
   - Date + rarity indicator
   - Click to view cast in Warpcast

### I. Action Buttons
1. **Share Collection** (prominent button):
   - Generates **player card** (600×600 arcade-styled image)
   - Shows: username, level, forge rank, best rarity, signature logo, rarity master badge
   - Uploads card to blob storage
   - Composes Farcaster cast with card + top logo embeds
   - Text: "My Pixel Logo Forge player card 🎮"
2. **Copy profile link**:
   - Copies `/profile/[username]` URL to clipboard
   - Fallback opens URL in new window

## 8) Image Display Strategy

### Context-Based Image Selection
The app uses **strict separation** between gallery views and social sharing:

**Gallery Contexts** (show **clean pixel logos**):
- Home generator preview
- Gallery grid
- Leaderboard
- Profile collection
- Signature logo selector modal

**Sharing Contexts** (show **card images** with frame + rarity branding):
- Cast/share embeds on Warpcast
- Profile player card (600×600)
- Latest cast highlight showcase
- Warpcast preview modal

Each stored logo has:
- `logoImageUrl`: Raw pixel art (no UI chrome)
- `cardImageUrl`: Framed social sharing card (branded, rarity-highlighted)

The `getImageForContext()` helper function selects the appropriate version based on where the image is being displayed.

## 9) iOS-Specific Features

### Web Share API Integration
On iOS devices:
1. **Download image** button opens native share sheet.
2. Users can tap **Save Image** → goes to Photos app (not Safari download folder).
3. Fallback to browser save for non-iOS devices.
4. Graceful degradation for unsupported browsers.

## 10) Other Behaviors (Global)

1. **How it works** modal explains seeds, rarity, daily limits, and forge ranks.
2. **Toasts** surface success or error states (especially for uploads, shares, copies).
3. **Seed and input rules** enforce valid numbers and daily limits.
4. **Animations**:
   - Emblems slide in on profile load
   - Level counter ticks up
   - Cards unlock with sparkle effects
   - Float effect on profile aura
5. **Progressive enhancement**:
   - SDK composeCast → Warpcast compose URL → fallback web share
   - Image upload to Vercel Blob → in-memory store → data URL fallback
   - Navigator.clipboard → fallback to manual selection + alert

---

**Last updated**: January 20, 2026  
**Recent additions**: iOS photo sharing, signature logos, forge rank system, player cards, image context separation, profile aura, visit states, unlocked rewards.
