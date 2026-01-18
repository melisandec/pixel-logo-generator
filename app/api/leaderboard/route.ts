import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

const logDebug = () => {};

const ensureLeaderboardTable = async () => {
  // #region agent log
  logDebug('H5', 'ensure table start', {});
  // #endregion agent log
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
      "id" TEXT PRIMARY KEY,
      "text" TEXT NOT NULL,
      "seed" INTEGER NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "displayName" TEXT NOT NULL,
      "pfpUrl" TEXT NOT NULL,
      "likes" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "castUrl" TEXT
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "LeaderboardEntry_createdAt_idx"
    ON "LeaderboardEntry" ("createdAt");
  `);
  // #region agent log
  logDebug('H5', 'ensure table done', {});
  // #endregion agent log
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
    // #region agent log
    logDebug('H1', 'GET start', {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(':')[0] ?? 'missing',
    });
    // #endregion agent log
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
    // #region agent log
    logDebug('H2', 'GET success', { count: entries.length });
    // #endregion agent log
    return NextResponse.json({ entries });
  } catch (error) {
    // #region agent log
    logDebug('H2', 'GET error', {
      errorName: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      // #region agent log
      logDebug('H5', 'GET missing table detected', { code: error.code });
      // #endregion agent log
      await ensureLeaderboardTable();
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
      // #region agent log
      logDebug('H5', 'GET retry success', { count: entries.length });
      // #endregion agent log
      return NextResponse.json({ entries });
    }
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  let entry: LeaderboardEntry | null = null;
  let body: Partial<LeaderboardEntry> | null = null;
  try {
    // #region agent log
    logDebug('H1', 'POST start', {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(':')[0] ?? 'missing',
    });
    // #endregion agent log
    body = (await request.json()) as Partial<LeaderboardEntry>;

    if (!body || !body.id || !body.text || !body.username) {
      // #region agent log
      logDebug('H4', 'POST invalid payload', {
        hasId: Boolean(body?.id),
        hasText: Boolean(body?.text),
        hasUsername: Boolean(body?.username),
      });
      // #endregion agent log
      return NextResponse.json({ error: 'Invalid entry payload.' }, { status: 400 });
    }

    entry = {
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
    // #region agent log
    logDebug('H3', 'POST upsert success', { id: entry.id });
    // #endregion agent log

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
    // #region agent log
    logDebug('H2', 'POST fetch success', { count: entries.length });
    // #endregion agent log
    return NextResponse.json({ entries });
  } catch (error) {
    // #region agent log
    logDebug('H2', 'POST error', {
      errorName: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021' && entry) {
      // #region agent log
      logDebug('H5', 'POST missing table detected', { code: error.code });
      // #endregion agent log
      await ensureLeaderboardTable();
      try {
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
        // #region agent log
        logDebug('H5', 'POST retry success', { count: entries.length });
        // #endregion agent log
        return NextResponse.json({ entries });
      } catch (retryError) {
        // #region agent log
        logDebug('H5', 'POST retry error', {
          errorName: retryError instanceof Error ? retryError.name : 'unknown',
          errorMessage: retryError instanceof Error ? retryError.message : String(retryError),
        });
        // #endregion agent log
      }
    }
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({ error: 'Failed to save leaderboard entry.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: { id?: string } | null = null;
  try {
    // #region agent log
    logDebug('H1', 'PATCH start', {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(':')[0] ?? 'missing',
    });
    // #endregion agent log
    body = (await request.json()) as { id?: string };

    if (!body?.id) {
      // #region agent log
      logDebug('H4', 'PATCH invalid payload', { hasId: false });
      // #endregion agent log
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    const updatedEntry = await prisma.leaderboardEntry.update({
      where: { id: body.id },
      data: {
        likes: { increment: 1 },
      },
    });
    // #region agent log
    logDebug('H3', 'PATCH update success', { id: updatedEntry.id, likes: updatedEntry.likes });
    // #endregion agent log

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
    // #region agent log
    logDebug('H2', 'PATCH fetch success', { count: entries.length });
    // #endregion agent log
    return NextResponse.json({ entry: updatedEntry, entries });
  } catch (error) {
    // #region agent log
    logDebug('H2', 'PATCH error', {
      errorName: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021' && body?.id) {
      // #region agent log
      logDebug('H5', 'PATCH missing table detected', { code: error.code });
      // #endregion agent log
      await ensureLeaderboardTable();
      try {
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
        // #region agent log
        logDebug('H5', 'PATCH retry success', { id: updatedEntry.id, count: entries.length });
        // #endregion agent log
        return NextResponse.json({ entry: updatedEntry, entries });
      } catch (retryError) {
        // #region agent log
        logDebug('H5', 'PATCH retry error', {
          errorName: retryError instanceof Error ? retryError.name : 'unknown',
          errorMessage: retryError instanceof Error ? retryError.message : String(retryError),
        });
        // #endregion agent log
      }
    }
    console.error('Leaderboard PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update like.' }, { status: 500 });
  }
}
