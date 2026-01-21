import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const computeScore = (entry: { likes: number; recasts?: number | null; saves?: number | null; remixes?: number | null; }) => {
  return (
    (entry.likes ?? 0) +
    (entry.recasts ?? 0) * 2 +
    (entry.remixes ?? 0) * 3 +
    (entry.saves ?? 0) * 0.5
  );
};

const ensureGeneratedLogoTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GeneratedLogo" (
      "id" TEXT PRIMARY KEY,
      "text" TEXT NOT NULL,
      "seed" INTEGER NOT NULL,
      "rarity" TEXT,
      "presetKey" TEXT,
      "userId" TEXT,
      "username" TEXT,
      "displayName" TEXT,
      "pfpUrl" TEXT,
      "imageUrl" TEXT,
      "logoImageUrl" TEXT,
      "cardImageUrl" TEXT,
      "castUrl" TEXT,
      "casted" BOOLEAN NOT NULL DEFAULT FALSE,
      "likes" INTEGER NOT NULL DEFAULT 0,
      "recasts" INTEGER NOT NULL DEFAULT 0,
      "saves" INTEGER NOT NULL DEFAULT 0,
      "remixes" INTEGER NOT NULL DEFAULT 0,
      "metadata" JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username.toLowerCase();

  try {
    const entries = await prisma.generatedLogo.findMany({
      where: { username },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const best =
      entries.reduce<typeof entries[number] | null>((current, entry) => {
        if (!current) return entry;
        const currentScore = computeScore(current);
        const entryScore = computeScore(entry);
        if (entryScore !== currentScore) {
          return entryScore > currentScore ? entry : current;
        }
        return entry.createdAt > current.createdAt ? entry : current;
      }, null) ?? null;
    const latest = entries[0] ?? null;
    return NextResponse.json({ username, best, latest, entries });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      await ensureGeneratedLogoTable();
      const entries = await prisma.generatedLogo.findMany({
        where: { username },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      const best =
        entries.reduce<typeof entries[number] | null>((current, entry) => {
          if (!current) return entry;
          const currentScore = computeScore(current);
          const entryScore = computeScore(entry);
          if (entryScore !== currentScore) {
            return entryScore > currentScore ? entry : current;
          }
          return entry.createdAt > current.createdAt ? entry : current;
        }, null) ?? null;
      const latest = entries[0] ?? null;
      return NextResponse.json({ username, best, latest, entries });
    }

    // Fallback to legacy table if generated logos missing
    try {
      const legacy = await prisma.leaderboardEntry.findMany({
        where: { username },
        orderBy: { createdAt: 'desc' },
        take: 25,
      });
      const bestLegacy =
        legacy.reduce<typeof legacy[number] | null>((current, entry) => {
          if (!current) return entry;
          const currentScore = current.likes + (current.recasts ?? 0) * 2;
          const entryScore = entry.likes + (entry.recasts ?? 0) * 2;
          if (entryScore !== currentScore) {
            return entryScore > currentScore ? entry : current;
          }
          return entry.createdAt > current.createdAt ? entry : current;
        }, null) ?? null;
      const latestLegacy = legacy[0] ?? null;
      return NextResponse.json({
        username,
        best: bestLegacy,
        latest: latestLegacy,
        entries: legacy,
      });
    } catch (legacyError) {
      console.error('Profile fallback failed:', legacyError);
    }
    console.error('Profile load error:', error);
    return NextResponse.json(
      { username, best: null, latest: null, entries: [] },
      { status: 200 },
    );
  }
}
