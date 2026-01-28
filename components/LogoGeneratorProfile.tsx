"use client";

import Link from "next/link";

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  likes: number;
  rarity?: string | null;
};

type UserProfile = {
  username: string;
  displayName?: string | null;
  pfpUrl?: string | null;
  stats?: Record<string, unknown> | null;
  entries: LeaderboardEntry[];
};

interface LogoGeneratorProfileProps {
  profileData: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  username: string | undefined;

  onRefresh?: () => Promise<void>;

  challengeStreak: number;
}

export default function LogoGeneratorProfile(
  props: LogoGeneratorProfileProps,
) {
  const {
    profileData,
    isLoading,
    error,
    username,
    challengeStreak,
  } = props;

  const getProfileTitle = (
    casts: number,
    legendaryCount: number,
    streak: number,
  ): string => {
    if (legendaryCount >= 5 && streak >= 7) return "RARITY MASTER 👑";
    if (legendaryCount >= 3) return "LEGENDARY HUNTER 🔶";
    if (casts >= 50 && streak >= 14) return "FORGE LEGEND 🏆";
    if (casts >= 20 && streak >= 7) return "FORGE VETERAN ⚔️";
    if (casts >= 5) return "FORGE INITIATE 🔥";
    return "NOVICE FORGER 🔨";
  };

  return (
    <div className="profile-tab">
      <div className="leaderboard-title">Your Profile</div>
      {username ? (
        <div className="profile-tab-card">
          <div className="profile-tab-name">@{username}</div>
          {isLoading && (
            <div className="profile-tab-meta">Loading profile...</div>
          )}
          {error && (
            <div className="profile-tab-meta">{error}</div>
          )}
          {profileData && (
            <>
              <div className="profile-title-badge">
                {getProfileTitle(
                  profileData.entries.length,
                  profileData.entries.filter(
                    (entry) =>
                      String(entry.rarity).toUpperCase() === "LEGENDARY",
                  ).length,
                  challengeStreak,
                )}
              </div>
              <div className="profile-tab-meta">
                {profileData.entries.length} casts · ❤️{" "}
                {profileData.entries.reduce(
                  (sum, entry) => sum + entry.likes,
                  0,
                )}
              </div>
            </>
          )}
          <Link
            className="profile-tab-link"
            href={`/profile/${encodeURIComponent(username)}`}
          >
            Open your profile
          </Link>
        </div>
      ) : (
        <div className="leaderboard-status">
          Sign in with Farcaster to view your profile.
        </div>
      )}
    </div>
  );
}
