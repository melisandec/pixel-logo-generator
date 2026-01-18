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
    orderBy: [
      { likes: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 25,
  });

  const best = entries[0] ?? null;
  return NextResponse.json({ username, best, entries });
}
