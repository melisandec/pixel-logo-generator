import { NextRequest, NextResponse } from "next/server";
import { getDemoLogoStyle } from "@/lib/demoLogoStyleManager";
import prisma from "@/lib/prisma";
import {
  generateNeonFingerprint,
  isValidNeonDemoStyle,
  enforceNeonConstraints,
} from "@/lib/demoNeonStyleVariants";

// Admin-only endpoint to get or create demo style fingerprint
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const username = request.headers.get("x-admin-user");
    console.log("[demo-fingerprint API] Request from user:", username);
    if (username !== "ladymel") {
      console.warn("[demo-fingerprint API] Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { seed } = body as { seed: number };
    console.log("[demo-fingerprint API] Requested seed:", seed);

    if (seed === undefined) {
      console.error("[demo-fingerprint API] Missing seed parameter");
      return NextResponse.json(
        { error: "Missing required field: seed" },
        { status: 400 },
      );
    }

    console.log("[demo-fingerprint API] Fetching style for seed:", seed);
    let dbStyle = await getDemoLogoStyle(seed.toString());
    console.log(
      "[demo-fingerprint API] DB lookup result:",
      dbStyle ? "found" : "not found",
    );

    // If no style exists, create one
    if (!dbStyle) {
      console.log("[demo-fingerprint API] Creating new fingerprint");
      const fingerprint = generateNeonFingerprint();
      console.log("[demo-fingerprint API] Generated fingerprint:", fingerprint);
      const validFingerprint = isValidNeonDemoStyle(fingerprint)
        ? fingerprint
        : enforceNeonConstraints(fingerprint);
      console.log(
        "[demo-fingerprint API] Validated fingerprint:",
        validFingerprint,
      );

      dbStyle = await prisma.demoLogoStyle.create({
        data: {
          seed: seed.toString(),
          palette: validFingerprint.palette,
          gradient: validFingerprint.gradient,
          glow: validFingerprint.glow,
          chrome: validFingerprint.chrome,
          bloom: validFingerprint.bloom,
          texture: validFingerprint.texture,
          lighting: validFingerprint.lighting,
        },
      });
      console.log("[demo-fingerprint API] Saved new style to DB");
    }

    const response = {
      success: true,
      fingerprint: {
        palette: dbStyle.palette,
        gradient: dbStyle.gradient,
        glow: dbStyle.glow,
        chrome: dbStyle.chrome,
        bloom: dbStyle.bloom,
        texture: dbStyle.texture,
        lighting: dbStyle.lighting,
      },
    };
    console.log(
      "[demo-fingerprint API] Returning fingerprint:",
      response.fingerprint,
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("[demo-fingerprint API] Unhandled error:", error);
    return NextResponse.json(
      {
        error: "Failed to get demo fingerprint",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
