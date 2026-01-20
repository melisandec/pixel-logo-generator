# Copilot instructions — Pixel Logo Forge

Purpose: short, actionable pointers so AI coding agents can be immediately productive in this repo.

1. Big picture

- Next.js 14 App Router app living under `app/` (client components use `use client`). UI + canvas-based logo generator runs in the browser. Server work lives in `app/api/*` (serverless routes) and uses Prisma for persistence.
- Logo generation is implemented in the browser (canvas) in `lib/logoGenerator.ts` and wired to the UI in `components/LogoGenerator.tsx`. Server routes help with image upload/serving and leaderboard persistence.

2. Important workflows / commands

- Dev: `npm install` then `npm run dev` (Next dev server).
- Build: `npm run build` — note `build` runs `prisma generate && next build`.
- Production / Vercel: `npm run vercel-build` runs `prisma migrate deploy && prisma generate && next build`.
- Postinstall: `prisma generate` runs automatically via `postinstall` script.

3. Environment variables the agent must be aware of

- `DATABASE_URL` — Postgres connection used by Prisma (prisma/schema.prisma).
- `BLOB_READ_WRITE_TOKEN` — optional token used by `@vercel/blob` in `app/api/logo-image/route.ts` to upload images.
- `NEXT_PUBLIC_APP_URL` — optional base URL used by image upload endpoints and share links.

4. Project-specific patterns & gotchas

- Canvas-only logo generation: `lib/logoGenerator.ts` uses `document.createElement('canvas')` and DOM APIs — do not try to run it server-side. For server-side image serving, `app/api/logo-image/route.ts` accepts base64 payloads and optionally uploads to Vercel Blob.
- Deterministic generation: `stringToSeed` → `SeededRandom` ensures same text+seed yields identical logos. Many UIs expect seeds to be stable (see `components/LogoGenerator.tsx` where `seed` is passed through URLs and stored in history).
- Presets and limits: presets are defined in `components/LogoGenerator.tsx` (PRESETS). Daily limits and localStorage keys are used (e.g., `TRIES_PER_DAY`, `plf:challengeHistory`) — search the component for constants if changing behavior.
- DB patterns: server routes use Prisma but include defensive upsert and runtime SQL table-creation fallbacks (see `app/api/leaderboard/route.ts`). Tests or migrations may not be applied — code defensively handles missing tables.
- Image endpoints: `POST /api/logo-image` returns an `imageUrl` that may point to Vercel Blob or a short-lived in-memory URL served by the same route via `id` (10 minute TTL). Use `download=1` for attachments.

5. Key files to inspect (examples)

- app entry / routing: [app/layout.tsx](app/layout.tsx) and [app/page.tsx](app/page.tsx)
- Client generator UI: [components/LogoGenerator.tsx](components/LogoGenerator.tsx)
- Canvas generator core: [lib/logoGenerator.ts](lib/logoGenerator.ts)
- Server image endpoint: [app/api/logo-image/route.ts](app/api/logo-image/route.ts)
- Leaderboard and badges: [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) and [lib/badgeTracker.ts](lib/badgeTracker.ts)
- Prisma schema & migrations: [prisma/schema.prisma](prisma/schema.prisma) and [prisma/migrations](prisma/migrations)
- Build scripts: [package.json](package.json)

6. Typical changes an agent may be asked to make

- Add a new preset: update PRESETS in `components/LogoGenerator.tsx` and add a short example config to `lib/logoGenerator.ts` if necessary.
- Add server-side image caching or longer TTL: modify `STORE_TTL_MS` in `app/api/logo-image/route.ts` and consider using Vercel Blob (set `BLOB_READ_WRITE_TOKEN`).
- Add a leaderboard metric: update Prisma schema, add migration, and update `app/api/leaderboard/route.ts` upsert logic.

7. Debugging tips

- To reproduce client behavior locally, run `npm run dev` and open `http://localhost:3000` (the generator relies on browser Canvas APIs).
- If Prisma errors appear during development, run `npx prisma migrate dev` (local dev) or inspect `prisma/migrations` — but builds call `prisma generate` automatically.
- Image upload problems: confirm `BLOB_READ_WRITE_TOKEN` (optional) and `NEXT_PUBLIC_APP_URL` when testing the POST /api/logo-image flow.

8. When to ask the repo owner

- Missing env values (DATABASE_URL, BLOB_READ_WRITE_TOKEN, NEXT_PUBLIC_APP_URL)
- Desired persistence policy for images (keep in Vercel Blob vs in-memory fallback)
- Any brand/legal guardrails for generating logos referencing trademarked names (the UI includes example prompts like 'Nike', 'Apple').

If you'd like, I can open a PR with this file and iterate on wording or add examples (e.g., a minimal preset PR). What's next?
