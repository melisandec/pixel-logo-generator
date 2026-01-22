import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, preferences } = body;

    if (!userId && !username) {
      return NextResponse.json(
        { error: "User ID or username is required" },
        { status: 400 },
      );
    }

    const prefs = await prisma.userPreferences.upsert({
      where: {
        userId: userId || `temp_${username}`,
      },
      update: {
        ...preferences,
        username: username || preferences.username,
      },
      create: {
        userId: userId || `temp_${username}`,
        username: username || "anonymous",
        uiMode: preferences?.uiMode || "simple",
        onboardingDone: preferences?.onboardingDone || false,
        soundEnabled: preferences?.soundEnabled ?? true,
      },
    });

    return NextResponse.json({ success: true, preferences: prefs });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (!userId && !username) {
      return NextResponse.json(
        { error: "User ID or username is required" },
        { status: 400 },
      );
    }

    const prefs = await prisma.userPreferences.findFirst({
      where: {
        OR: [
          { userId: userId || undefined },
          { username: username || undefined },
        ],
      },
    });

    return NextResponse.json({ preferences: prefs });
  } catch (error) {
    console.error("Preferences fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}
