# Demo Seed Pool Management & Transactions

**Consolidated from:** DEMO_SEED_POOL.md, DEMO_SEED_POOL_IMPLEMENTATION.md, DEMO_SEED_POOL_FIX_REPORT.md, DEMO_TRANSACTION_LOCKING.md, DEMO_TRANSACTION_QUICK_START.md, DEMO_SEED_POOL_QUICK_REF.md

---

## 📋 Quick Reference

| Item                 | Value                                      |
| -------------------- | ------------------------------------------ |
| **Pool Size**        | 5,000 exclusive seeds                      |
| **Seed Range**       | 100_000_000 to 100_004_999                 |
| **Database Model**   | DemoSeedPool                               |
| **Consumption Type** | Once-only, atomic transactions             |
| **Tracking**         | Timestamp + User ID                        |
| **Key Feature**      | Row-level locking prevents race conditions |

---

## 🎯 Quick Start

### Getting a Demo Seed (Client-Side)

```typescript
// Hook-based approach (preferred in React components)
import { useDemoMode } from "@/lib/hooks/useDemoMode";

const demoModeHook = useDemoMode(userInfo?.username);
const demoSeed = await demoModeHook.consumeDemoSeed();

if (!demoSeed) {
  console.log("Pool exhausted - forge is locked");
  return;
}

const seedNumber = stringToSeed(demoSeed);
console.log(`Generated with seed: ${seedNumber}`);
```

```typescript
// Direct function approach (for non-React contexts)
import { requestAndConsumeDemoSeed } from "@/lib/demoSeedClient";

const seed = await requestAndConsumeDemoSeed(userId);

if (!seed) {
  console.log("Pool exhausted - forge is locked");
  return;
}

console.log(`Generated with seed: ${seed}`);
```

### Checking Pool Status

```typescript
import { getDemoSeedPoolStats } from "@/lib/demoSeedClient";

const stats = await getDemoSeedPoolStats();
console.log(
  `${stats.available} seeds remaining (${stats.percentageUsed}% used)`,
);
```

---

## Overview

The `DemoSeedPool` model manages a finite set of **5,000 exclusive, unreleased seeds** for demo mode. Each seed is consumed exactly once, ensuring controlled and trackable usage through **database-level transaction safety**.

### Key Characteristics

✅ **Exclusive:** 5,000 unique seeds reserved for demo mode only  
✅ **Atomic Consumption:** No race conditions - each seed consumed exactly once  
✅ **Tracked:** Records timestamp and user ID for every consumption  
✅ **Analytics-Ready:** Real-time pool statistics  
✅ **Resilient:** Graceful fallback when pool exhausts  
✅ **Fast:** Indexed queries for quick lookups

---

## Database Schema

### DemoSeedPool Model

```prisma
model DemoSeedPool {
  seed         String   @id           // Seed value (100_000_000 to 100_004_999)
  used         Boolean  @default(false) // Consumption flag
  usedAt       DateTime?              // When consumed
  usedByUserId String?                // Who consumed it

  @@index([used])                     // Fast lookup of available seeds
  @@index([usedAt])                   // Analytics on consumption patterns
}
```

### Database Migration

Location: `prisma/migrations/add_demo_seed_pool/migration.sql`

```sql
CREATE TABLE "DemoSeedPool" (
    "seed" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,

    CONSTRAINT "DemoSeedPool_pkey" PRIMARY KEY ("seed")
);

CREATE INDEX "DemoSeedPool_used_idx" ON "DemoSeedPool"("used");
CREATE INDEX "DemoSeedPool_usedAt_idx" ON "DemoSeedPool"("usedAt");
```

---

## API Routes

### `GET /api/demo/seed` - Preview Next Seed

Get the next available unused demo seed **without consuming it**.

**Response (Success - 200):**

```json
{ "seed": "100000042" }
```

**Response (Exhausted - 429):**

```json
{ "error": "The 80s Forge has exhausted its unreleased seeds." }
```

**Use Case:** Preview mode, checking availability

---

### `POST /api/demo/seed` - Consume Seed

Get **and consume** a demo seed atomically using row-level database locking.

**Request Body:**

```json
{
  "userId": "optional-user-id"
}
```

**Response (Success - 200):**

```json
{ "seed": "100000042" }
```

**Response (Exhausted - 429):**

```json
{ "error": "The 80s Forge has exhausted its unreleased seeds." }
```

**How It Works:** Uses `SELECT ... FOR UPDATE SKIP LOCKED` transaction

---

### `GET /api/demo/seed/stats` - Pool Statistics

Get current pool statistics.

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

## Architecture: Transaction Safety

### The Race Condition Problem

Without transactions, concurrent requests could both get the same seed:

```
Timeline:
T1: User A → SELECT seed WHERE used=false → gets "abc123"
T2: User B → SELECT seed WHERE used=false → ALSO gets "abc123"
T3: User A → UPDATE seed SET used=true
T4: User B → UPDATE seed SET used=true (double-consumption!)
```

### The Solution: Row-Level Locking

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

