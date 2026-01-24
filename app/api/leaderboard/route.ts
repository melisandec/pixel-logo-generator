import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  views?: number;
  saves?: number;
  remixes?: number;
  rarity?: string | null;
  presetKey?: string | null;
  createdAt: number | string | Date;
  castUrl?: string;
};

const logDebug = (..._args: unknown[]) => {};

const ensureLeaderboardTable = async () => {
  // #region agent log
  logDebug("H5", "ensure table start", {});
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
      "recasts" INTEGER NOT NULL DEFAULT 0,
      "views" INTEGER NOT NULL DEFAULT 0,
      "rarity" TEXT,
      "presetKey" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "castUrl" TEXT
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "LeaderboardEntry_createdAt_idx"
    ON "LeaderboardEntry" ("createdAt");
  `);
  // #region agent log
  logDebug("H5", "ensure table done", {});
  // #endregion agent log
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRange = (dateKey?: string | null) => {
  const key = dateKey || getTodayKey();
  const start = new Date(`${key}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const getRecentRange = (days: number) => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);
  return { start, end };
};

const computeScore = (entry: LeaderboardEntry) => {
  const createdAtMs =
    typeof entry.createdAt === "number"
      ? entry.createdAt
      : new Date(entry.createdAt).getTime();
  const hoursSince = (Date.now() - createdAtMs) / 36e5;
  const saves = (entry as any).saves ?? 0;
  const remixes = (entry as any).remixes ?? 0;
  return (
    entry.likes +
    entry.recasts * 2 +
    remixes * 3 +
    saves * 0.5 -
    hoursSince * 0.25
  );
};

