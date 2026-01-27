#!/usr/bin/env node

/**
 * Admin script to generate cryptographically random demo seeds
 * Usage: npx tsx scripts/generate-demo-seeds.ts [count]
 * Default: 5000 seeds
 */

import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";

interface DemoSeed {
  seed: string;
  used: boolean;
  usedAt: null;
  usedByUserId: null;
}

function generateDemoSeed(): string {
  // Generate 32 bytes of cryptographically random data
  // Convert to hex for a 64-character string
  return randomBytes(32).toString("hex");
}

function generateDemoSeeds(count: number): DemoSeed[] {
  const seeds: DemoSeed[] = [];
  const seedSet = new Set<string>();

  console.log(`🔐 Generating ${count} cryptographically random demo seeds...`);

  let attempts = 0;
  const maxAttempts = count * 10; // Safety limit to prevent infinite loop

  while (seeds.length < count && attempts < maxAttempts) {
    const seed = generateDemoSeed();

    // Ensure uniqueness
    if (!seedSet.has(seed)) {
      seedSet.add(seed);
      seeds.push({
        seed,
        used: false,
        usedAt: null,
        usedByUserId: null,
      });
    }

    attempts++;
  }

  if (seeds.length !== count) {
    console.error(
      `❌ Failed to generate ${count} unique seeds after ${maxAttempts} attempts`,
    );
    process.exit(1);
  }

  console.log(`✅ Generated ${seeds.length} unique seeds`);
  return seeds;
}

function exportToJSON(seeds: DemoSeed[], filename: string): void {
  const filepath = path.join(process.cwd(), "scripts", "data", filename);

  // Create directory if it doesn't exist
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(seeds, null, 2));
  console.log(`📁 Exported seeds to: ${filepath}`);
}

function exportToSQL(seeds: DemoSeed[], filename: string): void {
  const filepath = path.join(process.cwd(), "scripts", "data", filename);

  // Create directory if it doesn't exist
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let sql = "-- Auto-generated demo seeds (cryptographically random)\n";
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Total: ${seeds.length} seeds\n\n`;
  sql +=
    'INSERT INTO "DemoSeedPool" (seed, used, "usedAt", "usedByUserId") VALUES\n';

  sql += seeds
    .map((s, i) => {
      const comma = i < seeds.length - 1 ? "," : ";";
      return `('${s.seed}', false, NULL, NULL)${comma}`;
    })
    .join("\n");

  sql += "\n";

  fs.writeFileSync(filepath, sql);
  console.log(`📁 Exported SQL to: ${filepath}`);
}

async function main() {
  try {
    const countArg = process.argv[2];
    const count = countArg ? parseInt(countArg, 10) : 9000;

    if (isNaN(count) || count <= 0) {
      console.error(
        "❌ Invalid count. Usage: npx tsx scripts/generate-demo-seeds.ts [count]",
      );
      process.exit(1);
    }

    const seeds = generateDemoSeeds(count);

    // Export in multiple formats
    const timestamp = new Date().toISOString().split("T")[0];
    exportToJSON(seeds, `demo-seeds-${timestamp}.json`);
    exportToSQL(seeds, `demo-seeds-${timestamp}.sql`);

    console.log("\n📊 Summary:");
    console.log(`   Total seeds: ${seeds.length}`);
    console.log(`   Format: 64-char hex (256-bit random)`);
    console.log(`   Used: 0`);
    console.log(`   Available: ${seeds.length}`);

    console.log("\n📝 Next steps:");
    console.log(`   1. Review the generated files in scripts/data/`);
    console.log(
      `   2. Import to database: npx tsx scripts/import-demo-seeds.ts demo-seeds-${timestamp}.json`,
    );
    console.log(`   3. Or paste SQL file directly into your database`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
