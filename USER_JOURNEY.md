# Pixel Logo Forge – User Journey & Cahier des Charges

**Version**: 1.0.0  
**Last Updated**: January 25, 2026  
**Status**: Complete Specification

---

## Executive Summary

Pixel Logo Forge is a Farcaster-integrated web application that enables users to generate deterministic, seed-based pixel art logos. The application features a full suite of social engagement tools including daily challenges, leaderboards, profile customization, badge rewards, and seamless Farcaster integration for casting and sharing.

---

## 1. System Architecture & Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router (React 18)
- **Styling**: CSS (custom classes with arcade/retro theme)
- **State Management**: React Hooks (useState, useEffect, useCallback, useRef)
- **SDK Integration**: Farcaster Mini App SDK (`@farcaster/miniapp-sdk`)
- **Image Handling**: Canvas API (DOM-based), Vercel Blob storage (optional)

### Backend

- **Runtime**: Node.js (serverless Next.js API routes)
- **Database**: PostgreSQL with Prisma ORM
- **Image Storage**: Vercel Blob (optional, with in-memory fallback)
- **Authentication**: Farcaster SDK (user context from mini-app)

### Infrastructure

- **Hosting**: Vercel
- **Database URL**: PostgreSQL instance (via Prisma)
- **Environment Variables**:
  - `DATABASE_URL` (required)
  - `BLOB_READ_WRITE_TOKEN` (optional, for Vercel Blob)
  - `NEXT_PUBLIC_APP_URL` (optional, for share links)

---

## 2. Core Features Overview

### 2.1 Logo Generation Engine

- **Deterministic Seeding**: Same text + seed always produces identical logos
- **Rarity System**: COMMON, RARE, EPIC, LEGENDARY (based on feature complexity)
- **Customizable Parameters**:
  - Text (max 30 characters)
  - Seed (optional, one custom per day per user)
  - Preset (visual theme: Arcade, Vaporwave, Game Boy, etc.)
  - Remix mode (generate with specific seed + text)

### 2.2 User Management

- **Farcaster Integration**: Automatic user detection via SDK context
- **Profile System**: Per-user stats, badges, collections, signature logos
- **Engagement Tracking**: Casts, likes, recasts, saves
- **Forge Rank**: Dynamic ranking (D→S+) based on engagement

### 2.3 Social Features

- **Daily Challenges**: 6 themed prompts per day
- **Leaderboard**: Global ranking (trending, recent, most liked)
- **Gallery**: Community cast browsing with rarity/preset filters
- **Casting System**: One-click Farcaster cast with image embeds

### 2.4 Reward System

- **Badges**: Achievement-based (cast milestones, rarity collection, challenges, social)
- **Moments**: Celebratory popups for major achievements
- **Challenge Streaks**: Consecutive daily completions
- **Rarity Master**: Unlock when user collects all 4 rarities

---

## 3. User Entry Point & Navigation

### 3.1 Landing Page

1. Open the app (Farcaster mini-app, web, or direct URL)
2. SDK initialization begins (3-second splash screen delay)
3. User context extracted from Farcaster SDK if available
4. Landing on **Home** tab by default

### 3.2 Navigation Structure (Bottom Bar / Tab Navigation)

Five persistent tabs accessible from any page:

| Tab             | Icon | Route                              | Purpose                     |
| --------------- | ---- | ---------------------------------- | --------------------------- |
| **Home**        | 🏠   | `/`                                | Main logo generator         |
| **Gallery**     | 🖼️   | `/` (view mode)                    | Community cast browsing     |
| **Leaderboard** | 🏆   | `/` (tab)                          | Global rankings             |
| **Challenge**   | 🎯   | `/` (tab)                          | Daily challenge tracker     |
| **Profile**     | 👤   | `/` (tab) or `/profile/[username]` | Personal stats & collection |

### 3.3 UI Pattern

- **Tab Bar**: Always visible at bottom, indicates current tab
- **Header**: App title, user info (if signed in), help link
- **Content Area**: Switches based on selected tab
- **Responsive**: Desktop, tablet, and iOS Web Share API optimized

---

## 4. Home Tab – Logo Generator (Main Feature)

### 4.1 Daily Context Display

**Tries Remaining Counter**

- Displays: "X TRIES LEFT TODAY" (default: 3 per day)
- Color coding: Green (2+), yellow (1), red (0)
- Bonus tries awarded if user is a **Rarity Master** (+1 daily try)
- Resets at 00:00 UTC daily

**Prompt of the Day**

- Single themed prompt displayed prominently
- Examples: "Nike", "Apple", "The Matrix", etc.
- "Use prompt" button auto-fills input field
- Changes daily

### 4.2 Input & Control Section

**Text Input Field**

- Max 30 characters
- Alphanumeric + basic symbols allowed
- Real-time validation feedback
- Placeholder: "Enter text for your logo"

**Seed Input (Optional)**

- Numeric field (0–4,294,967,295)
- Labeled: "Custom seed (optional)"
- One custom seed per day rule enforced locally
- Copy-able from result after generation
- If using same seed multiple times, backend allows it for recalculation

**Preset Selector**

- Dropdown or pill selector
- Options: All, Arcade, Vaporwave, Game Boy, Cyberpunk, etc.
- Displays color swatch preview
- Default: Random (assigns random preset per generation)

**Remix Mode Toggle**

- Checkbox: "Remix with seed"
- When enabled + seed provided: Generates with that exact seed
- Use case: User-initiated deterministic regeneration
- Can be toggled on/off dynamically

**Action Buttons**

- **Generate**: Submit current input, increment tries counter
- **Randomize**: Generate with random text + random seed (0 tries cost if no text entered, 1 try if custom text used)

### 4.3 Generation Animation (Seed Crack Sequence)

Plays during generation, 2–3 seconds total:

1. **Crack Initiation** (0.3s)
   - A short vertical crack line appears on the logo seed display
   - Subtle glow effect

2. **Crack Growth** (0.6s)
   - Crack expands downward, splitting the seed number visually
   - Progressive opacity increase

