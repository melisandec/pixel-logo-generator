import { useState, useCallback } from "react";

interface Reward {
  rewardType: string;
  unlockedAt?: string;
  metadata?: Record<string, unknown>;
}

interface RewardRegistry {
  rewardType: string;
  title?: string;
  description?: string;
  threshold?: number;
  stat?: string;
}

/**
 * Manages reward and badge system state:
 * - Earned badges/rewards
 * - Badge registry and definitions
 * - Active reward animations
 * - Trending data
 */
export function useRewardTracking() {
  const [userRewards, setUserRewards] = useState<Reward[]>([]);
  const [rewardRegistry, setRewardRegistry] = useState<RewardRegistry[]>([]);
  const [activeRewardAnimation, setActiveRewardAnimation] = useState<string | null>(
    null
  );
  const [trendingData, setTrendingData] = useState<{
    mostUsedWords?: Array<{ word: string; count: number }>;
    popularSeeds?: Array<{ seed: number; count: number }>;
    rarityDistribution?: Array<{ rarity: string; count: number }>;
    mostLikedLogos?: Array<{
      id: string;
      text: string;
      seed: number;
    }>;
  }>({});

  const awardBadge = useCallback((reward: Reward) => {
    setUserRewards((prev) => {
      const exists = prev.some((r) => r.rewardType === reward.rewardType);
      if (exists) return prev;
      return [...prev, reward];
    });
  }, []);

  const hasBadge = useCallback(
    (rewardType: string): boolean => {
      return userRewards.some((r) => r.rewardType === rewardType);
    },
    [userRewards]
  );

  const startRewardAnimation = useCallback((rewardType: string) => {
    setActiveRewardAnimation(rewardType);
    const timer = setTimeout(() => setActiveRewardAnimation(null), 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadRewardRegistry = useCallback((registry: RewardRegistry[]) => {
    setRewardRegistry(registry);
  }, []);

  return {
    userRewards,
    setUserRewards,
    awardBadge,
    hasBadge,
    rewardRegistry,
    setRewardRegistry,
    loadRewardRegistry,
    activeRewardAnimation,
    startRewardAnimation,
    trendingData,
    setTrendingData,
  };
}
