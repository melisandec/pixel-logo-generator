import { NextRequest, NextResponse } from "next/server";
import {
  getAndConsumeDemoSeed,
  getNextDemoSeed,
} from "@/lib/demoSeedPoolManager";

const SEEDS_EXHAUSTED_MESSAGE =
  "The 80s Forge has exhausted its unreleased seeds.";

/**
 * GET /api/demo/seed - Get the next available demo seed (preview only)
 * Returns: { seed: string } or { error: string }
 */
async function handleGetSeed(_req: NextRequest) {
  try {
    const seed = await getNextDemoSeed();

    if (!seed) {
      return NextResponse.json(
        { error: SEEDS_EXHAUSTED_MESSAGE },
        { status: 429 },
      );
    }

    return NextResponse.json({ seed });
  } catch (error) {
    console.error("Error getting demo seed:", error);
    return NextResponse.json(
      { error: "Failed to get demo seed" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/demo/seed - Get and consume a demo seed atomically
 * Uses database transaction with row-level locking: SELECT ... FOR UPDATE SKIP LOCKED
 * Body: { userId?: string }
 * Returns: { seed: string } or { error: string }
 */
async function handleConsumeSeed(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    // Atomically get and consume seed using transaction with row locking
    const seed = await getAndConsumeDemoSeed(userId);

    if (!seed) {
      return NextResponse.json(
        { error: SEEDS_EXHAUSTED_MESSAGE },
        { status: 429 },
      );
    }

    return NextResponse.json({ seed });
  } catch (error) {
    console.error("Error consuming demo seed:", error);
    return NextResponse.json(
      { error: "Failed to consume demo seed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleGetSeed(req);
}

export async function POST(req: NextRequest) {
  return handleConsumeSeed(req);
}
