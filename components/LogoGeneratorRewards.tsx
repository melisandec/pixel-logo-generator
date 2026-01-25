'use client';

interface Badge {
  badgeType: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt: string;
}

interface LogoGeneratorRewardsProps {
  badges: Badge[];
  isLoading: boolean;
  
  userStats: {
    username: string;
    rank?: string | null;
    totalPower?: number;
    bestRarity?: string | null;
  } | null;
}

export default function LogoGeneratorRewards(
  props: LogoGeneratorRewardsProps,
) {
  const { badges, isLoading, userStats } = props;

  return (
    <div className="logo-generator-rewards">
      <h2>Rewards Tab</h2>
      {/* TODO: Implement rewards UI */}
      {/* - User stats display */}
      {/* - Badges grid */}
      {/* - Achievement progress */}
      {/* - Unlock conditions */}
    </div>
  );
}
