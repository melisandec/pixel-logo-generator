import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const phase = process.env.NEXT_PHASE || "";
  if (phase === "phase-export" || phase === "phase-production-build") {
    return NextResponse.json(
      { error: "Search disabled during static export" },
      { status: 503 },
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "username"; // username, seed, text
    const limit = parseInt(searchParams.get("limit") || "20");

    let results: any[] = [];

    switch (type) {
      case "username":
        results = await prisma.generatedLogo.findMany({
          where: {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        break;

      case "seed":
        const seedNum = parseInt(query);
        if (!isNaN(seedNum)) {
          results = await prisma.generatedLogo.findMany({
            where: { seed: seedNum },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
        }
        break;

      case "text":
        results = await prisma.generatedLogo.findMany({
          where: {
            text: {
              contains: query,
              mode: "insensitive",
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid search type" },
          { status: 400 },
        );
    }

    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      // Fall back to legacy leaderboard table if the new one isn't present
      try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const type = searchParams.get("type") || "username";
        const limit = parseInt(searchParams.get("limit") || "20");

        switch (type) {
          case "username":
            const legacyUser = await prisma.leaderboardEntry.findMany({
              where: {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              orderBy: { createdAt: "desc" },
              take: limit,
            });
            return NextResponse.json({ results: legacyUser, count: legacyUser.length });
          case "seed":
            const seedNum = parseInt(query);
            if (!isNaN(seedNum)) {
              const legacySeed = await prisma.leaderboardEntry.findMany({
                where: { seed: seedNum },
                orderBy: { createdAt: "desc" },
                take: limit,
              });
              return NextResponse.json({ results: legacySeed, count: legacySeed.length });
            }
            return NextResponse.json({ results: [], count: 0 });
          case "text":
            const legacyText = await prisma.leaderboardEntry.findMany({
              where: {
                text: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              orderBy: { createdAt: "desc" },
              take: limit,
            });
            return NextResponse.json({ results: legacyText, count: legacyText.length });
          default:
            return NextResponse.json(
              { error: "Invalid search type" },
              { status: 400 },
            );
        }
      } catch (legacyError) {
        console.error("Search legacy fallback error:", legacyError);
      }
    }

    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
