const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = 'ladymel';
  console.log(`\n=== USER PROFILE CHECK: ${username} ===\n`);

  const genCount = await prisma.generatedLogo.count({ where: { username } });
  console.log(`GeneratedLogo count for ${username}: ${genCount}`);

  const genEntries = await prisma.generatedLogo.findMany({
    where: { username },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (genEntries.length > 0) {
    console.log('\nRecent GeneratedLogo entries:');
    genEntries.forEach((e, i) => {
      console.log(`${i + 1}. ${e.text} | createdAt: ${e.createdAt} | casted: ${e.casted} | castUrl: ${e.castUrl || 'null'}`);
    });
  }

  const lbCount = await prisma.leaderboardEntry.count({ where: { username } });
  console.log(`\nLeaderboardEntry count for ${username}: ${lbCount}`);

  const lbEntries = await prisma.leaderboardEntry.findMany({
    where: { username },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (lbEntries.length > 0) {
    console.log('\nRecent LeaderboardEntry entries:');
    lbEntries.forEach((e, i) => {
      console.log(`${i + 1}. ${e.text} | createdAt: ${e.createdAt} | castUrl: ${e.castUrl || 'null'}`);
    });
  }

  console.log('\n=== END ===\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
