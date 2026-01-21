import { UserStats } from '@prisma/client';

export type RewardDefinition = {
  rewardType: string;
  stat: keyof Pick<UserStats, 'support' | 'influence' | 'creation' | 'discovery' | 'totalPower'>;
  threshold: number;
  title: string;
  description: string;
};

export const REWARD_REGISTRY: RewardDefinition[] = [
  {
    rewardType: 'supporter-aura',
    stat: 'support',
    threshold: 25,
    title: 'Supporter Aura',
    description: 'Earned for consistently liking and uplifting other forgers.',
  },
  {
    rewardType: 'influencer-flare',
    stat: 'influence',
    threshold: 50,
    title: 'Influencer Flare',
    description: 'Unlocked by receiving love on your logos and casts.',
  },
  {
    rewardType: 'rarity-master-badge',
    stat: 'creation',
    threshold: 80,
    title: 'Rarity Master',
    description: 'Hit a creation streak that impresses the forge.',
  },
  {
    rewardType: 'explorer-frame',
    stat: 'discovery',
    threshold: 40,
    title: 'Explorer Frame',
    description: 'Saved and curated enough logos to earn a custom frame.',
  },
  {
    rewardType: 'signature-border',
    stat: 'totalPower',
    threshold: 150,
    title: 'Signature Border',
    description: 'Overall forge power unlocked a signature border.',
  },
];
