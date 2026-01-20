import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  BADGE_TYPES,
  BADGE_INFO,
  BadgeType,
  EXTRA_BADGE_INFO,
} from "@/lib/badgeTypes";

const logDebug = (..._args: unknown[]) => {};

// Get user's badges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const badges = await (prisma as any).badge
      .findMany({
        where: { userId: username.toLowerCase() },
        orderBy: { earnedAt: "desc" },
      })
      .catch(() => []);

    const badgesWithInfo = badges.map((badge: any) => ({
      ...badge,
      ...(BADGE_INFO[badge.badgeType as BadgeType] ??
        EXTRA_BADGE_INFO[badge.badgeType as any] ??
        {}),
    }));

    return NextResponse.json({ badges: badgesWithInfo });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      // Table doesn't exist yet
      return NextResponse.json({ badges: [] });
    }
    console.error("Badges GET error:", error);
    return NextResponse.json({ badges: [] }, { status: 200 });
  }
}

// Award a badge (internal use)
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId: string;
      badgeType: BadgeType;
      metadata?: any;
    };

    if (!body.userId || !body.badgeType) {
      return NextResponse.json(
        { error: "userId and badgeType required" },
        { status: 400 },
      );
    }

    // Check if badge already exists
    const existing = await (prisma as any).badge
      .findUnique({
        where: {
          userId_badgeType: {
            userId: body.userId.toLowerCase(),
            badgeType: body.badgeType,
          },
        },
      })
      .catch(() => null);

    if (existing) {
      return NextResponse.json({ badge: existing, alreadyEarned: true });
    }

    const badge = await (prisma as any).badge.create({
      data: {
        userId: body.userId.toLowerCase(),
        badgeType: body.badgeType,
        metadata: body.metadata || null,
      },
    });

    return NextResponse.json({ badge, alreadyEarned: false });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint violation - badge already exists
        return NextResponse.json(
          { error: "Badge already earned" },
          { status: 409 },
        );
      }
      if (error.code === "P2021") {
        // Table doesn't exist yet
        return NextResponse.json(
          { error: "Badge system not initialized" },
          { status: 503 },
        );
      }
    }
    console.error("Badges POST error:", error);
    return NextResponse.json(
      { error: "Failed to award badge" },
      { status: 500 },
    );
  }
}