3. **Crack Extends** (0.6s)
   - Crack reaches the bottom edge of the display area
   - Vibration effect begins subtly

4. **Seed Shakes** (0.4s)
   - The seed number itself shakes/vibrates
   - Increases in intensity

5. **Seed Bloom** (0.3s)
   - Crack fully opens, seed "blooms" upward
   - Two halves split apart, revealing rarity-colored ticket underneath

6. **Rarity Reveal** (0.3s)
   - **Rarity Ticket** appears with:
     - Final seed number (large, monospace)
     - Rarity badge (color-coded: gray/cyan/purple/gold)
     - Visual sparkle effect

### 4.4 Result Panel (Post-Generation)

**Logo Display**

- Large, centered preview (clean pixel art, no UI frame)
- Quality: 256×256 or 512×512 pixels
- Pixel-perfect rendering, no anti-aliasing
- Responsive: Scales to fit viewport

**Rarity Badge**

- Positioned top-left or top-center
- Color: Gray (COMMON), Cyan (RARE), Purple (EPIC), Gold (LEGENDARY)
- Text: "COMMON", "RARE", "EPIC", or "LEGENDARY"
- Icon: Optional glow/sparkle effect based on rarity

**Seed Display**

- Below logo, monospace font
- Clickable to copy seed to clipboard
- Shows: `SEED: [number]` or just the number
- Feedback toast: "Seed copied!"

**Action Buttons** (horizontal row)

1. **Cast to Farcaster**
   - Opens preview modal (if SDK ready) or fallback to Warpcast compose URL
   - Embeds: Logo image URL + cast text
   - Auto-populates: Text from input + seed + rarity
   - Optional auto-reply: "Added app link" if toggle enabled

2. **Download Image**
   - Desktop: Browser download
   - iOS: Web Share API → Save to Photos
   - Fallback: Manual save link with data URL
   - Format: PNG, filename includes seed/text

3. **Share** (Web Share API)
   - Native share sheet (iOS) or fallback to URL copy
   - Share text: "Check out my pixel logo: [text]"
   - Includes app URL

4. **Save to Favorites**
   - Toggleable button (heart icon)
   - Stores in localStorage under `plf:favorites`
   - Allows user to re-open logo later
   - Visual feedback: heart fills when saved

5. **Auto-Reply Toggle**
   - Checkbox/toggle button
   - When enabled + casting to Farcaster: App link auto-included in reply
   - Stored in localStorage: `plf:autoReplyEnabled`

6. **Add to Collection** (Farcaster Mini-App Only)
   - Button: "Add to Home"
   - Calls SDK action: `sdk.actions.addMiniApp()`
   - Requires SDK ready (only in Farcaster client)
   - Fallback: Toast message "Available in Farcaster app"

### 4.5 Top Casts Today (Trending Strip)

**Display Section**

- Horizontal scrollable grid (3–5 visible cards)
- Title: "TOP CASTS TODAY" or "TRENDING NOW"
- Cards show: Logo image, username, rarity chip, like count

**Card Interaction**

- Tap card: Opens full cast details in modal or navigates to Warpcast
- Hover effect: Scale up, slight shadow increase
- Rarity-based border/glow color

**Refresh**

- Auto-refresh every 5–10 minutes
- Or manual refresh button

---

## 5. Gallery Tab – Community Browsing

### 5.1 View Modes

**Logo View**

- Grid of clean pixel logos (no card frame)
- Pure art-focused display
- Clicking logo opens cast details or navigates to Warpcast

**Cast View**

- Grid of cast cards with card images (branded, framed)
- Shows: Username, time posted, like count, rarity chip
- Full social metadata visible

### 5.2 Filtering System

**Rarity Filter**

- Options: All, Common, Rare, Epic, Legendary, Unknown
- Default: All
- Affects gallery results in real-time
- Persisted in component state (not URL)

**Preset Filter**

- Options: All, Arcade, Vaporwave, Game Boy, Cyberpunk, Sepia, etc.
- Default: All
- Combined with rarity filter (AND logic)

**Recent Only Toggle**

- Option: Last 7 days
- When enabled: Only shows casts from past week
- Helps users discover fresh content

### 5.3 Grid Display

**Card Layout**

- Responsive: 2–4 columns (mobile to desktop)
- Each card height: ~300px
- Lazy loading: Images load as viewport scrolls
- Fallback placeholder: Gray background + logo icon

**Card Information**

- Logo image (main content area)
- Username + avatar (small circle, top-right)
- Posted time (relative: "2h ago", "1d ago")
- Rarity chip + preset chip (glow effect)
- Like count + recast count

**Interactions**

- Hover/tap: Scale up card slightly
- Double-tap: Like the cast (if user signed in)
- Long-tap: More options menu (share, remix, open in Warpcast)

### 5.4 Pagination

- **Load More Button**: "Show more" button at bottom
- Or: Infinite scroll on scroll-to-bottom
- Page size: 12–24 casts per load
- Loading state: Spinner + "Loading more casts..."
- No results state: "No casts found with those filters"

### 5.5 Favorites & Recent Logos (Local)

**Favorites Strip** (if any saved)

- Horizontal scrollable row
- Label: "YOUR FAVORITES"
- Tap to reload logo with same settings
- Returns to Home tab with logo loaded

**Recent Logos Strip** (if any generated)

- Horizontal scrollable row
- Label: "RECENT LOGOS"
- Last 10 generated logos
- Tap to reload logo

---

## 6. Leaderboard Tab – Global Rankings

### 6.1 Leaderboard Sections

**Today's Winners (Top 3)**

- Card display with rank badges (🥇, 🥈, 🥉)
- Each card shows:
  - Rank + logo (clean art, no frame)
  - Username
  - Cast time
  - Like count
  - Rarity chip

**Global Leaderboard (Last 7 Days)**

- Paginated list (12–24 per page)
- Multiple sort options:
  - **Trending**: Ranked by engagement score (likes + recasts + views)
  - **Recent**: Newest first
  - **Most Likes**: Sorted by like count descending

**Entry Display**

