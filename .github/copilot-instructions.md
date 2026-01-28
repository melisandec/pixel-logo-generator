# Copilot instructions — Pixel Logo Forge

Purpose: short, actionable pointers so AI coding agents can be immediately productive in this repo.

1. Big picture

- Next.js 14 App Router app living under `app/` (client components use `use client`). UI + canvas-based logo generator runs in the browser. Server work lives in `app/api/*` (serverless routes) and uses Prisma for persistence.
- Logo generation is implemented in the browser (canvas) in `lib/logoGenerator.ts` and wired to the UI in `components/LogoGenerator.tsx`. Server routes help with image upload/serving and leaderboard persistence.
- **Two modes of operation:**
  - `/` (normal mode) - Public logo generator with daily usage limits, regular style variants
  - `/demo` (exclusive mode) - Demo-exclusive logos from a managed seed pool (5,000 seeds in range 100_000_000–100_004_999) with premium styling, transaction-locked for concurrency safety
- **Styling system**: 80s neon arcade aesthetic with SVG filters (neon glow, chrome, bloom, holographic), deterministic color palettes, and variant pools (12 palettes, 6 gradients, 4 glows, 4 chromes, 3 blooms, 4 textures, 4 lightings) = 9,216 total style combinations
- **Search & filters**: 7 filter components (SearchField, RarityControl, PresetControl, QuickActions, ActiveFilterPills, ResultCount, FilterBar) supporting advanced filtering (Liquid Neon, Comic Book, Wave Ripple, Holographic Shine, etc.) with rarity-based stacks

2. Important workflows / commands

- Dev: `npm install` then `npm run dev` (Next dev server).
- Build: `npm run build` — note `build` runs `prisma generate && next build`.
- Production / Vercel: `npm run vercel-build` runs `prisma migrate deploy && prisma generate && next build`.
- Postinstall: `prisma generate` runs automatically via `postinstall` script.

3. Environment variables the agent must be aware of

- `DATABASE_URL` — Postgres connection used by Prisma (prisma/schema.prisma). Required for all database operations.
- `BLOB_READ_WRITE_TOKEN` — optional token used by `@vercel/blob` in `app/api/logo-image/route.ts` to upload images. If not set, uses in-memory 10-minute TTL fallback.
- `NEXT_PUBLIC_APP_URL` — optional base URL used by image upload endpoints and share links (e.g., for Farcaster frames).
- `FARCASTER_HUB_URL` — (if Farcaster integration enabled) Hub URL for frame verification and user data.

4. Project-specific patterns & gotchas

- Canvas-only logo generation: `lib/logoGenerator.ts` uses `document.createElement('canvas')` and DOM APIs — do not try to run it server-side. For server-side image serving, `app/api/logo-image/route.ts` accepts base64 payloads and optionally uploads to Vercel Blob.
- Deterministic generation: `stringToSeed` → `SeededRandom` ensures same text+seed yields identical logos. Many UIs expect seeds to be stable (see `components/LogoGenerator.tsx` where `seed` is passed through URLs and stored in history).
- Presets and limits: presets are defined in `components/LogoGenerator.tsx` (PRESETS). Daily limits and localStorage keys are used (e.g., `TRIES_PER_DAY`, `plf:challengeHistory`) — search the component for constants if changing behavior.
- DB patterns: server routes use Prisma but include defensive upsert and runtime SQL table-creation fallbacks (see `app/api/leaderboard/route.ts`). Tests or migrations may not be applied — code defensively handles missing tables.
- Image endpoints: `POST /api/logo-image` returns an `imageUrl` that may point to Vercel Blob or a short-lived in-memory URL served by the same route via `id` (10 minute TTL). Use `download=1` for attachments.
- Demo seed pool: Uses row-level locking (`SELECT FOR UPDATE SKIP LOCKED`) for concurrent access safety. Seeds marked `used=true` and `usedAt=NOW()` when consumed. Indices on `used` and `usedAt` for performance.
- Styling locks: `DemoForgeLock` table prevents concurrent styling changes via row-level locks; `demoForgeLock.ts` manages acquisition/release.
- Filter state: Immutable filter state pattern; changes trigger recalculation across 1000+ logos with debounced search (300ms) and memoized components.

5. Key files to inspect (examples)

**Core generation & UI:**

