"use client";

import styles from "./LogoGenerator.module.css";

type UserStats = {
  username: string;
  rank?: string | null;
  support?: number;
  influence?: number;
  creation?: number;
  discovery?: number;
  totalPower?: number;
  bestRarity?: string | null;
};

type Badge = {
  badgeType: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt: string;
};

type Reward = {
  rewardType: string;
  unlockedAt?: string;
  metadata?: Record<string, unknown>;
};

type RewardRegistry = {
  rewardType: string;
  title?: string;
  description?: string;
  threshold?: number;
  stat?: string;
};

type TrendingData = {
  mostUsedWords: Array<{ word: string; count: number }>;
  popularSeeds: Array<{ seed: number; count: number }>;
  rarityDistribution: Array<{ rarity: string; count: number }>;
  mostLikedLogos: Array<{
    id: string;
    text: string;
    seed: number;
    rarity: string | null;
    logoImageUrl: string | null;
    imageUrl: string | null;
    cardImageUrl: string | null;
    likes: number;
    recasts: number;
    saves: number;
    remixes: number;
    username: string | null;
  }>;
  windowDays: number;
};

interface LogoGeneratorRewardsProps {
  badges: Badge[];
  isLoading: boolean;
  userStats: UserStats | null;
  userRewards?: Reward[];
  rewardRegistry?: RewardRegistry[];
  trendingData?: TrendingData | null;
  expandedStat?: string | null;
  onExpandedStatChange?: (stat: string | null) => void;
}

