# Demo Seed Pool — Transaction Locking Integration Guide

## What Changed

The demo seed pool now uses **database-level row locking** (`FOR UPDATE SKIP LOCKED`) to prevent race conditions when consuming seeds atomically.

## Before → After

### Before

```typescript
// Separate SELECT + UPDATE (race condition possible)
const seed = await getNextDemoSeed(); // SELECT
const consumed = await consumeDemoSeed(seed); // UPDATE
```

### After

```typescript
// Atomic transaction with row locking
const seed = await getAndConsumeDemoSeed(userId);
// Combines SELECT + UPDATE with FOR UPDATE SKIP LOCKED
```

## Changed Files

| File                                                         | Change                                 | Impact                             |
| ------------------------------------------------------------ | -------------------------------------- | ---------------------------------- |
| [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts)     | ✨ New `getAndConsumeDemoSeed()`       | Transactional consumption          |
| [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts)     | Updated POST handler                   | Now uses `getAndConsumeDemoSeed()` |
| [lib/demoSeedClient.ts](lib/demoSeedClient.ts)               | ✨ New `requestAndConsumeDemoSeed()`   | Client wrapper for transaction     |
| [components/LogoGenerator.tsx](components/LogoGenerator.tsx) | Updated imports + `createLogoResult()` | Uses transactional consumption     |

## Error Message

When all 5,000 seeds are consumed:

```
"The 80s Forge has exhausted its unreleased seeds."
```

**HTTP Response:** `429 Too Many Requests`

## API Contract

### Endpoint

```
POST /api/demo/seed
```

### Request

```json
{
  "userId": "optional-user-id"
}
```

### Success Response (200)

```json
{
  "seed": "a3f2b1c8d9e4f7a6b2c1d8e9f4a7b3c6d2e1f8a9b4c7d0e3f6a9b2c5d8e1f"
}
```

### Exhaustion Response (429)

```json
{
  "error": "The 80s Forge has exhausted its unreleased seeds."
}
```

### Error Response (500)

```json
{
  "error": "Failed to consume demo seed"
}
```

## Code Examples

### Server-Side (Direct)

```typescript
import { getAndConsumeDemoSeed } from "@/lib/demoSeedPoolManager";

const seed = await getAndConsumeDemoSeed(userId);

if (!seed) {
  console.log("Pool exhausted!");
  return;
}

console.log("Consumed seed:", seed);
```

### Client-Side (HTTP)

```typescript
import { requestAndConsumeDemoSeed } from "@/lib/demoSeedClient";

try {
  const seed = await requestAndConsumeDemoSeed(userId);

  if (!seed) {
    showError("The 80s Forge has exhausted its unreleased seeds.");
    return;
  }

  generateLogo(seed);
} catch (error) {
  showError(error.message);
}
```

### In Component

```typescript
const createLogoResult = useCallback(
  async (text: string, seed?: number, preset?: string) => {
    if (IS_DEMO_MODE) {
      try {
        // Atomically get and consume
        const demoSeed = await requestAndConsumeDemoSeed(userInfo?.username);

        if (!demoSeed) {
          throw new Error("The 80s Forge has exhausted its unreleased seeds.");
        }

        seed = parseInt(demoSeed, 10);
      } catch (error) {
        throw error; // Propagate to error handler
      }
    }

    return generateLogo({ text, seed, preset });
  },
  [userInfo?.username],
);
```

## Database Details

### SQL Transaction

```sql
BEGIN;
  SELECT seed FROM "DemoSeedPool"
  WHERE used = false
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  UPDATE "DemoSeedPool"
  SET used = true, "usedAt" = NOW(), "usedByUserId" = $1
  WHERE seed = $2;
COMMIT;
```

### Required Indices

```sql
CREATE INDEX idx_demo_seed_pool_used
  ON "DemoSeedPool"(used);
```

This index is critical for `SELECT WHERE used = false` performance.

## Monitoring

### Real-time Status