- App entry / routing: [app/layout.tsx](app/layout.tsx) and [app/page.tsx](app/page.tsx)
- Client generator UI: [components/LogoGenerator.tsx](components/LogoGenerator.tsx)
- Canvas generator core: [lib/logoGenerator.ts](lib/logoGenerator.ts)
- Styling system: [lib/demoStyleVariants.ts](lib/demoStyleVariants.ts) (9,216 combinations) and [lib/svgFilterLibrary.ts](lib/svgFilterLibrary.ts) (7 advanced filters)
- Seed-to-random: [lib/seededRandom.ts](lib/seededRandom.ts) (ensures deterministic generation)

**Server & persistence:**

- Server image endpoint: [app/api/logo-image/route.ts](app/api/logo-image/route.ts)
- Leaderboard and badges: [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) and [lib/badgeTracker.ts](lib/badgeTracker.ts)
- Demo endpoints: [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts) (seed pool) and [app/api/demo/seed/stats/route.ts](app/api/demo/seed/stats/route.ts)
- Demo utilities: [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts) and [lib/demoForgeLock.ts](lib/demoForgeLock.ts)

**Data & configuration:**

- Prisma schema & migrations: [prisma/schema.prisma](prisma/schema.prisma) and [prisma/migrations](prisma/migrations)
- Build scripts: [package.json](package.json)
- Filter components: [components/FilterBar.tsx](components/FilterBar.tsx), [components/SearchField.tsx](components/SearchField.tsx), [components/RarityControl.tsx](components/RarityControl.tsx)

6. Database schema essentials

**Key tables:**

- `GeneratedLogo` — User-created logos (id, text, userId, seed, style, palette, gradient, glow, chrome, bloom, texture, lighting, rarity, createdAt, sharedCount)
- `DemoLogoStyle` — Demo-exclusive styling (demoSeedId, svgFilters array, variant selections, intensity, fingerprint)
- `DemoSeedPool` — Exclusive seed availability (seed PK, used, usedAt, createdAt) with indices on `used` and `usedAt`
- `DemoForgeLock` — Row-level locks for styling updates (seedId PK, lockedBy, lockedAt, expiresAt)
- `Leaderboard` — User rankings (userId PK, username, totalLogos, legendaryCount, badges, score, updatedAt)

**Key relationships:** GeneratedLogo → DemoLogoStyle (one-to-many by demoSeedId), DemoLogoStyle → DemoSeedPool (one-to-one)

7. Data flow: Normal vs Demo mode

**Normal mode (/):**

```
User inputs text → LogoGenerator component (client)
→ stringToSeed() → SeededRandom → generateLogo() on canvas
→ POST /api/logo-image (base64) → Vercel Blob OR in-memory store
→ imageUrl returned → Share/Download
→ POST /api/leaderboard (upsert GeneratedLogo) → Leaderboard update
```

**Demo mode (/demo):**

```
User inputs text → LogoGenerator component with demoMode=true
→ GET /api/demo/seed (acquires exclusive seed from DemoSeedPool via row-level lock)
→ stringToSeed() on acquired seed → SeededRandom → generateLogo() on canvas
→ DemoForgeLock acquired for styling (demoForgeLock.ts)
→ Style variant pool applied (demoStyleVariants.ts, 9,216 combinations)
→ SVG filters applied (svgFilterLibrary.ts, 7 advanced filters)
→ POST /api/logo-image → Vercel Blob (persistent, exclusive)
→ POST /api/leaderboard with demoSeedId → Creates DemoLogoStyle record
→ Share to Farcaster → Frame verification via hub
```

8. Custom hooks (demo mode & filters)

**Demo mode management**: [lib/hooks/useDemoMode.ts](lib/hooks/useDemoMode.ts) encapsulates demo seed logic

- `resolveDemoSeed(value?)` — Maps any seed to demo range (100M-104,999) via modulo arithmetic
- `consumeDemoSeed()` — Atomically consumes from pool; returns seed string or null if exhausted
- `getEffectivePreset(normalPreset?)` — Returns demo preset config; always uses DEMO_PRESET_KEY in demo mode
- Used in LogoGenerator.tsx: `const demoModeHook = useDemoMode(userInfo?.username)`
- Internally calls `requestAndConsumeDemoSeed()` for database operations

**Filter state management**: [lib/hooks/useFilterState.ts](lib/hooks/useFilterState.ts) centralizes gallery filters

- State: `galleryRarityFilter`, `gallerySearchQuery`, `filteredResultCount`
- Callbacks: `handleRarityChange()`, `handleSearchChange()`, `handleClearFilters()`
- Utilities: `getActiveFilterCount()` for UX feedback (shows number of active filters)
- Used in LogoGenerator.tsx: `const filterStateHook = useFilterState()`
- FilterBar.tsx wired to these callbacks for seamless gallery filtering
- No prop drilling; no context providers; clean TypeScript types

