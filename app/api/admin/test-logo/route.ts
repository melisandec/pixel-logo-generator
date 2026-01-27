import { NextRequest, NextResponse } from "next/server";
import { getDemoLogoStyle } from "@/lib/demoLogoStyleManager";
import prisma from "@/lib/prisma";
import {
  generateNeonFingerprint,
  isValidNeonDemoStyle,
  enforceNeonConstraints,
} from "@/lib/demoNeonStyleVariants";

// Helper function to wrap canvas as SVG with filters applied
function createSvgWithFilters(
  canvasDataUrl: string,
  filterDefs: string,
): string {
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
      <defs>
        ${filterDefs}
      </defs>
      <!-- Apply combined filter stack with all effects (chrome, bloom, glow, texture) -->
      <image x="0" y="0" width="512" height="512" xlink:href="${canvasDataUrl}" filter="url(#demoFilterStack)" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Admin-only test logo endpoint - expects client-side generated logo
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const username = request.headers.get("x-admin-user");
    console.log("[test-logo API] Request received from user:", username);
    if (username !== "ladymel") {
      console.warn(
        "[test-logo API] Unauthorized access attempt from:",
        username,
      );
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { text, seed, mode, dataUrl, rarity, demoFingerprint, isDemoSvg } =
      body as {
        text: string;
        seed: number;
        mode: "normal" | "demo";
        dataUrl?: string;
        rarity?: string;
        demoFingerprint?: Record<string, unknown>;
        isDemoSvg?: boolean;
      };

    console.log("[test-logo API] Parsed request body:", {
      text,
      seed,
      mode,
      isDemoSvg,
      hasDemoFingerprint: !!demoFingerprint,
      dataUrlLength: dataUrl?.length || 0,
    });

    if (!text || seed === undefined || !mode) {
      console.error("[test-logo API] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: text, seed, mode" },
        { status: 400 },
      );
    }

    // For demo mode, try to get stored styling fingerprint
    let demoStyle = null;
    let filters = null;
    if (mode === "demo") {
      console.log("[test-logo API] Processing DEMO MODE for seed:", seed);
      try {
        console.log("[test-logo API] Fetching demo style from database");
        let dbStyle = await getDemoLogoStyle(seed.toString());
        console.log(
          "[test-logo API] DB style result:",
          dbStyle ? "found" : "not found",
        );

        // If no style exists, create one
        if (!dbStyle) {
          console.log("[test-logo API] Creating new demo fingerprint");
          const fingerprint = generateNeonFingerprint();
          console.log("[test-logo API] Generated fingerprint:", fingerprint);
          const validFingerprint = isValidNeonDemoStyle(fingerprint)
            ? fingerprint
            : enforceNeonConstraints(fingerprint);
          console.log(
            "[test-logo API] Validated fingerprint:",
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
          console.log(
            "[test-logo API] Created new demo style in DB:",
            dbStyle?.id,
          );
        }

        if (dbStyle) {
          console.log("[test-logo API] Using demo style:", dbStyle);
          demoStyle = dbStyle;
          // Generate SVG filter defs from fingerprint
          try {
            console.log(
              "[test-logo API] Generating filter defs from fingerprint",
            );
            const { generateFilterDefsFromFingerprint } =
              await import("@/lib/demoStyleVariants");
            // Cast to StyleFingerprint - use only the styling fields
            const fingerprint = {
              palette: dbStyle.palette as any,
              gradient: dbStyle.gradient as any,
              glow: dbStyle.glow as any,
              chrome: dbStyle.chrome as any,
              bloom: dbStyle.bloom as any,
              texture: dbStyle.texture as any,
              lighting: dbStyle.lighting as any,
            };
            filters = generateFilterDefsFromFingerprint(fingerprint);
            console.log(
              "[test-logo API] Filters generated, length:",
              filters?.length || 0,
            );
          } catch (filterError) {
            console.error(
              "[test-logo API] Error generating filters:",
              filterError,
            );
          }
        }
      } catch (error) {
        console.error("[test-logo API] Error in demo mode processing:", error);
      }
    } else {
      console.log("[test-logo API] Processing NORMAL MODE");
    }

    return NextResponse.json({
      success: true,
      result: {
        seed,
        text,
        dataUrl: dataUrl || null,
        rarity: rarity || "LEGENDARY", // Demo logos marked as special
        mode,
        // For demo SVG, data is already styled. For normal mode, wrap in SVG with filters
        styledDataUrl:
          mode === "demo" && isDemoSvg
            ? dataUrl // Already a complete styled SVG
            : mode === "demo" && dataUrl && filters
              ? createSvgWithFilters(dataUrl, filters)
              : dataUrl,
      },
      demoStyle,
      filters,
      debugInfo: {
        mode,
        seedUsed: seed,
        rarity: rarity || "LEGENDARY",
        hasDemoStyle: !!demoStyle,
        hasFilters: !!filters,
        isDemoSvg,
        receivedDataUrlLength: dataUrl?.length || 0,
      },
    });
  } catch (error) {
    console.error("[test-logo API] Unhandled error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate test logo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