- Rank number (if trending sort)
- Logo thumbnail (100×100px, clean)
- Username (clickable → profile)
- Rarity + preset chips
- Like + recast counts
- Posted time (relative)

**Interactions**

- Tap logo: View full cast or details
- Tap username: Navigate to user profile
- Like button: If signed in, increment like count
- Remix button: Load logo settings in Home generator

### 6.2 Recent Casts List

- Supplementary list (separate section or tab within leaderboard)
- Shows last 50 casts in chronological order
- Each item: Logo thumbnail + username + time + rarity
- Click to open in Warpcast (external link)

---

## 7. Challenge Tab – Daily Challenge Tracker

### 7.1 Challenge Overview Panel

**Header Info**

- Title: "DAILY CHALLENGES" or "CHALLENGE QUEST"
- Streak counter: "STREAK: X" (animated counter with sparkles)
- Progress bar: "X / 6 completed today"
- Reset timer: "Resets in HH:MM" (countdown to midnight UTC)

### 7.2 Challenge List

**Today's 6 Prompts**
Each challenge displays:

- Challenge number (1–6)
- Prompt text (short, 3–8 words)
- Difficulty indicator (⭐, ⭐⭐, etc.)
- Checkbox: Checked if completed
- Generate button (jumps to Home with prompt pre-filled)
- Optional: Hint or description

**Challenge Completion**

- User clicks **Generate** button
- Home tab loads with prompt pre-filled in input
- User generates logo with that prompt
- Backend tracks completion automatically (if prompt matches)
- Checkbox updates to completed state
- If all 6 completed: **Daily Champion** badge awarded

### 7.3 Streak System

**Mechanics**

- Consecutive days of completing all 6 challenges
- Visible in header with animated counter
- Preserved in database table: `ChallengeCompletion`
- Resets if user misses a day (no completion for that day)

**Streak Rewards**

- Visual milestone markers: 3-day, 7-day, 14-day, 30-day
- Badge awards at key milestones:
  - **STREAK_STARTER**: 3-day streak
  - **STREAK_MASTER**: 7-day streak
  - **STREAK_LEGEND**: 30-day streak
- Bonus tries for longer streaks (if configured)

### 7.4 History Grid

**Past Days View**

- Calendar or grid showing last 7–30 days
- Each day cell shows: Date + completion status
  - ✅ Green: Fully completed (all 6)
  - ⚠️ Yellow: Partial completion
  - ❌ Gray: Not completed
  - Empty: Day not started

**Interaction**

- Click day to see that day's prompts (view-only)
- Visual highlight on today's row

---

## 8. Profile Tab & Page (`/profile/[username]`)

### 8.1 Profile Tab (Quick Preview in App)

**Quick Stats** (if signed in)

- Username with verification badge (if applicable)
- Cast count: "X casts"
- Total likes: "❤️ X"
- Forge Rank indicator (letter + color)
- Rarity Master badge (if unlocked)
- Current level (computed: floor(castCount / 5) + 1)

**Sign-In Prompt** (if not signed in)

- Message: "Sign in with Farcaster to view your profile"
- Button: "Open in Farcaster" (if mini-app available)
- Or: "View Profiles" → Link to /profile page

**Navigation**

- "Open your profile" link → /profile/[username]
- Opens full profile page in same tab or modal

### 8.2 Profile Page Layout (`/profile/[username]`)

#### **A. Header Section**

**Visit State Indicator**

- Own profile: "YOUR FORGE" (banner, accent color)
- Other profile: "VIEWING @[USERNAME]'S FORGE"
- Subtle background aura based on best rarity achieved:
  - COMMON: Gray glow
  - RARE: Cyan/blue glow
  - EPIC: Purple/violet glow
  - LEGENDARY: Gold/yellow glow

**Username Display**

- Large, monospace font (40–60px)
- Text glow effect (color matches rarity aura)
- Optional: Pixel-art style rendering

**Emblems** (Right side, stacked)

- ⭐ **Star**: User has at least one LEGENDARY rarity logo
- 🔥 **Fire**: User cast 3+ logos in last 7 days (on fire!)
- 🔱 **Trident**: User is Rarity Master (all 4 rarities collected)
- Animated slide-in on page load
- Tooltip on hover: Explains badge

**Follow Button** (Other profiles only)

- Calls Farcaster SDK: `sdk.actions.openCast()` or `sdk.actions.composeCast()`
- Text: "Follow @[username]"
- Color: Accent (teal, purple, or gold based on rarity)
- Desktop: May fallback to "Open on Warpcast" link

**Back Link**

- Top-left: Arrow + "Back"
- Returns to previous page or Home tab

#### **B. Stats Section (Arcade Console Style)**

Monospace font (Courier New or similar), glow effects, dark background panel.

```
┌─────────────────────────────────┐
│  LEVEL        FORGE RANK        │
│    42              S+            │
│  BEST RARITY    PLAYTIME        │
│  LEGENDARY      123 days ago     │
└─────────────────────────────────┘
```

**Displayed Metrics**

- **LEVEL**: Computed as `floor(totalCasts / 5) + 1` (max ~50)
- **FORGE RANK**: D / C / B / A / S / S+ (weighted: casts + best rarity + legendary count)
- **BEST RARITY**: Highest rarity achieved (LEGENDARY > EPIC > RARE > COMMON)
- **PLAYTIME**: Time since first cast (relative date: "3 days ago")

#### **C. Rarity Collection Progress**

**4-Column Console**

- Visual grid showing rarity progression
- Each rarity column:
  - Icon (colored circle or symbol)
  - Label: "COMMON", "RARE", "EPIC", "LEGENDARY"
  - Count: "X entries" or "X/10 collected"
  - Progress bar (0–100%, colored gradient)
  - Glow effect matching rarity color

**Rarity Master Badge** (if unlocked)

- Golden banner spanning across progress section
- Text: "⭐ RARITY MASTER"
- Subtitle: "You've collected all rarity tiers!"
- Unlock animation on first achievement (sparkles, scale-up)
- Persists visibly once unlocked

