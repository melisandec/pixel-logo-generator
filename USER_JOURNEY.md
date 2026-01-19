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
2. **Generated logo** preview.
3. **Seed** shown under the logo (tap to copy).
4. **Actions**
   - **Cast this logo** to Farcaster.
   - **Download image** (desktop download or mobile save flow).
   - **Share** (link / share flow).
   - **Save** (adds to Favorites).
   - **Auto‑reply toggle** (adds app link when casting).
   - **Add to collection** (Farcaster mini‑app action if available).

### E. Top casts today
1. See the **Top 3 casts today** preview grid.
2. Tap a card to view the cast content.

## 3) Gallery

### A. Cast Gallery
1. Shows recent casts from the community.
2. Filters:
   - **Rarity** (All / Common / Rare / Epic / Legendary / Unknown)
   - **Preset** (All / Arcade / Vaporwave / Game Boy / Unknown)
3. Pagination for large lists.
4. Each card:
   - Preview image
   - Username + time
   - Rarity + preset chips
   - **Share to Warpcast** button

### B. Favorites + Recent logos (local)
1. **Favorites** strip: tap to reopen a saved logo.
2. **Recent logos** strip: tap to reopen recent work.
3. Opening a card returns you to **Home** with the logo loaded.

## 4) Leaderboard

1. **Today’s Winners** (top ranked casts for today).
2. **Global leaderboard** (last 7 days).
3. Sort controls:
   - **Trending**
   - **Recent**
   - **Most likes**
4. Pagination for the global list.
5. **Recent casts** list with quick links to open in Warpcast.

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
   - Link to open the full profile page
2. If not signed in:
   - Displays a sign‑in prompt

## 7) Profile Page (`/profile/[username]`)

1. Header with **Back** link to Home.
2. **Share collection** (casts top entries + profile link).
3. **Copy profile link**.
4. Stats:
   - Total casts
   - Total likes
   - Best rarity
   - Top preset
5. **Latest cast** highlight.
6. **Top 3** highlight section.
7. Filters:
   - Rarity
   - Preset
   - Recent only (last 7 days)
8. Full list of entries with image previews and cast links.

## 8) Other Behaviors (Global)

1. **How it works** modal explains seeds, rarity, and daily limits.
2. **Toasts** surface success or error states.
3. Seed and input rules enforce valid numbers and daily limits.

---

If you want this journey expanded with screenshots, a flowchart, or a developer‑facing version, tell me what format you prefer.
