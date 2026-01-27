# DemoSeedPool Database Model

## Overview

The `DemoSeedPool` model manages a finite set of 5,000 exclusive, unreleased seeds for demo mode. Each seed is consumed exactly once, ensuring controlled and trackable usage.

## Database Schema

```prisma
model DemoSeedPool {
  seed         String   @id // Seed as string for uniqueness
  used         Boolean  @default(false)
  usedAt       DateTime?
  usedByUserId String?

  @@index([used])
  @@index([usedAt])
}
```

### Fields

- **seed** (String, PK): The seed value. Seeds are generated in range `100_000_000` to `100_004_999`
- **used** (Boolean): Tracks consumption status. Indexed for fast lookups of available seeds
- **usedAt** (DateTime?): Timestamp when seed was consumed
- **usedByUserId** (String?): User ID or username who consumed the seed

### Indices

- `used`: Quick lookup of available seeds (`WHERE used = false`)
- `usedAt`: Analytics on consumption patterns over time

---

## API Routes

### `GET /api/demo/seed`

Get the next available unused demo seed.

**Response:**

```json
{ "seed": "100000000" }
```

**Error (429):**

```json
{ "error": "No demo seeds available" }
```

---

### `POST /api/demo/seed`

Consume a demo seed (mark as used).

**Request Body:**

```json
{
  "seed": "100000000",
  "userId": "optional-user-id"
}
```

**Response:**

```json
{ "seed": "100000000" }
```

**Error (404):**

```json
{ "error": "Seed not found or already consumed" }
```

---

### `GET /api/demo/seed/stats`

Get pool statistics.

**Response:**

```json
{
  "total": 5000,
  "used": 1234,
  "available": 3766,
  "percentageUsed": 24.68
}
```

---

## Server-Side Utilities

### `lib/demoSeedPoolManager.ts`

#### `generateDemoSeeds(): string[]`

Generates 5,000 unique seed values in the demo range.

```ts
const seeds = generateDemoSeeds();
// returns: ["100000000", "100000001", ..., "100004999"]
```

#### `initializeDemoSeedPool(): Promise<void>`

Initializes the DemoSeedPool with 5,000 seeds. Safe to call multiple times (uses `skipDuplicates`).

```ts
await initializeDemoSeedPool();
// Logs: ✓ Inserted 5000 seeds into demo pool
```

#### `getNextDemoSeed(): Promise<string | null>`

Gets the next available unused demo seed.

```ts
const seed = await getNextDemoSeed();
// returns: "100000000" or null if exhausted
```

#### `consumeDemoSeed(seed: string, userId?: string): Promise<string | null>`

Marks a seed as used. Returns the seed if successful, null if already consumed or not found.

```ts
const result = await consumeDemoSeed("100000000", "user123");
// returns: "100000000" or null
```

#### `getDemoSeedPoolStats(): Promise<PoolStats>`

Returns current pool statistics.

```ts
const stats = await getDemoSeedPoolStats();
// { total: 5000, used: 1234, available: 3766, percentageUsed: 24.68 }
```

#### `resetDemoSeedPool(): Promise<void>`

Resets all seeds to unused (testing/admin only).

```ts
await resetDemoSeedPool();
```

---

## Client-Side Utilities

### `lib/demoSeedClient.ts`

#### `requestDemoSeed(): Promise<string | null>`

Request the next available seed from the server.

```ts
const seed = await requestDemoSeed();
```

#### `consumeDemoSeed(seed: string, userId?: string): Promise<boolean>`

Mark a seed as consumed via the server.

```ts
const success = await consumeDemoSeed("100000000", userInfo?.username);
```

#### `getDemoSeedPoolStats(): Promise<PoolStats | null>`

Fetch pool statistics.

```ts
const stats = await getDemoSeedPoolStats();
```

---

## Integration with Demo Mode

### In `components/LogoGenerator.tsx`

When `IS_DEMO_MODE = true`:

1. **On generation**, call `requestDemoSeed()` to get the next available seed:

   ```ts
   if (IS_DEMO_MODE) {
     try {
       const demoSeed = await requestDemoSeed();
       if (demoSeed) seedToUse = parseInt(demoSeed, 10);
     } catch (error) {
       // Fall back to computed seed
     }
   }
   ```

2. **After successful generation**, consume the seed:

   ```ts
   if (IS_DEMO_MODE && result.seed >= 100_000_000) {
     void consumeDemoSeedAPI(result.seed.toString(), userInfo?.username);
   }
   ```

3. **Fallback behavior**: If no seeds available, a computed seed in the demo range is used (range: `100_000_000–100_004_999`).

---

## Setup Instructions

### 1. Run Migration

```bash
npx prisma migrate deploy
# Or during development:
npx prisma migrate dev
```

### 2. Initialize Pool

```bash
npx tsx scripts/setup-demo-seeds.ts
```

This will:

- Create 5,000 seed entries
- Display initialization status
- Show pool statistics

---

## Constraints & Guarantees

✅ **5000 Exactly**: Pool always contains exactly 5,000 seeds  
✅ **No Overlap**: Demo seeds (100_000_000–100_004_999) never collide with normal random generation  
✅ **Once-Only**: Each seed can be consumed exactly once via `consumeDemoSeed()`  
✅ **Atomic**: Database operations ensure no race conditions or double-consumption  
✅ **Tracked**: Every consumption records timestamp and user ID for analytics  
✅ **Resilient**: Graceful degradation if pool exhausted—falls back to computed seeds

---

## Monitoring

Check pool status anytime:

```bash
curl http://localhost:3000/api/demo/seed/stats
```

Example output:

```json
{
  "total": 5000,
  "used": 842,
  "available": 4158,
  "percentageUsed": 16.84
}
```

---

## Future Enhancements

- [ ] Admin dashboard to view consumption timeline
- [ ] Alerts when pool reaches < 10% availability
- [ ] Seed replenishment/refresh mechanism
- [ ] Per-user consumption limits
- [ ] Export consumption audit logs
