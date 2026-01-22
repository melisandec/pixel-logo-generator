const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== MIGRATE LEGACY LeaderboardEntry -> GeneratedLogo ===\n');

  // load existing GeneratedLogo ids
  const existing = await prisma.generatedLogo.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((e) => e.id));

  // fetch all legacy entries
  const legacy = await prisma.leaderboardEntry.findMany({ orderBy: { createdAt: 'asc' } });
  console.log(`Found ${legacy.length} LeaderboardEntry rows`);

  let migrated = 0;
  const migratedSamples = [];

  for (const e of legacy) {
    if (existingIds.has(e.id)) continue; // already present

    const payload = {
      id: e.id,
      text: e.text,
      seed: e.seed ?? 0,
      rarity: e.rarity ?? null,
      presetKey: e.presetKey ?? null,
      userId: null,
      username: e.username ? e.username.toLowerCase() : null,
      displayName: e.displayName ?? e.username ?? null,
      pfpUrl: e.pfpUrl ?? null,
      imageUrl: e.imageUrl ?? null,
      thumbImageUrl: e.imageUrl ?? null,
      mediumImageUrl: null,
      logoImageUrl: e.logoImageUrl ?? e.imageUrl ?? null,
      cardImageUrl: e.cardImageUrl ?? e.imageUrl ?? null,
      castUrl: e.castUrl ?? null,
      casted: !!e.castUrl,
      likes: e.likes ?? 0,
      recasts: e.recasts ?? 0,
      saves: 0,
      remixes: 0,
      metadata: null,
      createdAt: e.createdAt,
      updatedAt: e.createdAt,
    };

    try {
      await prisma.generatedLogo.create({ data: payload });
      migrated += 1;
      migratedSamples.push({ id: e.id, username: e.username, text: e.text, createdAt: e.createdAt });
      // keep set updated
      existingIds.add(e.id);
    } catch (err) {
      console.warn('Failed to migrate', e.id, err.message || err);
    }
  }

  console.log(`\nMigration complete. Migrated ${migrated} rows.`);
  if (migratedSamples.length > 0) {
    console.log('\nSample migrated rows:');
    migratedSamples.slice(-10).forEach((s) => console.log(` - ${s.username}: "${s.text}" (${s.createdAt})`));
  }

  console.log('\n=== END MIGRATION ===\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
