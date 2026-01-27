import { NextRequest, NextResponse } from "next/server";
import { getDemoSeedPoolStats } from "@/lib/demoSeedPoolManager";

/**
 * GET /api/demo/seed/stats - Get demo seed pool statistics
 * Returns: { total, used, available, percentageUsed }
 */
export async function GET(_req: NextRequest) {
  try {
    const stats = await getDemoSeedPoolStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting demo seed pool stats:", error);
    return NextResponse.json(
      { error: "Failed to get seed pool stats" },
      { status: 500 },
    );
  }
}
