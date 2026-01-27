#!/usr/bin/env node

/**
 * Admin script to import cryptographically random demo seeds into database
 * Usage: npx tsx scripts/import-demo-seeds.ts <path-to-json-file>
 */

import * as fs from "fs";
import * as path from "path";
import prisma from "@/lib/prisma";

interface DemoSeed {
  seed: string;
  used: boolean;
  usedAt: null;
  usedByUserId: null;
}

async function importDemoSeeds(filepath: string): Promise<void> {
  try {
    // Read and parse JSON
    if (!fs.existsSync(filepath)) {
      console.error(`❌ File not found: ${filepath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filepath, "utf-8");
    const seeds: DemoSeed[] = JSON.parse(content);

    if (!Array.isArray(seeds) || seeds.length === 0) {
      console.error("❌ Invalid seed file format. Expected non-empty array.");
      process.exit(1);
    }

    console.log(
      `📥 Importing ${seeds.length} seeds from ${path.basename(filepath)}...`,
    );

    // Clear existing seeds (admin operation)
    const deleteResult = await prisma.demoSeedPool.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.count} existing seeds`);

    // Import in batches to avoid overwhelming the database
    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < seeds.length; i += batchSize) {
      const batch = seeds.slice(i, i + batchSize);

      await prisma.demoSeedPool.createMany({
        data: batch.map((s) => ({
          seed: s.seed,
          used: false,
        })),
        skipDuplicates: true,
      });

      imported += batch.length;
      console.log(`   ✓ Imported ${imported}/${seeds.length}`);
    }

    // Verify import
    const stats = await prisma.demoSeedPool.groupBy({
      by: ["used"],
      _count: true,
    });

    const totalSeeds = stats.reduce(
      (sum: number, group: any) => sum + group._count,
      0,
    );
    const unusedSeeds = stats.find((g: any) => !g.used)?._count ?? 0;

    console.log("\n✅ Import complete!");
    console.log("\n📊 Pool Statistics:");
    console.log(`   Total seeds: ${totalSeeds}`);
    console.log(`   Unused: ${unusedSeeds}`);
    console.log(`   Used: ${totalSeeds - unusedSeeds}`);
    console.log(
      `   Percentage used: ${(((totalSeeds - unusedSeeds) / totalSeeds) * 100).toFixed(2)}%`,
    );
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const filepath = process.argv[2];

  if (!filepath) {
    console.error(
      "❌ Usage: npx tsx scripts/import-demo-seeds.ts <path-to-json-file>",
    );
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(filepath)
    ? filepath
    : path.join(process.cwd(), filepath);

  await importDemoSeeds(absolutePath);
}

main();
