#!/usr/bin/env node

/**
 * Database Diagnostic Tool
 * Use this to check database health and identify data issues
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🏥 DATABASE DIAGNOSTIC REPORT\n");
  console.log("=".repeat(60) + "\n");

  // 1. Count entries
  console.log("📊 ENTRY COUNTS\n");
  const genCount = await prisma.generatedLogo.count();
  const legacyCount = await prisma.leaderboardEntry.count();
  console.log(`GeneratedLogo: ${genCount}`);
  console.log(`LeaderboardEntry: ${legacyCount}`);
  console.log(`Total: ${genCount + legacyCount}\n`);

  // 2. Check for missing data
  console.log("⚠️  DATA COMPLETENESS\n");

  const missingRarity = await prisma.generatedLogo.count({
    where: { rarity: null },
  });
  console.log(`Missing rarity: ${missingRarity}`);

  const missingUsername = await prisma.generatedLogo.count({
    where: { username: null },
  });
  console.log(`Missing username: ${missingUsername}`);

  const missingImages = await prisma.generatedLogo.count({
    where: {
      AND: [{ imageUrl: null }, { logoImageUrl: null }, { cardImageUrl: null }],
    },
  });
  console.log(`Missing all image URLs: ${missingImages}\n`);

  // 3. Timeline analysis
  console.log("📅 TIMELINE\n");

  const oldest = await prisma.generatedLogo.findFirst({
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const newest = await prisma.generatedLogo.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (oldest && newest) {
    console.log(`Oldest entry: ${new Date(oldest.createdAt).toLocaleString()}`);
    console.log(`Newest entry: ${new Date(newest.createdAt).toLocaleString()}`);
    const daysDiff = Math.floor(
      (newest.createdAt - oldest.createdAt) / (1000 * 60 * 60 * 24),
    );
    console.log(`Span: ${daysDiff} days\n`);
  }

  // 4. User statistics
  console.log("👥 USER STATISTICS\n");

  const allEntries = await prisma.generatedLogo.findMany();
  const userMap = new Map();

  allEntries.forEach((entry) => {
    const user = entry.username || "unknown";
    userMap.set(user, (userMap.get(user) || 0) + 1);
  });

  const userStats = Array.from(userMap.entries())
    .map(([username, count]) => ({ username, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  console.log("Top contributors:");
  userStats.forEach((stat, idx) => {
    console.log(`${idx + 1}. ${stat.username}: ${stat.count} entries`);
  });
  console.log();

  // 5. Rarity distribution
  console.log("🎨 RARITY DISTRIBUTION\n");

  const allEntriesForRarity = await prisma.generatedLogo.findMany();
  const rarityMap = new Map();

  allEntriesForRarity.forEach((entry) => {
    const rarity = entry.rarity || "UNKNOWN";
    rarityMap.set(rarity, (rarityMap.get(rarity) || 0) + 1);
  });

  const rarityOrder = ["LEGENDARY", "EPIC", "RARE", "COMMON", "UNKNOWN"];

  rarityOrder.forEach((rarity) => {
    const count = rarityMap.get(rarity) || 0;
    if (count > 0) {
      const pct = ((count / genCount) * 100).toFixed(1);
      const bar = "█".repeat(Math.ceil(count / 2));
      console.log(
        `${rarity.padEnd(12)}: ${String(count).padStart(3)} (${pct}%) ${bar}`,
      );
    }
  });
  console.log();

  // 6. Data quality score
  console.log("✨ DATA QUALITY SCORE\n");

  const total = genCount;
  const complete = genCount - missingRarity - missingUsername;
  const score = Math.round((complete / total) * 100);

  console.log(`Complete entries: ${complete}/${total} = ${score}%`);

  if (score >= 95) {
    console.log("Status: ✅ EXCELLENT");
  } else if (score >= 90) {
    console.log("Status: ✅ GOOD");
  } else if (score >= 80) {
    console.log("Status: ⚠️  ACCEPTABLE");
  } else {
    console.log("Status: ❌ NEEDS ATTENTION");
  }
  console.log();

  // 7. Known issues
  console.log("🐛 KNOWN ISSUES\n");

  const issues = [];

  if (missingRarity > 0) {
    issues.push(`${missingRarity} entry(ies) missing rarity`);
  }

  if (missingUsername > 0) {
    issues.push(`${missingUsername} entry(ies) missing username`);
  }

  const duplicateCheck = await prisma.generatedLogo.findMany({
    select: { username: true, text: true, seed: true },
  });

  const seen = new Set();
  let duplicates = 0;
  duplicateCheck.forEach((entry) => {
    const key = `${entry.username}_${entry.text}_${entry.seed}`;
    if (seen.has(key)) {
      duplicates++;
    }
    seen.add(key);
  });

  if (duplicates > 0) {
    issues.push(`${duplicates} potential duplicate entry(ies)`);
  }

  if (issues.length === 0) {
    console.log("✅ No issues detected!");
  } else {
    issues.forEach((issue) => {
      console.log(`• ${issue}`);
    });
  }
  console.log();

  // 8. Recovery opportunities
  console.log("🔄 RECOVERY OPPORTUNITIES\n");

  const orphaned = await prisma.generatedLogo.count({
    where: {
      AND: [
        { castUrl: null },
        {
          OR: [
            { imageUrl: null },
            { logoImageUrl: null },
            { cardImageUrl: null },
          ],
        },
      ],
    },
  });

  console.log(
    `Entries not casted: ${genCount - (await prisma.generatedLogo.count({ where: { castUrl: { not: null } } }))}`,
  );
  console.log(`Potentially recoverable: ${orphaned}`);
  console.log();

  console.log("=".repeat(60));
  console.log("✅ Diagnostic complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