**If Not Unlocked**

- Hint message: "Collect your first Rare!" or next milestone
- Progress toward next milestone shown

#### **D. Signature Logo Section**

**Signature Logo Display** (if selected)

- Large framed image (400×400 or 500×500px)
- Rarity-colored border:
  - COMMON: Gray border
  - RARE: Cyan border
  - EPIC: Purple border
  - LEGENDARY: Gold border
- Optional: "Player's Choice" label
- Quote/caption: "This is my identity" or custom user text (if feature added)

**Select Signature Logo Button**

- Below image: "SELECT A SIGNATURE LOGO" or "CHANGE SIGNATURE"
- Opens modal with gallery grid
- Grid shows: Top 20–50 logos by rarity or date
- Click logo to set as signature
- Selection persisted in database
- If no signature set: Placeholder image + "No signature selected"

**Modal Interaction**

- Grid of logos (4 columns)
- Each card: Logo + creation date + rarity chip
- Tap to confirm selection
- Confirmation toast: "Signature logo updated!"
- Modal closes and profile updates

#### **E. Unlocked Rewards (Achievement Cards)**

**Card Grid** (2–3 columns, mobile to desktop)

- Title: "UNLOCKED REWARDS" or "ACHIEVEMENT GALLERY"
- Each badge/reward card displays:
  - Icon (emoji or pixel art)
  - Title (e.g., "First Forge", "Rare Collector")
  - Description ("Cast your first logo")
  - Earned date ("Earned 2 months ago")
  - Rarity color border (common/rare/epic/legendary)

**Badge Types** (see lib/badgeTypes.ts)

- **Achievement Badges**: First Cast, Novice/Skilled/Master/Legendary Forger
- **Rarity Badges**: Rare/Epic Collector, Legendary Hunter/Master
- **Challenge Badges**: Daily Champion, Week Warrior, Streak badges, Challenge Master
- **Social Badges**: Popular, Viral, Community Favorite, Recast King
- **Winner Badges**: Daily Winner, Weekly Champion

**Locked Badges** (if shown)

- Grayed out appearance
- Shows requirement: "5 more casts to unlock"
- Optional: Unlock animation when requirement met

#### **F. Next Objective Panel**

**Motivation Message**

- Displayed if rarity collection incomplete
- Examples:
  - "Collect your first RARE!" (if no rare yet)
  - "Find an EPIC!" (if rare collected but no epic)
  - "Hunt for LEGENDARY!" (if epic collected but no legendary)
- Dismissible (X button) or auto-dismisses after collection complete
- Animated entrance (slide up)

#### **G. Latest Cast Highlight ("SHOWCASE")**

**Showcase Card** (prominent display)

- Title: "SHOWCASE" or "LATEST CREATION"
- Large display (600×400 or full-width responsive)
- Image: Card version (framed with rarity branding)
- Metadata:
  - Posted date ("Created 2 hours ago")
  - Rarity with color glow
  - Like count ("❤️ 42 likes")
  - Recast count (if tracked)
  - Seed number (small, gray text)

**Interaction**

- Tap to view full cast on Warpcast
- Hover: Scale up slightly, increase shadow
- Animated entrance on page load

#### **H. Filters & Gallery**

**Filter Controls** (horizontal bar)

- **Rarity**: All / Common / Rare / Epic / Legendary (chips or dropdown)
- **Preset**: All / Arcade / Vaporwave / Game Boy / etc. (chips)
- **Recent Only**: Toggle for last 7 days
- Active filters show as colored pills with X to remove

**Gallery Grid**

- Title: "[Username]'s Collection" or similar
- Grid of logos (3–4 columns, responsive)
- Each card:
  - Clean pixel logo (no frame, art-focused)
  - Rarity chip (small badge, top-right)
  - Preset chip (if applicable)
  - Posted date (small gray text, bottom)
  - Like count (optional, hover to show)

**Interaction**

- Tap logo: View full cast details or navigate to Warpcast
- Lazy loading: Images load as user scrolls
- Infinite scroll or pagination: "Load more" button

#### **I. Action Buttons**

**Share Collection** (Prominent, accent-colored button)

- Generates **Player Card** (600×600 or 800×900 PNG):
  - Background: Dark with subtle grid or aura pattern
  - Username (large, monospace, glowing)
  - Level + Forge Rank (displayed as "LV.42 | RANK:S+")
  - Best Rarity (color-coded badge)
  - Signature logo (if selected, framed and centered)
  - Rarity Master badge (if unlocked, corner banner)
  - "Made with Pixel Logo Forge" watermark
  - Optional: Arcade border/bezel effect

**Card Generation Flow**

1. Click "Share Collection" button
2. Display loading spinner: "Generating player card..."
3. Canvas-based generation (DOM, client-side)
4. Upload to Vercel Blob (if `BLOB_READ_WRITE_TOKEN` set) or use data URL
5. Compose Farcaster cast with:
   - Text: "My Pixel Logo Forge player card 🎮"
   - Embeds: Player card image URL + best logo URL
6. Toast: "Shared to Warpcast! 🎉"

**Copy Profile Link** (Secondary button)

- Copies: `https://[NEXT_PUBLIC_APP_URL]/profile/[username]`
- If `NEXT_PUBLIC_APP_URL` not set: Fallback to window.location.origin
- Toast: "Profile link copied!"
- Fallback: Opens URL in new tab if clipboard not available

---

## 9. Image Display Context Strategy

### 9.1 Context-Based Image Selection

The app maintains **strict separation** between two image types per logo entry:

#### **Logo Images** (used in galleries, collections, previews)

- File: `logoImageUrl`
- Content: Clean pixel art, no UI chrome, no frame
- Size: 512×512 or 256×256px
- Use cases:
  - Home generator preview
  - Gallery grid
  - Leaderboard/leaderboard list
  - Profile collection grid
  - Signature logo display
  - Recent/Favorites strips

#### **Card Images** (used in social sharing)

