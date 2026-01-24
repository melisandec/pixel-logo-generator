import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing entry ID" },
        { status: 400 },
      );
    }

    // Try GeneratedLogo first, then LeaderboardEntry
    let updated: any = null;

    try {
      updated = await prisma.generatedLogo.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        // Not in GeneratedLogo, try LeaderboardEntry
        try {
          updated = await prisma.leaderboardEntry.update({
            where: { id },
            data: {
              views: {
                increment: 1,
              },
            },
          });
        } catch (leError: any) {
          if (leError.code === "P2025") {
            return NextResponse.json(
              { error: "Entry not found" },
              { status: 404 },
            );
          }
          throw leError;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      { success: true, views: updated.views },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating view count:", error);
    return NextResponse.json(
      { error: "Failed to update view count" },
      { status: 500 },
    );
  }
}