export default function LogoGeneratorRewards(props: LogoGeneratorRewardsProps) {
  const {
    badges,
    isLoading,
    userStats,
    userRewards = [],
    rewardRegistry = [],
    trendingData = null,
    expandedStat = null,
    onExpandedStatChange = () => {},
  } = props;

  const getTierLabel = (
    value: number,
    tiers: Array<{ min: number; label: string }>,
  ): string => {
    const tier = tiers.find((t) => value >= t.min);
    return tier?.label ?? "Unknown";
  };

  const supportPower = userStats?.support ?? 0;
  const influencePower = userStats?.influence ?? 0;
  const creationPower = userStats?.creation ?? 0;
  const discoveryPower = userStats?.discovery ?? 0;
  const totalPower = userStats?.totalPower ?? 0;
  const powerRank = userStats?.rank ?? "C";

  if (isLoading) {
    return (
      <div className="logo-generator-rewards">
        <div className="loading-state">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="forge-arena-section">
      {/* Power Rank Banner */}
      <div className="forge-power-banner">
        <div className="forge-power-rank">{powerRank}</div>
        <div className="forge-power-info">
          <div className="forge-power-value">
            {totalPower.toLocaleString()} ⚡
          </div>
          <div className="forge-power-label">Forge Power</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="forge-stats-grid">
        {[
          {
            icon: "♥",
            name: "Support",
            value: supportPower,
            max: 300,
            tier: getTierLabel(supportPower, [
              { min: 250, label: "Gold Heart" },
              { min: 50, label: "Silver Heart" },
              { min: 0, label: "Bronze Heart" },
            ]),
            color: "#ff3366",
            unlocks: "Frame accents, glow effects, badge types",
            description: "Likes you've given to other creators",
          },
          {
            icon: "★",
            name: "Influence",
            value: influencePower,
            max: 150,
            tier: getTierLabel(influencePower, [
              { min: 100, label: "Legendary Glow" },
              { min: 10, label: "Neon Aura" },
              { min: 0, label: "Pixel Spark" },
            ]),
            color: "#ffdd00",
            unlocks: "Aura colors, highlights, animations",
            description: "Likes your logos have earned",
          },
          {
            icon: "🎨",
            name: "Creation",
            value: creationPower,
            max: 200,
            tier: getTierLabel(creationPower, [
              { min: 150, label: "Master Crafter" },
              { min: 50, label: "Steady Artisan" },
              { min: 0, label: "New Forger" },
            ]),
            color: "#ff9900",
            unlocks: "Palettes, backgrounds, badge styles",
            description: "Total logos you've generated",
          },
          {
            icon: "🔁",
            name: "Discovery",
            value: discoveryPower,
            max: 120,
            tier: getTierLabel(discoveryPower, [
              { min: 100, label: "Legendary Signal" },
              { min: 25, label: "Neon Signal" },
              { min: 0, label: "Spark" },
            ]),
            color: "#00ddff",
            unlocks: "Profile highlights, share boosts",
            description: "People interacting with your logos",
          },
        ].map((stat) => {
          const pct = Math.min(100, Math.round((stat.value / stat.max) * 100));
          const segments = 8;
          const filled = Math.round((pct / 100) * segments);
          const barString = "■".repeat(filled) + "□".repeat(segments - filled);
          const isExpanded = expandedStat === stat.name;

          return (
            <div key={stat.name}>
              <div
                className="forge-stat-card"
                data-stat={stat.name}
                onClick={() =>
                  onExpandedStatChange(isExpanded ? null : stat.name)
                }
              >
                <div className="forge-stat-content">
                  <span className="forge-stat-icon">{stat.icon}</span>
                  <span className="forge-stat-label">{stat.name}</span>
                  <div className="forge-stat-value">{stat.value}</div>
                </div>
                <div className="forge-stat-right">
                  <div className="forge-stat-bar">{barString}</div>
                  <div className="forge-stat-tier">{stat.tier}</div>
                  <div className="forge-stat-progress">{pct}%</div>
                </div>
              </div>

              {isExpanded && (
                <div
                  className={`forge-stat-details ${styles.forgeStatDetails}`}
                  style={{ borderColor: stat.color }}
                >
                  <div className="forge-stat-details-title">
                    What it unlocks
                  </div>
                  <div className="forge-stat-details-content">
                    {stat.unlocks}
                  </div>
                  <div className="forge-stat-details-hint">
                    ↳ {stat.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Arcade Missions */}
      <div className="forge-missions-section">
        <h3 className="forge-missions-title">Arcade Missions</h3>
        <div className="forge-missions-grid">
          {[
            {
              icon: "❤️",
              title: "Like 10 logos",
              rewardIcon: "🎁",
              reward: "Pixel Spark",
              progress: Math.min(10, supportPower % 10),
              target: 10,
            },
            {
              icon: "⭐",
              title: "Receive 5 likes",
              rewardIcon: "🎁",
              reward: "Neon Frame",
              progress: Math.min(5, Math.round(influencePower / 5)),
              target: 5,
            },
            {
              icon: "🎨",
              title: "Generate 3 logos",
              rewardIcon: "🎁",
              reward: "New background",
              progress: Math.min(3, creationPower % 3),
              target: 3,
            },
          ].map((mission) => {
            const pct = Math.min(
              100,
              Math.round((mission.progress / mission.target) * 100),
            );
            const segments = 6;
            const filled = Math.round((pct / 100) * segments);
            const barString =
              "■".repeat(filled) + "□".repeat(segments - filled);
            const isComplete = mission.progress >= mission.target;

            return (
              <div
                key={mission.title}
                className={`forge-mission-card${isComplete ? " completed" : ""}`}
                title={mission.reward}
              >
                <span className="forge-mission-icon">{mission.icon}</span>
                <span className="forge-mission-title">{mission.title}</span>
                <div className="forge-mission-progress">
                  {mission.progress}/{mission.target}
                </div>
                <div className="forge-mission-bar">{barString}</div>
                <span className="forge-mission-reward">
                  {mission.rewardIcon}
                </span>
                {isComplete && (
                  <span className="forge-mission-status-icon">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="badges-section">
          <h3 className="badges-title">Your Badges</h3>
          <div className="badges-grid">
            {badges.map((badge) => (
              <div key={badge.badgeType} className="badge-card">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-rarity">{badge.rarity}</div>
                <div className="badge-earned">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocks Section */}
      {rewardRegistry.length > 0 && (
        <div className="forge-unlocks-section">
          <h3 className="forge-unlocks-title">Unlocked Rewards</h3>
          <div className="forge-unlocks-subtitle">
            Earn these by growing your forge stats
          </div>
          <div className="forge-unlocks-grid">
            {rewardRegistry.map((reward) => {
              const unlocked = userRewards.some(
                (r) => r.rewardType === reward.rewardType,
              );
              return (
                <div
                  key={reward.rewardType}
                  className={`forge-unlock-card ${unlocked ? "unlocked" : "locked"}`}
                >
                  <div className="forge-unlock-header">
                    <div className="forge-unlock-title">
                      {reward.title ?? reward.rewardType}
                    </div>
                    <div
                      className={`forge-unlock-status ${unlocked ? "unlocked" : ""}`}
                    >
                      {unlocked ? "✓" : "🔒"}
                    </div>
                  </div>
                  <div className="forge-unlock-description">
                    {reward.description ?? "Earn by boosting your stats"}
                  </div>
                  <div className="forge-unlock-threshold">
                    Unlocks at {reward.threshold ?? "?"}{" "}
                    {reward.stat ?? "power"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {trendingData && (
        <div className="forge-trending-section">
          <h3 className="forge-trending-title">
            Trending ({trendingData.windowDays}d)
          </h3>

          <div className="forge-trending-subsections-wrapper">
            <div className="forge-trending-subsection">
              <div className="forge-trending-subsection-title">Top Prompts</div>
              <div className="forge-trending-list">
                {trendingData.mostUsedWords.slice(0, 5).map((w) => (
                  <div key={w.word} className="forge-trending-item">
                    <span className="forge-trending-item-name">{w.word}</span>
                    <span className="forge-trending-item-count">{w.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="forge-trending-subsection">
              <div className="forge-trending-subsection-title">
                Popular Seeds
              </div>
              <div className="forge-trending-list">
                {trendingData.popularSeeds.slice(0, 5).map((s) => (
                  <div key={s.seed} className="forge-trending-item">
                    <span className="forge-trending-item-name">
                      Seed {s.seed}
                    </span>
                    <span className="forge-trending-item-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="forge-trending-subsection">
            <div className="forge-trending-subsection-title">
              Rarity Distribution
            </div>
            {(() => {
              const total = trendingData.rarityDistribution.reduce(
                (sum, r) => sum + r.count,
                0,
              );
              const rarityColors = {
                common: "#00ff00",
                rare: "#00aaff",
                epic: "#aa00ff",
                legendary: "#ffaa00",
              };
              const rarityLabels = {
                common: "Common",
                rare: "Rare",
                epic: "Epic",
                legendary: "Legendary",
              };
              return (
                <>
                  <div className="forge-trending-rarity-bar">
                    {trendingData.rarityDistribution.map((r) => {
                      const percentage =
                        total > 0 ? (r.count / total) * 100 : 0;
                      return (
                        <div
                          key={r.rarity}
                          className={`forge-trending-rarity-segment ${r.rarity.toLowerCase()} ${styles.forgeTrendingRaritySegment}`}
                          style={{ flex: percentage }}
                          title={`${r.rarity}: ${r.count} (${Math.round(percentage)}%)`}
                        >
                          {Math.round(percentage) > 10 &&
                            Math.round(percentage)}
                        </div>
                      );
                    })}
                  </div>
                  <div className="forge-trending-rarity-legend">
                    {trendingData.rarityDistribution.map((r) => (
                      <div
                        key={r.rarity}
                        className="forge-trending-rarity-legend-item"
                      >
                        <div
                          className={`forge-trending-rarity-legend-color ${styles.forgeTrendingRarityLegendColor}`}
                          style={{
                            background:
                              rarityColors[
                                r.rarity.toLowerCase() as keyof typeof rarityColors
                              ],
                          }}
                        />
                        <span>
                          {
                            rarityLabels[
                              r.rarity.toLowerCase() as keyof typeof rarityLabels
                            ]
                          }
                          : {r.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