- File: `cardImageUrl`
- Content: Framed social card with rarity branding, username, metadata
- Size: 1200×630 or 600×600px (OG image sizes)
- Use cases:
  - Farcaster cast embeds
  - Player card generation
  - Warpcast preview modal
  - Social share (Twitter, Discord, etc.)
  - Open Graph preview (when shared)

### 9.2 Helper Function: `getImageForContext()`

Located in [lib/imageContext.ts](lib/imageContext.ts)

```typescript
type ImageRenderContext =
  | "gallery" // Use logoImageUrl
  | "leaderboard" // Use logoImageUrl
  | "profile" // Use logoImageUrl
  | "cast" // Use cardImageUrl
  | "share" // Use cardImageUrl
  | "og" // Use cardImageUrl
  | "preview"; // Use cardImageUrl

function getImageForContext(
  entry: LeaderboardEntry,
  context: ImageRenderContext,
): string {
  // Returns appropriate image URL based on context
}
```

### 9.3 Image Generation & Storage

**Generation Flow** (in `lib/logoGenerator.ts`)

1. Generate logo pixel art on canvas
2. Export as PNG: **logoImageUrl** (clean art)
3. Render overlay frame + metadata on canvas
4. Export as PNG: **cardImageUrl** (framed card)

**Storage**

- **Vercel Blob** (if `BLOB_READ_WRITE_TOKEN`):
  - Upload both images to Blob storage
  - Return public CDN URLs
  - Cache-Control: Public, 1-year max-age
- **In-Memory Store** (fallback):
  - Store data URLs in Node.js memory (Map)
  - 10-minute TTL per image
  - Garbage collection on cleanup
  - Return `/api/logo-image?id=<entry-id>` URL

---

## 10. iOS-Specific Features

### 10.1 Web Share API Integration

**Download Image Button (iOS)**

1. Detect iOS device: `navigator.userAgent` or capability detection
2. Use `navigator.share()` API:
   ```typescript
   await navigator.share({
     title: `Pixel Logo: ${text}`,
     text: `Check out my logo`,
     files: [new File([blob], "logo.png", { type: "image/png" })],
   });
   ```
3. User sees native share sheet
4. Option: "Save Image" → Photos app
5. Image saved to device's photo library

**Desktop Fallback**

- Standard browser download (triggers `<a download>`)
- File saved to Downloads folder

### 10.2 Graceful Degradation

- Check for `navigator.share` availability
- If unavailable: Fallback to manual selection + copy link
- Display alert: "Copy the link below and share manually"
- Provide data URL fallback for offline access

### 10.3 PWA Considerations (Optional Future)

- Add `manifest.webmanifest` for home screen install
- Service worker for offline support
- Caching strategy: Cache images, network-first for data

---

## 11. Authentication & User Context

### 11.1 Farcaster Integration

**SDK Initialization** (`components/LogoGenerator.tsx`)

1. Import: `@farcaster/miniapp-sdk`
2. Call: `sdk.actions.ready()` after 3-second splash delay
3. Get context: `sdk.context` → `{ user: { fid, username } }`
4. Store in state: `userInfo = { fid, username }`

**User Detection**

- **Signed In**: `userInfo.username` is set
- **Not Signed In**: `userInfo === null` or `username === undefined`

### 11.2 Session Persistence

**localStorage Keys**

- `farcasterUsername`: Current user's username
- `farcasterFid`: User's Farcaster ID
- `plf:autoReplyEnabled`: Auto-reply preference
- `plf:soundEnabled`: Sound toggle
- `plf:miniappAdded`: Whether mini-app was added

**Logout** (if feature added)

- Clear localStorage keys
- Set `userInfo = null`
- Redirect to home (unauthenticated state)

### 11.3 Non-Farcaster Web Access

- App accessible via direct URL without Farcaster
- SDK calls gracefully fail (no composeCast, etc.)
- Fallback URLs provided (Warpcast compose, share APIs)
- User can browse gallery, view leaderboard, but cannot cast

---

## 12. Data Model & Persistence

### 12.1 Prisma Schema Tables

#### **LeaderboardEntry**

```prisma
id           String   @id  // Unique entry ID
text         String        // Logo text input
seed         Int           // Deterministic seed
imageUrl     String        // Legacy field (deprecated)
logoImageUrl String?       // Clean pixel art URL
cardImageUrl String?       // Framed social card URL
username     String        // Farcaster username
displayName  String        // User's display name
pfpUrl       String        // Profile picture URL
likes        Int           // Like count
recasts      Int           // Recast count
rarity       String?       // COMMON | RARE | EPIC | LEGENDARY
presetKey    String?       // Preset identifier
views        Int           // View count (optional)
createdAt    DateTime      // Timestamp
castUrl      String?       // Warpcast cast URL
```

#### **Badge**

```prisma
id          String   @id
userId      String        // Username
badgeType   String        // Badge identifier
earnedAt    DateTime
metadata    Json?         // Optional extra data
```

#### **ChallengeCompletion**

```prisma
id          String   @id
userId      String
challengeId String        // Challenge theme/ID for today
date        DateTime      // Date of completion
prompts     String[]      // Prompts completed
completedAt DateTime
```

### 12.2 API Routes

| Route                         | Method   | Purpose                            |
| ----------------------------- | -------- | ---------------------------------- |
| `/api/logo-image`             | GET/POST | Store & serve logo images          |
| `/api/leaderboard`            | GET/POST | Leaderboard CRUD                   |
| `/api/generated-logos/random` | GET      | Random logo for browse             |
| `/api/user-stats`             | GET      | User profile stats                 |
| `/api/badges`                 | GET/POST | Badge operations                   |
| `/api/challenges`             | GET/POST | Challenge tracking                 |
| `/api/search`                 | GET      | Search logos by username/seed/text |
| `/api/admin/health`           | GET      | Admin health check                 |
| `/api/webhook`                | POST/GET | Farcaster webhook (optional)       |

---

## 13. Daily Limits & Rules

### 13.1 Generation Limits

**Standard Users**

- 3 tries per day (24-hour rolling window, UTC)
- Resets at 00:00 UTC

**Rarity Master Users**

