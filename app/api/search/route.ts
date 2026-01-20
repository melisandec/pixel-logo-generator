import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "username"; // username, seed, text
    const limit = parseInt(searchParams.get("limit") || "20");

    let results: any[] = [];

    switch (type) {
      case "username":
        results = await prisma.leaderboardEntry.findMany({
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
          results = await prisma.leaderboardEntry.findMany({
            where: { seed: seedNum },
            orderBy: { createdAt: "desc" },
            take: limit,
          });
        }
        break;

      case "text":
        results = await prisma.leaderboardEntry.findMany({
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
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