**Key Components:**

| Component     | Purpose                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `FOR UPDATE`  | Locks the selected row, preventing other transactions from modifying it |
| `SKIP LOCKED` | If a row is locked, skip it and try the next one (no waiting)           |
| Single COMMIT | Both SELECT and UPDATE happen atomically - no partial states            |

### With Transaction Safety

```
Timeline:
T1: User A transaction starts
  → SELECT+LOCK "abc123"
T2: User B transaction starts
  → SELECT attempts "abc123" (locked by T1)
  → SKIP LOCKED → tries next seed
  → Gets "abc124" ✅
T3: User A → UPDATE "abc123" SET used=true
T4: User B → UPDATE "abc124" SET used=true

Result: Each user gets unique seed, no conflicts ✅
```

---

## Server-Side Implementation

### File: `lib/demoSeedPoolManager.ts`

#### Function: `getAndConsumeDemoSeed(userId?)`

Atomically consumes next available seed using row-level locking.

```typescript
export async function getAndConsumeDemoSeed(
  userId?: string,
): Promise<string | null> {
  const result = await prisma.$transaction(async (tx) => {
    // Lock first unused seed row (prevents other transactions from modifying it)
    const seeds = await tx.$queryRaw<Array<{ seed: string }>>`
      SELECT seed FROM "DemoSeedPool"
      WHERE used = false
      ORDER BY seed ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    if (!seeds || seeds.length === 0) {
      // No seeds remaining - forge is locked
      return null;
    }

    const seedValue = seeds[0].seed;

    // Mark seed as used atomically within same transaction
    await tx.$executeRaw`
      UPDATE "DemoSeedPool"
      SET used = true,
          "usedAt" = NOW(),
          "usedByUserId" = ${userId || null}
      WHERE seed = ${seedValue}
    `;

    return seedValue;
  });

  // Invalidate forge lock cache after consumption
  if (result) {
    invalidateForgeCache();
  }

  return result;
}
```

**Guarantees:**

- ✅ Seed is locked immediately after SELECT
- ✅ No other transaction can modify it
- ✅ Consumed atomically (no partial updates)
- ✅ Returns `null` if pool exhausted (graceful)

---

#### Function: `getNextDemoSeed()`

Get next available seed **without consuming** (preview only).

```typescript
export async function getNextDemoSeed(): Promise<string | null> {
  const nextSeed = await prisma.demoSeedPool.findFirst({
    where: { used: false },
    orderBy: { seed: "asc" },
  });

  return nextSeed?.seed ?? null;
}
```

---

#### Function: `getDemoSeedPoolStats()`

Get current pool statistics.

```typescript
export async function getDemoSeedPoolStats(): Promise<{
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
}> {
  const total = await prisma.demoSeedPool.count();
  const used = await prisma.demoSeedPool.count({ where: { used: true } });
  const available = total - used;
  const percentageUsed = total > 0 ? (used / total) * 100 : 0;

  return { total, used, available, percentageUsed };
}
```

---

#### Function: `initializeDemoSeedPool()`

Initialize pool with 5,000 unique seeds (idempotent).

```typescript
export async function initializeDemoSeedPool(): Promise<void> {
  // Check if already initialized
  const count = await prisma.demoSeedPool.count();
  if (count > 0) {
    console.log(`✓ Pool already has ${count} seeds`);
    return;
  }

  // Generate 5,000 unique seeds in demo range
  const seeds = generateDemoSeeds(5000);

  const result = await prisma.demoSeedPool.createMany({
    data: seeds.map((seed) => ({ seed, used: false })),
    skipDuplicates: true,
  });

  console.log(`✓ Inserted ${result.count} seeds into demo pool`);
}
```

---

#### Function: `resetDemoSeedPool()` ⚠️

**Admin-only function for testing. DO NOT USE IN PRODUCTION.**

Marks all seeds as unused.

```typescript
export async function resetDemoSeedPool(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Forge reset only available in development");
  }

  await prisma.demoSeedPool.updateMany({
    data: {
      used: false,
      usedAt: null,
      usedByUserId: null,
    },
  });

  invalidateForgeCache();
  console.log("⚠️ Demo forge reset (DEVELOPMENT ONLY)");
}
```

---

## Client-Side Implementation

### File: `lib/demoSeedClient.ts`

#### Function: `requestAndConsumeDemoSeed(userId?)`

Calls server to get and consume next seed atomically.

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

    const data = (await response.json()) as { seed?: string; error?: string };

    if (!response.ok) {
      // Check if it's an exhaustion error (429 status)
      if (response.status === 429) {
        console.warn("Demo seed pool exhausted:", data.error);
        return null;
      }

      console.error("Failed to get and consume demo seed:", data.error);
      throw new Error(data.error || "Failed to consume demo seed");
    }

    return data.seed ?? null;
  } catch (error) {
    console.error("Error requesting and consuming demo seed:", error);
    throw error;
  }
}
```

---

#### Function: `getDemoSeedPoolStats()`

