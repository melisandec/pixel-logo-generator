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

export const BADGE_INFO: Record<BadgeType, { name: string; description: string; icon: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }> = {
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

// Rarity collection / progression badges
export const EXTRA_BADGE_TYPES = {
  RARITY_COMMON: 'rarity_common',
  RARITY_RARE: 'rarity_rare',
  RARITY_EPIC: 'rarity_epic',
  RARITY_LEGENDARY: 'rarity_legendary',
  RARITY_MASTER: 'rarity_master',
} as const;

export type ExtraBadgeType = typeof EXTRA_BADGE_TYPES[keyof typeof EXTRA_BADGE_TYPES];

export const EXTRA_BADGE_INFO: Record<ExtraBadgeType, { name: string; description: string; icon: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }> = {
  [EXTRA_BADGE_TYPES.RARITY_COMMON]: { name: 'Common Collector', description: 'Collect at least one COMMON logo', icon: '✔️', rarity: 'common' },
  [EXTRA_BADGE_TYPES.RARITY_RARE]: { name: 'Rare Collector', description: 'Collect at least one RARE logo', icon: '🔵', rarity: 'rare' },
  [EXTRA_BADGE_TYPES.RARITY_EPIC]: { name: 'Epic Collector', description: 'Collect at least one EPIC logo', icon: '🟣', rarity: 'epic' },
  [EXTRA_BADGE_TYPES.RARITY_LEGENDARY]: { name: 'Legendary Collector', description: 'Collect at least one LEGENDARY logo', icon: '🟠', rarity: 'epic' },
  [EXTRA_BADGE_TYPES.RARITY_MASTER]: { name: 'Rarity Master', description: 'Collected one of each rarity', icon: '🎉', rarity: 'legendary' },
};
