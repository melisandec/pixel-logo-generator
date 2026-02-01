#!/usr/bin/env node

/**
 * CHECK DEMO SEED POOL STATUS
 * Monitor available seeds and pool health
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDemoSeeds() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          📊 DEMO SEED POOL STATUS 📊                           ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // Pool statistics
    const totalCount = await prisma.demoSeedPool.count();
    const usedCount = await prisma.demoSeedPool.count({
      where: { used: true },
    });
    const availableCount = totalCount - usedCount;

    console.log(`\n📈 Pool Statistics:`);
    console.log(`  Total seeds: ${totalCount}`);
    console.log(`  ✓ Available: ${availableCount}`);
    console.log(`  ✗ Used: ${usedCount}`);

    if (totalCount > 0) {
      const usagePercent = ((usedCount / totalCount) * 100).toFixed(1);
      console.log(`\n📊 Usage: ${usagePercent}%`);

      // Visual bar
      const barLength = 30;
      const filledLength = Math.round((usedCount / totalCount) * barLength);
      const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
      console.log(`  [${bar}]`);
    }

    // Recent usage
    if (usedCount > 0) {
      const recentlyUsed = await prisma.demoSeedPool.findMany({
        where: { used: true },
        orderBy: { usedAt: "desc" },
        take: 5,
        select: { seed: true, usedAt: true },
      });

      console.log(`\n⏰ Recently Used Seeds:`);
      recentlyUsed.forEach((entry, idx) => {
        const time = new Date(entry.usedAt).toLocaleString();
        console.log(`  ${idx + 1}. Seed ${entry.seed} - ${time}`);
      });
    }

    // Health warnings
    console.log(`\n⚠️  Health Status:`);
    if (availableCount === 0) {
      console.log(`  🔴 CRITICAL: Pool exhausted! Run: node reseed-demo-pool.js`);
    } else if (availableCount < 100) {
      console.log(
        `  🟠 WARNING: Only ${availableCount} seeds remaining (${((availableCount / totalCount) * 100).toFixed(1)}%)`,
      );
    } else if (availableCount < 500) {
      console.log(
        `  🟡 NOTICE: ${availableCount} seeds available (${((availableCount / totalCount) * 100).toFixed(1)}%)`,
      );
    } else {
      console.log(`  🟢 HEALTHY: Plenty of seeds available`);
    }

    console.log(`
════════════════════════════════════════════════════════════════════
`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }
}

checkDemoSeeds();
