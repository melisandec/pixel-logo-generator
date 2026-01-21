import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
};

const byCount = (a: [string, number], b: [string, number]) => b[1] - a[1];

export async function GET(req: NextRequest) {
  const phase = process.env.NEXT_PHASE || "";
  if (phase === "phase-export" || phase === "phase-production-build") {
    return NextResponse.json(
      { error: "Analytics disabled during static export" },
      { status: 503 },
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number.parseInt(searchParams.get("days") || "7", 10);
  const lookbackDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;

  try {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - lookbackDays);

    const recent = await prisma.generatedLogo.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const wordCounts: Record<string, number> = {};
    const seedCounts: Record<string, number> = {};
    const rarityCounts: Record<string, number> = {};

    recent.forEach((entry) => {
      const words = (entry.text || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2);
      words.forEach((w) => {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      });
      seedCounts[String(entry.seed)] = (seedCounts[String(entry.seed)] || 0) + 1;
      const rarityKey = entry.rarity?.toUpperCase?.() || "UNKNOWN";
      rarityCounts[rarityKey] = (rarityCounts[rarityKey] || 0) + 1;
    });

    const mostUsedWords = Object.entries(wordCounts)
      .sort(byCount)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const popularSeeds = Object.entries(seedCounts)
      .sort(byCount)
      .slice(0, 10)
      .map(([seed, count]) => ({ seed: Number(seed), count }));

    const rarityDistribution = Object.entries(rarityCounts)
      .sort(byCount)
      .map(([rarity, count]) => ({ rarity, count }));

    const mostLikedLogos = await prisma.generatedLogo.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: [
        { likes: "desc" },
        { recasts: "desc" },
        { createdAt: "desc" },
      ],
      take: 10,
      select: {
        id: true,
        text: true,
        seed: true,
        rarity: true,
        logoImageUrl: true,
        imageUrl: true,
        cardImageUrl: true,
        likes: true,
        recasts: true,
        saves: true,
        remixes: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      mostUsedWords,
      popularSeeds,
      rarityDistribution,
      mostLikedLogos,
      windowDays: lookbackDays,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      await ensureGeneratedLogoTable();
      return GET(req);
    }
    console.error("trending analytics error:", error);
    return NextResponse.json({
      mostUsedWords: [],
      popularSeeds: [],
      rarityDistribution: [],
      mostLikedLogos: [],
      windowDays: lookbackDays,
    });
  }
}
