import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const phase = process.env.NEXT_PHASE || "";
  if (phase === "phase-export" || phase === "phase-production-build") {
    return NextResponse.json(
      { error: "Random logo disabled during static export" },
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
    const count = await prisma.generatedLogo.count();
    if (count === 0) {
      return NextResponse.json({ error: "No entries found" }, { status: 404 });
    }

    const randomSkip = Math.floor(Math.random() * count);
    const entry = await prisma.generatedLogo.findMany({
      take: 1,
      skip: randomSkip,
      orderBy: { createdAt: "desc" },
    });

    if (!entry || entry.length === 0) {
      return NextResponse.json({ error: "No entry found" }, { status: 404 });
    }

    return NextResponse.json({ entry: entry[0] });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      // Fall back to legacy table if new one is missing
      try {
        const count = await prisma.leaderboardEntry.count();
        if (count === 0) {
          return NextResponse.json(
            { error: "No entries found" },
            { status: 404 },
          );
        }
        const randomSkip = Math.floor(Math.random() * count);
        const entry = await prisma.leaderboardEntry.findMany({
          take: 1,
          skip: randomSkip,
          orderBy: { createdAt: "desc" },
        });
        if (!entry || entry.length === 0) {
          return NextResponse.json(
            { error: "No entry found" },
            { status: 404 },
          );
        }
        return NextResponse.json({ entry: entry[0] });
      } catch (legacyError) {
        console.error("Random logo legacy fallback error:", legacyError);
      }
    }

    console.error("Random logo fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random logo" },
      { status: 500 },
    );
  }
}
