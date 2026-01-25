import { useState, useCallback } from "react";

interface UserStats {
  username: string;
  rank?: string;
  support?: number;
  influence?: number;
  creation?: number;
  discovery?: number;
  totalPower?: number;
  bestRarity?: string;
}

/**
 * Manages leaderboard and gallery data state:
 * - Leaderboard entries and sorting
 * - Gallery entries and filtering
 * - User profile and stats
 * - View modes and pagination
 */
export function useLeaderboardData() {
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);
  const [leaderboardSort, setLeaderboardSort] = useState<"score" | "recent">(
    "score",
  );
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string>("");

  const [galleryEntries, setGalleryEntries] = useState<any[]>([]);
  const [galleryMode, setGalleryMode] = useState<"logos" | "casts">("casts");
  const [galleryRarityFilter, setGalleryRarityFilter] = useState("All");
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string>("");

  const [userProfile, setUserProfile] = useState<{
    username: string;
    best: any | null;
    latest: any | null;
    entries: any[];
  } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string>("");

  const [likedEntries, setLikedEntries] = useState<Set<string>>(new Set());
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const addLikedEntry = useCallback((id: string) => {
    setLikedEntries((prev) => new Set([...prev, id]));
  }, []);

  const removeLikedEntry = useCallback((id: string) => {
    setLikedEntries((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleLikedEntry = useCallback((id: string) => {
    setLikedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    leaderboardEntries,
    setLeaderboardEntries,
    leaderboardSort,
    setLeaderboardSort,
    leaderboardPage,
    setLeaderboardPage,
    leaderboardLoading,
    setLeaderboardLoading,
    leaderboardError,
    setLeaderboardError,
    galleryEntries,
    setGalleryEntries,
    galleryMode,
    setGalleryMode,
    galleryRarityFilter,
    setGalleryRarityFilter,
    galleryPage,
    setGalleryPage,
    galleryLoading,
    setGalleryLoading,
    galleryError,
    setGalleryError,
    userProfile,
    setUserProfile,
    userStats,
    setUserStats,
    profileLoading,
    setProfileLoading,
    profileError,
    setProfileError,
    likedEntries,
    addLikedEntry,
    removeLikedEntry,
    toggleLikedEntry,
    expandedEntry,
    setExpandedEntry,
    expandedImage,
    setExpandedImage,
  };
}
