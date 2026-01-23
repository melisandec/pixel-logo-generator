import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface BlobAuditEntry {
  id: string;
  type: "logo" | "card";
  url: string;
  entryId: string;
  entryText: string;
  seed: number;
  username: string | null;
  createdAt: Date;
}

interface BlobAuditStats {
  totalBlobs: number;
  uniqueLogos: number;
  uniqueCards: number;
  totalEntries: number;
  entriesWithBothImages: number;
  entriesWithOnlyLogo: number;
  entriesWithOnlyCard: number;
  orphanedLogos: number;
  orphanedCards: number;
}

interface DailyBreakdown {
  date: string;
  logoCount: number;
  cardCount: number;
  totalCount: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get all entries from database
    const entries = await prisma.generatedLogo.findMany({
      select: {
        id: true,
        text: true,
        seed: true,
        username: true,
        logoImageUrl: true,
        cardImageUrl: true,
        createdAt: true,
        updatedAt: true,
        imageUrl: true,
      },
    });

    const blobEntries: BlobAuditEntry[] = [];
    const seenUrls = new Set<string>();
    const dailyBreakdown = new Map<string, { logos: number; cards: number }>();

    // Extract blob references from all entries
    entries.forEach((entry) => {
      const logoUrl = entry.logoImageUrl || entry.imageUrl;
      const cardUrl = entry.cardImageUrl;

      // Track logo
      if (logoUrl && !seenUrls.has(logoUrl)) {
        seenUrls.add(logoUrl);
        blobEntries.push({
          id: `${entry.id}-logo`,
          type: "logo",
          url: logoUrl,
          entryId: entry.id,
          entryText: entry.text,
          seed: entry.seed,
          username: entry.username,
          createdAt: entry.createdAt,
        });

        // Track daily breakdown
        const date = entry.createdAt
          .toISOString()
          .split("T")[0];
        if (!dailyBreakdown.has(date)) {
          dailyBreakdown.set(date, { logos: 0, cards: 0 });
        }
        dailyBreakdown.get(date)!.logos++;
      }

      // Track card
      if (cardUrl && cardUrl !== logoUrl && !seenUrls.has(cardUrl)) {
        seenUrls.add(cardUrl);
        blobEntries.push({
          id: `${entry.id}-card`,
          type: "card",
          url: cardUrl,
          entryId: entry.id,
          entryText: entry.text,
          seed: entry.seed,
          username: entry.username,
          createdAt: entry.createdAt,
        });

        // Track daily breakdown
        const date = entry.createdAt
          .toISOString()
          .split("T")[0];
        if (!dailyBreakdown.has(date)) {
          dailyBreakdown.set(date, { logos: 0, cards: 0 });
        }
        dailyBreakdown.get(date)!.cards++;
      }
    });

    // Calculate statistics
    const uniqueLogos = blobEntries.filter((e) => e.type === "logo").length;
    const uniqueCards = blobEntries.filter((e) => e.type === "card").length;

    const entriesWithBothImages = entries.filter(
      (e) => e.logoImageUrl && e.cardImageUrl && e.cardImageUrl !== e.logoImageUrl
    ).length;
    const entriesWithOnlyLogo = entries.filter(
      (e) =>
        e.logoImageUrl &&
        (!e.cardImageUrl || e.cardImageUrl === e.logoImageUrl)
    ).length;
    const entriesWithOnlyCard = entries.filter(
      (e) => e.cardImageUrl && !e.logoImageUrl
    ).length;

    const stats: BlobAuditStats = {
      totalBlobs: blobEntries.length,
      uniqueLogos,
      uniqueCards,
      totalEntries: entries.length,
      entriesWithBothImages,
      entriesWithOnlyLogo,
      entriesWithOnlyCard,
      orphanedLogos: 0, // We can't detect orphans without direct blob access
      orphanedCards: 0,
    };

    // Sort entries by creation date (newest first)
    blobEntries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Convert daily breakdown to array and sort by date (newest first)
    const dailyBreakdownArray = Array.from(dailyBreakdown.entries())
      .map(([date, { logos, cards }]) => ({
        date,
        logoCount: logos,
        cardCount: cards,
        totalCount: logos + cards,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      stats,
      dailyBreakdown: dailyBreakdownArray,
      entries: blobEntries.slice(0, 50), // Return most recent 50
      totalRecords: blobEntries.length,
    });
  } catch (error) {
    console.error("[Blob Audit] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to audit blob storage",
      },
      { status: 500 }
    );
  }
}
