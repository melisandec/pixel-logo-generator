import prisma from '@/lib/prisma';
import { BADGE_TYPES, BadgeType } from '@/lib/badgeTypes';
import { EXTRA_BADGE_TYPES, ExtraBadgeType } from '@/lib/badgeTypes';
import { Prisma } from '@prisma/client';

type LeaderboardEntry = {
  id: string;
  username: string;
  likes: number;
  recasts: number;
  rarity?: string | null;
  createdAt: number | string | Date;
};

// Check and award badges based on user actions (server-side)
export async function checkAndAwardBadges(
  username: string,
  action: 'cast' | 'like' | 'recast',
  data: {
    isFirstCast?: boolean;
    castCount?: number;
    rarity?: string | null;
    likes?: number;
    recasts?: number;
    entry?: LeaderboardEntry;
  }
): Promise<BadgeType[]> {
  const badgesToAward: BadgeType[] = [];

  if (!username) return badgesToAward;

  try {
    // Check existing badges
    const existingBadges = await prisma.badge.findMany({
      where: { userId: username.toLowerCase() },
      select: { badgeType: true },
    }).catch(() => []);
    
    const existingBadgeTypes = new Set(existingBadges.map(b => b.badgeType));

    // First cast badge
    if (action === 'cast' && data.isFirstCast && !existingBadgeTypes.has(BADGE_TYPES.FIRST_CAST)) {
      badgesToAward.push(BADGE_TYPES.FIRST_CAST);
    }

    // Cast count badges
    if (action === 'cast' && data.castCount !== undefined) {
      if (data.castCount >= 5 && !existingBadgeTypes.has(BADGE_TYPES.NOVICE_FORGER)) {
        badgesToAward.push(BADGE_TYPES.NOVICE_FORGER);
      }
      if (data.castCount >= 25 && !existingBadgeTypes.has(BADGE_TYPES.SKILLED_FORGER)) {
        badgesToAward.push(BADGE_TYPES.SKILLED_FORGER);
      }
      if (data.castCount >= 100 && !existingBadgeTypes.has(BADGE_TYPES.MASTER_FORGER)) {
        badgesToAward.push(BADGE_TYPES.MASTER_FORGER);
      }
      if (data.castCount >= 500 && !existingBadgeTypes.has(BADGE_TYPES.LEGENDARY_FORGER)) {
        badgesToAward.push(BADGE_TYPES.LEGENDARY_FORGER);
      }
    }

    // Rarity badges
    if (action === 'cast' && data.rarity) {
      const rarity = data.rarity.toUpperCase();
      
      if (rarity === 'LEGENDARY' && !existingBadgeTypes.has(BADGE_TYPES.LEGENDARY_HUNTER)) {
        badgesToAward.push(BADGE_TYPES.LEGENDARY_HUNTER);
      }
    }

    // Rarity collection: award a per-rarity "collected" badge on first occurrence
    if (action === 'cast' && data.rarity) {
      const rarity = String(data.rarity).toUpperCase();
      const perRarityMap: Record<string, ExtraBadgeType | null> = {
        COMMON: EXTRA_BADGE_TYPES.RARITY_COMMON,
        RARE: EXTRA_BADGE_TYPES.RARITY_RARE,
        EPIC: EXTRA_BADGE_TYPES.RARITY_EPIC,
        LEGENDARY: EXTRA_BADGE_TYPES.RARITY_LEGENDARY,
      };
      const perBadge = perRarityMap[rarity] ?? null;
      if (perBadge && !existingBadgeTypes.has(perBadge)) {
        badgesToAward.push(perBadge as unknown as BadgeType);
      }

      // If awarding this badge completes the set, also award RARITY_MASTER
      const projected = new Set(existingBadgeTypes);
      for (const b of badgesToAward) projected.add(b);
      const hasCommon = projected.has(EXTRA_BADGE_TYPES.RARITY_COMMON);
      const hasRare = projected.has(EXTRA_BADGE_TYPES.RARITY_RARE);
      const hasEpic = projected.has(EXTRA_BADGE_TYPES.RARITY_EPIC);
      const hasLegendary = projected.has(EXTRA_BADGE_TYPES.RARITY_LEGENDARY) || projected.has(BADGE_TYPES.LEGENDARY_HUNTER);
      if (hasCommon && hasRare && hasEpic && hasLegendary && !existingBadgeTypes.has(EXTRA_BADGE_TYPES.RARITY_MASTER)) {
        badgesToAward.push(EXTRA_BADGE_TYPES.RARITY_MASTER as unknown as BadgeType);
      }
    }

    // Social badges (when entry gets likes/recasts)
    if (action === 'like' && data.entry) {
      const totalLikes = data.entry.likes;
      if (totalLikes >= 10 && !existingBadgeTypes.has(BADGE_TYPES.POPULAR)) {
        badgesToAward.push(BADGE_TYPES.POPULAR);
      }
      if (totalLikes >= 50 && !existingBadgeTypes.has(BADGE_TYPES.VIRAL)) {
        badgesToAward.push(BADGE_TYPES.VIRAL);
      }
      if (totalLikes >= 100 && !existingBadgeTypes.has(BADGE_TYPES.COMMUNITY_FAVORITE)) {
        badgesToAward.push(BADGE_TYPES.COMMUNITY_FAVORITE);
      }
    }

    if (action === 'recast' && data.entry) {
      const totalRecasts = data.entry.recasts || 0;
      if (totalRecasts >= 10 && !existingBadgeTypes.has(BADGE_TYPES.RECAST_KING)) {
        badgesToAward.push(BADGE_TYPES.RECAST_KING);
      }
    }

    // Award badges
    for (const badgeType of badgesToAward) {
      try {
        await (prisma as any).badge.create({
          data: {
            userId: username.toLowerCase(),
            badgeType,
          },
        }).catch((error: any) => {
          // Ignore unique constraint errors (badge already exists)
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code !== 'P2002') {
            console.error(`Failed to award badge ${badgeType}:`, error);
          }
        });
      } catch (error) {
        // Table might not exist yet
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
          // Table doesn't exist, skip
          continue;
        }
      }
    }
  } catch (error) {
    // Table might not exist yet
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      // Table doesn't exist, return empty
      return [];
    }
    console.error('Badge checking error:', error);
  }

  return badgesToAward;
}

// Award daily winner badge (server-side)
export async function awardDailyWinnerBadge(username: string, rank: number): Promise<void> {
  if (rank !== 1) return; // Only award to #1 winner

  try {
    await (prisma as any).badge.create({
      data: {
        userId: username.toLowerCase(),
        badgeType: BADGE_TYPES.DAILY_WINNER,
      },
    }).catch((error: any) => {
      // Ignore if badge already exists or table doesn't exist
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' || error.code === 'P2021') {
          return; // Badge already exists or table doesn't exist
        }
      }
      console.error('Failed to award daily winner badge:', error);
    });
  } catch (error) {
    // Table might not exist yet
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return; // Table doesn't exist
    }
    console.error('Failed to award daily winner badge:', error);
  }
}
