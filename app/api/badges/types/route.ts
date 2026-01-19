import { NextResponse } from 'next/server';
import { BADGE_INFO } from '@/lib/badgeTypes';

export async function GET() {
  return NextResponse.json({ 
    badgeTypes: Object.entries(BADGE_INFO).map(([type, info]) => ({
      type,
      ...info,
    }))
  });
}