```bash
curl http://localhost:3000/api/demo/seed/stats
```

### Database Queries

```sql
-- Count remaining seeds
SELECT COUNT(*) FROM "DemoSeedPool" WHERE used = false;

-- Show recent consumptions
SELECT seed, "usedAt", "usedByUserId"
FROM "DemoSeedPool"
WHERE used = true
ORDER BY "usedAt" DESC
LIMIT 20;

-- Check for locked rows (active transactions)
SELECT * FROM pg_locks
WHERE locktype = 'relation'
AND relation = '"DemoSeedPool"'::regclass;
```

## Race Condition Prevention

**Scenario:** 2 users try to consume seeds simultaneously

### Without Transaction

```
User A: SELECT → gets "seed123"
User B: SELECT → gets "seed123" (RACE!)
User A: UPDATE → "seed123" marked used
User B: UPDATE → overwrites user A's update (DATA LOSS)
```

### With Transaction + Locking

```
User A: SELECT FOR UPDATE → locks "seed123"
User B: SELECT FOR UPDATE → "seed123" locked, SKIP LOCKED → next seed
User A: UPDATE → "seed123" marked used, lock released
User B: UPDATE → different seed marked used

Result: ✅ No conflicts, no data loss
```

## Testing

### Manual Test

```bash
# 1. Start dev server
npm run dev

# 2. Check initial pool
curl http://localhost:3000/api/demo/seed/stats

# 3. Generate demo logo (consumes seed)
# Visit http://localhost:3000 and click FORGE in demo mode

# 4. Check updated pool
curl http://localhost:3000/api/demo/seed/stats
# Should show increased "used" count
```

### Load Test (Simulate Concurrent Users)

```bash
# Generate 100 concurrent POST requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/demo/seed \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-$i\"}" &
done
wait

# Verify all succeeded (none should duplicate)
curl http://localhost:3000/api/demo/seed/stats
```

## Troubleshooting

### Issue: "Property 'demoSeedPool' does not exist on type 'PrismaClient'"

**Solution:** Run `npx prisma migrate deploy` to regenerate Prisma client

### Issue: "Lock timeout" errors

**Solution:**

- Transactions should complete quickly (~10ms)
- Check if DB connection is slow
- Check for long-running queries blocking locks

### Issue: Duplicate seeds getting consumed

**Solution:**

- This should not happen with transaction-based approach
- If it does, DB transaction isolation level may be wrong
- Verify PostgreSQL isolation level: `SHOW transaction_isolation;` (should be `read committed` or higher)

## Deployment

### Prerequisites

1. ✅ Run migration: `npx prisma migrate deploy`
2. ✅ Initialize seeds: `npx tsx scripts/setup-demo-seeds.ts`
3. ✅ Verify: `curl /api/demo/seed/stats`

### Production

```bash
# Build with new code
npm run build

# Ensures schema is applied and Prisma client is generated
# (build calls `prisma generate` automatically)

# Deploy to Vercel/prod environment
```

### Rollback (if needed)

```bash
# Revert to previous version without transaction locking
# Old functions still available: getNextDemoSeed(), consumeDemoSeed()
git revert <commit-hash>
npm run build
```

---

**Documentation References:**

- [DEMO_TRANSACTION_LOCKING.md](DEMO_TRANSACTION_LOCKING.md) — Full technical details
- [ADMIN_SEEDS_SCRIPTS.md](ADMIN_SEEDS_SCRIPTS.md) — Admin utilities
- [DEMO_SEED_POOL.md](DEMO_SEED_POOL.md) — Original design doc

**Related Code:**

- [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts) — `getAndConsumeDemoSeed()`
- [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts) — POST /api/demo/seed
- [lib/demoSeedClient.ts](lib/demoSeedClient.ts) — `requestAndConsumeDemoSeed()`
- [components/LogoGenerator.tsx](components/LogoGenerator.tsx) — Component integration

---

**Status:** ✅ Ready for deployment
