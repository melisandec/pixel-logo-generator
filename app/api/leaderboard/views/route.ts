import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/leaderboard/views
 * Increment view count for a logo entry
 */
export async function POST(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
    }

    // Increment views for GeneratedLogo if it exists
    const updated = await prisma.generatedLogo.updateMany({
      where: { id: entryId },
      data: { views: { increment: 1 } },
    });

    if (updated.count === 0) {
      // Try LeaderboardEntry as fallback
      const leaderboardUpdated = await prisma.leaderboardEntry.updateMany({
        where: { id: entryId },
        data: { views: { increment: 1 } },
      });

      if (leaderboardUpdated.count === 0) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("[VIEWS] Error incrementing views:", error);
    return NextResponse.json(
      { error: "Failed to increment views" },
      { status: 500 },
    );
  }
}