- 4 tries per day (3 + 1 bonus)
- Bonus awarded automatically when all 4 rarities collected
- Revoked if collection incomplete (edge case handling)

**Custom Seed**

- 1 custom seed per day
- Using same seed twice+ in one day costs a try (if unique seed limit enforced)
- Or: Allow unlimited retries with same seed (depending on design decision)

### 13.2 Daily Prompt

- Single theme-based prompt per day
- Example: "Nike", "Space Invaders", "Cyberpunk"
- Visible in Home tab
- Optional use (not mandatory for generation)

### 13.3 Challenge Rules

- 6 prompts per day
- All prompts reset at 00:00 UTC
- Completing all 6 = **Daily Champion** badge + streak increment
- Streak resets if user doesn't complete all 6 on any day

---

## 14. Rarity System & Scoring

### 14.1 Rarity Tiers

**COMMON** (60% of generations)

- Few effects/features
- Basic color palette
- Standard frame or no frame
- Single badge max

**RARE** (25% of generations)

- Multiple effects enabled
- Advanced color palette
- Interesting frame style
- 2–3 badges

**EPIC** (12% of generations)

- Most effects enabled
- Premium color palette + depth
- Complex composition
- 3–5 badges
- Rare depth preset (cyber-neon, gold-trophy, etc.)

**LEGENDARY** (3% of generations)

- All effects enabled at max intensity
- Exotic color system
- Maximum depth and lighting
- 4–5 badges
- Signature depth + special composition

### 14.2 Rarity Determination Algorithm

Located in [lib/logoGenerator.ts](lib/logoGenerator.ts)

Rarity determined by:

1. Seeded random number (0–1)
2. Feature count & complexity
3. Depth/lighting presence
4. Badge count
5. Color system rarity value

```
if (randomValue < 0.60) → COMMON
else if (randomValue < 0.85) → RARE
else if (randomValue < 0.97) → EPIC
else → LEGENDARY
```

---

## 15. Forge Rank System

### 15.1 Rank Tiers

| Rank   | Score Range | Badges | Characteristics |
| ------ | ----------- | ------ | --------------- |
| **D**  | 0–10        | 0–2    | Newcomer        |
| **C**  | 10–25       | 1–3    | Emerging        |
| **B**  | 25–50       | 2–5    | Competent       |
| **A**  | 50–75       | 3–7    | Advanced        |
| **S**  | 75–90       | 4–10   | Expert          |
| **S+** | 90+         | 5+     | Master          |

### 15.2 Scoring Algorithm

Located in [components/ProfileClient.tsx](components/ProfileClient.tsx)

```typescript
let score = 0;

// Cast count (max 50 points)
score += Math.min(casts, 50);

// Rarity bonus
switch (bestRarity.toUpperCase()) {
  case "LEGENDARY":
    score += 40;
  case "EPIC":
    score += 25;
  case "RARE":
    score += 10;
  case "COMMON":
    score += 5;
}

// Legendary multiplier
score += legendaryCount * 5;

// Engagement bonus (likes + recasts)
score += Math.floor(totalLikes / 10);
score += Math.floor(totalRecasts / 5);
```

---

## 16. Badge System & Achievements

### 16.1 Badge Categories

**Achievement Badges** (Cast milestones)

- First Cast 🎯
- Novice Forger 🔨 (5 casts)
- Skilled Forger ⚒️ (25 casts)
- Master Forger 🏆 (100 casts)
- Legendary Forger 👑 (500 casts)

**Rarity Badges** (Collection milestones)

- Rare Collector 🔵 (10 RARE)
- Epic Collector 🟣 (5 EPIC)
- Legendary Hunter 👑 (1 LEGENDARY)
- Legendary Master 🏅 (10 LEGENDARY)

**Challenge Badges** (Daily challenges)

- Daily Champion ⭐ (Complete all 6 today)
- Week Warrior 🗓️ (7 daily challenges)
- Streak Starter 🔥 (3-day streak)
- Streak Master 🔥🔥 (7-day streak)
- Streak Legend 🔥👑 (30-day streak)
- Challenge Master 🎯 (50 challenges)

**Social Badges** (Engagement)

- Popular ❤️ (10 likes)
- Viral 📈 (50 likes)
- Community Favorite 🌟 (100 likes)
- Recast King 🔄 (10 recasts)

**Winner Badges** (Leaderboard)

- Daily Winner 🥇
- Weekly Champion 🏆

### 16.2 Badge Tracking

- Stored in database: `Badge` table
- `userId`: Username
- `badgeType`: Badge identifier
- `earnedAt`: Timestamp
- `metadata`: Optional extra data (e.g., streak count)

### 16.3 Badge Display

**On Profile**

- Grid of earned badges with icons, names, descriptions
- Visual rarity: Common (gray), Rare (cyan), Epic (purple), Legendary (gold)
- Locked badges shown grayed out with unlock requirement

**In Rewards Modal**

- Full badge details: Icon, name, description, earned date, achievement progress

---

## 17. Moments & Celebratory Popups

### 17.1 Moment Triggers

Located in [components/LogoGenerator.tsx](components/LogoGenerator.tsx)

**Stored Moments** (localStorage key: `plf:moments`)

- `first_rare`: First RARE rarity pulled
- `first_epic`: First EPIC pulled
- `first_legendary`: First LEGENDARY pulled
- `rarity_master`: All 4 rarities collected
- `streak_3`: 3-day challenge streak
- `streak_7`: 7-day challenge streak
- `level_10`: Reached level 10
- `level_25`: Reached level 25

### 17.2 Moment Display

**Popup Modal** (center screen)

- Icon (emoji, large): 🔵 🟣 👑 🎯 🔥 ⭐
- Title (uppercase): "FIRST RARE", "RARITY MASTER"
- Subtitle (sentence): "You just pulled something special"
- Auto-dismiss after 5 seconds
- Or: Click to dismiss
- Animated entrance (scale-up from center)
- Animated exit (fade out)

### 17.3 Moment Sharing

