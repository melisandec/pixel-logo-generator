/**
 * Setup script for demo seed pool
 * Run with: npx tsx scripts/setup-demo-seeds.ts
 *
 * This script:
 * 1. Initializes the DemoSeedPool with 5000 unique seeds
 * 2. Verifies the pool is properly seeded
 * 3. Displays pool statistics
 */

import {
  initializeDemoSeedPool,
  getDemoSeedPoolStats,
} from "@/lib/demoSeedPoolManager";

async function main() {
  console.log("🌱 Demo Seed Pool Setup");
  console.log("=".repeat(50));

  try {
    // Initialize the pool
    await initializeDemoSeedPool();

    // Get and display stats
    console.log("");
    const stats = await getDemoSeedPoolStats();
    console.log("📊 Pool Statistics:");
    console.log(`   Total seeds:        ${stats.total}`);
    console.log(`   Available:          ${stats.available}`);
    console.log(`   Used:               ${stats.used}`);
    console.log(`   Percentage used:    ${stats.percentageUsed.toFixed(2)}%`);

    console.log("");
    console.log("✓ Demo seed pool is ready!");
  } catch (error) {
    console.error("✗ Error setting up demo seed pool:", error);
    process.exit(1);
  }
}

main();
