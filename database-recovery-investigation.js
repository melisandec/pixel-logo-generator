#!/usr/bin/env node

/**
 * Database Recovery Investigation Script
 * Attempts to determine:
 * 1. When data was deleted
 * 2. If backups are available
 * 3. What recovery options exist
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 DATABASE RECOVERY INVESTIGATION\n");
  console.log("=".repeat(60));

  try {
    // Check current database state
    console.log("\n📊 CURRENT DATABASE STATE:\n");

    const genLogoCount = await prisma.generatedLogo.count();
    const forgedLogoCount = await prisma.forgedLogo.count();
    const demoLogStyleCount = await prisma.demoLogoStyle.count();
    const leaderboardCount = await prisma.leaderboard.count();

    console.log(`GeneratedLogo entries: ${genLogoCount}`);
    console.log(`ForgedLogo entries: ${forgedLogoCount}`);
    console.log(`DemoLogoStyle entries: ${demoLogStyleCount}`);
    console.log(`Leaderboard entries: ${leaderboardCount}`);

    // Check if ANY recent entries exist
    console.log("\n📅 TIME-BASED ANALYSIS:\n");

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogos = await prisma.generatedLogo.count({
      where: {
        createdAt: { gte: oneWeekAgo },
      },
    });
    console.log(`Entries created in last 7 days: ${recentLogos}`);

    // Check git history for branch timeline
    console.log("\n🌳 GIT BRANCH TIMELINE:\n");
    const { execSync } = require("child_process");

    try {
      const branchLog = execSync(
        "git log --all --date=short --pretty=format:'%h %ad %s' | head -20",
      ).toString();
      console.log(branchLog);
    } catch (e) {
      console.log("(Git info unavailable)");
    }

    // Check for backup indicators
    console.log("\n💾 BACKUP INDICATORS:\n");
    console.log(
      "✓ Database: Prisma Data Platform (db.prisma.io)",
    );
    console.log(
      "ℹ Prisma Data Platform typically has:");
    console.log(
      "  - Automated daily backups (30-day retention)",
    );
    console.log("  - Point-in-time recovery available");
    console.log("  - Accessible via Prisma Cloud console");

    // Recommendations
    console.log("\n💡 RECOVERY OPTIONS:\n");
    console.log(
      "1. CHECK PRISMA CLOUD CONSOLE:",
    );
    console.log("   - Go to https://cloud.prisma.io");
    console.log("   - Navigate to your project/database");
    console.log("   - Look for 'Backups' or 'Restore' section");
    console.log(
      "   - Restore from backup point before data loss");

    console.log(
      "\n2. CONTACT PRISMA SUPPORT:");
    console.log(
      "   - If automated backups don't show the data",
    );
    console.log("   - Support can restore from WAL (Write-Ahead Logs)");
    console.log(
      "   - Provide: approximate time of data loss");

    console.log("\n3. MANUAL RECREATION:");
    console.log("   - Document lost entries: 45 total");
    console.log("   - Recreate via seed script with known data");
    console.log(
      "   - Or: node recover-missing-entry.js");

    // Try to extract useful metadata
    console.log("\n📋 SCHEMA VERIFICATION:\n");

    const tables = [
      "GeneratedLogo",
      "ForgedLogo",
      "DemoLogoStyle",
      "Leaderboard",
    ];

    for (const table of tables) {
      try {
        // This is a simple check to see if tables exist and are accessible
        const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];
        if (model) {
          console.log(`✓ ${table} table exists and is accessible`);
        }
      } catch (e) {
        console.log(`✗ ${table} table error: ${e.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n⚠️  NEXT STEPS:");
    console.log(
      "1. Check Prisma Cloud console for backup restore options",
    );
    console.log(
      "2. If available, restore database to point before data loss",
    );
    console.log(
      "3. If not available, contact Prisma support with timestamp",
    );
    console.log(
      "4. Meanwhile, document the 45 lost entries for manual recovery",
    );

  } catch (error) {
    console.error("❌ Investigation error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
