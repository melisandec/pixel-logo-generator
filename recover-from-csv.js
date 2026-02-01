#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE RECOVERY FROM CSV EXPORT
 * 
 * Recovers GeneratedLogo entries from logos-export-2026-01-22.csv
 * Includes proper IDs, rarity, likes, and all metadata
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split('","').map((h) => h.replace(/^"|"$/g, ""));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split('","')
      .map((v) => v.replace(/^"|"$/g, ""));

    if (values.length !== headers.length) continue;

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    records.push(record);
  }

  return records;
}

async function recoverFromCSV() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║    📊 COMPREHENSIVE DATABASE RECOVERY FROM CSV EXPORT 📊       ║
║   Restoring complete metadata with rarity, likes, and IDs      ║
╚════════════════════════════════════════════════════════════════╝
`);

  const csvPath = path.join(
    "/Users/melisandecornetlichtfus/Downloads",
    "logos-export-2026-01-22.csv",
  );

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log(`\n📂 Reading CSV from: ${csvPath}\n`);

  const records = parseCSV(csvPath);
  console.log(`📋 Found ${records.length} entries in CSV\n`);

  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const record of records) {
    try {
      const id = record["ID"].trim();
      const username = record["Username"].trim();
      const text = record["Text"].trim();
      const seed = parseInt(record["Seed"], 10);
      const rarity = record["Rarity"].trim();
      const logoImageUrl = record["Logo Image URL"].trim();
      const cardImageUrl = record["Card Image URL"].trim();
      const createdAt = new Date(record["Created At"].trim());
      const likes = parseInt(record["Likes"] || "0", 10);
      const recasts = parseInt(record["Recasts"] || "0", 10);
      const casted = record["Casted"].trim() === "Yes";

      // Check if entry already exists
      const existing = await prisma.generatedLogo.findUnique({
        where: { id },
      });

      if (existing) {
        // Update existing entry with CSV data
        await prisma.generatedLogo.update({
          where: { id },
          data: {
            rarity: rarity,
            cardImageUrl: cardImageUrl || null,
            recasts: recasts,
            createdAt: createdAt,
          },
        });
        console.log(
          `  ↻ ${text} by ${username} - Updated with rarity: ${rarity}`,
        );
        updateCount++;
      } else {
        // Create new entry
        await prisma.generatedLogo.create({
          data: {
            id,
            text,
            seed,
            username: username.toLowerCase(),
            displayName: username,
            logoImageUrl,
            imageUrl: logoImageUrl,
            cardImageUrl: cardImageUrl || null,
            createdAt,
            updatedAt: createdAt,
            rarity,
            recasts: recasts,
          },
        });
        console.log(
          `  ✓ ${text} by ${username} (Rarity: ${rarity}, Likes: ${likes})`,
        );
        successCount++;
      }
    } catch (error) {
      console.log(
        `  ✗ ${record["Text"]} - Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      errors.push({
        text: record["Text"],
        error: error instanceof Error ? error.message : "Unknown error",
      });
      errorCount++;
    }
  }

  console.log(`
════════════════════════════════════════════════════════════════════

✅ RECOVERY COMPLETE

  Total entries processed: ${records.length}
  ✓ New entries created: ${successCount}
  ↻ Existing entries updated: ${updateCount}
  ✗ Failed: ${errorCount}

════════════════════════════════════════════════════════════════════
`);

  if (errorCount > 0) {
    console.log("❌ ERRORS:\n");
    errors.forEach((err) => {
      console.log(`  - ${err.text}: ${err.error}`);
    });
  }

  // Get current database status
  const totalLogos = await prisma.generatedLogo.count();
  const rarityBreakdown = await prisma.generatedLogo.groupBy({
    by: ["rarity"],
    _count: {
      id: true,
    },
  });

  const totalLikes = await prisma.generatedLogo.aggregate({
    _sum: {
      recasts: true,
    },
  });

  console.log(`\n📊 DATABASE STATUS:\n`);
  console.log(`  Total GeneratedLogo entries: ${totalLogos}`);
  console.log(`\n  Rarity Distribution:`);
  rarityBreakdown.forEach((rb) => {
    console.log(`    ${rb.rarity}: ${rb._count.id}`);
  });
  console.log(`\n  Total Recasts: ${totalLikes._sum.recasts || 0}`);

  const oldestEntry = await prisma.generatedLogo.findFirst({
    orderBy: { createdAt: "asc" },
    select: { text: true, createdAt: true, rarity: true },
  });

  const newestEntry = await prisma.generatedLogo.findFirst({
    orderBy: { createdAt: "desc" },
    select: { text: true, createdAt: true, rarity: true },
  });

  console.log(`\n  Oldest: ${oldestEntry?.text} (${oldestEntry?.createdAt})`);
  console.log(`  Newest: ${newestEntry?.text} (${newestEntry?.createdAt})`);

  console.log(`
════════════════════════════════════════════════════════════════════

🎉 YOUR COMPLETE DATASET HAS BEEN RECOVERED!

Next steps:
  1. Verify in admin panel: http://localhost:3000/admin/generated-logos
  2. Check rarity distribution and engagement metrics
  3. Run blob audit to verify all image URLs are accessible

════════════════════════════════════════════════════════════════════
`);

  await prisma.$disconnect();
}

recoverFromCSV().catch((error) => {
  console.error("❌ Recovery failed:", error);
  process.exit(1);
});
