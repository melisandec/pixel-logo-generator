/**
 * Shared types and utilities for Logo Generator components
 */

/**
 * Unified leaderboard entry type used across all components
 */
export type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  likes: number;
  rarity?: string | null;
  logoImageUrl?: string;
  cardImageUrl?: string;
  thumbImageUrl?: string;
  mediumImageUrl?: string;
  imageUrl?: string;
  username: string;
  displayName: string;
  pfpUrl?: string;
  createdAt: number | string;
  views?: number;
  recasts?: number;
  saves?: number;
  remixes?: number;
  presetKey?: string | null;
  castUrl?: string | null;
};

/**
 * Format a timestamp for display in history/leaderboard contexts
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "Jan 28, 2:30 PM")
 */
export const formatHistoryTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
