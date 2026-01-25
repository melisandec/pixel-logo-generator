/**
 * Centralized API client for all backend requests
 * Handles: leaderboard, gallery, badges, challenges, user stats, image operations
 */

import { LeaderboardEntry } from "@/types"; // or define inline if needed

interface FetchOptions extends RequestInit {
  skipErrorToast?: boolean;
}

// Helper function for API calls with error handling
async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipErrorToast, ...init } = options;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (!skipErrorToast) {
      console.error("API error:", error);
    }
    throw error;
  }
}

// Leaderboard endpoints
export const leaderboardAPI = {
  async getLeaderboard(
    sort: "score" | "recent" = "score",
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    return apiFetch(
      `/api/generated-logos?sort=${sort}&scope=recent&limit=${limit}`
    );
  },

  async getTopTodayWinners(limit: number = 3): Promise<LeaderboardEntry[]> {
    return apiFetch(`/api/winners?limit=${limit}&days=0`);
  },

  async getPastWeekWinners(limit: number = 50): Promise<LeaderboardEntry[]> {
    return apiFetch(`/api/winners?days=7&limit=${limit}`);
  },

  async likeEntry(id: string): Promise<{ likes: number }> {
    return apiFetch(`/api/leaderboard/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "like" }),
    });
  },

  async unlikeEntry(id: string): Promise<{ likes: number }> {
    return apiFetch(`/api/leaderboard/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "unlike" }),
    });
  },

  async trackView(id: string): Promise<void> {
    return apiFetch(`/api/leaderboard/${id}/view`, {
      method: "POST",
      skipErrorToast: true,
    });
  },
};

// Gallery/Logo endpoints
export const galleryAPI = {
  async getGallery(
    sort: "recent" | "trending" = "recent",
    limit: number = 200
  ): Promise<LeaderboardEntry[]> {
    return apiFetch(`/api/generated-logos?sort=${sort}&limit=${limit}`);
  },

  async getRandomLogo(): Promise<LeaderboardEntry | null> {
    try {
      return await apiFetch("/api/generated-logos/random");
    } catch {
      return null;
    }
  },

  async search(
    query: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    return apiFetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async createEntry(data: {
    text: string;
    seed: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    rarity?: string;
    presetKey?: string;
  }): Promise<LeaderboardEntry> {
    return apiFetch("/api/generated-logos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Image endpoints
export const imageAPI = {
  async uploadImage(data: {
    logoImageUrl?: string;
    cardImageUrl?: string;
    entryId?: string;
  }): Promise<{ imageUrl: string; id?: string }> {
    return apiFetch("/api/logo-image", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getImageUrl(id: string): Promise<{ url: string }> {
    return apiFetch(`/api/logo-image?id=${id}`);
  },
};

// User endpoints
export const userAPI = {
  async getUserStats(username: string): Promise<{
    username: string;
    rank?: string;
    support?: number;
    influence?: number;
    creation?: number;
    discovery?: number;
    totalPower?: number;
    bestRarity?: string;
  }> {
    return apiFetch(`/api/user-stats?username=${username}`);
  },

  async getUserProfile(username: string): Promise<{
    username: string;
    best: LeaderboardEntry | null;
    latest: LeaderboardEntry | null;
    entries: LeaderboardEntry[];
  }> {
    return apiFetch(`/api/user-profile?username=${username}`);
  },

  async getUserBadges(username: string): Promise<
    Array<{
      id: string;
      badgeType: string;
      earnedAt: string;
      metadata?: Record<string, unknown>;
    }>
  > {
    return apiFetch(`/api/user-badges?username=${username}`);
  },
};

// Badge endpoints
export const badgeAPI = {
  async awardBadge(data: {
    userId: string;
    badgeType: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean }> {
    return apiFetch("/api/badges", {
      method: "POST",
      body: JSON.stringify(data),
      skipErrorToast: true,
    });
  },
};

// Challenge endpoints
export const challengeAPI = {
  async trackChallenge(data: {
    userId: string;
    prompts: string[];
    completedAt: string;
  }): Promise<{ success: boolean; streak: number }> {
    return apiFetch("/api/challenges", {
      method: "POST",
      body: JSON.stringify(data),
      skipErrorToast: true,
    });
  },

  async getChallengeWinners(date: string): Promise<LeaderboardEntry[]> {
    return apiFetch(`/api/challenges/winners?date=${date}`);
  },
};

// Analytics endpoints
export const analyticsAPI = {
  async getTrendingData(days: number = 7): Promise<{
    mostUsedWords: Array<{ word: string; count: number }>;
    popularSeeds: Array<{ seed: number; count: number }>;
    rarityDistribution: Array<{ rarity: string; count: number }>;
  }> {
    return apiFetch(`/api/analytics/trending?days=${days}`, {
      skipErrorToast: true,
    });
  },

  async trackEvent(data: {
    userId?: string;
    eventType: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    return apiFetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify(data),
      skipErrorToast: true,
    });
  },
};

// Feedback endpoint
export const feedbackAPI = {
  async submitFeedback(data: {
    userId?: string;
    rating: number;
    message: string;
  }): Promise<{ success: boolean }> {
    return apiFetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify(data),
      skipErrorToast: true,
    });
  },
};

// Admin endpoints
export const adminAPI = {
  async healthCheck(): Promise<{ status: string }> {
    return apiFetch("/api/admin/health", {
      skipErrorToast: true,
    });
  },
};
