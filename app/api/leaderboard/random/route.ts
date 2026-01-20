import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // Get a random entry from the database
    const count = await prisma.leaderboardEntry.count();

    if (count === 0) {
      return NextResponse.json({ error: "No entries found" }, { status: 404 });
    }

    const randomSkip = Math.floor(Math.random() * count);

    const entry = await prisma.leaderboardEntry.findMany({
      take: 1,
      skip: randomSkip,
      orderBy: { createdAt: "desc" },
    });

    if (!entry || entry.length === 0) {
      return NextResponse.json({ error: "No entry found" }, { status: 404 });
    }

    return NextResponse.json({ entry: entry[0] });
  } catch (error) {
    console.error("Random entry fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random entry" },
      { status: 500 },
    );
  }
}
