import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { fetchUserRewards } from '@/lib/scoringEngine';
import { REWARD_REGISTRY } from '@/lib/rewardRegistry';

const ensureUserStatsTables = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserStats" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT,
      "username" TEXT NOT NULL UNIQUE,
      "support" INTEGER NOT NULL DEFAULT 0,
      "influence" INTEGER NOT NULL DEFAULT 0,
      "creation" INTEGER NOT NULL DEFAULT 0,
      "discovery" INTEGER NOT NULL DEFAULT 0,
      "totalPower" INTEGER NOT NULL DEFAULT 0,
      "rank" TEXT NOT NULL DEFAULT 'Rookie',
      "bestRarity" TEXT,
      "lastUpdated" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserReward" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT,
      "username" TEXT NOT NULL,
      "rewardType" TEXT NOT NULL,
      "unlockedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "metadata" JSONB
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UserReward_username_rewardType_key"
    ON "UserReward" ("username", "rewardType");
  `);
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase();
  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 });
  }
  try {
    const stats = await prisma.userStats.findUnique({ where: { username } });
    const rewards = await fetchUserRewards(username);
    return NextResponse.json({ stats, rewards, registry: REWARD_REGISTRY });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      await ensureUserStatsTables();
      const stats = await prisma.userStats.findUnique({ where: { username } });
      const rewards = await fetchUserRewards(username);
      return NextResponse.json({ stats, rewards, registry: REWARD_REGISTRY });
    }
    console.error('user-stats GET error:', error);
    return NextResponse.json({ stats: null, rewards: [], registry: REWARD_REGISTRY }, { status: 200 });
  }
}
