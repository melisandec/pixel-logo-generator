"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { sdk } from "@farcaster/miniapp-sdk";
import { EXTRA_BADGE_TYPES } from "@/lib/badgeTypes";

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  imageUrl: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  recasts?: number;
  createdAt: string;
  castUrl?: string | null;
  rarity?: string | null;
  presetKey?: string | null;
};

type UserProfile = {
  username: string;
  best: LeaderboardEntry | null;
  latest?: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
};

const buildWarpcastComposeUrl = (text: string, embeds?: string[]) => {
  const params = new URLSearchParams();
  params.set("text", text);
  (embeds ?? [])
    .slice(0, 2)
    .forEach((embed) => params.append("embeds[]", embed));
  return `https://warpcast.com/~/compose?${params.toString()}`;
};

const PRESETS = [
  { key: "arcade", label: "Arcade" },
  { key: "vaporwave", label: "Vaporwave" },
  { key: "gameboy", label: "Game Boy" },
] as const;

const RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProfileTitle = (casts: number, legendaryCount: number, rarity: Set<string>) => {
  if (rarity.size === 4) return "Rarity Master";
  if (legendaryCount > 0) return "Master Forger";
  if (rarity.has("EPIC")) return "Arcade Crafter";
  if (casts > 0) return "Apprentice Forger";
  return "Pixel Forger";
};

const getProfileEmblems = (
  legendaryCount: number,
  topEntries: LeaderboardEntry[],
): string[] => {
  const emblems: string[] = [];
  if (legendaryCount > 0) emblems.push("⭐"); // Legendary unlocked
  // Check for streak (3+ casts in last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCasts = topEntries.filter(
    (e) => new Date(e.createdAt).getTime() >= sevenDaysAgo,
  ).length;
  if (recentCasts >= 3) emblems.push("🔥"); // On streak
  return emblems;
};

const getProfileLevel = (casts: number): number => {
  return Math.floor(casts / 5) + 1;
};

