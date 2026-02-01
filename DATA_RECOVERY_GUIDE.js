#!/usr/bin/env node

/**
 * CRITICAL: DATA RECOVERY GUIDE - 45 ENTRIES LOST
 * ================================================
 * 
 * This script helps you understand and recover lost data.
 * The data was likely deleted through:
 * 1. prisma migrate reset (most likely)
 * 2. Direct database wipe via Prisma Cloud console
 * 3. Running on wrong branch/environment
 * 
 * RECOVERY OPTIONS (in order of likelihood to work):
 */

const { execSync } = require("child_process");

console.log(`
╔════════════════════════════════════════════════════════════════╗
║               🚨 DATABASE RECOVERY GUIDE 🚨                    ║
║          45 GeneratedLogo entries have been deleted            ║
╚════════════════════════════════════════════════════════════════╝

SITUATION:
  ✗ GeneratedLogo table: 0 entries (was 45+)
  ✗ No backup files in repository
  ✗ Git doesn't track data (only schema)
  ✓ Database connection working
  ✓ Prisma Data Platform in use (db.prisma.io)

═══════════════════════════════════════════════════════════════════

OPTION 1: PRISMA DATA PLATFORM BACKUP (MOST LIKELY TO WORK)
───────────────────────────────────────────────────────────────

Prisma's managed database typically has:
  ✓ Automated daily backups
  ✓ 30-day retention policy
  ✓ Point-in-time recovery (PITR)

STEPS:
  1. Go to: https://cloud.prisma.io
  2. Sign in with your account
  3. Navigate to your project
  4. Look for "Backups" or "Restore" tab
  5. Find a backup from BEFORE the data was deleted
  6. Click "Restore" and confirm
  7. Verify data with: npx prisma db execute --stdin

⚠️  NOTE: You need:
    - Prisma Cloud login
    - Project access
    - Approximate time of data loss

═══════════════════════════════════════════════════════════════════

OPTION 2: PRISMA SUPPORT RECOVERY (IF OPTION 1 FAILS)
───────────────────────────────────────────────────────────────

If automated backups don't show your data:
  1. Contact: support@prisma.io
  2. Provide:
     - Database name: postgres (on db.prisma.io)
     - Approximate time of loss: ~2026-01-31
     - Number of entries: 45 GeneratedLogo records
     - Last known good data: 2026-01-29 or earlier
  3. They can recover from:
     - PostgreSQL WAL (Write-Ahead Logs)
     - Point-in-time recovery archives
     - May take 24-48 hours

═══════════════════════════════════════════════════════════════════

OPTION 3: MANUAL RECOVERY (IF NO AUTOMATED BACKUP)
───────────────────────────────────────────────────────────────

If backups unavailable, you can:
  1. Manually recreate entries using:
     node recover-missing-entry.js
  
  2. Or populate with test data:
     node seed-demo.js
  
  3. Or restore from memory:
     - Document the 45 logos
     - Get text, usernames, seeds, rarities
     - Re-enter via interactive script

═══════════════════════════════════════════════════════════════════

OPTION 4: CHECK OTHER BRANCHES/ENVIRONMENTS
───────────────────────────────────────────────────────────────

Could the data still exist on a different branch?
  - Check if another branch uses different DATABASE_URL
  - Check .env.production vs .env vs .env.local
  - Verify which branch was checked out when data was used

═══════════════════════════════════════════════════════════════════

DIAGNOSTIC CHECKLIST:
───────────────────────────────────────────────────────────────
`);

// Run diagnostics
try {
  console.log("📋 Checking environment variables...");
  const { execSync } = require("child_process");
  const dbUrl = process.env.DATABASE_URL || "(not set)";
  console.log(
    `   DATABASE_URL: ${dbUrl.substring(0, 40)}...${dbUrl.length > 40 ? '...' : ''}`,
  );

  // Check git branches
  console.log("\n🌳 Active branches:");
  const branches = execSync("git branch -a 2>/dev/null || echo ''")
    .toString()
    .split("\n")
    .filter((b) => b.trim());
  branches.slice(0, 8).forEach((b) => console.log(`   ${b}`));

  // Check recent commits
  console.log("\n📅 Last commits on demo branch:");
  const lastCommits = execSync("git log -3 --oneline demo 2>/dev/null || echo ''")
    .toString()
    .trim();
  if (lastCommits) {
    lastCommits.split("\n").forEach((c) => console.log(`   ${c}`));
  }
} catch (e) {
  console.log("   (Diagnostic check skipped)");
}

console.log(`
═══════════════════════════════════════════════════════════════════

IMMEDIATE ACTION PLAN:
───────────────────────────────────────────────────────────────

1️⃣  STOP - Don't run migrations or resets
2️⃣  CHECK Prisma Cloud for backup/restore options
3️⃣  DOCUMENT what you remember about the 45 entries:
    - Usernames
    - Logo text
    - Approximate creation dates
    - Rarity levels (if known)
4️⃣  CONTACT support if Prisma backups unavailable
5️⃣  RESTORE when backup is found or recreate manually

═══════════════════════════════════════════════════════════════════

NEED HELP?
Run: node recover-missing-entry.js
     (Interactive mode to manually add entries back)

═══════════════════════════════════════════════════════════════════
`);
