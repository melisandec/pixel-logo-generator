#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE AUDIT
 * Checks all possible locations where the 45 entries might exist
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

async function auditDatabase() {
  const prisma = new PrismaClient();

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🔍 COMPREHENSIVE DATABASE AUDIT 🔍                    ║
║     Searching for 45 missing GeneratedLogo entries             ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // Check all tables for any data
    console.log("\n📊 TABLE STATUS:\n");

    const tables = [
      { name: "GeneratedLogo", model: prisma.generatedLogo },
      { name: "LeaderboardEntry", model: prisma.leaderboardEntry },
      { name: "DemoSeedPool", model: prisma.demoSeedPool },
      { name: "DemoLogoStyle", model: prisma.demoLogoStyle },
      { name: "LogoStyle", model: prisma.logoStyle },
      { name: "ForgedLogo", model: prisma.forgedLogo },
      { name: "UserStats", model: prisma.userStats },
      { name: "UserReward", model: prisma.userReward },
      { name: "Badge", model: prisma.badge },
    ];

    let totalRecords = 0;
    for (const table of tables) {
      try {
        const count = await table.model.count();
        const status = count === 0 ? "❌ EMPTY" : `✓ ${count} records`;
        console.log(`  ${table.name.padEnd(20)} ${status}`);
        totalRecords += count;
      } catch (e) {
        console.log(
          `  ${table.name.padEnd(20)} ⚠️  Error: ${e.message.substring(0, 30)}`,
        );
      }
    }

    console.log(`\n  TOTAL RECORDS ACROSS ALL TABLES: ${totalRecords}`);

    if (totalRecords === 0) {
      console.log("\n⚠️  DATABASE IS COMPLETELY EMPTY");
      console.log("   This indicates:");
      console.log(
        "   • prisma migrate reset was run (most likely)",
      );
      console.log("   • All data deleted via Prisma Cloud");
      console.log("   • Wrong database URL (unlikely)");
    }

    // Check for any date-based clues
    console.log("\n📅 DATE-BASED ANALYSIS:\n");

    try {
      const oldestLogo = await prisma.generatedLogo.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      const newestLogo = await prisma.generatedLogo.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      if (oldestLogo) {
        console.log(`  Oldest entry: ${oldestLogo.createdAt}`);
        console.log(`  Newest entry: ${newestLogo?.createdAt}`);
      } else {
        console.log("  No GeneratedLogo entries found in database");
      }
    } catch (e) {
      console.log(`  Error reading dates: ${e.message.substring(0, 50)}`);
    }

    // Check schema
    console.log("\n🏗️  DATABASE SCHEMA STATUS:\n");

    try {
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      const tableNames = result
        .map((t) => t.table_name)
        .filter((t) => !t.startsWith("_"));
      console.log(`  Total tables in 'public' schema: ${tableNames.length}`);
      console.log(`  Tables: ${tableNames.join(", ")}`);
    } catch (e) {
      console.log(`  Could not query schema: ${e.message.substring(0, 50)}`);
    }

    // Summary
    console.log(`
═══════════════════════════════════════════════════════════════════

AUDIT SUMMARY:
───────────────────────────────────────────────────────────────

Database Status: ${totalRecords === 0 ? "⚠️  EMPTY (DATA LOST)" : "✓ Has data"}

If 45+ entries were lost:
  1. Check Prisma Cloud for backups → https://cloud.prisma.io
  2. Contact support if no backup → support@prisma.io
  3. Or restore from your local memory → recover-missing-entry.js

═══════════════════════════════════════════════════════════════════
`);
  } catch (error) {
    console.error("\n❌ Audit failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditDatabase();
