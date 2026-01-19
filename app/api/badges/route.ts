import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const logDebug = (..._args: unknown[]) => {};

// Badge type definitions
export const BADGE_TYPES = {
  // Achievement badges
  FIRST_CAST: 'first_cast',
  NOVICE_FORGER: 'novice_forger', // 5 casts
  SKILLED_FORGER: 'skilled_forger', // 25 casts
  MASTER_FORGER: 'master_forger', // 100 casts
  LEGENDARY_FORGER: 'legendary_forger', // 500 casts
  
  // Rarity badges
  RARE_COLLECTOR: 'rare_collector', // 10 RARE
  EPIC_COLLECTOR: 'epic_collector', // 5 EPIC
  LEGENDARY_HUNTER: 'legendary_hunter', // 1 LEGENDARY
  LEGENDARY_MASTER: 'legendary_master', // 10 LEGENDARY
  
  // Challenge badges
  DAILY_CHAMPION: 'daily_champion',
  WEEK_WARRIOR: 'week_warrior', // 7 daily challenges
  STREAK_STARTER: 'streak_starter', // 3-day streak
  STREAK_MASTER: 'streak_master', // 7-day streak
  STREAK_LEGEND: 'streak_legend', // 30-day streak
  CHALLENGE_MASTER: 'challenge_master', // 50 challenges
  
  // Social badges
  POPULAR: 'popular', // 10 likes
  VIRAL: 'viral', // 50 likes
  COMMUNITY_FAVORITE: 'community_favorite', // 100 likes
  RECAST_KING: 'recast_king', // 10 recasts
  
  // Winner badges
  DAILY_WINNER: 'daily_winner',
  WEEKLY_CHAMPION: 'weekly_champion',
} as const;

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];

const BADGE_INFO: Record<BadgeType, { name: string; description: string; icon: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }> = {
  [BADGE_TYPES.FIRST_CAST]: { name: 'First Forge', description: 'Cast your first logo', icon: '🎯', rarity: 'common' },
  [BADGE_TYPES.NOVICE_FORGER]: { name: 'Novice Forger', description: 'Cast 5 logos', icon: '🔨', rarity: 'common' },
  [BADGE_TYPES.SKILLED_FORGER]: { name: 'Skilled Forger', description: 'Cast 25 logos', icon: '⚒️', rarity: 'rare' },
  [BADGE_TYPES.MASTER_FORGER]: { name: 'Master Forger', description: 'Cast 100 logos', icon: '🏆', rarity: 'epic' },
  [BADGE_TYPES.LEGENDARY_FORGER]: { name: 'Legendary Forger', description: 'Cast 500 logos', icon: '👑', rarity: 'legendary' },
  
  [BADGE_TYPES.RARE_COLLECTOR]: { name: 'Rare Collector', description: 'Cast 10 RARE logos', icon: '🔵', rarity: 'rare' },
  [BADGE_TYPES.EPIC_COLLECTOR]: { name: 'Epic Collector', description: 'Cast 5 EPIC logos', icon: '🟣', rarity: 'epic' },
  [BADGE_TYPES.LEGENDARY_HUNTER]: { name: 'Legendary Hunter', description: 'Cast 1 LEGENDARY logo', icon: '🟠', rarity: 'epic' },
  [BADGE_TYPES.LEGENDARY_MASTER]: { name: 'Legendary Master', description: 'Cast 10 LEGENDARY logos', icon: '⭐', rarity: 'legendary' },
  
  [BADGE_TYPES.DAILY_CHAMPION]: { name: 'Daily Champion', description: 'Complete daily challenge', icon: '✅', rarity: 'common' },
  [BADGE_TYPES.WEEK_WARRIOR]: { name: 'Week Warrior', description: 'Complete 7 daily challenges', icon: '📅', rarity: 'rare' },
  [BADGE_TYPES.STREAK_STARTER]: { name: 'Streak Starter', description: '3-day streak', icon: '🔥', rarity: 'common' },
  [BADGE_TYPES.STREAK_MASTER]: { name: 'Streak Master', description: '7-day streak', icon: '🔥🔥', rarity: 'rare' },
  [BADGE_TYPES.STREAK_LEGEND]: { name: 'Streak Legend', description: '30-day streak', icon: '🔥🔥🔥', rarity: 'legendary' },
  [BADGE_TYPES.CHALLENGE_MASTER]: { name: 'Challenge Master', description: 'Complete 50 challenges', icon: '🎖️', rarity: 'epic' },
  
  [BADGE_TYPES.POPULAR]: { name: 'Popular', description: 'Get 10 likes on a cast', icon: '❤️', rarity: 'common' },
  [BADGE_TYPES.VIRAL]: { name: 'Viral', description: 'Get 50 likes on a cast', icon: '💥', rarity: 'epic' },
  [BADGE_TYPES.COMMUNITY_FAVORITE]: { name: 'Community Favorite', description: 'Get 100 likes on a cast', icon: '🌟', rarity: 'legendary' },
  [BADGE_TYPES.RECAST_KING]: { name: 'Recast King', description: 'Get 10 recasts', icon: '🔁', rarity: 'rare' },
  
  [BADGE_TYPES.DAILY_WINNER]: { name: 'Daily Winner', description: 'Win daily leaderboard', icon: '🏆', rarity: 'epic' },
  [BADGE_TYPES.WEEKLY_CHAMPION]: { name: 'Weekly Champion', description: 'Win weekly leaderboard', icon: '👑', rarity: 'legendary' },
};

// Get user's badges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const badges = await prisma.badge.findMany({
      where: { userId: username.toLowerCase() },
      orderBy: { earnedAt: 'desc' },
    });

    const badgesWithInfo = badges.map(badge => ({
      ...badge,
      ...BADGE_INFO[badge.badgeType as BadgeType],
    }));

    return NextResponse.json({ badges: badgesWithInfo });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      // Table doesn't exist yet
      return NextResponse.json({ badges: [] });
    }
    console.error('Badges GET error:', error);
    return NextResponse.json({ badges: [] }, { status: 200 });
  }
}

// Award a badge (internal use)
export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId: string; badgeType: BadgeType; metadata?: any };
    
    if (!body.userId || !body.badgeType) {
      return NextResponse.json({ error: 'userId and badgeType required' }, { status: 400 });
    }

    // Check if badge already exists
    const existing = await prisma.badge.findUnique({
      where: {
        userId_badgeType: {
          userId: body.userId.toLowerCase(),
          badgeType: body.badgeType,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ badge: existing, alreadyEarned: true });
    }

    const badge = await prisma.badge.create({
      data: {
        userId: body.userId.toLowerCase(),
        badgeType: body.badgeType,
        metadata: body.metadata || null,
      },
    });

    return NextResponse.json({ badge, alreadyEarned: false });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation - badge already exists
        return NextResponse.json({ error: 'Badge already earned' }, { status: 409 });
      }
      if (error.code === 'P2021') {
        // Table doesn't exist yet
        return NextResponse.json({ error: 'Badge system not initialized' }, { status: 503 });
      }
    }
    console.error('Badges POST error:', error);
    return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 });
  }
}

// Get all badge types
export async function GET_TYPES() {
  return NextResponse.json({ 
    badgeTypes: Object.entries(BADGE_INFO).map(([type, info]) => ({
      type,
      ...info,
    }))
  });
}
