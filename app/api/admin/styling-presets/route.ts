import { NextResponse } from "next/server";
import { DEMO_PRESET_CONFIG } from "@/lib/demoMode";
import { PRESETS } from "@/lib/logoGeneratorConstants";

// Get all available styling options for admin testing
export async function GET() {
  try {
    // Extract available options from constants
    const palettes = [
      "vaporTeal",
      "sunsetPink",
      "oceanBlue",
      "forestGreen",
      "electricPurple",
      "neonOrange",
    ];

    const gradients = ["none", "sunsetFade", "oceanShift", "neonPulse"];

    const glows = ["softNeon", "hardNeon", "pulseGlow", "auraGlow"];

    const chromes = ["mirrorChrome", "darkChrome", "lightChrome", "neonChrome"];

    const blooms = ["none", "light", "medium", "heavy"];

    const textures = ["none", "grain", "halftone", "scanlines"];

    const lightings = [
      "topLeft",
      "top",
      "topRight",
      "left",
      "center",
      "right",
      "bottomLeft",
      "bottom",
      "bottomRight",
    ];

    return NextResponse.json({
      success: true,
      options: {
        palettes,
        gradients,
        glows,
        chromes,
        blooms,
        textures,
        lightings,
      },
      presets: {
        normal: PRESETS[0]?.config || {},
        demo: DEMO_PRESET_CONFIG,
      },
      colorSystem: ["Vaporwave", "Neon", "Classic", "Pastel", "Cyberpunk"],
    });
  } catch (error) {
    console.error("Error fetching styling presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch styling presets" },
      { status: 500 },
    );
  }
}
