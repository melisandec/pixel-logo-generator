# Demo Seeds Admin Scripts

Admin utilities for generating and importing cryptographically random demo seeds.

## Overview

Two complementary scripts for managing the demo seed pool:

- **generate-demo-seeds.ts** — Generate cryptographically random seeds (outputs JSON + SQL)
- **import-demo-seeds.ts** — Import seeds into the database

## Usage

### Generate Seeds

```bash
# Generate 5000 seeds (default)
npx tsx scripts/generate-demo-seeds.ts

# Generate custom count
npx tsx scripts/generate-demo-seeds.ts 10000
```

**Output:**

- `scripts/data/demo-seeds-YYYY-MM-DD.json` (JSON format for review)
- `scripts/data/demo-seeds-YYYY-MM-DD.sql` (SQL for direct database import)

**Example JSON:**

```json
[
  {
    "seed": "a3f2b1c8d9e4f7a6b2c1d8e9f4a7b3c6d2e1f8a9b4c7d0e3f6a9b2c5d8e1f",
    "used": false,
    "usedAt": null,
    "usedByUserId": null
  }
]
```

### Import Seeds

```bash
# Import from generated JSON
npx tsx scripts/import-demo-seeds.ts scripts/data/demo-seeds-2026-01-27.json

# Or provide relative path
npx tsx scripts/import-demo-seeds.ts ./demo-seeds-latest.json
```

**What it does:**

1. ✓ Deletes all existing seeds (admin operation)
2. ✓ Imports new seeds in batches (1000 at a time)
3. ✓ Shows progress and final statistics

**Output:**

```
📥 Importing 5000 seeds...
🗑️  Cleared 0 existing seeds
   ✓ Imported 1000/5000
   ✓ Imported 2000/5000
   ✓ Imported 3000/5000
   ✓ Imported 4000/5000
   ✓ Imported 5000/5000

✅ Import complete!

📊 Pool Statistics:
   Total seeds: 5000
   Unused: 5000
   Used: 0
   Percentage used: 0.00%
```

## Seed Format

Each seed is a **64-character hex string** derived from 256 bits of cryptographic randomness:

```
a3f2b1c8d9e4f7a6b2c1d8e9f4a7b3c6d2e1f8a9b4c7d0e3f6a9b2c5d8e1f
└─────────────────────────────────────────────────────────────┘
         256-bit random data (32 bytes) as hex
```

**Benefits:**

- ✅ Cryptographically secure (no predictability)
- ✅ Extremely unlikely to collide with normal app seeds
- ✅ URL-safe and easy to transmit
- ✅ Human-readable for debugging

## Workflow

### Initial Setup

```bash
# 1. Generate seeds
npx tsx scripts/generate-demo-seeds.ts 5000

# 2. Review the JSON (optional)
cat scripts/data/demo-seeds-2026-01-27.json | head

# 3. Import to database
npx tsx scripts/import-demo-seeds.ts scripts/data/demo-seeds-2026-01-27.json

# 4. Verify
curl http://localhost:3000/api/demo/seed/stats
```

### Regenerate Seeds (Reset)

```bash
# Generate new batch
npx tsx scripts/generate-demo-seeds.ts 5000

# Import (clears old seeds automatically)
npx tsx scripts/import-demo-seeds.ts scripts/data/demo-seeds-2026-01-27.json

# Verify fresh pool
curl http://localhost:3000/api/demo/seed/stats
```

## API Integration

Once imported, seeds are available via:

```
GET /api/demo/seed          # Get next available seed
POST /api/demo/seed         # Consume a seed
GET /api/demo/seed/stats    # Pool statistics
```

See [DEMO_SEED_POOL.md](../DEMO_SEED_POOL.md) for full API documentation.

## Security Notes

⚠️ **Admin Operations:**

- These scripts directly modify the demo seed pool
- Should only be run by trusted administrators
- Consider adding authentication before exposing via API

🔐 **Cryptographic Quality:**

- Uses Node.js `crypto.randomBytes()` (OS-level entropy)
- Each seed from independent random generation
- Collision probability: negligible for practical purposes

## Troubleshooting

**Issue: "Invalid count"**

```bash
npx tsx scripts/generate-demo-seeds.ts abc  # ❌ Error
npx tsx scripts/generate-demo-seeds.ts 1000 # ✅ OK
```

**Issue: "File not found"**

```bash
npx tsx scripts/import-demo-seeds.ts /wrong/path/file.json
# Make sure path exists and is correct
```

**Issue: "Failed to generate unique seeds"**

- Extremely unlikely with default 5000 count
- If it happens, try rerunning (random data issue)
- Contact if persistent

## File Locations

| File                                                                | Purpose              |
| ------------------------------------------------------------------- | -------------------- |
| [scripts/generate-demo-seeds.ts](../scripts/generate-demo-seeds.ts) | Generation script    |
| [scripts/import-demo-seeds.ts](../scripts/import-demo-seeds.ts)     | Import script        |
| [scripts/data/](../scripts/data/)                                   | Generated seed files |
| [lib/demoSeedPoolManager.ts](../lib/demoSeedPoolManager.ts)         | Core utilities       |

---

**Last Updated:** January 27, 2026