export async function GET(request: Request) {
  try {
    // #region agent log
    logDebug("H1", "GET start", {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(":")[0] ?? "missing",
    });
    // #endregion agent log
    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get("date");
    const scope = searchParams.get("scope");
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 200)
      : 50;

    // Prefer new GeneratedLogo entries for leaderboard
    try {
      const range =
        scope === "daily" && dateKey
          ? getDateRange(dateKey)
          : getRecentRange(7);
      const where = {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      } satisfies Prisma.GeneratedLogoWhereInput;

      const generated = await prisma.generatedLogo.findMany({
        where,
        take: 200,
        orderBy: { createdAt: "desc" },
      });
      if (generated.length > 0) {
        const mapped = generated.map((entry) => ({
          id: entry.id,
          text: entry.text,
          seed: entry.seed,
          imageUrl:
            entry.logoImageUrl || entry.cardImageUrl || entry.imageUrl || "",
          logoImageUrl: entry.logoImageUrl,
          cardImageUrl: entry.cardImageUrl,
          username: entry.username ?? "",
          displayName: entry.displayName ?? entry.username ?? "",
          pfpUrl: entry.pfpUrl ?? "",
          likes: entry.likes,
          recasts: entry.recasts,
          rarity: entry.rarity,
          presetKey: entry.presetKey,
          createdAt: entry.createdAt,
          castUrl: entry.castUrl ?? undefined,
          saves: entry.saves ?? 0,
          remixes: entry.remixes ?? 0,
        }));
        const sortedGenerated = mapped
          .map((entry) => ({
            ...entry,
            score: computeScore(entry as LeaderboardEntry),
          }))
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .slice(0, limit);
        return NextResponse.json({ entries: sortedGenerated });
      }
    } catch (generatedError) {
      logDebug("H1", "GeneratedLogo fallback to legacy", {
        error: (generatedError as Error)?.message,
      });
    }
    if (scope === "recent") {
      const range = getRecentRange(7);
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          createdAt: {
            gte: range.start,
            lt: range.end,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });
      return NextResponse.json({ entries });
    }
    const range =
      scope === "daily" && dateKey ? getDateRange(dateKey) : getRecentRange(7);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      take: 200,
    });
    const sorted = entries
      .map((entry) => ({
        ...entry,
        score: computeScore(entry as LeaderboardEntry),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
    // #region agent log
    logDebug("H2", "GET success", { count: sorted.length });
    // #endregion agent log
    return NextResponse.json({ entries: sorted });
  } catch (error) {
    // #region agent log
    logDebug("H2", "GET error", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      // #region agent log
      logDebug("H5", "GET missing table detected", { code: error.code });
      // #endregion agent log
      await ensureLeaderboardTable();
      const { searchParams } = new URL(request.url);
      const dateKey = searchParams.get("date");
      const scope = searchParams.get("scope");
      const limitParam = Number.parseInt(searchParams.get("limit") ?? "50", 10);
      const limit = Number.isFinite(limitParam)
        ? Math.min(Math.max(limitParam, 1), 200)
        : 50;
      if (scope === "recent") {
        const range = getRecentRange(7);
        const entries = await prisma.leaderboardEntry.findMany({
          where: {
            createdAt: {
              gte: range.start,
              lt: range.end,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
        });
        return NextResponse.json({ entries });
      }
      const range =
        scope === "daily" && dateKey
          ? getDateRange(dateKey)
          : getRecentRange(7);
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          createdAt: {
            gte: range.start,
            lt: range.end,
          },
        },
        take: 200,
      });
      const sorted = entries
        .map((entry) => ({
          ...entry,
          score: computeScore(entry as LeaderboardEntry),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);
      // #region agent log
      logDebug("H5", "GET retry success", { count: sorted.length });
      // #endregion agent log
      return NextResponse.json({ entries: sorted });
    }
    console.error("Leaderboard GET error:", error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  let entry: LeaderboardEntry | null = null;
  let body: Partial<LeaderboardEntry> | null = null;
  try {
    // #region agent log
    logDebug("H1", "POST start", {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(":")[0] ?? "missing",
    });
    // #endregion agent log
    body = (await request.json()) as Partial<LeaderboardEntry>;

    if (!body || !body.id || !body.text || !body.username) {
      // #region agent log
      logDebug("H4", "POST invalid payload", {
        hasId: Boolean(body?.id),
        hasText: Boolean(body?.text),
        hasUsername: Boolean(body?.username),
      });
      // #endregion agent log
      return NextResponse.json(
        { error: "Invalid entry payload." },
        { status: 400 },
      );
    }

    entry = {
      id: body.id,
      text: body.text,
      seed: body.seed ?? 0,
      imageUrl: body.imageUrl ?? "",
      username: body.username,
      displayName: body.displayName ?? body.username,
      pfpUrl: body.pfpUrl ?? "",
      likes: body.likes ?? 0,
      recasts: body.recasts ?? 0,
      rarity: body.rarity ?? null,
      presetKey: body.presetKey ?? null,
      createdAt: body.createdAt ?? Date.now(),
      castUrl: body.castUrl,
    };

    const isNewEntry = !(await prisma.leaderboardEntry.findUnique({
      where: { id: entry.id },
    }));

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
        recasts: entry.recasts,
        rarity: entry.rarity,
        presetKey: entry.presetKey,
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
        recasts: entry.recasts,
        rarity: entry.rarity,
        presetKey: entry.presetKey,
        createdAt: new Date(entry.createdAt),
        castUrl: entry.castUrl,
      },
    });
    // #region agent log
    logDebug("H3", "POST upsert success", { id: entry.id });
    // #endregion agent log

    // Check and award badges for new casts
    if (isNewEntry) {
      try {
        const { checkAndAwardBadges } = await import("@/lib/badgeTracker");

        // Check if this is user's first cast
        const userCastCount = await prisma.leaderboardEntry.count({
          where: { username: entry.username },
        });

        await checkAndAwardBadges(entry.username, "cast", {
          isFirstCast: userCastCount === 1,
          castCount: userCastCount,
          rarity: entry.rarity,
        });
      } catch (badgeError) {
        // Badge system might not be initialized yet, continue
        console.log("Badge check skipped:", badgeError);
      }
    }

    const range = getRecentRange(7);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      take: 200,
    });
    const sorted = entries
      .map((entry) => ({
        ...entry,
        score: computeScore(entry as LeaderboardEntry),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
    // #region agent log
    logDebug("H2", "POST fetch success", { count: sorted.length });
    // #endregion agent log
    return NextResponse.json({ entries: sorted });
  } catch (error) {
    // #region agent log
    logDebug("H2", "POST error", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021" &&
      entry
    ) {
      // #region agent log
      logDebug("H5", "POST missing table detected", { code: error.code });
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
            recasts: entry.recasts,
            rarity: entry.rarity,
            presetKey: entry.presetKey,
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
            recasts: entry.recasts,
            rarity: entry.rarity,
            presetKey: entry.presetKey,
            createdAt: new Date(entry.createdAt),
            castUrl: entry.castUrl,
          },
        });
        const range = getRecentRange(7);
        const entries = await prisma.leaderboardEntry.findMany({
          where: {
            createdAt: {
              gte: range.start,
              lt: range.end,
            },
          },
          take: 200,
        });
        const sorted = entries
          .map((entry) => ({
            ...entry,
            score: computeScore(entry as LeaderboardEntry),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 25);
        // #region agent log
        logDebug("H5", "POST retry success", { count: sorted.length });
        // #endregion agent log
        return NextResponse.json({ entries: sorted });
      } catch (retryError) {
        // #region agent log
        logDebug("H5", "POST retry error", {
          errorName: retryError instanceof Error ? retryError.name : "unknown",
          errorMessage:
            retryError instanceof Error
              ? retryError.message
              : String(retryError),
        });
        // #endregion agent log
      }
    }
    console.error("Leaderboard POST error:", error);
    return NextResponse.json(
      { error: "Failed to save leaderboard entry." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: { id?: string; delta?: number } | null = null;
  try {
    // #region agent log
    logDebug("H1", "PATCH start", {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL?.split(":")[0] ?? "missing",
    });
    // #endregion agent log
    body = (await request.json()) as { id?: string; delta?: number };

    if (!body?.id) {
      // #region agent log
      logDebug("H4", "PATCH invalid payload", { hasId: false });
      // #endregion agent log
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    const delta = typeof body.delta === "number" ? body.delta : 1;
    if (![1, -1].includes(delta)) {
      return NextResponse.json({ error: "Invalid delta." }, { status: 400 });
    }

    let updatedEntry = await prisma.leaderboardEntry.update({
      where: { id: body.id },
      data: {
        likes: { increment: delta },
      },
    });
    if (updatedEntry.likes < 0) {
      updatedEntry = await prisma.leaderboardEntry.update({
        where: { id: body.id },
        data: {
          likes: 0,
        },
      });
    }
    // #region agent log
    logDebug("H3", "PATCH update success", {
      id: updatedEntry.id,
      likes: updatedEntry.likes,
    });
    // #endregion agent log

    // Check for social badges when likes increase
    if (delta > 0 && updatedEntry.likes > 0) {
      try {
        const { checkAndAwardBadges } = await import("@/lib/badgeTracker");
        await checkAndAwardBadges(updatedEntry.username, "like", {
          entry: updatedEntry as LeaderboardEntry,
        });
      } catch (badgeError) {
        // Badge system might not be initialized yet, continue
        console.log("Badge check skipped:", badgeError);
      }
    }

    const range = getRecentRange(7);
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      take: 200,
    });
    const sorted = entries
      .map((entry) => ({
        ...entry,
        score: computeScore(entry as LeaderboardEntry),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
    // #region agent log
    logDebug("H2", "PATCH fetch success", { count: sorted.length });
    // #endregion agent log
    return NextResponse.json({ entry: updatedEntry, entries: sorted });
  } catch (error) {
    // #region agent log
    logDebug("H2", "PATCH error", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // #endregion agent log
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021" &&
      body?.id
    ) {
      // #region agent log
      logDebug("H5", "PATCH missing table detected", { code: error.code });
      // #endregion agent log
      await ensureLeaderboardTable();
      try {
        const delta = typeof body.delta === "number" ? body.delta : 1;
        if (![1, -1].includes(delta)) {
          return NextResponse.json(
            { error: "Invalid delta." },
            { status: 400 },
          );
        }
        let updatedEntry = await prisma.leaderboardEntry.update({
          where: { id: body.id },
          data: {
            likes: { increment: delta },
          },
        });
        if (updatedEntry.likes < 0) {
          updatedEntry = await prisma.leaderboardEntry.update({
            where: { id: body.id },
            data: {
              likes: 0,
            },
          });
        }
        const range = getRecentRange(7);
        const entries = await prisma.leaderboardEntry.findMany({
          where: {
            createdAt: {
              gte: range.start,
              lt: range.end,
            },
          },
          take: 200,
        });
        const sorted = entries
          .map((entry) => ({
            ...entry,
            score: computeScore(entry as LeaderboardEntry),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 25);
        // #region agent log
        logDebug("H5", "PATCH retry success", {
          id: updatedEntry.id,
          count: sorted.length,
        });
        // #endregion agent log
        return NextResponse.json({ entry: updatedEntry, entries: sorted });
      } catch (retryError) {
        // #region agent log
        logDebug("H5", "PATCH retry error", {
          errorName: retryError instanceof Error ? retryError.name : "unknown",
          errorMessage:
            retryError instanceof Error
              ? retryError.message
              : String(retryError),
        });
        // #endregion agent log
      }
    }
    console.error("Leaderboard PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update like." },
      { status: 500 },
    );
  }
}
