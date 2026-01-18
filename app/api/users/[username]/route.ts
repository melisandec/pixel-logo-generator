import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username.toLowerCase();
  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      username,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 25,
  });

  const best =
    entries.reduce<typeof entries[number] | null>((current, entry) => {
      if (!current) return entry;
      const currentScore = current.likes + (current.recasts ?? 0) * 2;
      const entryScore = entry.likes + (entry.recasts ?? 0) * 2;
      if (entryScore !== currentScore) {
        return entryScore > currentScore ? entry : current;
      }
      return entry.createdAt > current.createdAt ? entry : current;
    }, null) ?? null;
  const latest = entries[0] ?? null;
  return NextResponse.json({ username, best, latest, entries });
}
