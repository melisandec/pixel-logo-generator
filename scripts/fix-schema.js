const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('Creating missing tables...');
    
    // Create UserStats table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserStats" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "userId" TEXT,
        "support" INTEGER DEFAULT 0,
        "influence" INTEGER DEFAULT 0,
        "creation" INTEGER DEFAULT 0,
        "discovery" INTEGER DEFAULT 0,
        "totalPower" INTEGER DEFAULT 0,
        "rank" INTEGER,
        "bestRarity" TEXT,
        "lastUpdated" TIMESTAMPTZ DEFAULT NOW(),
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created UserStats table');

    // Create UserReward table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserReward" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT NOT NULL,
        "userId" TEXT,
        "rewardType" TEXT NOT NULL,
        "unlockedAt" TIMESTAMPTZ DEFAULT NOW(),
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Created UserReward table');

    // Create indices
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "UserStats_username_idx" ON "UserStats"("username")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "UserReward_username_idx" ON "UserReward"("username")
    `);
    console.log('✅ Created indices');

    console.log('✅ All tables created successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Tables already exist');
      process.exit(0);
    }
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createMissingTables();
