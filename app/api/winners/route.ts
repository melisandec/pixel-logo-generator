import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const logDebug = (..._args: unknown[]) => {};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRange = (dateKey?: string | null) => {
  const key = dateKey || getTodayKey();
  const start = new Date(`${key}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  imageUrl: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  recasts: number;
  rarity?: string | null;
  presetKey?: string | null;
  createdAt: number | string | Date;
  castUrl?: string;
};

const computeScore = (entry: LeaderboardEntry) => {
  const createdAtMs = typeof entry.createdAt === 'number' ? entry.createdAt : new Date(entry.createdAt).getTime();
  const hoursSince = (Date.now() - createdAtMs) / 36e5;
  return entry.likes + entry.recasts * 2 - hoursSince * 0.25;
};

// Get daily winners
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');
    
    // If days parameter is provided, return past winners
    if (days) {
      const daysNum = Number.parseInt(days, 10);
      const end = new Date();
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - daysNum);

      const pastWinners = await (prisma as any).dailyWinner.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          date: 'desc',
        },
      }).catch(() => []);

      // Fetch entry details for winners
      const winnersWithDetails = await Promise.all(
        pastWinners.map(async (winner: any) => {
          const dateKey = winner.date.toISOString().split('T')[0];
          const entries: any[] = [];
          
          if (winner.winner1EntryId) {
            const entry1 = await prisma.leaderboardEntry.findUnique({
              where: { id: winner.winner1EntryId },
            }).catch(() => null);
            if (entry1) entries.push({ rank: 1, ...entry1 });
          }
          
          if (winner.winner2EntryId) {
            const entry2 = await prisma.leaderboardEntry.findUnique({
              where: { id: winner.winner2EntryId },
            }).catch(() => null);
            if (entry2) entries.push({ rank: 2, ...entry2 });
          }
          
          if (winner.winner3EntryId) {
            const entry3 = await prisma.leaderboardEntry.findUnique({
              where: { id: winner.winner3EntryId },
            }).catch(() => null);
            if (entry3) entries.push({ rank: 3, ...entry3 });
          }

          return {
            date: dateKey,
            dateObj: winner.date,
            winners: entries,
          };
        })
      );

      return NextResponse.json({ pastWinners: winnersWithDetails });
    }
    
    // Otherwise, return today's winners
    const dateKey = searchParams.get('date') || getTodayKey();
    const range = getDateRange(dateKey);

    // Get entries for the date
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      take: 200,
    });

    // Score and sort entries
    const scored = entries
      .map((entry) => ({ ...entry, score: computeScore(entry as LeaderboardEntry) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Check if winners already stored
    const dateObj = range.start;
    const existing = await (prisma as any).dailyWinner.findUnique({
      where: { date: dateObj },
    }).catch(() => null);

    const winners = scored.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      displayName: entry.displayName,
      pfpUrl: entry.pfpUrl,
      entryId: entry.id,
      entry: {
        id: entry.id,
        text: entry.text,
        imageUrl: entry.imageUrl,
        likes: entry.likes,
        recasts: entry.recasts,
        rarity: entry.rarity,
        score: entry.score,
        castUrl: entry.castUrl,
      },
    }));

    // Store winners if not already stored
    if (!existing && winners.length > 0) {
      try {
        await prisma.dailyWinner.create({
          data: {
            date: dateObj,
            winner1Id: winners[0].username,
            winner1EntryId: winners[0].entryId,
            winner2Id: winners[1]?.username || null,
            winner2EntryId: winners[1]?.entryId || null,
            winner3Id: winners[2]?.username || null,
            winner3EntryId: winners[2]?.entryId || null,
          },
        });

        // Award daily winner badge to #1
        try {
          const { awardDailyWinnerBadge } = await import('@/lib/badgeTracker');
          await awardDailyWinnerBadge(winners[0].username, 1);
        } catch (badgeError) {
          // Badge system might not be initialized yet
          console.log('Badge award skipped:', badgeError);
        }
      } catch (error) {
        // Ignore if already exists or table doesn't exist
        console.log('Could not store daily winner:', error);
      }
    }

    return NextResponse.json({ 
      date: dateKey,
      winners: winners.filter(w => w.username),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      // Table doesn't exist yet
      return NextResponse.json({ winners: [], date: getTodayKey() });
    }
    console.error('Winners GET error:', error);
    return NextResponse.json({ winners: [], date: getTodayKey() }, { status: 200 });
  }
}

