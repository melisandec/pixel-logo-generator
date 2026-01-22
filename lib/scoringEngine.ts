import prisma from './prisma';
import { Prisma } from '@prisma/client';
import { REWARD_REGISTRY } from './rewardRegistry';

export type StatDelta = Partial<{
  support: number;
  influence: number;
  creation: number;
  discovery: number;
  totalPower: number;
  bestRarity: string | null;
}>;

export type ScoreAction =
  | 'generate'
  | 'save'
  | 'like_received'
  | 'like_given'
  | 'cast_share'
  | 'remix_used';

const BASE_DELTAS: Record<ScoreAction, StatDelta> = {
  generate: { creation: 1, totalPower: 1 },
  save: { discovery: 2, totalPower: 2 },
  like_received: { influence: 3, totalPower: 3 },
  like_given: { support: 1, totalPower: 1 },
  cast_share: { influence: 5, totalPower: 5 },
  remix_used: { creation: 10, totalPower: 10 },
};

const computeRank = (totalPower: number) => {
  if (totalPower >= 400) return 'Legendary';
  if (totalPower >= 250) return 'Master';
  if (totalPower >= 150) return 'Elite';
  if (totalPower >= 75) return 'Adept';
  return 'Rookie';
};

const clampNonNegative = (value: number) => (value < 0 ? 0 : value);

const NUMERIC_KEYS: Array<keyof StatDelta> = ['support', 'influence', 'creation', 'discovery', 'totalPower'];

const mergeDeltas = (deltas: StatDelta[]) => {
  return deltas.reduce<StatDelta>((acc, delta) => {
    Object.entries(delta).forEach(([key, value]) => {
      if (NUMERIC_KEYS.includes(key as keyof StatDelta) && typeof value === 'number') {
        const numericKey = key as keyof StatDelta;
        const prev = typeof acc[numericKey] === 'number' ? (acc[numericKey] as number) : 0;
        (acc as Record<string, number | string | null | undefined>)[numericKey] = prev + value;
      }
      if (key === 'bestRarity' && typeof value === 'string') {
        acc.bestRarity = value;
      }
    });
    return acc;
  }, {});
};

const rarityOrder = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

const isBetterRarity = (current: string | null | undefined, incoming?: string | null) => {
  if (!incoming) return false;
  if (!current) return true;
  const currentIndex = rarityOrder.indexOf(current.toUpperCase());
  const incomingIndex = rarityOrder.indexOf(incoming.toUpperCase());
  if (currentIndex === -1) return true;
  if (incomingIndex === -1) return false;
  return incomingIndex > currentIndex;
};

export const applyScoreActions = async (
  username: string | null | undefined,
  actions: Array<{ action: ScoreAction; multiplier?: number; bestRarity?: string | null }>,
  userId?: string | null,
) => {
  if (!username) return { stats: null, rewards: [] as string[] };

  const deltas = actions.map(({ action, multiplier = 1, bestRarity }) => {
    const base = BASE_DELTAS[action];
    const scaled: StatDelta = {};
    Object.entries(base).forEach(([key, value]) => {
      if (typeof value === 'number') {
        (scaled as Record<string, number | string | null | undefined>)[key] = value * multiplier;
      }
    });
    if (bestRarity) {
      scaled.bestRarity = bestRarity;
    }
    return scaled;
  });
  const merged = mergeDeltas(deltas);

  const existing = await prisma.userStats.findUnique({ where: { username: username.toLowerCase() } });

  const nextStats = {
    id: existing?.id ?? `user-${username.toLowerCase()}-${Date.now()}`,
    userId: userId ?? existing?.userId ?? null,
    username: username.toLowerCase(),
    support: clampNonNegative((existing?.support ?? 0) + (merged.support ?? 0)),
    influence: clampNonNegative((existing?.influence ?? 0) + (merged.influence ?? 0)),
    creation: clampNonNegative((existing?.creation ?? 0) + (merged.creation ?? 0)),
    discovery: clampNonNegative((existing?.discovery ?? 0) + (merged.discovery ?? 0)),
    bestRarity: isBetterRarity(existing?.bestRarity, merged.bestRarity) ? merged.bestRarity : existing?.bestRarity,
    totalPower: 0,
    rank: existing?.rank ?? 'Rookie',
  };
  nextStats.totalPower = clampNonNegative((existing?.totalPower ?? 0) + (merged.totalPower ?? 0));
  nextStats.rank = computeRank(nextStats.totalPower);

  const saved = await prisma.userStats.upsert({
    where: { username: username.toLowerCase() },
    update: nextStats,
    create: nextStats,
  });

  const unlockedRewards: string[] = [];
  for (const reward of REWARD_REGISTRY) {
    const meetsThreshold = (saved[reward.stat] as number) >= reward.threshold;
    if (!meetsThreshold) continue;
    const existingReward = await prisma.userReward.findUnique({
      where: { username_rewardType: { username: saved.username, rewardType: reward.rewardType } },
    });
    if (!existingReward) {
      await prisma.userReward.create({
        data: {
          id: `reward-${saved.username}-${reward.rewardType}-${Date.now()}`,
          username: saved.username,
          userId: saved.userId ?? null,
          rewardType: reward.rewardType,
        },
      });
      unlockedRewards.push(reward.rewardType);
    }
  }

  return { stats: saved, rewards: unlockedRewards };
};

export const fetchUserStats = async (username?: string | null) => {
  if (!username) return null;
  return prisma.userStats.findUnique({ where: { username: username.toLowerCase() } });
};

export const fetchUserRewards = async (username?: string | null) => {
  if (!username) return [];
  return prisma.userReward.findMany({
    where: { username: username.toLowerCase() },
    orderBy: { unlockedAt: 'desc' },
  });
};
