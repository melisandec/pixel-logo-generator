#!/usr/bin/env node

/**
 * Data Integrity Monitor
 * Detects missing, incomplete, or suspicious entries in the logo database
 * Useful for identifying issues like the 111iks "Coucou" missing entry
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 DATA INTEGRITY MONITOR\n');
  console.log('='.repeat(70) + '\n');

  // 1. Find missing entries
  console.log('🚨 CRITICAL ISSUES\n');
  
  const missingRarity = await prisma.generatedLogo.findMany({
    where: { rarity: null },
    select: { id: true, username: true, text: true, seed: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Missing Rarity (${missingRarity.length}):`);
  if (missingRarity.length === 0) {
    console.log('  ✅ None found\n');
  } else {
    missingRarity.forEach((entry) => {
      console.log(`  ⚠️  ${entry.username} | "${entry.text}" | Seed: ${entry.seed} | ${new Date(entry.createdAt).toLocaleString()}`);
    });
    console.log();
  }

  const missingImages = await prisma.generatedLogo.findMany({
    where: {
      AND: [
        { imageUrl: null },
        { logoImageUrl: null },
        { cardImageUrl: null },
      ],
    },
    select: { id: true, username: true, text: true, seed: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Missing All Image URLs (${missingImages.length}):`);
  if (missingImages.length === 0) {
    console.log('  ✅ None found\n');
  } else {
    missingImages.forEach((entry) => {
      console.log(`  ⚠️  ${entry.username} | "${entry.text}" | Seed: ${entry.seed}`);
    });
    console.log();
  }

  const orphaned = await prisma.generatedLogo.findMany({
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
    select: { id: true, username: true, text: true, seed: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Orphaned Entries - Not Casted & Missing Images (${orphaned.length}):`);
  if (orphaned.length === 0) {
    console.log('  ✅ None found\n');
  } else {
    orphaned.slice(0, 5).forEach((entry) => {
      console.log(`  ⚠️  ${entry.username} | "${entry.text}" | Seed: ${entry.seed}`);
    });
    console.log();
  }

  // 2. Find potential duplicates
  console.log('⚠️  POTENTIAL ISSUES\n');
  
  const allEntries = await prisma.generatedLogo.findMany();
  const seedMap = new Map();
  const duplicates = [];

  allEntries.forEach((entry) => {
    const key = `${entry.username}_${entry.text}_${entry.seed}`;
    if (seedMap.has(key)) {
      duplicates.push({
        key,
        first: seedMap.get(key),
        second: entry.id,
      });
    } else {
      seedMap.set(key, entry.id);
    }
  });

  console.log(`Potential Duplicates (${duplicates.length}):`);
  if (duplicates.length === 0) {
    console.log('  ✅ None found\n');
  } else {
    duplicates.slice(0, 5).forEach((dup) => {
      console.log(`  ⚠️  ${dup.key}`);
    });
    console.log();
  }

  // 3. Timeline gaps
  console.log('📅 TIMELINE ANALYSIS\n');
  
  const entries = await prisma.generatedLogo.findMany({
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true, username: true, text: true },
  });

  if (entries.length > 1) {
    const gaps = [];
    for (let i = 0; i < entries.length - 1; i++) {
      const current = new Date(entries[i].createdAt).getTime();
      const next = new Date(entries[i + 1].createdAt).getTime();
      const diffHours = (next - current) / (1000 * 60 * 60);
      
      if (diffHours > 24) {
        gaps.push({
          from: new Date(entries[i].createdAt).toLocaleString(),
          to: new Date(entries[i + 1].createdAt).toLocaleString(),
          hours: Math.round(diffHours),
        });
      }
    }

    if (gaps.length === 0) {
      console.log('No significant gaps (> 24 hours) detected\n');
    } else {
      console.log(`Found ${gaps.length} gaps longer than 24 hours:\n`);
      gaps.slice(0, 5).forEach((gap) => {
        console.log(`  📍 ${gap.from} → ${gap.to} (${gap.hours}h gap)`);
      });
      console.log();
    }
  }

  // 4. Recent activity (last 7 days)
  console.log('📊 RECENT ACTIVITY (Last 7 Days)\n');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recent = await prisma.generatedLogo.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    select: { username: true, text: true, rarity: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const recentByDay = new Map();
  recent.forEach((entry) => {
    const day = new Date(entry.createdAt).toLocaleDateString();
    if (!recentByDay.has(day)) {
      recentByDay.set(day, []);
    }
    recentByDay.get(day).push(entry);
  });

  Array.from(recentByDay.entries()).forEach(([day, entries]) => {
    console.log(`${day}: ${entries.length} entries`);
    entries.slice(0, 3).forEach((e) => {
      console.log(`  • ${e.username} | "${e.text}" | ${e.rarity || 'NO RARITY'}`);
    });
  });
  console.log();

  // 5. User statistics
  console.log('👥 USER STATISTICS\n');
  
  const userStats = new Map();
  allEntries.forEach((entry) => {
    const user = entry.username || 'unknown';
    if (!userStats.has(user)) {
      userStats.set(user, { count: 0, rarest: null, lastCreated: null });
    }
    const stat = userStats.get(user);
    stat.count++;
    
    // Track rarest rarity
    const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
    const currentOrder = rarityOrder[entry.rarity] ?? 999;
    const bestOrder = stat.rarest ? rarityOrder[stat.rarest] ?? 999 : 999;
    
    if (currentOrder < bestOrder) {
      stat.rarest = entry.rarity;
    }

    const entryDate = new Date(entry.createdAt).getTime();
    const lastDate = stat.lastCreated ? new Date(stat.lastCreated).getTime() : 0;
    if (entryDate > lastDate) {
      stat.lastCreated = entry.createdAt;
    }
  });

  const topUsers = Array.from(userStats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  console.log('Top Contributors:');
  topUsers.forEach(([user, stat]) => {
    console.log(`  ${user.padEnd(20)} | ${stat.count} logos | Best: ${stat.rarest || 'N/A'}`);
  });
  console.log();

  // 6. Summary
  console.log('='.repeat(70));
  console.log('\n📈 SUMMARY\n');
  
  const issues = missingRarity.length + missingImages.length + duplicates.length;
  const healthScore = Math.max(0, 100 - (issues * 10));

  console.log(`Total Entries: ${allEntries.length}`);
  console.log(`Unique Users: ${userStats.size}`);
  console.log(`Issues Found: ${issues}`);
  console.log(`Health Score: ${healthScore}/100 ${healthScore >= 90 ? '✅' : healthScore >= 80 ? '⚠️' : '❌'}`);
  console.log();

  if (issues === 0) {
    console.log('✅ Database integrity is excellent!');
  } else {
    console.log(`⚠️  Found ${issues} issues. Review above for details.`);
    console.log('\n📝 RECOMMENDED ACTIONS:');
    if (missingRarity.length > 0) {
      console.log(`  1. Fix ${missingRarity.length} entry(ies) missing rarity`);
      console.log('     Run: node recover-missing-entry.js (Mode 3)');
    }
    if (missingImages.length > 0) {
      console.log(`  2. Investigate ${missingImages.length} entry(ies) missing image URLs`);
    }
    if (duplicates.length > 0) {
      console.log(`  3. Review and remove ${duplicates.length} duplicate entry(ies)`);
    }
  }
  console.log();
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
