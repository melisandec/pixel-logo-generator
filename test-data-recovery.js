const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== DATABASE DATA RECOVERY TEST ===\n');

  // Check GeneratedLogo table
  console.log('1. GeneratedLogo Table:');
  const genLogoCount = await prisma.generatedLogo.count();
  console.log(`   Total records: ${genLogoCount}`);

  if (genLogoCount > 0) {
    const genLogoStats = await prisma.generatedLogo.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`   Oldest: ${genLogoStats?.createdAt}`);

    const newestGen = await prisma.generatedLogo.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Newest: ${newestGen?.createdAt}`);
  }

  // Check LeaderboardEntry table
  console.log('\n2. LeaderboardEntry Table (Legacy):');
  const leaderboardCount = await prisma.leaderboardEntry.count();
  console.log(`   Total records: ${leaderboardCount}`);

  if (leaderboardCount > 0) {
    const leaderboardStats = await prisma.leaderboardEntry.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`   Oldest: ${leaderboardStats?.createdAt}`);

    const newestLead = await prisma.leaderboardEntry.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Newest: ${newestLead?.createdAt}`);
  }

  // Check for data from Jan 19-20
  console.log('\n3. Data from January 19-20, 2026:');

  const janGenLogos = await prisma.generatedLogo.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-01-19T00:00:00Z'),
        lt: new Date('2026-01-21T00:00:00Z'),
      },
    },
  });
  console.log(`   GeneratedLogo (Jan 19-20): ${janGenLogos.length} records`);

  const janLeaderboard = await prisma.leaderboardEntry.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-01-19T00:00:00Z'),
        lt: new Date('2026-01-21T00:00:00Z'),
      },
    },
  });
  console.log(`   LeaderboardEntry (Jan 19-20): ${janLeaderboard.length} records`);

  // Show sample data from LeaderboardEntry for Jan 19-20
  if (janLeaderboard.length > 0) {
    console.log('\n4. Sample LeaderboardEntry data (Jan 19-20):');
    janLeaderboard.slice(0, 3).forEach((entry, i) => {
      console.log(`   [${i + 1}] ${entry.username}: "${entry.text}" (created: ${entry.createdAt})`);
      console.log(`       casted: ${entry.castUrl ? 'YES' : 'NO'}`);
    });
  }

  // Show sample data from GeneratedLogo for Jan 19-20
  if (janGenLogos.length > 0) {
    console.log('\n5. Sample GeneratedLogo data (Jan 19-20):');
    janGenLogos.slice(0, 3).forEach((entry, i) => {
      console.log(`   [${i + 1}] ${entry.username}: "${entry.text}" (created: ${entry.createdAt})`);
      console.log(`       casted: ${entry.casted}`);
    });
  }

  // Check for your user's data
  console.log('\n6. Your profile data across all time:');
  const yourGeneratedLogos = await prisma.generatedLogo.findMany({
    where: {
      username: {
        in: ['melisandecornelt', 'melisandecornetlichtfus'], // common username variations
      },
    },
  });
  console.log(`   GeneratedLogo entries (your account): ${yourGeneratedLogos.length}`);

  const yourLeaderboard = await prisma.leaderboardEntry.findMany({
    where: {
      username: {
        in: ['melisandecornelt', 'melisandecornetlichtfus'],
      },
    },
  });
  console.log(`   LeaderboardEntry entries (your account): ${yourLeaderboard.length}`);

  if (yourLeaderboard.length > 0) {
    console.log('   Your LeaderboardEntry casts:');
    yourLeaderboard.forEach((entry, i) => {
      console.log(`   [${i + 1}] "${entry.text}" (${entry.createdAt}) - casted: ${entry.castUrl ? 'YES' : 'NO'}`);
    });
  }

  if (yourGeneratedLogos.length > 0) {
    console.log('   Your GeneratedLogo casts:');
    yourGeneratedLogos.forEach((entry, i) => {
      console.log(`   [${i + 1}] "${entry.text}" (${entry.createdAt}) - casted: ${entry.casted}`);
    });
  }

  console.log('\n=== END TEST ===\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
