/**
 * API Route: GET /api/demo-logo-style/[seed]
 *
 * Retrieves the stored demo logo style fingerprint for a given seed.
 * Returns the style data used to render demo-specific SVG filters.
 *
 * Only accessible in demo mode and for demo seeds (100_000_000+).
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { IS_DEMO_MODE, DEMO_SEED_BASE } from "@/lib/demoMode";

/**
 * GET /api/demo-logo-style/[seed]
 *
 * @param seed - The logo seed to look up
 * @returns DemoLogoStyle fingerprint or 404 if not found
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { seed: string };
  },
): Promise<NextResponse> {
  try {
    // Validate demo mode is enabled
    if (!IS_DEMO_MODE) {
      return NextResponse.json(
        { error: "Demo mode is not enabled" },
        { status: 403 },
      );
    }

    const seedString = params.seed;
    const seedNumber = parseInt(seedString, 10);

    // Validate seed is in demo range
    if (isNaN(seedNumber) || seedNumber < DEMO_SEED_BASE) {
      return NextResponse.json(
        { error: "Invalid or non-demo seed" },
        { status: 400 },
      );
    }

    // Retrieve style from database
    const demoStyle = await prisma.demoLogoStyle.findUnique({
      where: { seed: seedString },
      select: {
        palette: true,
        gradient: true,
        glow: true,
        chrome: true,
        bloom: true,
        texture: true,
        lighting: true,
      },
    });

    // Return 404 if not found
    if (!demoStyle) {
      return NextResponse.json(
        { error: "Demo style not found for this seed" },
        { status: 404 },
      );
    }

    // Return style fingerprint
    return NextResponse.json(demoStyle, {
      headers: {
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error retrieving demo logo style:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
