import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, userId, username, metadata } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 },
      );
    }

    const event = await prisma.analytics.create({
      data: {
        eventType,
        userId,
        username,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const days = parseInt(searchParams.get("days") || "7");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await prisma.analytics.findMany({
      where: {
        eventType: eventType || undefined,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Aggregate stats
    const stats: Record<string, any> = {
      total: events.length,
      byType: {} as Record<string, number>,
      topSeeds: {} as Record<number, number>,
      topWords: {} as Record<string, number>,
      topRarities: {} as Record<string, number>,
    };

    events.forEach((event) => {
      // Count by type
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;

      // Aggregate metadata
      if (event.metadata && typeof event.metadata === "object") {
        const meta = event.metadata as any;

        if (meta.seed) {
          stats.topSeeds[meta.seed] = (stats.topSeeds[meta.seed] || 0) + 1;
        }
        if (meta.text) {
          stats.topWords[meta.text] = (stats.topWords[meta.text] || 0) + 1;
        }
        if (meta.rarity) {
          stats.topRarities[meta.rarity] =
            (stats.topRarities[meta.rarity] || 0) + 1;
        }
      }
    });

    // Sort and limit top items
    stats.topSeeds = Object.fromEntries(
      Object.entries(stats.topSeeds)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10),
    );
    stats.topWords = Object.fromEntries(
      Object.entries(stats.topWords)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 20),
    );

    return NextResponse.json({ stats, events: events.slice(0, 100) });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
