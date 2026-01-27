# Demo Seed Pool — Transaction-Based Consumption

## Overview

The demo seed pool now uses **database-level row locking** to prevent race conditions when multiple users try to consume seeds simultaneously.

## Transaction Flow

```sql
BEGIN;
  SELECT seed FROM "DemoSeedPool"
  WHERE used = false
  ORDER BY seed ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  UPDATE "DemoSeedPool"
  SET used = true,
      "usedAt" = NOW(),
      "usedByUserId" = $userId
  WHERE seed = $seedValue;
COMMIT;
```

**Key components:**

- `FOR UPDATE` — Locks the selected row, preventing other transactions from modifying it
- `SKIP LOCKED` — If a row is locked, skip it and try the next one (prevents waiting)
- Atomic COMMIT — Both SELECT and UPDATE happen together; no partial states

## Race Condition Prevention

### Without Transaction

```
User A: SELECT available seed → gets "abc123"
User B: SELECT available seed → gets "abc123" (same seed!)
User A: UPDATE → marks "abc123" as used
User B: UPDATE → fails or marks already-used seed again
```

### With Transaction

```
User A: SELECT+UPDATE in transaction T1
  └→ Row "abc123" locked
User B: Tries SELECT in transaction T2
  └→ "abc123" is locked, SKIP LOCKED → tries next seed
  └→ Finds "abc124" instead
Result: Each user gets unique seed ✅
```

## Implementation

### 1. Server-Side Transaction

**File:** [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts)

```typescript
export async function getAndConsumeDemoSeed(
  userId?: string,
): Promise<string | null> {
  const result = await prisma.$transaction(async (tx) => {
    // Lock and select first available seed
    const seeds = await tx.$queryRaw<Array<{ seed: string }>>`
      SELECT seed FROM "DemoSeedPool"
      WHERE used = false
      ORDER BY seed ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    if (!seeds || seeds.length === 0) {
      return null; // Pool exhausted
    }

    const seedValue = seeds[0].seed;

    // Mark as used within same transaction
    await tx.$executeRaw`
      UPDATE "DemoSeedPool"
      SET used = true,
          "usedAt" = NOW(),
          "usedByUserId" = ${userId || null}
      WHERE seed = ${seedValue}
    `;

    return seedValue;
  });

  return result;
}
```

**Guarantees:**

- ✅ Seed is locked immediately after SELECT
- ✅ No other transaction can modify it
- ✅ Consumed atomically (no partial updates)
- ✅ If pool is empty, returns `null` (not an error)

### 2. API Endpoint

**File:** [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts)

```typescript
async function handleConsumeSeed(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    // Get and consume atomically
    const seed = await getAndConsumeDemoSeed(userId);

    if (!seed) {
      // Pool exhausted
      return NextResponse.json(
        { error: "The 80s Forge has exhausted its unreleased seeds." },
        { status: 429 }, // Too Many Requests = pool limit reached
      );
    }

    return NextResponse.json({ seed });
  } catch (error) {
    console.error("Error consuming demo seed:", error);
    return NextResponse.json(
      { error: "Failed to consume demo seed" },
      { status: 500 },
    );
  }
}
```

**Response codes:**

- `200 { seed: "..." }` — Successfully consumed
- `429 { error: "..." }` — Pool exhausted
- `500 { error: "..." }` — Server error

### 3. Client-Side Integration

**File:** [lib/demoSeedClient.ts](lib/demoSeedClient.ts)

```typescript
export async function requestAndConsumeDemoSeed(
  userId?: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/demo/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        // Pool exhausted - handle gracefully
        console.warn("Demo seed pool exhausted:", data.error);
        return null;
      }
      throw new Error(data.error);
    }

    return data.seed;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
```

### 4. Component Usage

**File:** [components/LogoGenerator.tsx](components/LogoGenerator.tsx)

```typescript
const createLogoResult = useCallback(
  async (text: string, seed?: number, presetKey?: string | null) => {
    // ... setup code ...

    if (IS_DEMO_MODE) {
      try {
        // Atomically get and consume seed
        const demoSeed = await requestAndConsumeDemoSeed(userInfo?.username);

        if (demoSeed) {
          seedToUse = parseInt(demoSeed, 10);
        } else {
          // Pool exhausted - throw error
          throw new Error(
            "The 80s Forge has exhausted its unreleased seeds."
          );
        }
      } catch (error) {
        console.error("Error getting demo seed:", error);
        throw error; // Propagate to handleGenerate error handler
      }
    }

    return generateLogo({ text, seed: seedToUse, ... });
  },
  [getPresetConfig, resolveDemoSeed, userInfo?.username],
);
```

Error flows to `handleGenerate` which displays toast: "The 80s Forge has exhausted its unreleased seeds."

## Database Schema

**Table:** DemoSeedPool

| Column         | Type     | Index       | Purpose                           |
| -------------- | -------- | ----------- | --------------------------------- |
| `seed`         | String   | PRIMARY KEY | Unique cryptographic seed         |
| `used`         | Boolean  | YES         | Fast lookup: `WHERE used = false` |
| `usedAt`       | DateTime | YES         | Track consumption timestamp       |
| `usedByUserId` | String   | -           | Track which user consumed seed    |

**Indices:**

```sql
CREATE INDEX idx_demo_seed_pool_used ON "DemoSeedPool"(used);
CREATE INDEX idx_demo_seed_pool_used_at ON "DemoSeedPool"("usedAt");
```

The `used` index is critical for performance — `SELECT WHERE used = false` must be fast.

## Behavior

### Normal Flow (Seeds Available)

```
User clicks FORGE
  ↓
