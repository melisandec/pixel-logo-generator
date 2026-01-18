import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.leaderboardEntry.findFirst();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, errorName, errorMessage }, { status: 500 });
  }
}
