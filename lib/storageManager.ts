/**
 * Centralized localStorage and persistence management
 * All localStorage operations go through this module for consistency and testability
 */

import { LOCAL_STORAGE_KEYS } from "@/lib/logoGeneratorConstants";

interface DailyLimitState {
  date: string;
  words: string[];
  seedUsed: boolean;
}

interface ChallengeProgress {
  [key: string]: boolean;
}

interface ChallengeDay {
  date: string;
  completed: boolean;
  prompts: string[];
}

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// History and Favorites
export const historyStorage = {
  getHistory(): Array<{ result: any; createdAt: number }> {
    return safeJsonParse(localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY), []);
  },

  saveHistory(items: Array<{ result: any; createdAt: number }>): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY, JSON.stringify(items));
  },

  addToHistory(item: { result: any; createdAt: number }): void {
    const history = this.getHistory();
    history.unshift(item);
    this.saveHistory(history.slice(0, 100)); // Keep last 100
  },

  clearHistory(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.HISTORY);
  },
};

export const favoritesStorage = {
  getFavorites(): string[] {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES),
      [],
    );
  },

  saveFavorites(ids: string[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
  },

  addToFavorites(id: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      this.saveFavorites(favorites);
    }
  },

  removeFromFavorites(id: string): void {
    const favorites = this.getFavorites();
    this.saveFavorites(favorites.filter((fav) => fav !== id));
  },

  isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  },

  clearFavorites(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FAVORITES);
  },
};

// Daily Limits
export const dailyLimitStorage = {
  getDailyLimit(): DailyLimitState {
    return safeJsonParse(localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_LIMIT), {
      date: "",
      words: [],
      seedUsed: false,
    });
  },

  saveDailyLimit(state: DailyLimitState): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_LIMIT, JSON.stringify(state));
  },

  updateDailyLimit(updates: Partial<DailyLimitState>): void {
    const current = this.getDailyLimit();
    this.saveDailyLimit({ ...current, ...updates });
  },

  clearDailyLimit(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DAILY_LIMIT);
  },
};

// Challenges
export const challengeStorage = {
  getChallengeProgress(): ChallengeProgress {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.CHALLENGE_STATE),
      {},
    );
  },

  saveChallengeProgress(progress: ChallengeProgress): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.CHALLENGE_STATE,
      JSON.stringify(progress),
    );
  },

  toggleChallenge(key: string, completed: boolean): void {
    const progress = this.getChallengeProgress();
    progress[key] = completed;
    this.saveChallengeProgress(progress);
  },

  getChallengeDays(): ChallengeDay[] {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.CHALLENGE_DAYS),
      [],
    );
  },

  saveChallengeDay(day: ChallengeDay): void {
    const days = this.getChallengeDays();
    const existing = days.findIndex((d) => d.date === day.date);
    if (existing >= 0) {
      days[existing] = day;
    } else {
      days.push(day);
    }
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.CHALLENGE_DAYS,
      JSON.stringify(days),
    );
  },

  getChallengeHistory(): Array<{ date: string; completedAt: number }> {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.CHALLENGE_HISTORY),
      [],
    );
  },

  addChallengeCompletion(date: string): void {
    const history = this.getChallengeHistory();
    if (!history.some((h) => h.date === date)) {
      history.push({ date, completedAt: Date.now() });
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CHALLENGE_HISTORY,
        JSON.stringify(history),
      );
    }
  },

  clearChallenges(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CHALLENGE_STATE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CHALLENGE_DAYS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CHALLENGE_HISTORY);
  },
};

// User Preferences
export const preferencesStorage = {
  isSoundEnabled(): boolean {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.SOUND_ENABLED),
      true,
    );
  },

  setSoundEnabled(enabled: boolean): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SOUND_ENABLED,
      JSON.stringify(enabled),
    );
  },

  isAutoReplyEnabled(): boolean {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_REPLY_ENABLED),
      false,
    );
  },

  setAutoReplyEnabled(enabled: boolean): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.AUTO_REPLY_ENABLED,
      JSON.stringify(enabled),
    );
  },

  getUIMode(): "simple" | "advanced" {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.UI_MODE),
      "simple",
    );
  },

  setUIMode(mode: "simple" | "advanced"): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.UI_MODE, JSON.stringify(mode));
  },

  isDarkModeEnabled(): boolean {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE_ENABLED),
      true,
    );
  },

  setDarkModeEnabled(enabled: boolean): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.DARK_MODE_ENABLED,
      JSON.stringify(enabled),
    );
  },
};

// User Progress
export const progressStorage = {
  isOnboardingDone(): boolean {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING_DONE),
      false,
    );
  },

  setOnboardingDone(done: boolean): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.ONBOARDING_DONE,
      JSON.stringify(done),
    );
  },

  getLastBootDate(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.BOOT_DATE);
  },

  setBootDate(date: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOT_DATE, date);
  },

  getTotalGenerations(): number {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.TOTAL_GENERATIONS),
      0,
    );
  },

  incrementGenerations(): void {
    const count = this.getTotalGenerations();
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.TOTAL_GENERATIONS,
      JSON.stringify(count + 1),
    );
  },

  getMomentsSeen(): string[] {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.MOMENTS_SEEN),
      [],
    );
  },

  addMomentSeen(momentId: string): void {
    const seen = this.getMomentsSeen();
    if (!seen.includes(momentId)) {
      seen.push(momentId);
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MOMENTS_SEEN,
        JSON.stringify(seen),
      );
    }
  },

  hasMomentBeenSeen(momentId: string): boolean {
    return this.getMomentsSeen().includes(momentId);
  },
};

// User Identity
export const identityStorage = {
  getFarcasterUsername(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USERNAME);
  },

  setFarcasterUsername(username: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_USERNAME, username);
  },

  getFarcasterFid(): number | null {
    const fid = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_FID);
    return fid ? parseInt(fid, 10) : null;
  },

  setFarcasterFid(fid: number): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_FID, String(fid));
  },

  clearIdentity(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_USERNAME);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FARCASTER_FID);
  },
};

// Liked Entries
export const likedEntriesStorage = {
  getLikedEntries(): Set<string> {
    const liked = safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED_ENTRIES),
      [],
    );
    return new Set(liked);
  },

  saveLikedEntries(entries: Set<string>): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.LIKED_ENTRIES,
      JSON.stringify(Array.from(entries)),
    );
  },

  addLikedEntry(id: string): void {
    const liked = this.getLikedEntries();
    liked.add(id);
    this.saveLikedEntries(liked);
  },

  removeLikedEntry(id: string): void {
    const liked = this.getLikedEntries();
    liked.delete(id);
    this.saveLikedEntries(liked);
  },

  isLiked(id: string): boolean {
    return this.getLikedEntries().has(id);
  },
};

// Leaderboard Cache
export const cacheStorage = {
  getLeaderboardCache(): any | null {
    return safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.LEADERBOARD),
      null,
    );
  },

  saveLeaderboardCache(data: any): void {
    const cached = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.LEADERBOARD,
      JSON.stringify(cached),
    );
  },

  isCacheValid(maxAge: number = 3600000): boolean {
    // 1 hour default
    const cached = safeJsonParse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.LEADERBOARD),
      null,
    );
    if (!cached || !cached.timestamp) return false;
    return Date.now() - cached.timestamp < maxAge;
  },

  clearCache(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LEADERBOARD);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GALLERY_CACHE);
  },
};

// Bulk clear (for logout or hard reset)
export const clearAllStorage = (): void => {
  Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