Fetch current pool statistics from server.

```typescript
export async function getDemoSeedPoolStats(): Promise<{
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
} | null> {
  try {
    const response = await fetch("/api/demo/seed/stats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to get demo seed stats:", response.statusText);
      return null;
    }

    return (await response.json()) as {
      total: number;
      used: number;
      available: number;
      percentageUsed: number;
    };
  } catch (error) {
    console.error("Error fetching demo seed stats:", error);
    return null;
  }
}
```

---

## Setup & Initialization

### Setup Script

Run once to initialize the pool:

```bash
npx tsx scripts/setup-demo-seeds.ts
```

**What it does:**

1. Generates 5,000 unique seeds
2. Inserts into DemoSeedPool table
3. Displays pool statistics
4. Verifies pool is ready

**Output:**

```
🌱 Demo Seed Pool Setup
==================================================

📊 Pool Statistics:
   Total seeds:        5000
   Available:          5000
   Used:               0
   Percentage used:    0.00%

✓ Demo seed pool is ready!
```

---

## Integration Points

### 1. LogoGenerator Component

```typescript
// When demo mode is active, consume seed instead of generating random
const seed = await requestAndConsumeDemoSeed(userId);
if (!seed) {
  showError("The 80s Forge has been locked. All exclusive seeds consumed.");
  return;
}
```

### 2. Demo Mode Setup

File: `lib/demoMode.ts`

```typescript
// Demo seed pool range - managed by DemoSeedPool database model
export const DEMO_SEED_BASE = 100_000_000;
export const DEMO_SEED_TOTAL = 5000;
export const DEMO_SEED_MAX = DEMO_SEED_BASE + DEMO_SEED_TOTAL - 1;
```

### 3. Forge Lock Status

File: `lib/demoForgeLock.ts`

```typescript
export async function enforceForgeNotLocked(): Promise<void> {
  const status = await getDemoForgeLockStatus();

  if (status.isLocked) {
    const error = new Error(FORGE_LOCKED_MESSAGE);
    (error as any).statusCode = 429;
    (error as any).isForgeLockedError = true;
    throw error;
  }
}
```

---

## Performance Considerations

### Indexing

The `used` index enables fast lookups of available seeds:

```sql
SELECT seed FROM "DemoSeedPool"
WHERE used = false
ORDER BY seed ASC
FOR UPDATE SKIP LOCKED
LIMIT 1
```

**Time Complexity:** O(log n) due to index

---

### Caching

The forge lock status is cached for 60 seconds to reduce database queries:

```typescript
const CACHE_TTL_MS = 60000; // 60 seconds

export async function getForgeStatusCached() {
  const now = Date.now();

  if (cachedForgeStatus && now - cachedForgeStatus.timestamp < CACHE_TTL_MS) {
    return cachedForgeStatus.status;
  }

  const status = await getDemoForgeLockStatus();
  cachedForgeStatus = { timestamp: now, status };
  return status;
}
```

**After seed consumption, cache is invalidated:**

```typescript
invalidateForgeCache(); // Call after consuming a seed
```

---

## Testing

### Unit Tests

```typescript
describe("Demo Seed Pool", () => {
  test("getAndConsumeDemoSeed returns unique seeds", async () => {
    const seed1 = await getAndConsumeDemoSeed("user1");
    const seed2 = await getAndConsumeDemoSeed("user2");

    expect(seed1).not.toBe(seed2);
  });

  test("consumed seeds cannot be consumed again", async () => {
    const seed = await getAndConsumeDemoSeed("user1");
    // Try to consume same seed (should fail in normal flow)
  });

  test("getDemoSeedPoolStats reflects consumption", async () => {
    const before = await getDemoSeedPoolStats();
    await getAndConsumeDemoSeed();
    const after = await getDemoSeedPoolStats();

    expect(after.available).toBe(before.available - 1);
    expect(after.used).toBe(before.used + 1);
  });
});
```

---

## Troubleshooting

### Issue: "Pool exhausted" on fresh initialization

**Solution:** Run setup script to initialize pool

```bash
npx tsx scripts/setup-demo-seeds.ts
```

### Issue: Duplicate seed consumption observed

**Solution:** Verify database transaction support:

```sql
SELECT * FROM "DemoSeedPool"
WHERE seed = 'xxx'
AND used = true
AND "usedAt" > NOW() - INTERVAL 1 minute;
```

### Issue: Slow seed lookups

**Solution:** Verify indices exist:

```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'DemoSeedPool';
```

Should show:

- `demoseedpool_pkey` (primary key)
- `DemoSeedPool_used_idx`
- `DemoSeedPool_usedAt_idx`

---

## Summary

The demo seed pool is a **production-ready system** that:

✅ Manages 5,000 exclusive seeds safely  
✅ Prevents race conditions with row-level locking  
✅ Tracks consumption with timestamps and user IDs  
✅ Provides real-time pool statistics  
✅ Gracefully handles exhaustion  
✅ Enables analytics on usage patterns

All without requiring manual synchronization logic in application code.