- "Share this moment" button
- Opens Farcaster compose with pre-filled text
- Example: "Just achieved RARITY MASTER! 🎉"
- Includes app link

---

## 18. Animations & Visual Effects

### 18.1 Generation Animation (Seed Crack)

- Duration: 2–3 seconds
- Multiple stages (see section 4.3)
- Smooth easing: ease-out for crack, ease-in-out for vibration
- Sound effects (optional, toggle-able):
  - Crack sound: 0.5s
  - Pop sound: At bloom reveal

### 18.2 Profile Animations

**Emblem Entrance**

- Slide in from right, one at a time
- Stagger: 0.2s between each emblem
- Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)

**Level Counter Tick-Up**

- Animated from 0 to final level
- Duration: 1s
- Easing: ease-in-out
- Font size: Slight pulse effect at end

**Card Unlock Sparkle**

- Badge card appears with sparkle animation
- Sparkle particles: 8–12 bursts
- Duration: 0.6s
- Color: Rarity-matched (gold for legendary, etc.)

### 18.3 Floating Effects

**Aura Float** (Profile background)

- Subtle vertical floating motion
- Amplitude: 5–10px
- Period: 4–6 seconds
- Infinite loop
- Opacity: 0.3–0.5

**Logo Glow** (Leaderboard/gallery cards)

- Rarity-colored glow around logo
- Opacity pulse: 0.5 → 1.0 → 0.5
- Duration: 2s cycle
- Glow blur: 10–20px

---

## 19. Error Handling & States

### 19.1 Toast Notifications

**Success Messages**

- "Seed copied!" (copy action)
- "Saved to favorites!" (save action)
- "Shared to Farcaster! 🎉" (cast action)
- "Downloaded successfully!" (download action)

**Error Messages**

- "Failed to generate logo. Try again." (generation error)
- "Upload failed. Retrying..." (image upload error)
- "Farcaster not available. Using web share instead." (SDK fallback)
- "Please enter a text" (validation error)

**Info Messages**

- "3 TRIES LEFT TODAY" (status)
- "Add to collection is available in Farcaster." (SDK-only feature)
- "Cast cancelled" (user action cancelled)

**Toast UI**

- Position: Bottom-right (mobile: full-width bottom)
- Auto-dismiss: 3–5 seconds
- Swipeable (mobile)
- Custom color by type: Success (green), Error (red), Info (blue)

### 19.2 Loading States

**Generation Loading**

- Spinner animation (rotating icon)
- Disabled input + buttons
- Text: "Generating..." or "Forging..."

**Image Upload Loading**

- Spinner with progress: "Uploading image..."
- Cancel button (if applicable)

**Leaderboard/Gallery Loading**

- Skeleton placeholders (gray boxes matching card size)
- 6–12 skeleton cards visible
- Fade to real content when loaded

### 19.3 Empty States

**No Casts in Gallery**

- Icon (empty frame) + text: "No casts found with those filters"
- Suggestion: "Try adjusting your filters"

**No Badges Yet**

- Icon (locked badge) + text: "No badges earned yet"
- Tip: "Start casting to unlock achievements"

**No Signature Logo**

- Placeholder image + text: "No signature selected"
- Button: "SELECT A SIGNATURE LOGO"

---

## 20. Global Features & Utilities

### 20.1 Help / How It Works Modal

**Sections**

1. **Seeds Explained**: Deterministic generation, same text = same logo
2. **Rarity System**: How rarities are determined, percentages
3. **Daily Limits**: 3 tries per day, +1 for Rarity Master
4. **Forge Rank**: Scoring algorithm overview
5. **Challenges**: How daily challenges work, streaks
6. **Casting**: How to share to Farcaster, image types

**Accessibility**

- Toggleable from header or menu
- Keyboard closable (Escape key)
- Readable font size, sufficient contrast
- Optional: Video walkthroughs or GIFs

### 20.2 Settings / Preferences (Optional)

**Toggles**

- 🔊 Sound effects: On/Off
- 🔄 Auto-reply: On/Off (include app link when casting)
- 🌑 Dark mode: On/Off (already default, but option to force)

**Stored in localStorage**

- `plf:soundEnabled`
- `plf:autoReplyEnabled`
- `plf:darkModeEnabled`

### 20.3 Search / Discovery

**Search Types** (in Gallery or Leaderboard)

- **Username**: Find logos by user
- **Seed**: Look up specific seed number
- **Text**: Find logos by input text

**Search Interaction**

- Search bar in header or dedicated page
- Type to search in real-time (debounce 0.3s)
- Results grid or list
- "No results" state with suggestions

---

## 21. Presets & Themes

### 21.1 Available Presets

| Preset        | Color Palette         | Style                      | Vibe              |
| ------------- | --------------------- | -------------------------- | ----------------- |
| **Arcade**    | NES, bright primaries | Bezel frame, pixel-perfect | Retro 80s         |
| **Vaporwave** | Pastel, sunset        | Synthetic, gradient        | Aesthetic 90s     |
| **Game Boy**  | Green monochrome      | LCD screen effect          | Nostalgia         |
| **Cyberpunk** | Neon, electric        | Glitch effects, grid       | Futuristic        |
| **Sepia**     | Brownish tones        | Film grain                 | Vintage           |
| **Classic**   | Limited palette       | Simple, clean              | Minimal           |
| **CGA**       | DOS-era colors        | Pixelated, bold            | Computing history |
| **Random**    | Any palette           | Any style                  | Surprise!         |

### 21.2 Preset Selection

- Dropdown or pill selector (responsive)
- Preview swatch shown (small color grid)
- "Random" option re-rolls on each generation
- Default: Random (assigned per-generation)

### 21.3 Preset Persistence

- Selected preset stored in component state during session
- Not persisted across sessions (optional feature)
- Used when casting/sharing: "Generated with Arcade preset"

---

## 22. Mobile & Responsive Design

### 22.1 Breakpoints