9. Typical changes an agent may be asked to make

- Add a new preset: update PRESETS in `components/LogoGenerator.tsx` and add a short example config to `lib/logoGenerator.ts` if necessary.
- Add server-side image caching or longer TTL: modify `STORE_TTL_MS` in `app/api/logo-image/route.ts` and consider using Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).
- Add a leaderboard metric: update Prisma schema, add migration, and update `app/api/leaderboard/route.ts` upsert logic.
- Add a new SVG filter: create filter function in `lib/svgFilterLibrary.ts` (with intensity scaling 0-1) and add to rarity stacks in `lib/rarityFilterStacks.ts`.
- Modify styling variants: edit `lib/demoStyleVariants.ts` (palette, gradient, glow, chrome, bloom, texture, lighting arrays) — changes multiply combination count.
- Add filter component: create new component in `components/`, wire to `FilterBar.tsx`, implement filter logic in `lib/filterLogic.ts`.

10. Farcaster integration context

- Logo generator is a Farcaster mini app; frame endpoints verify user via hub URL.
- Share flow: generate logo → POST to `/api/logo-image` → get imageUrl → create Farcaster frame card with image + buttons (cast, download).
- Frame validation: Farcaster hub verifies frame authenticity; `FARCASTER_HUB_URL` used to call validation endpoint.
- Leaderboard: Farcaster usernames imported; badges (legendary, rare collector) displayed on leaderboard and user profile.
- Example trademarked prompts ('Nike', 'Apple') in UI — confirm with repo owner on brand guidelines before deployment.

11. Testing patterns

- **Canvas rendering**: Test in jsdom with `document.createElement('canvas')` mock; check pixel data or export as data URL for visual regression.
- **Deterministic generation**: `test('same seed yields same logo', () => { const seed = stringToSeed('test'); const rng1 = new SeededRandom(seed); const rng2 = new SeededRandom(seed); expect(rng1.next()).toBe(rng2.next()); })`
- **Demo seed pool**: Mock Prisma client; test `SELECT FOR UPDATE SKIP LOCKED` behavior with concurrent requests; verify `used=true` and `usedAt` set on acquisition.
- **Styling locks**: Test lock acquisition/release in `demoForgeLock.ts`; simulate lock timeout expiry and recovery.
- **Leaderboard**: Verify upsert idempotency (same userId+seed twice = one record); check badge calculation logic in `badgeTracker.ts`.
- **Filter state**: Test immutability; verify memoization skips re-render when filter state unchanged; check debounce timing (300ms).

12. Debugging tips

- To reproduce client behavior locally, run `npm run dev` and open `http://localhost:3000` (the generator relies on browser Canvas APIs).
- If Prisma errors appear during development, run `npx prisma migrate dev` (local dev) or inspect `prisma/migrations` — but builds call `prisma generate` automatically.
- Image upload problems: confirm `BLOB_READ_WRITE_TOKEN` (optional) and `NEXT_PUBLIC_APP_URL` when testing the POST /api/logo-image flow.
- Demo seed pool depleted: check `GET /api/demo/seed/stats` for available seed count; reseed pool via admin endpoint if needed.
- Styling lock contention: check `DemoForgeLock` table for stale locks (compare `expiresAt` to NOW()); manually delete if expired.
- Filter performance: use React DevTools Profiler to check memoization; ensure virtual scrolling enabled for 1000+ items.

13. When to ask the repo owner

- Missing env values (DATABASE_URL, BLOB_READ_WRITE_TOKEN, NEXT_PUBLIC_APP_URL, FARCASTER_HUB_URL)
- Desired persistence policy for images (keep in Vercel Blob vs in-memory fallback)
- Any brand/legal guardrails for generating logos referencing trademarked names (the UI includes example prompts like 'Nike', 'Apple')
- Demo seed pool reseed strategy (manual vs automated, how often)
- Styling lock timeout duration (currently implied in code, confirm target for `expiresAt`)
- Rarity distribution policy (% Common vs Rare vs Epic vs Legendary per seed pool batch)
- Farcaster frame deployment details (hub URL, casting strategy, leaderboard integration scope)

---

**Last updated:** January 28, 2026  
**Scope:** Logo generation (normal + demo exclusive), styling (SVG filters + variants), filters (7 components, advanced techniques), Farcaster integration, leaderboard + badges
