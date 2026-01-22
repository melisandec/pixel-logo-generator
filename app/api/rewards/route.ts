import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { REWARD_REGISTRY } from '@/lib/rewardRegistry';

const ensureUserRewardTable = async () => {
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
    const rewards = await prisma.userReward.findMany({
      where: { username },
      orderBy: { unlockedAt: 'desc' },
    });
    return NextResponse.json({ rewards, registry: REWARD_REGISTRY });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      await ensureUserRewardTable();
      const rewards = await prisma.userReward.findMany({
        where: { username },
        orderBy: { unlockedAt: 'desc' },
      });
      return NextResponse.json({ rewards, registry: REWARD_REGISTRY });
    }
    console.error('rewards GET error:', error);
    return NextResponse.json({ rewards: [], registry: REWARD_REGISTRY }, { status: 200 });
  }
}
