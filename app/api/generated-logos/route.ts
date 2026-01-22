import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { applyScoreActions, ScoreAction } from '@/lib/scoringEngine';

type GeneratedLogo = {
  id: string;
  text: string;
  seed: number;
  rarity?: string | null;
  presetKey?: string | null;
  userId?: string | null;
  username?: string | null;
  displayName?: string | null;
  pfpUrl?: string | null;
  imageUrl?: string | null;
  thumbImageUrl?: string | null;
  mediumImageUrl?: string | null;
  logoImageUrl?: string | null;
  cardImageUrl?: string | null;
  castUrl?: string | null;
  casted?: boolean;
  likes: number;
  recasts: number;
  saves: number;
  remixes: number;
  metadata?: any | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

const clampLimit = (value: number, min = 1, max = 100) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const computeScore = (entry: GeneratedLogo) => {
  const createdAtMs = new Date(entry.createdAt).getTime();
  const hoursSince = (Date.now() - createdAtMs) / 36e5;
  const likes = entry.likes ?? 0;
  const recasts = entry.recasts ?? 0;
  const remixes = entry.remixes ?? 0;
  const saves = entry.saves ?? 0;
  return likes + recasts * 2 + remixes * 3 + saves * 0.5 - hoursSince * 0.25;
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
      "thumbImageUrl" TEXT,
      "mediumImageUrl" TEXT,
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
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GeneratedLogo_createdAt_idx"
    ON "GeneratedLogo" ("createdAt");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GeneratedLogo_username_idx"
    ON "GeneratedLogo" ("username");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GeneratedLogo_userId_idx"
    ON "GeneratedLogo" ("userId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GeneratedLogo_rarity_idx"
    ON "GeneratedLogo" ("rarity");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GeneratedLogo_presetKey_idx"
    ON "GeneratedLogo" ("presetKey");
  `);
};

const buildWhere = (params: URLSearchParams) => {
  const usernameParam = params.get('username');
  const rarity = params.get('rarity');
  const presetKey = params.get('presetKey');
  const casted = params.get('casted');
  const where: Prisma.GeneratedLogoWhereInput = {};
  if (usernameParam) {
    where.username = usernameParam.toLowerCase();
  }
  if (rarity && rarity !== 'all') {
    where.rarity = rarity.toUpperCase();
  }
  if (presetKey && presetKey !== 'all') {
    where.presetKey = presetKey;
  }
  // If casted filter is requested, include both explicit casted flag AND any logos with castUrl
  if (casted === 'true') {
    where.OR = [
      { casted: true },
      { castUrl: { not: null } }
    ];
  }
  const scope = params.get('scope');
  const dateKey = params.get('date');
  if (scope === 'daily' && dateKey) {
    const start = new Date(`${dateKey}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }
  if (scope === 'recent') {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 7);
    where.createdAt = { gte: start, lt: end };
  }
  return where;
};

