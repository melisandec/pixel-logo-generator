import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  imageUrl: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  createdAt: number;
  castUrl?: string;
};

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get('date');
    const { start, end } = getDateRange(dateKey);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 25,
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LeaderboardEntry>;

    if (!body || !body.id || !body.text || !body.username) {
      return NextResponse.json({ error: 'Invalid entry payload.' }, { status: 400 });
    }

    const entry: LeaderboardEntry = {
      id: body.id,
      text: body.text,
      seed: body.seed ?? 0,
      imageUrl: body.imageUrl ?? '',
      username: body.username,
      displayName: body.displayName ?? body.username,
      pfpUrl: body.pfpUrl ?? '',
      likes: body.likes ?? 0,
      createdAt: body.createdAt ?? Date.now(),
      castUrl: body.castUrl,
    };

    await prisma.leaderboardEntry.upsert({
      where: { id: entry.id },
      update: {
        text: entry.text,
        seed: entry.seed,
        imageUrl: entry.imageUrl,
        username: entry.username,
        displayName: entry.displayName,
        pfpUrl: entry.pfpUrl,
        likes: entry.likes,
        createdAt: new Date(entry.createdAt),
        castUrl: entry.castUrl,
      },
      create: {
        id: entry.id,
        text: entry.text,
        seed: entry.seed,
        imageUrl: entry.imageUrl,
        username: entry.username,
        displayName: entry.displayName,
        pfpUrl: entry.pfpUrl,
        likes: entry.likes,
        createdAt: new Date(entry.createdAt),
        castUrl: entry.castUrl,
      },
    });

    const { start, end } = getDateRange(null);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 25,
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({ error: 'Failed to save leaderboard entry.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    const updatedEntry = await prisma.leaderboardEntry.update({
      where: { id: body.id },
      data: {
        likes: { increment: 1 },
      },
    });

    const { start, end } = getDateRange(null);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 25,
    });
    return NextResponse.json({ entry: updatedEntry, entries });
  } catch (error) {
    console.error('Leaderboard PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update like.' }, { status: 500 });
  }
}
