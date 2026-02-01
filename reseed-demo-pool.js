#!/usr/bin/env node

/**
 * RESEED DEMO POOL
 * Resets the demo seed pool to fresh seeds (100M-104,999)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function reseedDemoPool() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🌱 RESEEDING DEMO SEED POOL 🌱                        ║
║     Generating fresh 5,000 seeds for exclusive demo access     ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // Check current pool status
    const existingCount = await prisma.demoSeedPool.count();
    const usedCount = await prisma.demoSeedPool.count({
      where: { used: true },
    });

    console.log(`\n📊 Current Pool Status:`);
    console.log(`  Total seeds: ${existingCount}`);
    console.log(`  Used seeds: ${usedCount}`);
    console.log(`  Available seeds: ${existingCount - usedCount}\n`);

    // Delete all existing seeds to start fresh
    if (existingCount > 0) {
      console.log(`🔄 Clearing exhausted pool...`);
      await prisma.demoSeedPool.deleteMany({});
      console.log(`  ✓ Deleted ${existingCount} old seeds\n`);
    }

    // Generate new 5,000 seeds in the demo range (100,000,000 - 100,004,999)
    console.log(`🌱 Generating 5,000 fresh seeds (range: 100M - 104,999)...\n`);

    const BATCH_SIZE = 500;
    const TOTAL_SEEDS = 5000;
    const SEED_RANGE_START = 100_000_000;

    for (let batch = 0; batch < TOTAL_SEEDS / BATCH_SIZE; batch++) {
      const startIdx = batch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, TOTAL_SEEDS);
      const seedsToInsert = [];

      for (let i = startIdx; i < endIdx; i++) {
        seedsToInsert.push({
          seed: String(SEED_RANGE_START + i), // Convert to string
          used: false,
        });
      }

      await prisma.demoSeedPool.createMany({
        data: seedsToInsert,
      });

      const progress = endIdx;
      console.log(
        `  ✓ Created seeds ${progress - BATCH_SIZE + 1}-${progress} / ${TOTAL_SEEDS}`,
      );
    }

    console.log(`\n════════════════════════════════════════════════════════════════════

✅ RESEED COMPLETE!

  New seeds created: 5,000
  Range: 100,000,000 - 100,004,999
  Status: Ready for demo exclusive access

════════════════════════════════════════════════════════════════════

🎯 Next Steps:

  1. Refresh the browser page
  2. Try generating a demo logo again
  3. Monitor seed consumption: node check-demo-seeds.js

════════════════════════════════════════════════════════════════════
`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Reseed failed:", error);
    process.exit(1);
  }
}

reseedDemoPool();