| Device      | Width      | Behavior                                        |
| ----------- | ---------- | ----------------------------------------------- |
| **Mobile**  | < 480px    | Full-width, single column, larger touch targets |
| **Tablet**  | 480–1024px | 2-column grids, bottom tab bar                  |
| **Desktop** | > 1024px   | 3–4 column grids, side navigation option        |

### 22.2 Touch Interactions

- Buttons: 44×44px minimum (touch target)
- Double-tap to like (gallery cards)
- Long-tap for context menu
- Swipe to dismiss toast/modal

### 22.3 iOS Optimizations

- Safe area insets (notch + home indicator)
- Web Share API for saving to Photos
- PWA metadata for home screen install (optional)
- Viewport settings: `width=device-width, initial-scale=1.0, viewport-fit=cover`

---

## 23. Performance & Optimization

### 23.1 Image Optimization

- Canvas-based generation (no external image files)
- Lazy loading: Images load as viewport enters
- Responsive images: srcset for different sizes
- Cache-Control: Public, max-age=31536000 (1 year)

### 23.2 Code Splitting

- Dynamic imports for modals (`CastPreviewModal`, `SignatureSelector`)
- Separate bundle per route (Next.js automatic)
- No heavy dependencies on critical path

### 23.3 Database Optimization

- Indexes on: `createdAt`, `username`, `rarity`
- Pagination: 12–24 results per page
- Caching: User profile cached in localStorage (1-hour TTL)

---

## 24. Security & Privacy

### 24.1 Input Validation

- Text input: Max 30 characters, alphanumeric + symbols
- Seed input: Numeric only (0–2³²-1)
- Username: From Farcaster SDK (trusted source)

### 24.2 CORS & Headers

- `Access-Control-Allow-Origin: *` (for image serving)
- `Content-Security-Policy`: Restrict script sources
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

### 24.3 Data Handling

- User IP not logged (unless analytics added)
- Seed not tied to user identity (deterministic, publicly visible)
- Username from Farcaster (user consented)
- No personal data in localStorage beyond username/fid

---

## 25. Testing & QA Checklist

### 25.1 Feature Testing

- [ ] Logo generation produces different logos for different seeds
- [ ] Same seed + text always produces identical logo
- [ ] Rarity distribution matches expected percentages
- [ ] Daily tries limit enforced correctly
- [ ] Custom seed limit (1 per day) enforced
- [ ] Challenges reset at 00:00 UTC
- [ ] Badges award on correct triggers
- [ ] Streak persists across days, resets on missed day

### 25.2 Integration Testing

- [ ] Farcaster SDK ready() initializes correctly
- [ ] composeCast() works in Farcaster client
- [ ] Fallback URLs generated for non-Farcaster browsers
- [ ] Image upload to Vercel Blob succeeds
- [ ] In-memory fallback works if Blob unavailable
- [ ] Web Share API triggers on iOS
- [ ] Browser download works on desktop

### 25.3 UI/UX Testing

- [ ] Seed crack animation plays smoothly (60fps)
- [ ] Profile animations trigger on load
- [ ] Toasts dismiss automatically or on user action
- [ ] Modals close on Escape key or X button
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Touch targets are 44×44px minimum
- [ ] Fonts render correctly (monospace for seed, sans-serif for body)

### 25.4 Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

---

## 26. Deployment & Environment

### 26.1 Build & Deploy Commands

```bash
# Development
npm run dev                    # Local dev server

# Production
npm run build                  # Next.js build + Prisma generate
npm run start                  # Vercel start

# Prisma
npx prisma migrate dev        # Local migration
npx prisma migrate deploy     # Production migration (in vercel-build script)
npx prisma generate           # Generate Prisma Client
```

### 26.2 Environment Variables

| Variable                | Required | Purpose                             |
| ----------------------- | -------- | ----------------------------------- |
| `DATABASE_URL`          | ✅       | PostgreSQL connection string        |
| `BLOB_READ_WRITE_TOKEN` | ❌       | Vercel Blob write access (optional) |
| `NEXT_PUBLIC_APP_URL`   | ❌       | App base URL for share links        |

### 26.3 Farcaster Manifest

- File: `public/.well-known/farcaster.json`
- Contains: Icon URL, home URL, app name, account association signature
- Deployed with Next.js static files
- No build changes required

---

## 27. Future Enhancement Ideas

1. **User Profiles**: Custom user pages with bio, social links
2. **Following System**: Follow users, curated feed
3. **Collections**: Group logos by theme/preset
4. **Marketplace**: Trade or sell special logos (if applicable)
5. **Achievements**: In-game progression system (levels, unlocks)
6. **Tournaments**: Weekly/monthly logo generation contests
7. **Analytics**: Track generation trends, popular presets
8. **API**: Public API for third-party integrations
9. **Remix Trading**: Exchange remixed versions
10. **Custom Frames**: User-designed frames/overlays

---

## 28. Glossary & Terminology

| Term              | Definition                                                            |
| ----------------- | --------------------------------------------------------------------- |
| **Seed**          | Deterministic number that generates identical logos for the same text |
| **Rarity**        | Classification of logo complexity (COMMON, RARE, EPIC, LEGENDARY)     |
| **Forge Rank**    | User's engagement rank (D–S+) based on casts, rarity, engagement      |
| **Rarity Master** | Badge earned when user collects all 4 rarity tiers                    |
| **Challenge**     | Daily themed prompt to generate logos (6 per day)                     |
| **Streak**        | Consecutive days of completing all daily challenges                   |
| **Badge**         | Achievement unlocked through milestones                               |
| **Moment**        | Celebratory popup for major achievements                              |
| **Cast**          | Farcaster post/message (like a tweet)                                 |
| **Recast**        | Farcaster equivalent of retweeting                                    |
| **Mini-App**      | Farcaster-native app (vs. standalone web app)                         |
| **SDK**           | Farcaster Mini App SDK for native integrations                        |

---

## 29. Document Revision History

| Version | Date         | Changes                             |
| ------- | ------------ | ----------------------------------- |
| 1.0     | Jan 25, 2026 | Initial comprehensive specification |

---

**End of Document**

_For questions or clarifications, refer to the codebase comments or open an issue in the repository._

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
