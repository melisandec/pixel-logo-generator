"use client";

import { LeaderboardEntry } from "@/lib/badgeTracker";

type UserProfile = {
  username: string;
  displayName?: string | null;
  pfpUrl?: string | null;
  stats?: Record<string, unknown> | null;
  topEntries?: LeaderboardEntry[];
};

interface LogoGeneratorProfileProps {
  profileData: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  username: string;

  onRefresh: () => Promise<void>;
}

export default function LogoGeneratorProfile(props: LogoGeneratorProfileProps) {
  const { profileData, isLoading, error, username, onRefresh } = props;

  return (
    <div className="logo-generator-profile">
      <h2>Profile Tab</h2>
      {/* TODO: Implement profile UI */}
      {/* - User info header */}
      {/* - Best logo showcase */}
      {/* - Latest logos */}
      {/* - Stats and achievements */}
      {/* - Share profile button */}
    </div>
  );
}