POST /api/demo/seed with userId
  ↓
Transaction:
  - SELECT seed WHERE used=false FOR UPDATE SKIP LOCKED
  - UPDATE seed SET used=true, usedAt=NOW(), usedByUserId=$userId
  ↓
Response: { seed: "a3f2b1c8..." }
  ↓
Logo generated with seed
  ↓
✅ "Logo generated successfully!"
```

### Exhaustion Flow (No Seeds Left)

```
User clicks FORGE (all 5000 seeds consumed)
  ↓
POST /api/demo/seed with userId
  ↓
Transaction:
  - SELECT seed WHERE used=false FOR UPDATE SKIP LOCKED
  - Result: empty (no rows match)
  - Returns null
  ↓
Response: { error: "The 80s Forge has exhausted its unreleased seeds." }
  ↓
Status: 429 Too Many Requests
  ↓
❌ Error toast: "The 80s Forge has exhausted its unreleased seeds."
```

### Concurrent Users (Race Condition Prevention)

```
Time T1: User A: SELECT ... FOR UPDATE SKIP LOCKED → gets seed "abc"
Time T2: User B: SELECT ... FOR UPDATE SKIP LOCKED → "abc" locked, SKIP LOCKED → gets seed "def"
Time T3: User A: UPDATE seed="abc" SET used=true
Time T4: User B: UPDATE seed="def" SET used=true

Result: Both users get unique seeds, no conflicts ✅
```

## Monitoring

### Check Pool Status

```bash
curl http://localhost:3000/api/demo/seed/stats
```

Response:

```json
{
  "total": 5000,
  "used": 42,
  "available": 4958,
  "percentageUsed": 0.84
}
```

### Check Locked Rows (PostgreSQL)

```sql
SELECT * FROM "DemoSeedPool" WHERE used = false LIMIT 5;
```

### View Recent Consumptions

```sql
SELECT seed, "usedAt", "usedByUserId"
FROM "DemoSeedPool"
WHERE used = true
ORDER BY "usedAt" DESC
LIMIT 10;
```

## Performance

### Lookup Performance

- **With index on `used`:** `O(1)` — locks immediately
- **Without index:** `O(n)` — scans entire table before locking

### Lock Behavior

- `FOR UPDATE SKIP LOCKED` waits ~1-10ms for lock to be available
- If row is locked, moves to next row immediately (SKIP LOCKED)
- No waiting/blocking — concurrent requests proceed in parallel

### Transaction Duration

- `getAndConsumeDemoSeed()` completes in ~5-50ms
- Lock held for duration of transaction (~10ms)
- Minimal impact on concurrent requests

## Fallback Strategy

If transaction fails (database unavailable):

```typescript
try {
  const seed = await requestAndConsumeDemoSeed(userId);
  // Use seed
} catch (error) {
  if (IS_DEMO_MODE) {
    // Fall back to computed seed in demo range
    const fallbackSeed = resolveDemoSeed();
    // Continue with fallback
  }
}
```

## Testing

### Load Test (Concurrent Users)

```bash
# Simulate 100 concurrent requests to /api/demo/seed
npm run test:demo-load
```

**Expected:**

- ✅ All 100 requests succeed (or 429 if pool exhausted)
- ✅ No duplicate seeds consumed
- ✅ No database errors

### Exhaustion Test

```bash
# Generate 5001 logos (1 over pool size)
npm run test:demo-exhaust
```

**Expected:**

- ✅ First 5000: status 200
- ✅ Request 5001: status 429 with exhaustion message

## Cleanup/Reset

**Reset entire pool (admin only):**

```bash
npx tsx scripts/reset-demo-seeds.ts
```

This deletes all consumed seeds and regenerates 5000 new ones.

---

**Last Updated:** January 27, 2026

**Related Files:**

- [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts) — Transaction logic
- [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts) — HTTP API
- [lib/demoSeedClient.ts](lib/demoSeedClient.ts) — Client utilities
- [components/LogoGenerator.tsx](components/LogoGenerator.tsx) — Component integration
