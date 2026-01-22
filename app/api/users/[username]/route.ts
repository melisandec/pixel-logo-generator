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
    // Retrieve ALL user entries without limiting
    const entries = await prisma.generatedLogo.findMany({
      where: { username },
      orderBy: { createdAt: 'desc' },
      // NO LIMIT - retrieve all historical data
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
    
    // Calculate total stats across all entries
    const totalStats = entries.reduce((acc, entry) => ({
      totalLikes: acc.totalLikes + (entry.likes ?? 0),
      totalRecasts: acc.totalRecasts + (entry.recasts ?? 0),
      totalSaves: acc.totalSaves + ((entry as any).saves ?? 0),
      totalRemixes: acc.totalRemixes + ((entry as any).remixes ?? 0),
    }), { totalLikes: 0, totalRecasts: 0, totalSaves: 0, totalRemixes: 0 });
    
    return NextResponse.json({ 
      username, 
      best, 
      latest, 
      entries,
      stats: {
        totalLogos: entries.length,
        ...totalStats,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      await ensureGeneratedLogoTable();
      // Retrieve ALL entries
      const entries = await prisma.generatedLogo.findMany({
        where: { username },
        orderBy: { createdAt: 'desc' },
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
      
      const totalStats = entries.reduce((acc, entry) => ({
        totalLikes: acc.totalLikes + (entry.likes ?? 0),
        totalRecasts: acc.totalRecasts + (entry.recasts ?? 0),
        totalSaves: acc.totalSaves + ((entry as any).saves ?? 0),
        totalRemixes: acc.totalRemixes + ((entry as any).remixes ?? 0),
      }), { totalLikes: 0, totalRecasts: 0, totalSaves: 0, totalRemixes: 0 });
      
      return NextResponse.json({ 
        username, 
        best, 
        latest, 
        entries,
        stats: {
          totalLogos: entries.length,
          ...totalStats,
        },
      });
    }

    // Fallback to legacy table if generated logos missing
    try {
      // Retrieve ALL legacy entries
      const legacy = await prisma.leaderboardEntry.findMany({
        where: { username },
        orderBy: { createdAt: 'desc' },
        // NO LIMIT
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
      
      const totalStats = legacy.reduce((acc, entry) => ({
        totalLikes: acc.totalLikes + (entry.likes ?? 0),
        totalRecasts: acc.totalRecasts + (entry.recasts ?? 0),
        totalSaves: acc.totalSaves + ((entry as any).saves ?? 0),
        totalRemixes: acc.totalRemixes + ((entry as any).remixes ?? 0),
      }), { totalLikes: 0, totalRecasts: 0, totalSaves: 0, totalRemixes: 0 });
      
      return NextResponse.json({
        username,
        best: bestLegacy,
        latest: latestLegacy,
        entries: legacy,
        stats: {
          totalLogos: legacy.length,
          ...totalStats,
        },
      });
    } catch (legacyError) {
      console.error('Profile fallback failed:', legacyError);
    }
    console.error('Profile load error:', error);
    return NextResponse.json(
      { username, best: null, latest: null, entries: [], stats: { totalLogos: 0, totalLikes: 0, totalRecasts: 0, totalSaves: 0, totalRemixes: 0 } },
      { status: 200 },
    );
  }
}
