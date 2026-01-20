import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BADGE_TYPES, EXTRA_BADGE_TYPES } from "@/lib/badgeTypes";

const isDev = process.env.NODE_ENV !== "production";

export async function GET(request: Request) {
  if (!isDev)
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 },
    );
  try {
    const { searchParams } = new URL(request.url);
    const username = (searchParams.get("username") || "").toLowerCase();
    if (!username)
      return NextResponse.json({ error: "username required" }, { status: 400 });

    const entries = await prisma.leaderboardEntry
      .findMany({
        where: { username },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      .catch(() => []);

    const badges = await (prisma as any).badge
      .findMany({ where: { userId: username }, orderBy: { earnedAt: "desc" } })
      .catch(() => []);

    const rarities = Array.from(
      new Set(
        (entries || [])
          .map((e: any) => (e.rarity || "").toUpperCase())
          .filter(Boolean),
      ),
    );
    const masterUnlocked = !!badges.find(
      (b: any) => b.badgeType === EXTRA_BADGE_TYPES.RARITY_MASTER,
    );
    const extraDailyGenerates = masterUnlocked ? 1 : 0;
    const specialFrameUnlocked = masterUnlocked;
    const specialBackgroundUnlocked = masterUnlocked;

    return NextResponse.json({
      username,
      entries,
      badges,
      rarities,
      masterUnlocked,
      extraDailyGenerates,
      specialFrameUnlocked,
      specialBackgroundUnlocked,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      // Table missing — return empty
      return NextResponse.json({
        username: null,
        entries: [],
        badges: [],
        rarities: [],
        masterUnlocked: false,
        extraDailyGenerates: 0,
        specialFrameUnlocked: false,
        specialBackgroundUnlocked: false,
      });
    }
    console.error("Dev GET error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDev)
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 },
    );
  try {
    const body = (await request.json()) as {
      username?: string;
      rarity?: string;
    };
    const username = (body?.username || "").toLowerCase();
    const rarity = body?.rarity ? String(body.rarity).toUpperCase() : null;
    if (!username || !rarity)
      return NextResponse.json(
        { error: "username and rarity required" },
        { status: 400 },
      );

    // create a leaderboard entry (upsert-like) to simulate a cast
    const id = `${username}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entry = {
      id,
      text: `Dev granted ${rarity}`,
      seed: Math.floor(Math.random() * 1e9),
      imageUrl: "",
      username,
      displayName: username,
      pfpUrl: "",
      likes: 0,
      recasts: 0,
      rarity,
      presetKey: null,
      createdAt: new Date(),
      castUrl: null,
    } as any;

    // ensure leaderboard table exists and upsert
    await prisma.leaderboardEntry.upsert({
      where: { id: entry.id },
      update: { ...entry, createdAt: new Date() },
      create: { ...entry, createdAt: new Date() },
    });

    // compute cast count for user
    const userCastCount = await prisma.leaderboardEntry
      .count({ where: { username } })
      .catch(() => 1);

    // run badge logic
    try {
      const { checkAndAwardBadges } = await import("@/lib/badgeTracker");
      const awarded = await checkAndAwardBadges(username, "cast", {
        isFirstCast: userCastCount === 1,
        castCount: userCastCount,
        rarity,
      });
      return NextResponse.json({ success: true, awarded });
    } catch (badgeError) {
      console.log("Badge check skipped:", badgeError);
      return NextResponse.json({ success: true, awarded: [] });
    }
  } catch (error) {
    console.error("Dev POST error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isDev)
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 },
    );
  try {
    const body = (await request.json().catch(() => null)) as {
      username?: string;
    } | null;
    const url = new URL(request.url);
    const username = (
      (body && body.username) ||
      url.searchParams.get("username") ||
      ""
    ).toLowerCase();
    if (!username)
      return NextResponse.json({ error: "username required" }, { status: 400 });

    // clear rarity fields from leaderboard entries for this user
    await prisma.leaderboardEntry
      .updateMany({ where: { username }, data: { rarity: null } })
      .catch(() => null);

    // delete rarity badges and master badge and LEGENDARY_HUNTER
    const badgeTypesToRemove = [
      EXTRA_BADGE_TYPES.RARITY_COMMON,
      EXTRA_BADGE_TYPES.RARITY_RARE,
      EXTRA_BADGE_TYPES.RARITY_EPIC,
      EXTRA_BADGE_TYPES.RARITY_LEGENDARY,
      EXTRA_BADGE_TYPES.RARITY_MASTER,
      BADGE_TYPES.LEGENDARY_HUNTER,
    ];
    await (prisma as any).badge
      .deleteMany({
        where: { userId: username, badgeType: { in: badgeTypesToRemove } },
      })
      .catch(() => null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dev DELETE error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
