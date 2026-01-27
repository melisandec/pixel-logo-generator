# Demo Seed Pool — Quick Reference

## 🎯 What Is It?

A database model (`DemoSeedPool`) that manages 5,000 exclusive, unreleased seeds for demo mode. Each seed is consumed exactly once and never overlaps with normal app seeds.

## 📊 Database Model

```prisma
model DemoSeedPool {
  seed         String   @id // 100_000_000 to 100_004_999
  used         Boolean  @default(false)
  usedAt       DateTime?
  usedByUserId String?
}
```

## 🚀 Quick Start

### 1. Deploy Migration

```bash
npx prisma migrate deploy
```

### 2. Initialize Pool

```bash
npx tsx scripts/setup-demo-seeds.ts
```

### 3. Verify

```bash
curl http://localhost:3000/api/demo/seed/stats
```

## 📡 API Endpoints

| Method | Path                   | Purpose                 |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/demo/seed`       | Get next available seed |
| POST   | `/api/demo/seed`       | Consume a seed          |
| GET    | `/api/demo/seed/stats` | Pool statistics         |

## 🔧 Server Functions

```ts
import {
  generateDemoSeeds,
  initializeDemoSeedPool,
  getNextDemoSeed,
  consumeDemoSeed,
  getDemoSeedPoolStats,
  resetDemoSeedPool,
} from "@/lib/demoSeedPoolManager";

// Generate 5000 seeds
const seeds = generateDemoSeeds();

// Initialize database
await initializeDemoSeedPool();

// Get next seed
const seed = await getNextDemoSeed();

// Consume seed
await consumeDemoSeed("100000000", "userId");

// Stats
const stats = await getDemoSeedPoolStats();

// Reset (testing)
await resetDemoSeedPool();
```

## 💻 Client Functions

```ts
import {
  requestDemoSeed,
  consumeDemoSeed,
  getDemoSeedPoolStats,
} from "@/lib/demoSeedClient";

// Request seed from server
const seed = await requestDemoSeed();

// Mark as consumed
await consumeDemoSeed("100000000", "userId");

// Get stats
const stats = await getDemoSeedPoolStats();
```

## 📋 Files Created/Modified

### New Files

- [lib/demoSeedPoolManager.ts](lib/demoSeedPoolManager.ts) — Server utilities
- [lib/demoSeedClient.ts](lib/demoSeedClient.ts) — Client utilities
- [app/api/demo/seed/route.ts](app/api/demo/seed/route.ts) — API routes
- [scripts/setup-demo-seeds.ts](scripts/setup-demo-seeds.ts) — Setup script
- [DEMO_SEED_POOL.md](DEMO_SEED_POOL.md) — Full documentation
- [prisma/migrations/add_demo_seed_pool/migration.sql](prisma/migrations/add_demo_seed_pool/migration.sql) — Migration

### Modified Files

- [prisma/schema.prisma](prisma/schema.prisma) — Added `DemoSeedPool` model
- [lib/demoMode.ts](lib/demoMode.ts) — Updated constants
- [components/LogoGenerator.tsx](components/LogoGenerator.tsx) — Integrated async seed fetching

## ✅ Constraints Met

✅ Seeds generated ahead of time (5000 pre-generated)  
✅ Never overlap with normal app seeds (100_000_000–100_004_999 range)  
✅ Consumed once and only once (atomic DB update)  
✅ Allow exactly 5000 total demo logos (fixed pool)

## 🧪 Testing

```bash
# Initialize
npx tsx scripts/setup-demo-seeds.ts

# Start dev server
npm run dev

# Check status
curl http://localhost:3000/api/demo/seed/stats

# Generate a logo in demo mode and watch seed get consumed
# Check status again to see used count increase
```

## 📈 Monitoring

```bash
# Real-time pool status
curl http://localhost:3000/api/demo/seed/stats

# Example response:
{
  "total": 5000,
  "used": 42,
  "available": 4958,
  "percentageUsed": 0.84
}
```

## 🔄 Consumption Flow

```
User clicks "FORGE" (demo mode)
    ↓
handleGenerate() → awaits createLogoResult()
    ↓
createLogoResult() calls requestDemoSeed()
    ↓
GET /api/demo/seed → fetches next available seed
    ↓
Logo generated with fetched seed
    ↓
POST /api/demo/seed → consumeDemoSeed() marks as used
    ↓
Result displayed
```

## ⚠️ Important Notes

1. **Migration Required**: Run `npx prisma migrate deploy` before using
2. **Initialization Required**: Run setup script once
3. **Async/Await**: All generation functions now async
4. **Fallback**: If pool exhausted, uses computed seeds in range
5. **Tracking**: Every consumption records user ID and timestamp

## 📚 Full Documentation

See [DEMO_SEED_POOL.md](DEMO_SEED_POOL.md) for complete technical reference.

---

**Status**: ✅ Ready for deployment on `demo` branch