const normalize = (entry: GeneratedLogo) => ({
  ...entry,
  username: entry.username?.toLowerCase?.() ?? entry.username ?? undefined,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const where = buildWhere(searchParams);
    const sort = searchParams.get('sort') ?? 'score';
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = clampLimit(limitParam);

    if (sort === 'recent') {
      // Get from both tables
      const [genEntries, legacyEntries] = await Promise.all([
        prisma.generatedLogo.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 500,
        }),
        // For legacy entries, apply casted filter if requested
        (searchParams.get('casted') === 'true')
          ? prisma.leaderboardEntry.findMany({
              where: { castUrl: { not: null } },
              orderBy: { createdAt: 'desc' },
              take: 500,
            })
          : prisma.leaderboardEntry.findMany({
              orderBy: { createdAt: 'desc' },
              take: 500,
            }),
      ]);

      // Combine and deduplicate by merging data
      const merged: any[] = [];
      const seenIds = new Set<string>();

      // Add new entries first
      for (const entry of genEntries) {
        if (!seenIds.has(entry.id)) {
          merged.push(normalize(entry));
          seenIds.add(entry.id);
        }
      }

      // Add legacy entries (if not already in merged)
      for (const entry of legacyEntries) {
        if (!seenIds.has(entry.id)) {
          const converted = {
            id: entry.id,
            text: entry.text,
            seed: entry.seed,
            imageUrl: entry.imageUrl,
            logoImageUrl: entry.logoImageUrl || entry.imageUrl,
            cardImageUrl: entry.cardImageUrl || entry.imageUrl,
            thumbImageUrl: entry.imageUrl,
            username: entry.username?.toLowerCase?.() ?? entry.username,
            displayName: entry.displayName,
            pfpUrl: entry.pfpUrl,
            likes: entry.likes,
            recasts: entry.recasts,
            rarity: entry.rarity,
            presetKey: entry.presetKey,
            createdAt: entry.createdAt,
            castUrl: entry.castUrl,
            casted: !!entry.castUrl,
            userId: null,
            remixes: 0,
            saves: 0,
            metadata: null,
            updatedAt: entry.createdAt,
          } as any;
          merged.push(normalize(converted));
          seenIds.add(entry.id);
        }
      }

      // Sort by recent and limit
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json({ entries: merged.slice(0, limit) });
    }

    if (sort === 'likes') {
      // Get from both tables
      const [genEntries, legacyEntries] = await Promise.all([
        prisma.generatedLogo.findMany({
          where,
          orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
          take: 500,
        }),
        // For legacy entries, apply casted filter if requested
        (searchParams.get('casted') === 'true')
          ? prisma.leaderboardEntry.findMany({
              where: { castUrl: { not: null } },
              orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
              take: 500,
            })
          : prisma.leaderboardEntry.findMany({
              orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
              take: 500,
            }),
      ]);

      // Combine and deduplicate
      const merged: any[] = [];
      const seenIds = new Set<string>();

      // Add new entries first
      for (const entry of genEntries) {
        if (!seenIds.has(entry.id)) {
          merged.push(normalize(entry));
          seenIds.add(entry.id);
        }
      }

      // Add legacy entries
      for (const entry of legacyEntries) {
        if (!seenIds.has(entry.id)) {
          const converted = {
            id: entry.id,
            text: entry.text,
            seed: entry.seed,
            imageUrl: entry.imageUrl,
            logoImageUrl: entry.logoImageUrl || entry.imageUrl,
            cardImageUrl: entry.cardImageUrl || entry.imageUrl,
            thumbImageUrl: entry.imageUrl,
            username: entry.username?.toLowerCase?.() ?? entry.username,
            displayName: entry.displayName,
            pfpUrl: entry.pfpUrl,
            likes: entry.likes,
            recasts: entry.recasts,
            rarity: entry.rarity,
            presetKey: entry.presetKey,
            createdAt: entry.createdAt,
            castUrl: entry.castUrl,
            casted: !!entry.castUrl,
            userId: null,
            remixes: 0,
            saves: 0,
            metadata: null,
            updatedAt: entry.createdAt,
          } as any;
          merged.push(normalize(converted));
          seenIds.add(entry.id);
        }
      }

      // Sort by likes
      merged.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      return NextResponse.json({ entries: merged.slice(0, limit) });
    }

    // Score-based (default)
    const [pool, legacyPool] = await Promise.all([
      prisma.generatedLogo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      // For legacy entries, apply casted filter if requested
      (searchParams.get('casted') === 'true')
        ? prisma.leaderboardEntry.findMany({
            where: { castUrl: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 500,
          })
        : prisma.leaderboardEntry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 500,
          }),
    ]);

    // Combine and deduplicate
    let dataPool: any[] = [];
    const seenIds = new Set<string>();

    // Add new entries
    for (const entry of pool) {
      if (!seenIds.has(entry.id)) {
        dataPool.push(entry);
        seenIds.add(entry.id);
      }
    }

    // Add legacy entries
    for (const entry of legacyPool) {
      if (!seenIds.has(entry.id)) {
        const converted = {
          id: entry.id,
          text: entry.text,
          seed: entry.seed,
          imageUrl: entry.imageUrl,
          logoImageUrl: entry.logoImageUrl || entry.imageUrl,
          cardImageUrl: entry.cardImageUrl || entry.imageUrl,
          thumbImageUrl: entry.imageUrl,
          username: entry.username?.toLowerCase?.() ?? entry.username,
          displayName: entry.displayName,
          pfpUrl: entry.pfpUrl,
          likes: entry.likes,
          recasts: entry.recasts,
          rarity: entry.rarity,
          presetKey: entry.presetKey,
          createdAt: entry.createdAt,
          castUrl: entry.castUrl,
          casted: !!entry.castUrl,
          userId: null,
          remixes: 0,
          saves: 0,
          metadata: null,
          updatedAt: entry.createdAt,
        } as any;
        dataPool.push(converted);
        seenIds.add(entry.id);
      }
    }
    
    const scored = dataPool
      .map((entry) => ({ ...entry, score: computeScore(entry) }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit);

    return NextResponse.json({ entries: scored.map(normalize) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      await ensureGeneratedLogoTable();
      return GET(request);
    }
    console.error('generated-logos GET error:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

async function handlePOST(body: Partial<GeneratedLogo>) {
  if (!body.text || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }
  const seedValue = typeof body.seed === 'number' ? body.seed : 0;
  const id = body.id || crypto.randomUUID();
  const username = body.username?.toLowerCase?.();
  const userId = body.userId ?? null;

  const payload = {
    id,
    text: body.text,
    seed: seedValue,
    rarity: body.rarity ?? null,
    presetKey: body.presetKey ?? null,
    userId,
    username: username ?? null,
    displayName: body.displayName ?? body.username ?? null,
    pfpUrl: body.pfpUrl ?? null,
    imageUrl: body.imageUrl ?? null,
    thumbImageUrl: body.thumbImageUrl ?? null,
    mediumImageUrl: body.mediumImageUrl ?? null,
    logoImageUrl: body.logoImageUrl ?? null,
    cardImageUrl: body.cardImageUrl ?? null,
    castUrl: body.castUrl ?? null,
    casted: body.casted ?? false,
    likes: body.likes ?? 0,
    recasts: body.recasts ?? 0,
    saves: body.saves ?? 0,
    remixes: body.remixes ?? 0,
    createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
    updatedAt: new Date(),
  } as Prisma.GeneratedLogoUncheckedCreateInput;

  const saved = await prisma.generatedLogo.upsert({
    where: { id },
    update: { ...payload, updatedAt: new Date() },
    create: payload,
  });

  // Skip scoring for now to avoid schema issues - will be fixed in later phase
  if (username && username !== 'testuser') {
    try {
      await applyScoreActions(username, [
        { action: 'generate', bestRarity: body.rarity ?? null },
      ], userId);
    } catch (scoreError) {
      console.warn('Warning: Failed to apply score actions:', scoreError);
      // Continue anyway - logo was saved
    }
  }

  return NextResponse.json({ entry: normalize(saved) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GeneratedLogo>;
    return handlePOST(body);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      await ensureGeneratedLogoTable();
      const body = (await request.clone().json()) as Partial<GeneratedLogo>;
      return handlePOST(body);
    }
    console.error('generated-logos POST error:', error);
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      deltaLikes?: number;
      deltaRecasts?: number;
      deltaSaves?: number;
      deltaRemixes?: number;
      actorUsername?: string;
      actorUserId?: string;
      casted?: boolean;
      text?: string;
      rarity?: string | null;
      castUrl?: string | null;
      logoImageUrl?: string | null;
      cardImageUrl?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const updateData: Prisma.GeneratedLogoUpdateInput = {};
    
    // Handle direct field updates
    if (typeof body.text === 'string') {
      updateData.text = body.text;
    }
    if (typeof body.rarity === 'string' || body.rarity === null) {
      updateData.rarity = body.rarity;
    }
    if (typeof body.castUrl === 'string' || body.castUrl === null) {
      updateData.castUrl = body.castUrl;
    }
    if (typeof body.logoImageUrl === 'string' || body.logoImageUrl === null) {
      updateData.logoImageUrl = body.logoImageUrl;
    }
    if (typeof body.cardImageUrl === 'string' || body.cardImageUrl === null) {
      updateData.cardImageUrl = body.cardImageUrl;
    }
    
    // Handle delta updates
    if (typeof body.deltaLikes === 'number' && body.deltaLikes !== 0) {
      updateData.likes = { increment: body.deltaLikes };
    }
    if (typeof body.deltaRecasts === 'number' && body.deltaRecasts !== 0) {
      updateData.recasts = { increment: body.deltaRecasts };
    }
    if (typeof body.deltaSaves === 'number' && body.deltaSaves !== 0) {
      updateData.saves = { increment: body.deltaSaves };
    }
    if (typeof body.deltaRemixes === 'number' && body.deltaRemixes !== 0) {
      updateData.remixes = { increment: body.deltaRemixes };
    }
    if (body.casted === true) {
      updateData.casted = true;
    }
    updateData.updatedAt = new Date();

    const updated = await prisma.generatedLogo.update({
      where: { id: body.id },
      data: updateData,
    });

    const actions = [] as Array<{ action: ScoreAction; multiplier?: number; bestRarity?: string | null }>;
    if (typeof body.deltaLikes === 'number' && body.deltaLikes > 0) {
      actions.push({ action: 'like_received', multiplier: body.deltaLikes });
    }
    if (typeof body.deltaSaves === 'number' && body.deltaSaves > 0) {
      actions.push({ action: 'save', multiplier: body.deltaSaves });
    }
    if (typeof body.deltaRecasts === 'number' && body.deltaRecasts > 0) {
      actions.push({ action: 'cast_share', multiplier: body.deltaRecasts });
    }
    if (typeof body.deltaRemixes === 'number' && body.deltaRemixes > 0) {
      actions.push({ action: 'remix_used', multiplier: body.deltaRemixes });
    }

    if (actions.length > 0 && updated.username) {
      await applyScoreActions(updated.username, actions, updated.userId);
    }

    if (typeof body.actorUsername === 'string') {
      const actorActions = [] as Array<{ action: ScoreAction; multiplier?: number }>;
      if (typeof body.deltaLikes === 'number') {
        actorActions.push({ action: 'like_given', multiplier: Math.abs(body.deltaLikes) });
      }
      if (typeof body.deltaSaves === 'number') {
        actorActions.push({ action: 'save', multiplier: Math.abs(body.deltaSaves) });
      }
      if (typeof body.deltaRecasts === 'number' && body.deltaRecasts > 0) {
        actorActions.push({ action: 'cast_share', multiplier: body.deltaRecasts });
      }
      if (actorActions.length > 0) {
        await applyScoreActions(body.actorUsername, actorActions, body.actorUserId);
      }
    }

    return NextResponse.json({ entry: normalize(updated) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      await ensureGeneratedLogoTable();
      return PATCH(request);
    }
    console.error('generated-logos PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    let targetId = id;
    if (!targetId) {
      try {
        const body = await request.json();
        targetId = body?.id;
      } catch (e) {
        // ignore
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.generatedLogo.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('generated-logos DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