export default function ProfileClient({
  profile,
  badges: initialBadges,
  devRewards,
}: {
  profile: UserProfile;
  badges?: Array<any>;
  devRewards?: {
    specialFrameUnlocked?: boolean;
    specialBackgroundUnlocked?: boolean;
  };
}) {
  const [userBadges, setUserBadges] = useState<Array<any>>(initialBadges ?? []);

  useEffect(() => {
    if (initialBadges && Array.isArray(initialBadges)) return;
    const loadBadges = async () => {
      try {
        const response = await fetch(
          `/api/badges?username=${encodeURIComponent(profile.username)}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.badges)) setUserBadges(data.badges);
      } catch (err) {
        console.error("Failed to load badges for profile:", err);
      }
    };
    loadBadges();
  }, [profile.username, initialBadges]);

  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [presetFilter, setPresetFilter] = useState<string>("all");
  const [recentOnly, setRecentOnly] = useState(false);

  const presetLabelMap = useMemo(() => {
    return PRESETS.reduce<Record<string, string>>((acc, preset) => {
      acc[preset.key] = preset.label;
      return acc;
    }, {});
  }, []);

  const stats = useMemo(() => {
    const totalCasts = profile.entries.length;
    const totalLikes = profile.entries.reduce(
      (sum, entry) => sum + entry.likes,
      0,
    );
    const legendaryCount = profile.entries.filter(
      (entry) => String(entry.rarity).toUpperCase() === "LEGENDARY",
    ).length;
    const bestRarity = profile.best?.rarity
      ? String(profile.best.rarity).toUpperCase()
      : "Unknown";
    const presetCounts = profile.entries.reduce<Record<string, number>>(
      (acc, entry) => {
        const key = entry.presetKey ?? "Unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const topPresetKey =
      Object.entries(presetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Unknown";
    const raritySet = new Set(
      profile.entries.map((e) => String(e.rarity).toUpperCase()),
    );
    return {
      totalCasts,
      totalLikes,
      legendaryCount,
      bestRarity,
      topPreset: presetLabelMap[topPresetKey] ?? topPresetKey,
      raritySet,
      level: getProfileLevel(totalCasts),
    };
  }, [presetLabelMap, profile.best?.rarity, profile.entries]);

  const latestEntry = useMemo(() => {
    return (
      profile.latest ??
      profile.entries.reduce<LeaderboardEntry | null>((latest, entry) => {
        if (!latest) return entry;
        return new Date(entry.createdAt).getTime() >
          new Date(latest.createdAt).getTime()
          ? entry
          : latest;
      }, null)
    );
  }, [profile.entries, profile.latest]);

  const topEntries = useMemo(() => {
    return [...profile.entries]
      .sort((a, b) => {
        const aScore = a.likes + (a.recasts ?? 0) * 2;
        const bScore = b.likes + (b.recasts ?? 0) * 2;
        if (aScore !== bScore) return bScore - aScore;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 3);
  }, [profile.entries]);

  const filteredEntries = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return profile.entries.filter((entry) => {
      const rarityValue = entry.rarity
        ? String(entry.rarity).toUpperCase()
        : "UNKNOWN";
      const presetValue = entry.presetKey ?? "Unknown";
      if (rarityFilter !== "all") {
        if (rarityFilter === "Unknown" && rarityValue !== "UNKNOWN")
          return false;
        if (rarityFilter !== "Unknown" && rarityValue !== rarityFilter)
          return false;
      }
      if (presetFilter !== "all") {
        if (presetFilter === "Unknown" && presetValue !== "Unknown")
          return false;
        if (presetFilter !== "Unknown" && presetValue !== presetFilter)
          return false;
      }
      if (recentOnly) {
        return new Date(entry.createdAt).getTime() >= cutoff;
      }
      return true;
    });
  }, [presetFilter, profile.entries, rarityFilter, recentOnly]);

  const handleCastBest = () => {
    if (!profile.best) return;
    const text = `My best pixel logo: "${profile.best.text}"`;
    const url = buildWarpcastComposeUrl(
      text,
      profile.best.imageUrl ? [profile.best.imageUrl] : undefined,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareCollection = async () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(profile.username)}`;
    const embeds = topEntries
      .map((entry) => entry.imageUrl)
      .filter(
        (url) =>
          url && (url.startsWith("http://") || url.startsWith("https://")),
      );
    const text = `My Pixel Logo Forge collection (top 3)\n${profileUrl}`;
    try {
      const embedsForSdk = embeds.slice(0, 2) as string[];
      await sdk.actions.composeCast({
        text,
        embeds:
          embedsForSdk.length === 2
            ? ([embedsForSdk[0], embedsForSdk[1]] as [string, string])
            : embedsForSdk.length === 1
              ? ([embedsForSdk[0]] as [string])
              : undefined,
      });
      return;
    } catch (error) {
      console.error("Share collection via SDK failed:", error);
    }
    const composeUrl = buildWarpcastComposeUrl(text, embeds);
    const opened = window.open(composeUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = composeUrl;
    }
  };

  const handleCopyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(profile.username)}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch (error) {
      console.error("Failed to copy profile link:", error);
      window.open(profileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link href="/" className="profile-back">
          &larr; Back
        </Link>
        <div className="profile-name-badge">
          <span className="profile-username">@{profile.username}</span>
          <span className="profile-emblems">
            {getProfileEmblems(stats.legendaryCount, topEntries).join(" ")}
          </span>
        </div>
        <div className="profile-level-subtitle">
          {getProfileTitle(
            stats.totalCasts,
            stats.legendaryCount,
            stats.raritySet,
          )}{" "}
          Lv. {stats.level}
        </div>
      </div>
      <div className="profile-actions">
        <button
          type="button"
          className="profile-share-button"
          onClick={handleShareCollection}
        >
          Share collection
        </button>
        <button
          type="button"
          className="profile-copy-link"
          onClick={handleCopyProfileLink}
        >
          Copy profile link
        </button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-label">TOTAL CASTS</span>
          <strong className="stat-value">{String(stats.totalCasts).padStart(3, "0")}</strong>
        </div>
        <div className="profile-stat">
          <span className="stat-label">TOTAL LIKES</span>
          <strong className="stat-value">{String(stats.totalLikes).padStart(3, "0")}</strong>
        </div>
        <div className="profile-stat">
          <span className="stat-label">BEST RARITY</span>
          <strong className={`stat-value rarity-${String(stats.bestRarity).toLowerCase()}`}>
            {stats.bestRarity}
          </strong>
        </div>
        <div className="profile-stat">
          <span className="stat-label">TOP PRESET</span>
          <strong className="stat-value">{stats.topPreset}</strong>
        </div>
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Rarity Collection</div>
        <div className="rarity-progress-console">
          {["COMMON", "RARE", "EPIC", "LEGENDARY"].map((r) => {
            const has = profile.entries.some(
              (e) => String(e.rarity).toUpperCase() === r,
            );
            return (
              <div
                key={`rarity-${r}`}
                className={`rarity-progress-item ${has ? "unlocked" : ""} ${r.toLowerCase()}`}
              >
                <span className="rarity-check">{has ? "✔" : "☐"}</span>
                <span className="rarity-label">
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
        <div className="rarity-progress-bar-container">
          <div
            className="rarity-progress-bar"
            style={{
              width: `${(stats.raritySet.size / 4) * 100}%`,
            }}
          />
        </div>
        <div className="rarity-progress-text">
          {stats.raritySet.size} / 4 COMPLETE
        </div>

        {userBadges.some(
          (b) => b.badgeType === EXTRA_BADGE_TYPES.RARITY_MASTER,
        ) ? (
          <div className="rarity-master-panel">
            <div className="rarity-master-header">✓ RARITY MASTER</div>
            <div className="rarity-master-desc">
              Unlocked: Mythic Frame, Mythic Background, +1 Daily Generate
            </div>
          </div>
        ) : (
          <div className="next-objective-panel">
            <div className="next-objective-title">NEXT OBJECTIVE</div>
            <div className="next-objective-text">
              Complete the set to unlock Mythic rewards.
            </div>
          </div>
        )}

        <div className="unlocked-rewards">
          <div className="leaderboard-subtitle">Unlocked Rewards</div>
          <div className="reward-list">
            <div className="reward-card">
              <div className="reward-card-content">
                {Boolean(
                  devRewards?.specialFrameUnlocked ||
                    userBadges.some(
                      (b) => b.badgeType === EXTRA_BADGE_TYPES.RARITY_MASTER,
                    ),
                ) ? (
                  <div className="reward-unlocked">
                    <span className="reward-check">✓</span>
                    <span className="reward-name">Mythic Frame</span>
                    <span className="reward-badge">UNLOCKED</span>
                  </div>
                ) : (
                  <div className="reward-locked">
                    <span className="reward-lock">🔒</span>
                    <span className="reward-name">Mythic Frame</span>
                  </div>
                )}
              </div>
            </div>
            <div className="reward-card">
              <div className="reward-card-content">
                {Boolean(
                  devRewards?.specialBackgroundUnlocked ||
                    userBadges.some(
                      (b) => b.badgeType === EXTRA_BADGE_TYPES.RARITY_MASTER,
                    ),
                ) ? (
                  <div className="reward-unlocked">
                    <span className="reward-check">✓</span>
                    <span className="reward-name">Mythic Background</span>
                    <span className="reward-badge">UNLOCKED</span>
                  </div>
                ) : (
                  <div className="reward-locked">
                    <span className="reward-lock">🔒</span>
                    <span className="reward-name">Mythic Background</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Latest Showcase</div>
        {latestEntry ? (
          <div className="profile-showcase-card">
            <div className="showcase-tag">SHOWCASE</div>
            {latestEntry.imageUrl ? (
              <Image
                src={latestEntry.imageUrl}
                alt={`Latest logo by ${latestEntry.username}`}
                className="profile-latest-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{latestEntry.text}</div>
            )}
            <div className="showcase-meta">
              <span>{formatDate(latestEntry.createdAt)}</span>
              <span className={`rarity-${String(latestEntry.rarity).toLowerCase()}`}>
                {latestEntry.rarity
                  ? String(latestEntry.rarity).toUpperCase()
                  : "UNKNOWN"}
              </span>
              <span>❤️ {latestEntry.likes}</span>
            </div>
          </div>
        ) : (
          <div className="leaderboard-status">
            Cast your first logo to populate this.
          </div>
        )}
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Personal Best</div>
        {profile.best ? (
          <div className="profile-best-card">
            {profile.best.imageUrl ? (
              <Image
                src={profile.best.imageUrl}
                alt={`Best logo by ${profile.best.username}`}
                className="profile-best-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{profile.best.text}</div>
            )}
            <div className="profile-best-meta">
              <span>❤️ {profile.best.likes}</span>
              <span>🔁 {profile.best.recasts ?? 0}</span>
            </div>
            <button
              type="button"
              className="profile-cast-button"
              onClick={handleCastBest}
            >
              Cast this
            </button>
          </div>
        ) : (
          <div className="leaderboard-status">
            Cast your first logo to populate this.
          </div>
        )}
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Filters</div>
        <div className="profile-filters">
          <div className="profile-filter-row">
            <span>Rarity</span>
            <div className="profile-filter-chips">
              {["all", ...RARITIES, "Unknown"].map((option) => (
                <button
                  key={`rarity-${option}`}
                  type="button"
                  className={`profile-chip${rarityFilter === option ? " active" : ""}`}
                  onClick={() => setRarityFilter(option)}
                  aria-pressed={rarityFilter === option}
                >
                  {option === "all" ? "All" : option}
                </button>
              ))}
            </div>
          </div>
          <div className="profile-filter-row">
            <span>Preset</span>
            <div className="profile-filter-chips">
              {["all", ...PRESETS.map((preset) => preset.key), "Unknown"].map(
                (option) => (
                  <button
                    key={`preset-${option}`}
                    type="button"
                    className={`profile-chip${presetFilter === option ? " active" : ""}`}
                    onClick={() => setPresetFilter(option)}
                    aria-pressed={presetFilter === option}
                  >
                    {option === "all"
                      ? "All"
                      : (presetLabelMap[option] ?? option)}
                  </button>
                ),
              )}
            </div>
          </div>
          <button
            type="button"
            className={`profile-chip${recentOnly ? " active" : ""}`}
            onClick={() => setRecentOnly((prev) => !prev)}
            aria-pressed={recentOnly}
          >
            Last 7 days
          </button>
        </div>
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Recent Logos</div>
        {filteredEntries.length === 0 ? (
          <div className="leaderboard-status">
            No casts match those filters yet.
          </div>
        ) : (
          <div className="profile-gallery-grid">
            {filteredEntries.map((entry) => (
              <div key={`profile-${entry.id}`} className="profile-gallery-card">
                {entry.imageUrl ? (
                  <Image
                    src={entry.imageUrl}
                    alt={`Logo by ${entry.username}`}
                    className="profile-gallery-image"
                    width={200}
                    height={140}
                    unoptimized
                  />
                ) : (
                  <div className="profile-gallery-text">{entry.text}</div>
                )}
                <div className="profile-gallery-meta">
                  <span>{formatDate(entry.createdAt)}</span>
                  <span>
                    {entry.rarity
                      ? String(entry.rarity).toUpperCase()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Home"
          data-label="Home"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🏠
          </span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Gallery"
          data-label="Gallery"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🖼️
          </span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Leaderboard"
          data-label="Leaderboard"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🏆
          </span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Challenge"
          data-label="Challenge"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🎯
          </span>
        </Link>
        <Link
          href={`/profile/${encodeURIComponent(profile.username)}`}
          className="bottom-nav-button active"
          aria-label="Profile"
          data-label="Profile"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            👤
          </span>
        </Link>
      </nav>
    </div>
  );
}
