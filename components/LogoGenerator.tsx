"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import {
  generateLogo,
  type LogoConfig,
  type LogoResult,
  type Rarity,
} from "@/lib/logoGenerator";
import {
  getImageForContext,
  type ImageRenderContext,
} from "@/lib/imageContext";
import { sdk } from "@farcaster/miniapp-sdk";
import { EXTRA_BADGE_TYPES } from "@/lib/badgeTypes";
import dynamic from "next/dynamic";
import Toast from "./Toast";
import OnboardingWizard from "./OnboardingWizard";
import FeedbackModal from "./FeedbackModal";
import RewardAnimation from "./RewardAnimation";
import SearchBar from "./SearchBar";

const CastPreviewModal = dynamic(() => import("./CastPreviewModal"), {
  ssr: false,
  loading: () => null,
});

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface DailyLimitState {
  date: string;
  words: string[];
  seedUsed: boolean;
}

interface LogoHistoryItem {
  result: LogoResult;
  createdAt: number;
}

type LimitCheck =
  | { ok: true; normalizedText: string; todayState: DailyLimitState }
  | { ok: false; message: string };

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  imageUrl: string; // Legacy field
  logoImageUrl?: string; // Raw pixel logo
  cardImageUrl?: string; // Framed card
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  recasts?: number;
  rarity?: Rarity | string | null;
  presetKey?: string | null;
  createdAt: number | string;
  castUrl?: string;
  score?: number;
};

type UserProfile = {
  username: string;
  best: LeaderboardEntry | null;
  latest?: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
};

const buildWarpcastComposeUrl = (
  text: string,
  embeds?: string[],
  channelKey?: string,
  parentCastHash?: string,
) => {
  const params = new URLSearchParams();
  params.set("text", text);
  (embeds ?? [])
    .slice(0, 2)
    .forEach((embed) => params.append("embeds[]", embed));
  if (channelKey) params.set("channelKey", channelKey);
  if (parentCastHash) params.set("parentCastHash", parentCastHash);
  return `https://warpcast.com/~/compose?${params.toString()}`;
};

const TRIES_PER_DAY = 3;
const BONUS_TRIES_FOR_MASTER = 1;
const RANDOM_WORDS = [
  "Arcade",
  "Pixel",
  "Forge",
  "Neon",
  "Crt",
  "Quest",
  "Byte",
  "Retro",
  "Glitch",
  "Tron",
  "Blade Runner",
  "Alien",
  "Predator",
  "The Matrix",
  "Dune",
  "Star Trek",
  "Doctor Who",
  "The Expanse",
  "Battlestar",
  "Neon Genesis",
  "Asteroids",
  "Galaga",
  "Centipede",
  "Tempest",
  "Defender",
  "Gauntlet",
  "Frogger",
  "Dig Dug",
  "Pac-Man",
  "Space Invaders",
  "Metroid",
  "Mega Man",
  "Contra",
  "OutRun",
  "Robotron",
  "Qbert",
  "Arkanoid",
  "Bubble Bobble",
  "R-Type",
  "Gradius",
  "Tekken",
  "Street Fighter",
  "Mortal Kombat",
  "Double Dragon",
  "Golden Axe",
  "After Burner",
  "Ms Pac-Man",
  "Star Wars",
  "The Fifth Element",
  "Terminator",
  "RoboCop",
  "Akira",
  "Ghost in the Shell",
  "Cowboy Bebop",
  "Firefly",
  "Stargate",
  "X-Files",
  "Westworld",
  "Black Mirror",
  "Altered Carbon",
  "Apple",
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Nvidia",
  "Intel",
  "AMD",
  "Samsung",
  "Sony",
  "Tesla",
  "OpenAI",
  "IBM",
  "Oracle",
  "Bitcoin",
  "Ethereum",
  "Solana",
  "Cardano",
  "Polkadot",
  "Litecoin",
  "Dogecoin",
  "Shiba Inu",
  "Avalanche",
  "Chainlink",
  "Uniswap",
  "Tether",
  "USD Coin",
  "Ripple",
  "Stellar",
  "Monero",
  "Aave",
  "Cosmos",
  "Algorand",
  "Polygon",
  "Toncoin",
  "NEAR",
  "Filecoin",
  "Arbitrum",
];
const PRESETS: Array<{
  key: string;
  label: string;
  config: Partial<LogoConfig>;
}> = [
  {
    key: "arcade",
    label: "Arcade",
    config: {
      backgroundStyle: "crt-scanlines",
      frameStyle: "arcade-bezel",
      colorSystem: "Classic",
      compositionMode: "centered",
    },
  },
  {
    key: "vaporwave",
    label: "Vaporwave",
    config: {
      backgroundStyle: "vaporwave-sky",
      frameStyle: "trading-card",
      colorSystem: "Vaporwave",
      compositionMode: "vertical-stacked",
    },
  },
  {
    key: "gameboy",
    label: "Game Boy",
    config: {
      backgroundStyle: "grid-horizon",
      frameStyle: "none",
      colorSystem: "GameBoy",
      compositionMode: "centered",
    },
  },
];
const RARITY_OPTIONS: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const PRESET_SWATCHES: Record<string, string[]> = {
  arcade: ["#00ff00", "#ff00ff", "#ffff00"],
  vaporwave: ["#ff006e", "#8338ec", "#3a86ff"],
  gameboy: ["#0f380f", "#306230", "#9bbc0f"],
};
const ALL_CHALLENGE_PROMPTS = [
  { name: "Nike", description: "Generate a logo for Nike" },
  { name: "Adidas", description: "Generate a logo for Adidas" },
  { name: "Apple", description: "Generate a logo for Apple" },
  { name: "Tesla", description: "Generate a logo for Tesla" },
  { name: "Gucci", description: "Generate a logo for Gucci" },
  { name: "Spotify", description: "Generate a logo for Spotify" },
  { name: "Meta", description: "Generate a logo for Meta" },
  { name: "Sony", description: "Generate a logo for Sony" },
  { name: "Uber", description: "Generate a logo for Uber" },
  { name: "BMW", description: "Generate a logo for BMW" },
  { name: "Dior", description: "Generate a logo for Dior" },
  { name: "Amazon", description: "Generate a logo for Amazon" },
  { name: "Nintendo", description: "Generate a logo for Nintendo" },
];

const DAILY_PROMPTS = [
  "Meta",
  "Sony",
  "Uber",
  "BMW",
  "Dior",
  "Amazon",
  "Nintendo",
];

export default function LogoGenerator() {
  const [inputText, setInputText] = useState("");
  const [customSeed, setCustomSeed] = useState<string>("");
  const [seedError, setSeedError] = useState<string>("");
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [userInfo, setUserInfo] = useState<{
    fid?: number;
    username?: string;
  } | null>(null);
  const [showCastPreview, setShowCastPreview] = useState(false);
  const [showDailyBoot, setShowDailyBoot] = useState(false);
  const [activeMoment, setActiveMoment] = useState<{
    id: string;
    icon: string;
    title: string;
    subtitle: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [seedCrackValue, setSeedCrackValue] = useState<string | null>(null);
  const [seedCrackStage, setSeedCrackStage] = useState<
    | "dormant"
    | "stress"
    | "crawl-1"
    | "crawl-2"
    | "fissure"
    | "swell"
    | "shake"
    | "pause"
    | "bloom"
    | "ticket"
    | null
  >(null);
  const [seedCrackRarity, setSeedCrackRarity] = useState<Rarity | null>(null);
  const [seedCrackVariance, setSeedCrackVariance] = useState<{
    shakeAmp: number;
    crackOffset: number;
    glowHue: number;
    bloomAngle: number;
  } | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [castPreviewImage, setCastPreviewImage] = useState<string | null>(null);
  const [castPreviewText, setCastPreviewText] = useState<string>("");
  const [castDraftText, setCastDraftText] = useState<string>("");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [castTarget, setCastTarget] = useState<LogoResult | null>(null);
  const [castTargetRemixSeed, setCastTargetRemixSeed] = useState<
    number | undefined
  >(undefined);
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<LogoHistoryItem[]>([]);
  const [remixMode, setRemixMode] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardSort, setLeaderboardSort] = useState<
    "score" | "recent" | "likes"
  >("score");
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [galleryEntries, setGalleryEntries] = useState<LeaderboardEntry[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryRarityFilter, setGalleryRarityFilter] = useState<string>("all");
  const [galleryPresetFilter, setGalleryPresetFilter] = useState<string>("all");
  const [galleryPage, setGalleryPage] = useState(1);
  const [likedEntryIds, setLikedEntryIds] = useState<Set<string>>(new Set());
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [hasNewGallery, setHasNewGallery] = useState(false);
  const [hasNewProfile, setHasNewProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "home" | "gallery" | "leaderboard" | "challenge" | "profile"
  >("home");
  const [miniappAdded, setMiniappAdded] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitState>({
    date: "",
    words: [],
    seedUsed: false,
  });
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const initRef = useRef(false);

  // NEW UX ENHANCEMENT STATES
  const [uiMode, setUiMode] = useState<"simple" | "advanced">("simple");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState<{
    type: "rarity-master" | "forge-rank" | "level-up" | "achievement";
    title: string;
    subtitle?: string;
  } | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [challengeDone, setChallengeDone] = useState<Record<string, boolean>>(
    {},
  );
  const [challengeDays, setChallengeDays] = useState<string[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<
    (typeof ALL_CHALLENGE_PROMPTS)[number][]
  >([]);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [challengeHistory, setChallengeHistory] = useState<
    Array<{ date: string; completed: boolean }>
  >([]);
  const [userBadges, setUserBadges] = useState<
    Array<{
      badgeType: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      earnedAt: string;
    }>
  >([]);
  const [dailyWinners, setDailyWinners] = useState<
    Array<{
      rank: number;
      username: string;
      displayName: string;
      entry: LeaderboardEntry;
    }>
  >([]);
  const [pastWinners, setPastWinners] = useState<
    Array<{ date: string; winners: Array<{ rank: number } & LeaderboardEntry> }>
  >([]);
  const getTodayKey = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getDayKeyFromTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const normalizeWord = useCallback(
    (value: string) => value.trim().toLowerCase(),
    [],
  );

  const getPromptOfDay = useCallback(() => {
    const dayKey = getTodayKey();
    let hash = 0;
    for (let i = 0; i < dayKey.length; i += 1) {
      hash = (hash * 31 + dayKey.charCodeAt(i)) % DAILY_PROMPTS.length;
    }
    return DAILY_PROMPTS[hash];
  }, [getTodayKey]);

  const getDailyChallenges = useCallback(() => {
    const dayKey = getTodayKey();
    // Use day key to deterministically select 6 challenges for today
    let hash = 0;
    for (let i = 0; i < dayKey.length; i += 1) {
      hash = (hash * 31 + dayKey.charCodeAt(i)) % ALL_CHALLENGE_PROMPTS.length;
    }

    // Select 6 challenges starting from the hash position, wrapping around if needed
    const challenges: (typeof ALL_CHALLENGE_PROMPTS)[number][] = [];
    for (let i = 0; i < 6; i += 1) {
      const index = (hash + i) % ALL_CHALLENGE_PROMPTS.length;
      challenges.push(ALL_CHALLENGE_PROMPTS[index]);
    }

    return challenges;
  }, [getTodayKey]);

  const getChallengeStreak = useCallback(
    (days: string[]) => {
      if (days.length === 0) return 0;
      const set = new Set(days);
      let count = 0;
      let cursor = new Date();
      while (true) {
        const key = getDayKeyFromTimestamp(cursor.getTime());
        if (!set.has(key)) break;
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    },
    [getDayKeyFromTimestamp],
  );

  const calculateTimeUntilReset = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const loadChallengeHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:challengeHistory");
      if (!stored) return;
      const parsed = JSON.parse(stored) as Array<{
        date: string;
        completed: boolean;
      }>;
      if (Array.isArray(parsed)) {
        // Show last 7 days
        const last7Days = parsed.slice(-7);
        setChallengeHistory(last7Days);
      }
    } catch (error) {
      console.error("Failed to read challenge history:", error);
    }
  }, []);

  const saveChallengeHistory = useCallback(
    (date: string, completed: boolean) => {
      try {
        const stored = localStorage.getItem("plf:challengeHistory");
        const history = stored
          ? (JSON.parse(stored) as Array<{ date: string; completed: boolean }>)
          : [];
        const updated = [
          ...history.filter((item) => item.date !== date),
          { date, completed },
        ]
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30); // Keep last 30 days
        localStorage.setItem("plf:challengeHistory", JSON.stringify(updated));
        loadChallengeHistory();
      } catch (error) {
        console.error("Failed to store challenge history:", error);
      }
    },
    [loadChallengeHistory],
  );

  const formatHistoryTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const runWhenIdle = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return;
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => callback());
      return;
    }
    setTimeout(() => callback(), 200);
  }, []);

  const seedCrackTimerRef = useRef<number | null>(null);
  const seedCrackTimeoutsRef = useRef<number[]>([]);

  const clearSeedCrackSequence = useCallback(() => {
    if (seedCrackTimerRef.current) {
      window.clearInterval(seedCrackTimerRef.current);
      seedCrackTimerRef.current = null;
    }
    seedCrackTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    seedCrackTimeoutsRef.current = [];
    setSeedCrackStage(null);
    setSeedCrackValue(null);
    setSeedCrackRarity(null);
  }, []);

  const saveLeaderboard = useCallback((items: LeaderboardEntry[]) => {
    try {
      localStorage.setItem("plf:leaderboard", JSON.stringify(items));
    } catch (error) {
      console.error("Failed to store leaderboard:", error);
    }
  }, []);

  const getSeenTimestamp = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return 0;
      const parsed = Number.parseInt(stored, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    } catch (error) {
      console.error("Failed to read seen timestamp:", error);
      return 0;
    }
  }, []);

  const setSeenTimestamp = useCallback((key: string, value: number) => {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      console.error("Failed to store seen timestamp:", error);
    }
  }, []);

  const loadMiniappAdded = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:miniappAdded");
      if (stored) {
        setMiniappAdded(stored === "true");
      }
    } catch (error) {
      console.error("Failed to read mini app status:", error);
    }
  }, []);

  const saveMiniappAdded = useCallback((value: boolean) => {
    try {
      localStorage.setItem("plf:miniappAdded", value ? "true" : "false");
    } catch (error) {
      console.error("Failed to store mini app status:", error);
    }
  }, []);

  const loadAutoReplySetting = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:autoReply");
      if (stored) {
        setAutoReplyEnabled(stored === "true");
      }
    } catch (error) {
      console.error("Failed to read auto reply setting:", error);
    }
  }, []);

  const saveAutoReplySetting = useCallback((value: boolean) => {
    try {
      localStorage.setItem("plf:autoReply", value ? "true" : "false");
    } catch (error) {
      console.error("Failed to store auto reply setting:", error);
    }
  }, []);

  const loadLikedEntries = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:likedEntries");
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setLikedEntryIds(new Set(parsed));
      }
    } catch (error) {
      console.error("Failed to read liked entries:", error);
    }
  }, []);

  const saveLikedEntries = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(
        "plf:likedEntries",
        JSON.stringify(Array.from(next)),
      );
    } catch (error) {
      console.error("Failed to store liked entries:", error);
    }
  }, []);

  const normalizeLeaderboardEntries = useCallback(
    (entries: LeaderboardEntry[]) => {
      const normalized = entries.map((item) => {
        const castUrl =
          item.castUrl ??
          (item.id && /^0x[a-fA-F0-9]{64}$/.test(item.id)
            ? `https://warpcast.com/~/cast/${item.id}`
            : undefined);
        const createdAtValue =
          typeof item.createdAt === "string"
            ? new Date(item.createdAt).getTime()
            : item.createdAt;
        return {
          ...item,
          castUrl,
          recasts: item.recasts ?? 0,
          createdAt: createdAtValue,
        };
      });

      const byKey = new Map<string, LeaderboardEntry>();
      normalized.forEach((entry) => {
        const dedupeKey =
          entry.castUrl ??
          entry.id ??
          `${entry.username}-${entry.text}-${entry.seed}`;
        const existing = byKey.get(dedupeKey);
        if (!existing) {
          byKey.set(dedupeKey, entry);
          return;
        }
        const existingScore = existing.likes + (existing.recasts ?? 0) * 2;
        const entryScore = entry.likes + (entry.recasts ?? 0) * 2;
        if (entryScore > existingScore) {
          byKey.set(dedupeKey, entry);
          return;
        }
        if (entryScore === existingScore) {
          const existingCreated =
            typeof existing.createdAt === "string"
              ? new Date(existing.createdAt).getTime()
              : existing.createdAt;
          const entryCreated =
            typeof entry.createdAt === "string"
              ? new Date(entry.createdAt).getTime()
              : entry.createdAt;
          if (entryCreated > existingCreated) {
            byKey.set(dedupeKey, entry);
          }
        }
      });

      return Array.from(byKey.values());
    },
    [],
  );

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?scope=global`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = (await response.json()) as { entries?: LeaderboardEntry[] };
      if (Array.isArray(data.entries)) {
        const normalized = normalizeLeaderboardEntries(data.entries);
        setLeaderboard(normalized);
        saveLeaderboard(normalized);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }

    try {
      const stored = localStorage.getItem("plf:leaderboard");
      if (!stored) return;
      const parsed = JSON.parse(stored) as LeaderboardEntry[];
      if (Array.isArray(parsed)) {
        const todayKey = getTodayKey();
        const normalized = normalizeLeaderboardEntries(
          parsed.filter((item) => {
            const createdAtValue =
              typeof item.createdAt === "string"
                ? new Date(item.createdAt).getTime()
                : item.createdAt;
            return getDayKeyFromTimestamp(createdAtValue) === todayKey;
          }),
        );
        setLeaderboard(normalized);
        saveLeaderboard(normalized);
      }
    } catch (error) {
      console.error("Failed to read leaderboard:", error);
    }
  }, [
    getDayKeyFromTimestamp,
    getTodayKey,
    normalizeLeaderboardEntries,
    saveLeaderboard,
  ]);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const response = await fetch(`/api/leaderboard?scope=recent&limit=80`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }
      const data = (await response.json()) as { entries?: LeaderboardEntry[] };
      if (Array.isArray(data.entries)) {
        const normalized = normalizeLeaderboardEntries(data.entries);
        setGalleryEntries(normalized);
        const latestCreatedAt = normalized.reduce((max, entry) => {
          const createdAtValue =
            typeof entry.createdAt === "string"
              ? new Date(entry.createdAt).getTime()
              : entry.createdAt;
          return Math.max(max, createdAtValue);
        }, 0);
        if (latestCreatedAt > 0) {
          const seenAt = getSeenTimestamp("plf:gallerySeenAt");
          if (latestCreatedAt > seenAt && activeTab !== "gallery") {
            setHasNewGallery(true);
          }
        }
        return;
      }
      setGalleryEntries([]);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
      setGalleryError("Failed to load gallery.");
    } finally {
      setGalleryLoading(false);
    }
  }, [activeTab, getSeenTimestamp, normalizeLeaderboardEntries]);

  const loadProfileData = useCallback(
    async (username: string) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(username.toLowerCase())}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }
        const data = (await response.json()) as UserProfile;
        setProfileData(data);
        const latestEntry =
          data.latest ??
          data.entries.reduce<LeaderboardEntry | null>((latest, entry) => {
            if (!latest) return entry;
            const latestCreated =
              typeof latest.createdAt === "string"
                ? new Date(latest.createdAt).getTime()
                : latest.createdAt;
            const entryCreated =
              typeof entry.createdAt === "string"
                ? new Date(entry.createdAt).getTime()
                : entry.createdAt;
            return entryCreated > latestCreated ? entry : latest;
          }, null);
        if (latestEntry) {
          const latestCreated =
            typeof latestEntry.createdAt === "string"
              ? new Date(latestEntry.createdAt).getTime()
              : latestEntry.createdAt;
          const seenAt = getSeenTimestamp("plf:profileSeenAt");
          if (latestCreated > seenAt && activeTab !== "profile") {
            setHasNewProfile(true);
          }
        }
      } catch (error) {
        console.error("Profile load error:", error);
        setProfileError("Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    },
    [activeTab, getSeenTimestamp],
  );

  const loadChallenge = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:challenge");
      if (!stored) return;
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      setChallengeDone(parsed || {});
    } catch (error) {
      console.error("Failed to read challenge progress:", error);
    }
  }, []);

  const saveChallenge = useCallback((next: Record<string, boolean>) => {
    try {
      localStorage.setItem("plf:challenge", JSON.stringify(next));
    } catch (error) {
      console.error("Failed to store challenge progress:", error);
    }
  }, []);

  const loadChallengeDays = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:challengeDays");
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setChallengeDays(parsed);
      }
    } catch (error) {
      console.error("Failed to read challenge days:", error);
    }
  }, []);

  const loadUserBadges = useCallback(async (username: string) => {
    try {
      const response = await fetch(
        `/api/badges?username=${encodeURIComponent(username)}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.badges)) {
        setUserBadges(data.badges);
      }
    } catch (error) {
      console.error("Failed to load badges:", error);
    }
  }, []);

  useEffect(() => {
    if (userInfo?.username) {
      loadUserBadges(userInfo.username);
    }
  }, [userInfo?.username, loadUserBadges]);

  const hasBadge = useCallback(
    (badgeType: string) => {
      return userBadges.some((b) => String(b.badgeType) === String(badgeType));
    },
    [userBadges],
  );

  const loadDailyWinners = useCallback(async () => {
    try {
      const response = await fetch("/api/winners");
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.winners)) {
        setDailyWinners(data.winners);
      }
    } catch (error) {
      console.error("Failed to load daily winners:", error);
    }
  }, []);

  const loadPastWinners = useCallback(async () => {
    try {
      const response = await fetch("/api/winners?days=7");
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.pastWinners)) {
        setPastWinners(data.pastWinners);
      }
    } catch (error) {
      console.error("Failed to load past winners:", error);
    }
  }, []);

  const saveChallengeDays = useCallback((days: string[]) => {
    try {
      localStorage.setItem("plf:challengeDays", JSON.stringify(days));
    } catch (error) {
      console.error("Failed to store challenge days:", error);
    }
  }, []);

  const saveDailyLimit = useCallback((state: DailyLimitState) => {
    try {
      localStorage.setItem("plf:dailyLimit", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to store daily limit:", error);
    }
  }, []);

  const ensureDailyLimit = useCallback(() => {
    const today = getTodayKey();
    try {
      const stored = localStorage.getItem("plf:dailyLimit");
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<DailyLimitState>;
        if (parsed.date === today) {
          const hydrated = {
            date: parsed.date ?? today,
            words: parsed.words ?? [],
            seedUsed: parsed.seedUsed ?? false,
          };
          setDailyLimit(hydrated);
          return hydrated;
        }
      }
    } catch (error) {
      console.error("Failed to read daily limit:", error);
    }

    const reset = { date: today, words: [], seedUsed: false };
    setDailyLimit(reset);
    saveDailyLimit(reset);
    return reset;
  }, [getTodayKey, saveDailyLimit]);

  const saveHistory = useCallback((items: LogoHistoryItem[]) => {
    try {
      localStorage.setItem("plf:history", JSON.stringify(items));
    } catch (error) {
      console.error("Failed to store history:", error);
    }
  }, []);

  const saveFavorites = useCallback((items: LogoHistoryItem[]) => {
    try {
      localStorage.setItem("plf:favorites", JSON.stringify(items));
    } catch (error) {
      console.error("Failed to store favorites:", error);
    }
  }, []);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:history");
      if (!stored) return;
      const parsed = JSON.parse(stored) as LogoHistoryItem[];
      if (Array.isArray(parsed)) {
        setLogoHistory(parsed.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to read history:", error);
    }
  }, []);

  const loadFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:favorites");
      if (!stored) return;
      const parsed = JSON.parse(stored) as LogoHistoryItem[];
      if (Array.isArray(parsed)) {
        setFavorites(parsed);
      }
    } catch (error) {
      console.error("Failed to read favorites:", error);
    }
  }, []);

  const addToHistory = useCallback(
    (result: LogoResult) => {
      setLogoHistory((prev) => {
        const next = [
          { result, createdAt: Date.now() },
          ...prev.filter(
            (item) =>
              item.result.seed !== result.seed ||
              item.result.config.text !== result.config.text,
          ),
        ];
        const trimmed = next.slice(0, 5);
        saveHistory(trimmed);
        return trimmed;
      });
    },
    [saveHistory],
  );

  const toggleFavorite = (result: LogoResult) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (item) =>
          item.result.seed === result.seed &&
          item.result.config.text === result.config.text,
      );
      if (exists) {
        const next = prev.filter(
          (item) =>
            item.result.seed !== result.seed ||
            item.result.config.text !== result.config.text,
        );
        saveFavorites(next);
        return next;
      }
      const next = [{ result, createdAt: Date.now() }, ...prev].slice(0, 20);
      saveFavorites(next);
      return next;
    });
  };

  const isFavorite = (result: LogoResult | null) => {
    if (!result) return false;
    return favorites.some(
      (item) =>
        item.result.seed === result.seed &&
        item.result.config.text === result.config.text,
    );
  };

  const addToLeaderboard = useCallback(
    async (entry: LeaderboardEntry) => {
      try {
        const response = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (!response.ok) {
          throw new Error("Failed to save leaderboard entry");
        }
        const data = (await response.json()) as {
          entries?: LeaderboardEntry[];
        };
        if (Array.isArray(data.entries)) {
          const normalized = normalizeLeaderboardEntries(data.entries);
          setLeaderboard(normalized);
          saveLeaderboard(normalized);
          return;
        }
      } catch (error) {
        console.error("Failed to save leaderboard entry:", error);
      }

      const todayKey = getTodayKey();
      setLeaderboard((prev) => {
        const merged = [entry, ...prev].filter((item) => {
          const createdAtValue =
            typeof item.createdAt === "string"
              ? new Date(item.createdAt).getTime()
              : item.createdAt;
          return getDayKeyFromTimestamp(createdAtValue) === todayKey;
        });
        const trimmed = merged.slice(0, 25);
        saveLeaderboard(trimmed);
        return trimmed;
      });
    },
    [
      getDayKeyFromTimestamp,
      getTodayKey,
      normalizeLeaderboardEntries,
      saveLeaderboard,
    ],
  );

  const toggleLeaderboardLike = useCallback(
    async (entryId: string) => {
      const isLiked = likedEntryIds.has(entryId);
      const delta = isLiked ? -1 : 1;
      const nextLiked = new Set(likedEntryIds);
      if (isLiked) {
        nextLiked.delete(entryId);
      } else {
        nextLiked.add(entryId);
      }
      setLikedEntryIds(nextLiked);
      saveLikedEntries(nextLiked);
      try {
        const response = await fetch("/api/leaderboard", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: entryId, delta }),
        });
        if (!response.ok) {
          throw new Error("Failed to update like");
        }
        const data = (await response.json()) as {
          entries?: LeaderboardEntry[];
          entry?: LeaderboardEntry;
        };
        if (Array.isArray(data.entries)) {
          const normalized = normalizeLeaderboardEntries(data.entries);
          setLeaderboard(normalized);
          saveLeaderboard(normalized);
          return;
        }
        if (data.entry) {
          setLeaderboard((prev) => {
            const next = prev.map((item) =>
              item.id === entryId ? data.entry! : item,
            );
            saveLeaderboard(next);
            return next;
          });
          return;
        }
      } catch (error) {
        console.error("Failed to update like:", error);
      }

      setLeaderboard((prev) => {
        const next = prev.map((item) =>
          item.id === entryId
            ? { ...item, likes: Math.max(0, item.likes + delta) }
            : item,
        );
        saveLeaderboard(next);
        return next;
      });
    },
    [
      likedEntryIds,
      normalizeLeaderboardEntries,
      saveLeaderboard,
      saveLikedEntries,
    ],
  );

  const toggleChallengeDone = useCallback(
    (prompt: string) => {
      setChallengeDone((prev) => {
        const next = { ...prev, [prompt]: !prev[prompt] };
        saveChallenge(next);
        // Get current daily challenges to check completion
        const todayChallenges = getDailyChallenges();
        const allDone =
          todayChallenges.length > 0 &&
          todayChallenges.every(
            (item: (typeof ALL_CHALLENGE_PROMPTS)[number]) => next[item.name],
          );
        if (allDone) {
          const todayKey = getTodayKey();
          setChallengeDays((daysPrev) => {
            if (daysPrev.includes(todayKey)) return daysPrev;
            const updated = [...daysPrev, todayKey];
            saveChallengeDays(updated);

            // Award daily champion badge
            if (userInfo?.username) {
              try {
                fetch("/api/badges", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: userInfo.username,
                    badgeType: "daily_champion",
                  }),
                }).catch(() => {});
              } catch (error) {
                console.error("Failed to award badge:", error);
              }
            }

            // Save to challenge history
            saveChallengeHistory(todayKey, true);

            return updated;
          });
        } else {
          // Update history even if not complete
          const todayKey = getTodayKey();
          const completedCount = Object.values(next).filter(Boolean).length;
          const todayChallenges = getDailyChallenges();
          saveChallengeHistory(
            todayKey,
            completedCount === todayChallenges.length,
          );
        }
        return next;
      });
    },
    [
      getTodayKey,
      getDailyChallenges,
      saveChallenge,
      saveChallengeDays,
      saveChallengeHistory,
      userInfo?.username,
    ],
  );

  const getPresetConfig = useCallback((presetKey?: string | null) => {
    if (!presetKey) return undefined;
    return PRESETS.find((preset) => preset.key === presetKey)?.config;
  }, []);

  const checkDailyLimits = useCallback(
    (text: string, seedProvided: boolean): LimitCheck => {
      const normalizedText = normalizeWord(text);
      const todayState = ensureDailyLimit();
      const isUnlimitedUser = userInfo?.username?.toLowerCase() === "ladymel";
      if (isUnlimitedUser) {
        return { ok: true, normalizedText, todayState };
      }
      const effectiveTries =
        TRIES_PER_DAY +
        (hasBadge(EXTRA_BADGE_TYPES.RARITY_MASTER)
          ? BONUS_TRIES_FOR_MASTER
          : 0);
      if (todayState.words.includes(normalizedText)) {
        return {
          ok: false,
          message:
            "You already tried this word today. Please wait until tomorrow.",
        };
      }
      if (todayState.words.length >= effectiveTries) {
        return {
          ok: false,
          message: "Daily limit reached. Please wait until tomorrow.",
        };
      }
      if (seedProvided && todayState.seedUsed) {
        return {
          ok: false,
          message: "Seed already used today. Please wait until tomorrow.",
        };
      }
      return { ok: true, normalizedText, todayState };
    },
    [ensureDailyLimit, normalizeWord, userInfo?.username, hasBadge],
  );

  const finalizeDailyLimit = useCallback(
    (
      normalizedText: string,
      todayState: DailyLimitState,
      seedProvided: boolean,
    ) => {
      const isUnlimitedUser = userInfo?.username?.toLowerCase() === "ladymel";
      if (isUnlimitedUser) return;
      const nextLimit = {
        ...todayState,
        words: [...todayState.words, normalizedText],
        seedUsed: todayState.seedUsed || seedProvided,
      };
      setDailyLimit(nextLimit);
      saveDailyLimit(nextLimit);
    },
    [saveDailyLimit, userInfo?.username],
  );

  const createLogoResult = useCallback(
    (text: string, seed?: number, presetKey?: string | null) => {
      const presetConfig = getPresetConfig(presetKey);
      return generateLogo({
        text,
        seed,
        ...presetConfig,
      });
    },
    [getPresetConfig],
  );

  const getProfileTitle = useCallback(
    (casts: number, legendaryCount: number, streak: number) => {
      if (legendaryCount >= 3) return "Legend Hunter";
      if (casts >= 20 || streak >= 5) return "Master Crafter";
      return "Pixel Forger";
    },
    [],
  );

  const dismissDailyBoot = useCallback(() => {
    setShowDailyBoot(false);
    try {
      localStorage.setItem("plf:bootDate", getTodayKey());
    } catch (error) {
      console.error("Failed to store boot state:", error);
    }
  }, [getTodayKey]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }, []);

  const createSeededRandom = useCallback((seed: number) => {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    };
  }, []);

  const getRarityGain = useCallback((rarity?: Rarity | null) => {
    if (rarity === "LEGENDARY") return 1.35;
    if (rarity === "EPIC") return 1.18;
    if (rarity === "RARE") return 1.08;
    return 1;
  }, []);

  const playCrackSound = useCallback(
    (params: { seed?: number; rarity?: Rarity | null }) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const now = ctx.currentTime;
      const seed = params.seed ?? Math.floor((performance.now() % 1e6) * 1000);
      const rand = createSeededRandom(seed ^ 0x9e3779b9);
      const rarityGain = getRarityGain(params.rarity) * 0.9;

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.8 * rarityGain, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      master.connect(ctx.destination);

      const pan = ctx.createStereoPanner();
      pan.pan.value = (rand() * 2 - 1) * 0.25;
      pan.connect(master);

      const crackBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.08,
        ctx.sampleRate,
      );
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackData.length; i += 1) {
        const t = i / crackData.length;
        const decay = 1 - t;
        crackData[i] = (rand() * 2 - 1) * decay * Math.pow(1 - t, 1.25);
      }
      const crack = ctx.createBufferSource();
      crack.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "highpass";
      crackFilter.frequency.value = 900 + rand() * 600;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.14 * rarityGain, now);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(pan);
      crack.start(now);
      crack.stop(now + 0.22);

      const thump = ctx.createOscillator();
      thump.type = "triangle";
      thump.frequency.setValueAtTime(140 + rand() * 40, now);
      thump.frequency.exponentialRampToValueAtTime(
        60 + rand() * 18,
        now + 0.34,
      );
      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.18 * rarityGain, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      thump.connect(thumpGain);
      thumpGain.connect(master);
      thump.start(now);
      thump.stop(now + 0.38);

      const debrisBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.18,
        ctx.sampleRate,
      );
      const debrisData = debrisBuffer.getChannelData(0);
      for (let i = 0; i < debrisData.length; i += 1) {
        const t = i / debrisData.length;
        const decay = Math.pow(1 - t, 1.6);
        debrisData[i] = (rand() * 2 - 1) * decay * 0.9;
      }
      const debris = ctx.createBufferSource();
      debris.buffer = debrisBuffer;
      const debrisFilter = ctx.createBiquadFilter();
      debrisFilter.type = "bandpass";
      debrisFilter.frequency.value = 3800 + rand() * 1600;
      debrisFilter.Q.value = 3.2;
      const debrisGain = ctx.createGain();
      debrisGain.gain.setValueAtTime(0.08 * rarityGain, now + 0.02);
      debrisGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      debris.connect(debrisFilter);
      debrisFilter.connect(debrisGain);
      debrisGain.connect(pan);
      debris.start(now + 0.02);
      debris.stop(now + 0.3);

      const shard = ctx.createOscillator();
      shard.type = "sine";
      shard.frequency.setValueAtTime(780 + rand() * 220, now + 0.02);
      shard.frequency.exponentialRampToValueAtTime(
        320 + rand() * 60,
        now + 0.18,
      );
      const shardGain = ctx.createGain();
      shardGain.gain.setValueAtTime(0.06 * rarityGain, now + 0.02);
      shardGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      shard.connect(shardGain);
      shardGain.connect(master);
      shard.start(now + 0.02);
      shard.stop(now + 0.27);
    },
    [createSeededRandom, getAudioContext, getRarityGain, soundEnabled],
  );

  const playBloomSound = useCallback(
    (params: { seed?: number; rarity?: Rarity | null }) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const seed =
        params.seed ?? Math.floor((performance.now() % 1e6) * 1000 + 17);
      const rand = createSeededRandom(seed ^ 0x85ebca6b);
      const rarityGain = getRarityGain(params.rarity);
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.55 * rarityGain, now + 0.04);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      master.connect(ctx.destination);

      const pad = ctx.createOscillator();
      pad.type = "sawtooth";
      pad.frequency.setValueAtTime(260 + rand() * 40, now);
      pad.frequency.exponentialRampToValueAtTime(140 + rand() * 30, now + 0.5);
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.12 * rarityGain, now);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
      pad.connect(padGain);
      padGain.connect(master);
      pad.start(now);
      pad.stop(now + 0.54);

      const shimmer = ctx.createOscillator();
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(880 + rand() * 120, now + 0.08);
      shimmer.frequency.exponentialRampToValueAtTime(
        620 + rand() * 60,
        now + 0.34,
      );
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.05 * rarityGain, now + 0.08);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start(now + 0.08);
      shimmer.stop(now + 0.42);

      const airBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.25,
        ctx.sampleRate,
      );
      const airData = airBuffer.getChannelData(0);
      for (let i = 0; i < airData.length; i += 1) {
        const t = i / airData.length;
        const decay = Math.pow(1 - t, 1.4);
        airData[i] = (rand() * 2 - 1) * decay * 0.5;
      }
      const air = ctx.createBufferSource();
      air.buffer = airBuffer;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = "highpass";
      airFilter.frequency.value = 1800 + rand() * 400;
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.04 * rarityGain, now + 0.02);
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      air.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(master);
      air.start(now + 0.02);
      air.stop(now + 0.5);
    },
    [createSeededRandom, getAudioContext, getRarityGain, soundEnabled],
  );

  const playTicketSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [getAudioContext, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("plf:sound", next ? "on" : "off");
      } catch (error) {
        console.error("Failed to store sound preference:", error);
      }
      return next;
    });
  }, []);

  const startSeedCrackSequence = useCallback(
    (result: LogoResult, onComplete: () => void) => {
      clearSeedCrackSequence();
      setSeedCrackStage("dormant");
      setSeedCrackRarity(result.rarity);
      setSeedCrackValue("—");
      const rarityMultiplier =
        result.rarity === "LEGENDARY"
          ? 1.6
          : result.rarity === "EPIC"
            ? 1.35
            : result.rarity === "RARE"
              ? 1.2
              : 1;
      setSeedCrackVariance({
        shakeAmp: 2 * (1 + (Math.random() * 0.2 - 0.1)) * rarityMultiplier,
        crackOffset: Math.random() * 2 - 1,
        glowHue: Math.random() * 10 - 5,
        bloomAngle:
          28 +
          (Math.random() * 6 - 3) +
          (result.rarity === "LEGENDARY" ? 4 : 0),
      });
      if (seedCrackTimerRef.current) {
        window.clearInterval(seedCrackTimerRef.current);
        seedCrackTimerRef.current = null;
      }

      const pacingMultiplier =
        (result.rarity === "LEGENDARY"
          ? 1.35
          : result.rarity === "EPIC"
            ? 1.15
            : 1) * 1.15;
      const scheduleStage = (delay: number, stage: typeof seedCrackStage) => {
        seedCrackTimeoutsRef.current.push(
          window.setTimeout(
            () => setSeedCrackStage(stage),
            delay * pacingMultiplier,
          ),
        );
      };
      scheduleStage(250, "stress");
      scheduleStage(550, "crawl-1");
      scheduleStage(900, "crawl-2");
      scheduleStage(1250, "fissure");
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playCrackSound({ seed: result.seed, rarity: result.rarity });
        }, 1250 * pacingMultiplier),
      );
      scheduleStage(1550, "swell");
      scheduleStage(1800, "shake");
      scheduleStage(1900, "pause");
      scheduleStage(1980, "bloom");
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playBloomSound({ seed: result.seed, rarity: result.rarity });
        }, 1980 * pacingMultiplier),
      );

      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          setSeedCrackStage("ticket");
          setSeedCrackValue(String(result.seed));
        }, 2400 * pacingMultiplier),
      );
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playTicketSound();
        }, 2400 * pacingMultiplier),
      );

      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          setSeedCrackStage(null);
          setSeedCrackValue(null);
          setSeedCrackRarity(null);
          setSeedCrackVariance(null);
          onComplete();
        }, 3800 * pacingMultiplier),
      );
    },
    [clearSeedCrackSequence, playBloomSound, playCrackSound, playTicketSound],
  );

  const readMoments = useCallback(() => {
    try {
      const stored = localStorage.getItem("plf:moments");
      if (!stored) return {};
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      return parsed ?? {};
    } catch (error) {
      console.error("Failed to read moments:", error);
      return {};
    }
  }, []);

  const writeMoments = useCallback((moments: Record<string, boolean>) => {
    try {
      localStorage.setItem("plf:moments", JSON.stringify(moments));
    } catch (error) {
      console.error("Failed to store moments:", error);
    }
  }, []);

  const triggerMoment = useCallback(
    (moment: { id: string; icon: string; title: string; subtitle: string }) => {
      const moments = readMoments();
      if (moments[moment.id]) return;
      moments[moment.id] = true;
      writeMoments(moments);
      setActiveMoment(moment);
    },
    [readMoments, writeMoments],
  );

  const dismissMoment = useCallback(() => {
    setActiveMoment(null);
  }, []);

  const shareMoment = useCallback(async () => {
    if (!activeMoment) return;
    const shareUrl =
      "https://farcaster.xyz/miniapps/upKwjayith2r/pixel-logo-forge";
    const text = `${activeMoment.title}\n${activeMoment.subtitle}\n${shareUrl}\n\n#PixelLogoForge`;
    try {
      if (sdkReady) {
        await sdk.actions.composeCast({ text });
        return;
      }
    } catch (error) {
      console.error("Share moment via SDK failed:", error);
    }
    const url = buildWarpcastComposeUrl(text);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [activeMoment, sdkReady]);

  const trackForgeMoments = useCallback(
    (result: LogoResult) => {
      try {
        const moments = readMoments();
        if (!moments.first_rare && result.rarity === "RARE") {
          triggerMoment({
            id: "first_rare",
            icon: "🔵",
            title: "FIRST RARE",
            subtitle: "You just pulled something special.",
          });
        }
        if (!moments.first_epic && result.rarity === "EPIC") {
          triggerMoment({
            id: "first_epic",
            icon: "🟣",
            title: "FIRST EPIC",
            subtitle: "The forge is heating up.",
          });
        }
        if (!moments.first_legendary && result.rarity === "LEGENDARY") {
          triggerMoment({
            id: "first_legendary",
            icon: "🟠",
            title: "FIRST LEGENDARY",
            subtitle: "You just pulled something special.",
          });
        }
        const forgeCount =
          Number(localStorage.getItem("plf:forgeCount") || "0") + 1;
        localStorage.setItem("plf:forgeCount", String(forgeCount));
        if (forgeCount >= 100 && !moments.logos_100) {
          triggerMoment({
            id: "logos_100",
            icon: "💯",
            title: "100 LOGOS FORGED",
            subtitle: "A true master of the forge.",
          });
        }
      } catch (error) {
        console.error("Failed to track forge moments:", error);
      }
    },
    [readMoments, triggerMoment],
  );

  const commitLogoResult = useCallback(
    (result: LogoResult) => {
      setLogoResult(result);
      // Add to local history
      addToHistory(result);
      trackForgeMoments(result);

      try {
        // Compute collected rarities from profile (server) + local history + this result
        const collected = new Set<string>();
        if (profileData?.entries && Array.isArray(profileData.entries)) {
          profileData.entries.forEach((e) => {
            if (e.rarity) collected.add(String(e.rarity).toUpperCase());
          });
        }
        logoHistory.forEach((h) => {
          if (h.result.rarity)
            collected.add(String(h.result.rarity).toUpperCase());
        });
        if (result.rarity) collected.add(String(result.rarity).toUpperCase());

        const hasCommon = collected.has("COMMON");
        const hasRare = collected.has("RARE");
        const hasEpic = collected.has("EPIC");
        const hasLegendary = collected.has("LEGENDARY");

        const previouslyHadAll = (() => {
          const prev = new Set<string>();
          if (profileData?.entries)
            profileData.entries.forEach(
              (e) => e.rarity && prev.add(String(e.rarity).toUpperCase()),
            );
          logoHistory.forEach(
            (h) =>
              h.result.rarity &&
              prev.add(String(h.result.rarity).toUpperCase()),
          );
          return (
            prev.has("COMMON") &&
            prev.has("RARE") &&
            prev.has("EPIC") &&
            prev.has("LEGENDARY")
          );
        })();

        const nowHasAll = hasCommon && hasRare && hasEpic && hasLegendary;
        if (!previouslyHadAll && nowHasAll && userInfo?.username) {
          // Trigger completion moment and award server-side badge
          triggerMoment({
            id: "rarity_master",
            icon: "🎉",
            title: "Rarity Master Unlocked",
            subtitle:
              "You've collected every rarity. The Forge recognizes you.",
          });

          // Persist badge server-side
          fetch("/api/badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userInfo.username,
              badgeType: EXTRA_BADGE_TYPES.RARITY_MASTER,
            }),
          })
            .then(() => {
              loadUserBadges(userInfo.username!);
            })
            .catch((err) =>
              console.error("Failed to award rarity master badge:", err),
            );
        }
      } catch (err) {
        console.error("Failed to evaluate rarity collection:", err);
      }
    },
    [
      addToHistory,
      trackForgeMoments,
      profileData,
      logoHistory,
      userInfo?.username,
      triggerMoment,
      loadUserBadges,
    ],
  );

  useEffect(() => {
    return () => {
      clearSeedCrackSequence();
    };
  }, [clearSeedCrackSequence]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    ensureDailyLimit();
    loadHistory();
    loadFavorites();
    loadLeaderboard();
    loadGallery();
    loadMiniappAdded();
    loadAutoReplySetting();
    loadLikedEntries();
    loadChallenge();
    loadChallengeDays();
    loadChallengeHistory();

    // Set daily challenges based on today's date
    const challenges = getDailyChallenges();
    setDailyChallenges(challenges);

    // NEW: Initialize UX enhancements
    try {
      // Load UI mode preference
      const storedMode = localStorage.getItem("plf:uiMode");
      if (storedMode === "advanced" || storedMode === "simple") {
        setUiMode(storedMode);
      }

      // Check onboarding status
      const storedOnboarding = localStorage.getItem("plf:onboardingDone");
      const onboardingComplete = storedOnboarding === "true";
      setOnboardingDone(onboardingComplete);

      // Show onboarding for first-time users
      if (!onboardingComplete) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }

      // Load generation count for auto-upgrade to advanced mode
      const storedCount = localStorage.getItem("plf:generationCount");
      if (storedCount) {
        setGenerationCount(parseInt(storedCount) || 0);
      }
    } catch (error) {
      console.error("Failed to load UX preferences:", error);
    }

    // Show daily boot screen once per day
    try {
      const todayKey = getTodayKey();
      const lastBoot = localStorage.getItem("plf:bootDate");
      if (lastBoot !== todayKey) {
        setShowDailyBoot(true);
      }
    } catch (error) {
      console.error("Failed to read boot state:", error);
    }

    // Load sound preference (default on for first-time)
    try {
      const storedSound = localStorage.getItem("plf:sound");
      if (storedSound === "off") {
        setSoundEnabled(false);
      } else if (!storedSound) {
        localStorage.setItem("plf:sound", "on");
      }
    } catch (error) {
      console.error("Failed to read sound preference:", error);
    }

    // Update time until reset every minute
    const updateTimeUntilReset = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };
    updateTimeUntilReset();
    const timeInterval = setInterval(updateTimeUntilReset, 60000); // Update every minute

    // Check if challenge should reset (new day)
    const todayKey = getTodayKey();
    const storedChallenge = localStorage.getItem("plf:challenge");
    const lastChallengeDate = localStorage.getItem("plf:challengeDate");

    if (storedChallenge && lastChallengeDate) {
      try {
        const parsed = JSON.parse(storedChallenge) as Record<string, boolean>;
        if (lastChallengeDate !== todayKey) {
          // New day - reset challenge
          setChallengeDone({});
          saveChallenge({});
          localStorage.setItem("plf:challengeDate", todayKey);
        } else {
          // Same day - load existing progress
          setChallengeDone(parsed);
        }
      } catch (error) {
        console.error("Failed to check challenge reset:", error);
        setChallengeDone({});
        localStorage.setItem("plf:challengeDate", todayKey);
      }
    } else {
      localStorage.setItem("plf:challengeDate", todayKey);
    }

    return () => {
      clearInterval(timeInterval);
    };
  }, [
    checkDailyLimits,
    ensureDailyLimit,
    finalizeDailyLimit,
    getTodayKey,
    loadChallenge,
    loadChallengeDays,
    loadChallengeHistory,
    loadDailyWinners,
    loadPastWinners,
    loadFavorites,
    calculateTimeUntilReset,
    getDailyChallenges,
    saveChallenge,
    saveChallengeHistory,
    loadGallery,
    loadHistory,
    loadLeaderboard,
    loadLikedEntries,
    loadAutoReplySetting,
    loadMiniappAdded,
    runWhenIdle,
    selectedPreset,
  ]);

  useEffect(() => {
    // Initialize SDK and signal ready after 3 seconds (splash screen delay)
    const initSdk = async () => {
      // Wait 3 seconds before calling ready (splash screen duration)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        await sdk.actions.ready();
        setSdkReady(true);

        // Get user info if available
        try {
          const context = await sdk.context;
          if (context?.user) {
            setUserInfo({
              fid: context.user.fid,
              username: context.user.username,
            });
          }
        } catch (userError) {
          console.log("Could not get user info:", userError);
        }
      } catch (error) {
        console.log("SDK not available (running outside Farcaster client)");
        setSdkReady(false);
      }
    };
    initSdk();

    // Load logo from URL parameters if present
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get("text");
    const seedParam = params.get("seed");

    if (textParam) {
      setInputText(textParam);
      const limitCheck = checkDailyLimits(textParam, !!seedParam);
      if (!limitCheck.ok) {
        setToast({ message: limitCheck.message, type: "info" });
        return;
      }
      const seed = seedParam ? parseInt(seedParam, 10) : undefined;

      // Auto-generate if we have text
      const seedToUse = seed ?? Math.floor(Math.random() * 2147483647);
      try {
        const result = createLogoResult(textParam, seedToUse, selectedPreset);
        setIsGenerating(true);
        startSeedCrackSequence(result, () => {
          commitLogoResult(result);
          if (limitCheck.ok) {
            finalizeDailyLimit(
              limitCheck.normalizedText,
              limitCheck.todayState,
              !!seedParam,
            );
          }
          setIsGenerating(false);
        });
      } catch (error) {
        console.error("Error loading logo from URL:", error);
        setToast({
          message:
            "Failed to load logo from URL. Please try generating manually.",
          type: "error",
        });
        setIsGenerating(false);
      }
    }
  }, [
    checkDailyLimits,
    finalizeDailyLimit,
    createLogoResult,
    commitLogoResult,
    selectedPreset,
    startSeedCrackSequence,
  ]);

  useEffect(() => {
    if (activeTab === "gallery") {
      loadGallery();
    }
  }, [activeTab, loadGallery]);

  useEffect(() => {
    if (userInfo?.username) {
      loadProfileData(userInfo.username);
    }
  }, [loadProfileData, userInfo?.username]);

  useEffect(() => {
    const streak = getChallengeStreak(challengeDays);
    if (streak >= 30) {
      triggerMoment({
        id: "streak_30",
        icon: "🔥",
        title: "30-DAY STREAK",
        subtitle: "Your forge discipline is legendary.",
      });
      return;
    }
    if (streak >= 7) {
      triggerMoment({
        id: "streak_7",
        icon: "🔥",
        title: "7-DAY STREAK",
        subtitle: "The forge calls you daily.",
      });
    }
  }, [challengeDays, getChallengeStreak, triggerMoment]);

  useEffect(() => {
    if (activeTab === "gallery" && galleryEntries.length > 0) {
      const latestCreatedAt = galleryEntries.reduce((max, entry) => {
        const createdAtValue =
          typeof entry.createdAt === "string"
            ? new Date(entry.createdAt).getTime()
            : entry.createdAt;
        return Math.max(max, createdAtValue);
      }, 0);
      if (latestCreatedAt > 0) {
        setSeenTimestamp("plf:gallerySeenAt", latestCreatedAt);
        setHasNewGallery(false);
      }
    }
  }, [activeTab, galleryEntries, setSeenTimestamp]);

  useEffect(() => {
    if (activeTab === "profile" && profileData) {
      const latestEntry =
        profileData.latest ??
        profileData.entries.reduce<LeaderboardEntry | null>((latest, entry) => {
          if (!latest) return entry;
          const latestCreated =
            typeof latest.createdAt === "string"
              ? new Date(latest.createdAt).getTime()
              : latest.createdAt;
          const entryCreated =
            typeof entry.createdAt === "string"
              ? new Date(entry.createdAt).getTime()
              : entry.createdAt;
          return entryCreated > latestCreated ? entry : latest;
        }, null);
      if (latestEntry) {
        const latestCreated =
          typeof latestEntry.createdAt === "string"
            ? new Date(latestEntry.createdAt).getTime()
            : latestEntry.createdAt;
        setSeenTimestamp("plf:profileSeenAt", latestCreated);
        setHasNewProfile(false);
      }
    }
    if (
      activeTab === "profile" &&
      userInfo?.username &&
      !profileLoading &&
      !profileData
    ) {
      loadProfileData(userInfo.username);
    }
  }, [
    activeTab,
    loadProfileData,
    profileData,
    profileLoading,
    setSeenTimestamp,
    userInfo?.username,
  ]);

  const handleGenerate = () => {
    if (!inputText.trim()) {
      setToast({
        message: "Please enter some text to generate a logo",
        type: "error",
      });
      return;
    }

    setRemixMode(false);

    const limitCheck = checkDailyLimits(inputText, !!customSeed.trim());
    if (!limitCheck.ok) {
      setToast({ message: limitCheck.message, type: "info" });
      return;
    }

    const seedValue = customSeed.trim();
    let seed: number | undefined = undefined;
    if (seedValue) {
      const parsedSeed = parseInt(seedValue, 10);
      if (isNaN(parsedSeed)) {
        setSeedError("Seed must be a number");
        return;
      }
      if (parsedSeed < 0 || parsedSeed > 2147483647) {
        setSeedError("Seed must be between 0 and 2147483647");
        return;
      }
      seed = parsedSeed;
      setSeedError("");
    }

    const seedToUse = seed ?? Math.floor(Math.random() * 2147483647);
    try {
      const result = createLogoResult(
        inputText.trim(),
        seedToUse,
        selectedPreset,
      );
      setIsGenerating(true);
      startSeedCrackSequence(result, () => {
        commitLogoResult(result);
        if (limitCheck.ok) {
          finalizeDailyLimit(
            limitCheck.normalizedText,
            limitCheck.todayState,
            !!seed,
          );
        }

        // NEW: Track analytics
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        try {
          localStorage.setItem("plf:generationCount", String(newCount));

          // Track event
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "generation",
              userId: userInfo?.fid ? String(userInfo.fid) : undefined,
              username: userInfo?.username,
              metadata: {
                text: inputText.trim(),
                seed: seedToUse,
                rarity: result.rarity,
                preset: selectedPreset,
              },
            }),
          }).catch(() => {});

          // Auto-upgrade to advanced mode after 3 successful generations
          if (uiMode === "simple" && newCount >= 3) {
            setUiMode("advanced");
            localStorage.setItem("plf:uiMode", "advanced");
            setToast({
              message:
                "🎉 Advanced Mode unlocked! You can now use seeds and remix.",
              type: "success",
            });
          }
        } catch (error) {
          console.error("Failed to track generation:", error);
        }

        setToast({ message: "Logo generated successfully!", type: "success" });
        setIsGenerating(false);
      });
    } catch (error) {
      console.error("Error generating logo:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate logo. Please try again.",
        type: "error",
      });
      setIsGenerating(false);
    }
  };

  const handleRandomize = () => {
    const randomText =
      RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    setInputText(randomText);
    setCustomSeed("");
    setSeedError("");
    setSelectedPreset(null);
    setRemixMode(false);

    const limitCheck = checkDailyLimits(randomText, false);
    if (!limitCheck.ok) {
      setToast({ message: limitCheck.message, type: "info" });
      return;
    }

    const seedToUse = Math.floor(Math.random() * 2147483647);
    try {
      const result = createLogoResult(randomText, seedToUse, null);
      setIsGenerating(true);
      startSeedCrackSequence(result, () => {
        commitLogoResult(result);
        if (limitCheck.ok) {
          finalizeDailyLimit(
            limitCheck.normalizedText,
            limitCheck.todayState,
            false,
          );
        }
        setToast({ message: "Logo generated successfully!", type: "success" });
        setIsGenerating(false);
      });
    } catch (error) {
      console.error("Error generating logo:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate logo. Please try again.",
        type: "error",
      });
      setIsGenerating(false);
    }
  };

  const handleRemixCast = () => {
    if (!inputText.trim()) {
      setToast({ message: "Enter the original text to remix.", type: "error" });
      return;
    }

    const seedValue = customSeed.trim();
    if (!seedValue) {
      setToast({ message: "Enter the seed you want to remix.", type: "error" });
      return;
    }

    const parsedSeed = parseInt(seedValue, 10);
    if (isNaN(parsedSeed)) {
      setSeedError("Seed must be a number");
      return;
    }
    if (parsedSeed < 0 || parsedSeed > 2147483647) {
      setSeedError("Seed must be between 0 and 2147483647");
      return;
    }

    const limitCheck = checkDailyLimits(inputText.trim(), true);
    if (!limitCheck.ok) {
      setToast({ message: limitCheck.message, type: "info" });
      return;
    }

    try {
      const result = createLogoResult(
        inputText.trim(),
        parsedSeed,
        selectedPreset,
      );
      setIsGenerating(true);
      startSeedCrackSequence(result, () => {
        commitLogoResult(result);
        finalizeDailyLimit(
          limitCheck.normalizedText,
          limitCheck.todayState,
          true,
        );
        setToast({ message: "Remix ready! Opening cast...", type: "success" });
        handleCastClick(result, parsedSeed);
        setIsGenerating(false);
        setRemixMode(false);
      });
    } catch (error) {
      console.error("Remix error:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to remix logo. Please try again.",
        type: "error",
      });
      setIsGenerating(false);
      setRemixMode(false);
    }
  };

  const handleDownload = async () => {
    if (!logoResult) return;

    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    );

    try {
      // In Farcaster mini-apps, downloads/web-share are blocked by sandbox.
      // Use the SDK to open a safe, shareable image URL.
      if (sdkReady) {
        try {
          const uploadResponse = await fetch("/api/logo-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dataUrl: logoResult.dataUrl,
              text: logoResult.config.text,
              seed: logoResult.seed,
            }),
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.imageUrl) {
              await sdk.actions.openUrl(uploadData.imageUrl);
              setToast({
                message: isMobileDevice
                  ? 'Image opened. Long-press and select "Save Image" to save to Photos.'
                  : 'Image opened. Right-click and select "Save Image As" to download.',
                type: "info",
              });
              return;
            }
          }
        } catch (sdkError) {
          console.log("SDK openUrl failed, falling back:", sdkError);
        }
      }

      // Fallback: open data URL in a new window/tab
      const objectUrl = logoResult.dataUrl;
      const newWindow = window.open(objectUrl, "_blank", "noopener,noreferrer");

      if (newWindow) {
        if (isMobileDevice) {
          setToast({
            message:
              'Image opened. Long-press the image and select "Save Image" to save to Photos.',
            type: "info",
          });
        } else {
          setToast({
            message:
              'Image opened. Right-click the image and select "Save Image As" to download.',
            type: "info",
          });
        }
      } else {
        // Popup blocked - show instructions
        if (isMobileDevice) {
          setToast({
            message:
              'Popup blocked. Long-press the logo image above and select "Save Image" or "Add to Photos".',
            type: "info",
          });
        } else {
          setToast({
            message:
              'Popup blocked. Right-click the logo image above and select "Save Image As" to download.',
            type: "info",
          });
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      if (isMobileDevice) {
        setToast({
          message:
            'Long-press the logo image above and select "Save Image" or "Add to Photos".',
          type: "info",
        });
      } else {
        setToast({
          message:
            'Right-click the logo image above and select "Save Image As" to download.',
          type: "info",
        });
      }
    }
  };

  const openImageForSave = async (target: "photos" | "files" | "download") => {
    if (!logoResult) return;
    setShowDownloadOptions(false);

    try {
      if (sdkReady) {
        const uploadResponse = await fetch("/api/logo-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataUrl: logoResult.dataUrl,
            text: logoResult.config.text,
            seed: logoResult.seed,
          }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const imageUrl = uploadData.imageUrl;

          if (!imageUrl) return;

          // For "Save to Photos" on iOS, use the Web Share API with files
          // This opens the native iOS share sheet where users can tap "Save Image"
          if (target === "photos") {
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], "logo.png", { type: blob.type });

              // Check if navigator.share supports files
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: `Pixel Logo: ${logoResult.config.text}`,
                  text: "Save this logo to your Photos",
                });
                setToast({
                  message: "Image shared! Tap 'Save Image' to save to Photos.",
                  type: "success",
                });
                return;
              }
            } catch (shareError) {
              // If share API fails, fall through to fallback below
              console.log("Web Share API failed, using fallback:", shareError);
            }

            // Fallback: Open image in new tab with instructions
            // (when Web Share API isn't supported)
            try {
              await sdk.actions.openUrl(imageUrl);
              setToast({
                message:
                  'Image opened. Long-press and choose "Save Image" to save to Photos.',
                type: "info",
              });
              return;
            } catch {
              // SDK openUrl not available, use window.open
              window.open(imageUrl, "_blank", "noopener,noreferrer");
              setToast({
                message:
                  'Image opened. Long-press and choose "Save Image" to save to Photos.',
                type: "info",
              });
              return;
            }
          }

          // For "Save to Files" and "Download", use SDK or fallback
          const downloadUrl = uploadData.downloadUrl || imageUrl;
          try {
            await sdk.actions.openUrl(downloadUrl);
            if (target === "files") {
              setToast({
                message: 'Image opened. Long-press and choose "Save to Files".',
                type: "info",
              });
            } else {
              setToast({
                message:
                  'Image opened. Right-click and choose "Save Image As" to download.',
                type: "info",
              });
            }
            return;
          } catch {
            // Fallback if SDK not available
            window.open(downloadUrl, "_blank", "noopener,noreferrer");
            if (target === "files") {
              setToast({
                message: 'Image opened. Long-press and choose "Save to Files".',
                type: "info",
              });
            } else {
              setToast({
                message:
                  'Image opened. Right-click and choose "Save Image As" to download.',
                type: "info",
              });
            }
          }
        }
      }
    } catch (error) {
      console.log("Open image failed:", error);
    }

    // Fallback if SDK not ready: use Web Share API or show instructions
    try {
      const response = await fetch(logoResult.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "logo.png", { type: blob.type });

      if (
        target === "photos" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Pixel Logo: ${logoResult.config.text}`,
          text: "Save this logo to your Photos",
        });
        setToast({
          message: "Image shared! Tap 'Save Image' to save to Photos.",
          type: "success",
        });
        return;
      }
    } catch (error) {
      console.log("Web Share API not available:", error);
    }

    // Final fallback: open data URL in new tab
    const objectUrl = logoResult.dataUrl;
    const newWindow = window.open(objectUrl, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      setToast({
        message: "Popup blocked. Please save the image from the preview above.",
        type: "info",
      });
    } else if (target === "photos") {
      setToast({
        message:
          'Image opened. Long-press and choose "Save Image" to save to Photos.',
        type: "info",
      });
    } else if (target === "files") {
      setToast({
        message: 'Image opened. Long-press and choose "Save to Files".',
        type: "info",
      });
    } else {
      setToast({
        message:
          'Image opened. Right-click and choose "Save Image As" to download.',
        type: "info",
      });
    }
  };

  const handleShare = async () => {
    if (!logoResult) return;

    setIsSharing(true);
    try {
      // Try Farcaster SDK first if available
      if (sdkReady) {
        try {
          let shareImageUrl: string | null = null;
          try {
            const uploadResponse = await fetch("/api/logo-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                dataUrl: logoResult.dataUrl,
                text: logoResult.config.text,
                seed: logoResult.seed,
              }),
            });
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              if (uploadData.imageUrl) {
                shareImageUrl = uploadData.imageUrl;
              }
            }
          } catch (uploadError) {
            console.error("Share image upload failed:", uploadError);
          }
          // Use the logo image in the share
          const result = await sdk.actions.composeCast({
            text: `Just generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}" 🎮`,
            embeds: shareImageUrl ? [shareImageUrl] : undefined, // Include image only
          });

          if (result && result.cast) {
            setToast({
              message: "Logo shared to Farcaster! 🎉",
              type: "success",
            });
          }
          return;
        } catch (sdkError) {
          console.log("SDK share failed, trying fallback:", sdkError);
        }
      }

      // Fallback to Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `Pixel Logo: ${logoResult.config.text} [${logoResult.rarity}]`,
          text: `Check out my retro pixel logo: ${logoResult.config.text}`,
        });
        setToast({ message: "Shared successfully!", type: "success" });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Check out my retro pixel logo: ${logoResult.config.text}`,
        );
        setToast({
          message: "Share text copied to clipboard!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      setToast({
        message: "Failed to share. Please try again.",
        type: "error",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const openWarpcastShare = useCallback(
    async (entry: LeaderboardEntry) => {
      const safeText = entry.text || "Pixel logo";
      const embeds: string[] = [];
      // Use card image for sharing context
      const shareImageUrl = getImageForContext(
        {
          logoImageUrl: entry.logoImageUrl,
          cardImageUrl: entry.cardImageUrl,
          imageUrl: entry.imageUrl,
        },
        "share",
      );
      if (
        shareImageUrl &&
        (shareImageUrl.startsWith("http://") ||
          shareImageUrl.startsWith("https://"))
      ) {
        embeds.push(shareImageUrl);
      }
      const shareText = `Pixel Logo Forge: "${safeText}"`;
      if (sdkReady) {
        try {
          const embedsForSdk = embeds.slice(0, 2) as string[];
          await sdk.actions.composeCast({
            text: shareText,
            embeds:
              embedsForSdk.length === 2
                ? ([embedsForSdk[0], embedsForSdk[1]] as [string, string])
                : embedsForSdk.length === 1
                  ? ([embedsForSdk[0]] as [string])
                  : undefined,
          });
          return;
        } catch (error) {
          console.error("Warpcast share via SDK failed:", error);
        }
      }
      const composeUrl = buildWarpcastComposeUrl(shareText, embeds);
      const opened = window.open(composeUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.href = composeUrl;
      }
    },
    [sdkReady],
  );

  const handleTagFriend = useCallback(() => {
    setCastDraftText((prev) => {
      const suffix = "\n\nTag a friend: @";
      if (!prev) return `Tag a friend: @`;
      return prev.includes("Tag a friend: @") ? prev : `${prev}${suffix}`;
    });
  }, []);

  const handleAddMiniapp = async () => {
    if (!sdkReady) {
      setToast({
        message: "Add to collection is available in Farcaster.",
        type: "info",
      });
      return;
    }

    try {
      await sdk.actions.addMiniApp();
      setMiniappAdded(true);
      saveMiniappAdded(true);
      setToast({ message: "Added to your collection!", type: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("rejected")) {
        setToast({ message: "Add to collection canceled.", type: "info" });
        return;
      }
      if (message.toLowerCase().includes("invaliddomainmanifestjson")) {
        setToast({
          message: "Domain/manifest mismatch. Please try again later.",
          type: "error",
        });
        return;
      }
      console.error("Add mini app error:", error);
      setToast({
        message: "Unable to add right now. Please try again.",
        type: "error",
      });
    }
  };

  const handleCopyCastText = async () => {
    if (!logoResult) return;
    const castText = `Forged a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"\n\n✨ Rarity: ${logoResult.rarity}\n🎲 Seed: ${logoResult.seed}\n\n#PixelLogoForge #${logoResult.rarity}Logo`;
    try {
      await navigator.clipboard.writeText(castText);
      setToast({ message: "Cast text copied!", type: "success" });
    } catch (error) {
      console.error("Copy cast text error:", error);
      setToast({ message: "Failed to copy cast text.", type: "error" });
    }
  };

  const handleCastClick = async (override?: LogoResult, remixSeed?: number) => {
    const activeResult = override ?? logoResult;
    if (!activeResult) return;

    // Generate preview first
    try {
      const previewImage = await generateCastImage(activeResult);

      const rarityEmoji =
        {
          COMMON: "⚪",
          RARE: "🔵",
          EPIC: "🟣",
          LEGENDARY: "🟠",
        }[activeResult.rarity] || "🎮";

      const remixLine = remixSeed ? `🔁 Remix seed: ${remixSeed}` : "";
      const previewText = `${rarityEmoji} ${remixSeed ? "Remixed" : "Forged"} a ${activeResult.rarity.toLowerCase()} pixel logo: "${activeResult.config.text}"

✨ Rarity: ${activeResult.rarity}
🎲 Seed: ${activeResult.seed}
${remixLine ? `${remixLine}\n` : ""}#PixelLogoForge #${activeResult.rarity}Logo`;

      setCastPreviewImage(previewImage);
      setCastPreviewText(previewText);
      setCastDraftText(previewText);
      setCastTarget(activeResult);
      setCastTargetRemixSeed(remixSeed);
      setShowCastPreview(true);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      setToast({
        message: "Failed to generate preview. Casting directly...",
        type: "error",
      });
      // Fall through to direct cast
      handleCast(activeResult, remixSeed);
    }
  };

  const handleCast = async (
    override?: LogoResult,
    remixSeed?: number,
    textOverride?: string,
  ) => {
    const activeResult = override ?? logoResult;
    if (!activeResult) return;

    setShowCastPreview(false);
    setIsCasting(true);
    setCastTarget(null);
    setCastTargetRemixSeed(undefined);
    try {
      console.log("Starting cast process...");
      console.log("SDK ready:", sdkReady);

      // Generate the composite cast image with logo, rarity, and owner
      let castImageUrl = activeResult.dataUrl; // Fallback to original logo

      try {
        console.log("Generating cast image...");
        const castImageDataUrl = await generateCastImage(activeResult);
        console.log("Cast image generated, length:", castImageDataUrl.length);

        // Upload the composite image to get a shareable URL
        console.log("Uploading image to get shareable URL...");
        const uploadResponse = await fetch("/api/logo-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataUrl: castImageDataUrl,
            text: activeResult.config.text,
            seed: activeResult.seed,
          }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          console.log("Upload response:", uploadData);
          if (uploadData.imageUrl) {
            castImageUrl = uploadData.imageUrl;
            console.log("Using shareable URL:", castImageUrl);
          } else {
            console.log("No imageUrl in response, using data URL");
          }
        } else {
          console.error(
            "Upload failed:",
            uploadResponse.status,
            await uploadResponse.text(),
          );
        }
      } catch (imageError) {
        console.error("Failed to generate/upload cast image:", imageError);
        // Continue with original logo
      }

      // Use Farcaster SDK composeCast
      if (sdkReady) {
        try {
          // Keep the full cast metadata, but do not embed the share link
          const rarityEmoji =
            {
              COMMON: "⚪",
              RARE: "🔵",
              EPIC: "🟣",
              LEGENDARY: "🟠",
            }[activeResult.rarity] || "🎮";

          const remixLine = remixSeed ? `🔁 Remix seed: ${remixSeed}` : "";
          const defaultText = `${rarityEmoji} ${remixSeed ? "Remixed" : "Forged"} a ${activeResult.rarity.toLowerCase()} pixel logo: "${activeResult.config.text}"

✨ Rarity: ${activeResult.rarity}
🎲 Seed: ${activeResult.seed}
${remixLine ? `${remixLine}\n` : ""}#PixelLogoForge #${activeResult.rarity}Logo
`;
          const castText = textOverride?.trim() ? textOverride : defaultText;

          // Farcaster embeds - build as tuple type
          let embeds: [string] | undefined = undefined;

          // Only add image embed if it's an HTTP URL (Farcaster prefers HTTP URLs over data URLs)
          if (
            castImageUrl &&
            (castImageUrl.startsWith("http://") ||
              castImageUrl.startsWith("https://"))
          ) {
            embeds = [castImageUrl] as [string];
          } else if (castImageUrl && castImageUrl.startsWith("data:")) {
            // Try data URL (may not work in all clients)
            embeds = [castImageUrl] as [string];
          } else {
            embeds = undefined;
          }

          console.log("Calling SDK composeCast with:", {
            text: castText,
            embeds: embeds,
          });

          const result = await sdk.actions.composeCast({
            text: castText,
            embeds: embeds,
          });

          console.log("ComposeCast result:", result);

          if (result && result.cast) {
            setToast({ message: "Logo casted! 🎉", type: "success" });
            const entryId =
              (result.cast as { hash?: string })?.hash ??
              `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const castHash = (result.cast as { hash?: string })?.hash;
            const castUrl =
              castHash && /^0x[a-fA-F0-9]{64}$/.test(castHash)
                ? `https://warpcast.com/~/cast/${castHash}`
                : undefined;
            addToLeaderboard({
              id: entryId,
              text: activeResult.config.text,
              seed: activeResult.seed,
              imageUrl: castImageUrl,
              username: userInfo?.username ?? "unknown",
              displayName: userInfo?.username ?? "Unknown",
              pfpUrl: "",
              likes: 0,
              recasts: 0,
              rarity: activeResult.rarity,
              presetKey: selectedPreset ?? null,
              createdAt: Date.now(),
              castUrl,
            });

            if (castHash && autoReplyEnabled) {
              try {
                const castShareUrl = "https://pixel-logo-generator.vercel.app";
                await sdk.actions.composeCast({
                  embeds: [castShareUrl],
                  parent: { type: "cast", hash: castHash },
                });
              } catch (replyError) {
                console.error("Auto-reply failed:", replyError);
              }
            }
          } else {
            setToast({ message: "Cast cancelled", type: "info" });
          }
          return;
        } catch (sdkError) {
          console.error("SDK cast error details:", sdkError);
          setToast({
            message: `Cast failed: ${sdkError instanceof Error ? sdkError.message : "Unknown error"}. Check console for details.`,
            type: "error",
          });
          throw sdkError;
        }
      } else {
        console.log("SDK not ready, using Warpcast fallback");
        // Fallback: open Warpcast compose URL
        const rarityEmoji =
          {
            COMMON: "⚪",
            RARE: "🔵",
            EPIC: "🟣",
            LEGENDARY: "🟠",
          }[activeResult.rarity] || "🎮";

        const remixLine = remixSeed ? `🔁 Remix seed: ${remixSeed}` : "";
        const defaultText = `${rarityEmoji} ${remixSeed ? "Remixed" : "Forged"} a ${activeResult.rarity.toLowerCase()} pixel logo: "${activeResult.config.text}"

✨ Rarity: ${activeResult.rarity}
🎲 Seed: ${activeResult.seed}
${remixLine ? `${remixLine}\n` : ""}#PixelLogoForge #${activeResult.rarity}Logo
`;
        const castText = textOverride?.trim() ? textOverride : defaultText;

        const warpcastUrl = buildWarpcastComposeUrl(
          castText,
          castImageUrl ? [castImageUrl] : undefined,
        );
        window.open(warpcastUrl, "_blank");
        setToast({
          message: "Opening Warpcast to compose cast...",
          type: "info",
        });
      }
      if (!readMoments().first_cast) {
        triggerMoment({
          id: "first_cast",
          icon: "🎮",
          title: "FIRST CAST",
          subtitle: "You just shared your first forge.",
        });
      }
    } catch (error) {
      console.error("Cast error:", error);
      setToast({
        message: `Failed to cast: ${error instanceof Error ? error.message : "Unknown error"}. Check console for details.`,
        type: "error",
      });
    } finally {
      setIsCasting(false);
    }
  };

  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case "COMMON":
        return "#AAAAAA";
      case "RARE":
        return "#00AAFF";
      case "EPIC":
        return "#AA00FF";
      case "LEGENDARY":
        return "#FFAA00";
      default:
        return "#FFFFFF";
    }
  };

  const generateCastImage = async (logoResult: LogoResult): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a larger canvas for the card
        const cardCanvas = document.createElement("canvas");
        const cardCtx = cardCanvas.getContext("2d");
        if (!cardCtx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Load the logo image
        const logoImg = new Image();
        logoImg.onload = () => {
          // Card dimensions - wider format for social sharing
          const cardWidth = 1200;
          const cardHeight = 630;
          cardCanvas.width = cardWidth;
          cardCanvas.height = cardHeight;

          // Disable smoothing for pixel art
          cardCtx.imageSmoothingEnabled = false;

          // Draw gradient background
          const bgGradient = cardCtx.createLinearGradient(
            0,
            0,
            cardWidth,
            cardHeight,
          );
          bgGradient.addColorStop(0, "#050505");
          bgGradient.addColorStop(1, "#0c0c0c");
          cardCtx.fillStyle = bgGradient;
          cardCtx.fillRect(0, 0, cardWidth, cardHeight);

          // Subtle scanlines
          cardCtx.fillStyle = "rgba(0, 0, 0, 0.18)";
          for (let y = 0; y < cardHeight; y += 4) {
            cardCtx.fillRect(0, y, cardWidth, 1);
          }

          // Draw border + glow
          const borderWidth = 10;
          const rarityColor = getRarityColor(logoResult.rarity);
          cardCtx.shadowColor = rarityColor;
          cardCtx.shadowBlur = 18;
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = borderWidth;
          cardCtx.strokeRect(
            borderWidth / 2,
            borderWidth / 2,
            cardWidth - borderWidth,
            cardHeight - borderWidth,
          );
          cardCtx.shadowBlur = 0;

          // Title bar
          cardCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
          cardCtx.fillRect(0, 0, cardWidth, 70);
          cardCtx.fillStyle = rarityColor;
          cardCtx.font = 'bold 22px "Press Start 2P", monospace';
          cardCtx.textAlign = "left";
          cardCtx.textBaseline = "middle";
          cardCtx.fillText("PIXEL LOGO FORGE", 32, 38);

          // Calculate logo size and position (larger + centered in main area)
          const logoPadding = 30;
          const titleBarHeight = 70;
          const footerHeight = 80;
          const maxLogoWidth = cardWidth - logoPadding * 2;
          const maxLogoHeight =
            cardHeight - logoPadding * 2 - titleBarHeight - footerHeight;

          let logoWidth = logoImg.width;
          let logoHeight = logoImg.height;
          const logoAspect = logoWidth / logoHeight;

          if (logoWidth > maxLogoWidth) {
            logoWidth = maxLogoWidth;
            logoHeight = logoWidth / logoAspect;
          }
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = logoHeight * logoAspect;
          }

          const logoX = (cardWidth - logoWidth) / 2;
          const availableHeight = cardHeight - titleBarHeight - footerHeight;
          const logoY = titleBarHeight + (availableHeight - logoHeight) / 2;

          // Draw logo with a subtle glow
          cardCtx.shadowColor = "rgba(0, 255, 0, 0.35)";
          cardCtx.shadowBlur = 12;
          cardCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          cardCtx.shadowBlur = 0;

          // Draw rarity badge (top-right)
          const rarityY = 16;
          const rarityX = cardWidth - 220;
          cardCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
          cardCtx.fillRect(rarityX - 10, rarityY - 8, 200, 56);
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = 4;
          cardCtx.strokeRect(rarityX - 10, rarityY - 8, 200, 56);

          cardCtx.fillStyle = rarityColor;
          cardCtx.font = 'bold 16px "Press Start 2P", monospace';
          cardCtx.textAlign = "center";
          cardCtx.textBaseline = "middle";
          cardCtx.fillText("RARITY", rarityX + 90, rarityY + 14);
          cardCtx.fillText(logoResult.rarity, rarityX + 90, rarityY + 36);

          // Draw owner info at bottom
          const ownerY = cardHeight - 70;
          const ownerText = userInfo?.username
            ? `Generated by @${userInfo.username}`
            : userInfo?.fid
              ? `Generated by FID ${userInfo.fid}`
              : "Generated by Pixel Logo Forge";

          cardCtx.fillStyle = "#9adf9a";
          cardCtx.font = '15px "Courier New", monospace';
          cardCtx.textAlign = "center";
          cardCtx.textBaseline = "middle";
          cardCtx.fillText(ownerText, cardWidth / 2, ownerY);

          // Draw seed info
          cardCtx.fillStyle = "#6fae6f";
          cardCtx.font = '12px "Courier New", monospace';
          cardCtx.fillText(
            `Seed: ${logoResult.seed}`,
            cardWidth / 2,
            ownerY + 24,
          );

          // Convert to data URL
          resolve(cardCanvas.toDataURL("image/png"));
        };

        logoImg.onerror = () => {
          reject(new Error("Failed to load logo image"));
        };

        logoImg.src = logoResult.dataUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  const copySeed = async () => {
    if (logoResult) {
      try {
        await navigator.clipboard.writeText(logoResult.seed.toString());
        setToast({
          message: `Seed ${logoResult.seed} copied! Share it to recreate this logo.`,
          type: "success",
        });
      } catch (error) {
        setToast({
          message: "Failed to copy seed to clipboard",
          type: "error",
        });
      }
    }
  };

  const favoritesContent = (
    <>
      {favorites.length > 0 && (
        <div className="history-strip" aria-label="Favorite logos">
          <div className="history-title">Favorites</div>
          <div className="history-list">
            {favorites.map((item) => (
              <button
                key={`fav-${item.result.seed}-${item.result.config.text}`}
                className="history-item"
                onClick={() => {
                  setLogoResult(item.result);
                  setInputText(item.result.config.text);
                  setActiveTab("home");
                }}
                aria-label={`Load favorite logo "${item.result.config.text}" with seed ${item.result.seed}`}
              >
                <NextImage
                  src={item.result.dataUrl}
                  alt={`Favorite logo: ${item.result.config.text}`}
                  className="history-image"
                  width={64}
                  height={64}
                  unoptimized
                />
                <span className="history-time">
                  {formatHistoryTime(item.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {logoHistory.length > 0 && (
        <div className="history-strip" aria-label="Recent logos">
          <div className="history-title">Recent logos</div>
          <div className="history-list">
            {logoHistory.map((item) => (
              <button
                key={`${item.result.seed}-${item.result.config.text}`}
                className="history-item"
                onClick={() => {
                  setLogoResult(item.result);
                  setInputText(item.result.config.text);
                  setActiveTab("home");
                }}
                aria-label={`Load logo "${item.result.config.text}" with seed ${item.result.seed}`}
              >
                <NextImage
                  src={item.result.dataUrl}
                  alt={`Recent logo: ${item.result.config.text}`}
                  className="history-image"
                  width={64}
                  height={64}
                  unoptimized
                />
                <span className="history-time">
                  {formatHistoryTime(item.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {favorites.length === 0 && logoHistory.length === 0 && (
        <div className="leaderboard-status">
          No favorites or recent logos yet.
        </div>
      )}
    </>
  );

  const leaderboardDate = "Last 7 days";
  const leaderboardPageSize = 5;
  const galleryPageSize = 6;

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    const bScore = b.score ?? b.likes + (b.recasts ?? 0) * 2;
    const aScore = a.score ?? a.likes + (a.recasts ?? 0) * 2;
    const bCreated =
      typeof b.createdAt === "string"
        ? new Date(b.createdAt).getTime()
        : b.createdAt;
    const aCreated =
      typeof a.createdAt === "string"
        ? new Date(a.createdAt).getTime()
        : a.createdAt;
    if (leaderboardSort === "recent") {
      return bCreated - aCreated;
    }
    if (leaderboardSort === "likes") {
      if (bScore !== aScore) return bScore - aScore;
      return bCreated - aCreated;
    }
    if (bScore !== aScore) return bScore - aScore;
    return bCreated - aCreated;
  });

  useEffect(() => {
    if (!userInfo?.username) return;
    const topThree = sortedLeaderboard.slice(0, 3);
    const inTopThree = topThree.some(
      (entry) =>
        entry.username?.toLowerCase() === userInfo.username?.toLowerCase(),
    );
    if (inTopThree) {
      triggerMoment({
        id: "first_top3",
        icon: "🏆",
        title: "FIRST TOP 3",
        subtitle: "You just hit the podium.",
      });
    }
  }, [sortedLeaderboard, triggerMoment, userInfo?.username]);

  const galleryRarityOptions = ["all", ...RARITY_OPTIONS, "Unknown"];
  const galleryPresetOptions = [
    "all",
    ...PRESETS.map((preset) => preset.key),
    "Unknown",
  ];
  const presetLabelMap = PRESETS.reduce<Record<string, string>>(
    (acc, preset) => {
      acc[preset.key] = preset.label;
      return acc;
    },
    {},
  );
  const filteredGalleryEntries = galleryEntries
    .filter((entry) => {
      const rarityValue = entry.rarity
        ? String(entry.rarity).toUpperCase()
        : "UNKNOWN";
      const presetValue = entry.presetKey ?? "Unknown";
      const matchesRarity =
        galleryRarityFilter === "all" ||
        (galleryRarityFilter === "Unknown"
          ? rarityValue === "UNKNOWN"
          : rarityValue === galleryRarityFilter);
      const matchesPreset =
        galleryPresetFilter === "all" ||
        (galleryPresetFilter === "Unknown"
          ? presetValue === "Unknown"
          : presetValue === galleryPresetFilter);
      return matchesRarity && matchesPreset;
    })
    .sort((a, b) => {
      const bCreated =
        typeof b.createdAt === "string"
          ? new Date(b.createdAt).getTime()
          : b.createdAt;
      const aCreated =
        typeof a.createdAt === "string"
          ? new Date(a.createdAt).getTime()
          : a.createdAt;
      return bCreated - aCreated;
    });

  const openGalleryEntry = useCallback(
    (entry: LeaderboardEntry, label: string) => {
      try {
        const presetKey = entry.presetKey ?? null;
        const result = createLogoResult(entry.text, entry.seed, presetKey);
        commitLogoResult(result);
        setInputText(entry.text);
        setSelectedPreset(presetKey);
        setActiveTab("home");
        setToast({ message: label, type: "success" });
      } catch (error) {
        console.error("Failed to open gallery entry:", error);
        setToast({
          message: "Could not open that entry. Try another.",
          type: "error",
        });
      }
    },
    [commitLogoResult, createLogoResult, setActiveTab, setInputText],
  );

  const handleRandomLegendary = useCallback(() => {
    const legendaryEntries = galleryEntries.filter((entry) => {
      const rarityValue = entry.rarity
        ? String(entry.rarity).toUpperCase()
        : "UNKNOWN";
      return rarityValue === "LEGENDARY";
    });
    if (legendaryEntries.length === 0) {
      setToast({
        message: "No legendary casts yet. Try again later!",
        type: "info",
      });
      return;
    }
    const entry =
      legendaryEntries[Math.floor(Math.random() * legendaryEntries.length)];
    openGalleryEntry(entry, "Legendary cast loaded!");
  }, [galleryEntries, openGalleryEntry]);

  const handleSurpriseMe = useCallback(() => {
    if (filteredGalleryEntries.length === 0) {
      setToast({ message: "No casts match those filters yet.", type: "info" });
      return;
    }
    const entry =
      filteredGalleryEntries[
        Math.floor(Math.random() * filteredGalleryEntries.length)
      ];
    openGalleryEntry(entry, "Surprise cast loaded!");
  }, [filteredGalleryEntries, openGalleryEntry]);

  const leaderboardTotalPages = Math.max(
    1,
    Math.ceil(sortedLeaderboard.length / leaderboardPageSize),
  );
  const galleryTotalPages = Math.max(
    1,
    Math.ceil(filteredGalleryEntries.length / galleryPageSize),
  );
  const pagedLeaderboard = sortedLeaderboard.slice(
    (leaderboardPage - 1) * leaderboardPageSize,
    leaderboardPage * leaderboardPageSize,
  );
  const pagedGalleryEntries = filteredGalleryEntries.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize,
  );

  const castGalleryContent = (
    <div className="cast-gallery">
      <div className="leaderboard-title">Cast Gallery</div>
      <div className="gallery-meta">
        Recent casts from the community - {filteredGalleryEntries.length} shown
      </div>

      {/* NEW: Search Bar */}
      <div style={{ padding: "0.5rem 0", maxWidth: "500px", margin: "0 auto" }}>
        <SearchBar
          placeholder="Search..."
          showRandomButton={true}
          onSearch={async (query, type) => {
            try {
              const response = await fetch(
                `/api/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`,
              );
              if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                  setGalleryEntries(data.results);
                  setToast({
                    message: `Found ${data.results.length} result(s)`,
                    type: "success",
                  });
                } else {
                  setToast({ message: "No results found", type: "info" });
                }
              }
            } catch (error) {
              console.error("Search error:", error);
              setToast({ message: "Search failed", type: "error" });
            }
          }}
        />
      </div>

      <div className="gallery-actions-top">
        <button
          type="button"
          className="gallery-action-button"
          onClick={handleRandomLegendary}
        >
          Random Legendary
        </button>
        <button
          type="button"
          className="gallery-action-button"
          onClick={handleSurpriseMe}
        >
          Surprise Me
        </button>
      </div>
      <div className="gallery-filters">
        <label className="gallery-filter">
          <span>Rarity</span>
          <select
            value={galleryRarityFilter}
            onChange={(event) => {
              setGalleryRarityFilter(event.target.value);
              setGalleryPage(1);
            }}
          >
            {galleryRarityOptions.map((option) => (
              <option key={`rarity-${option}`} value={option}>
                {option === "all" ? "All" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="gallery-filter">
          <span>Preset</span>
          <select
            value={galleryPresetFilter}
            onChange={(event) => {
              setGalleryPresetFilter(event.target.value);
              setGalleryPage(1);
            }}
          >
            {galleryPresetOptions.map((option) => (
              <option key={`preset-${option}`} value={option}>
                {option === "all" ? "All" : (presetLabelMap[option] ?? option)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {galleryLoading && (
        <div className="leaderboard-status">Loading gallery...</div>
      )}
      {galleryError && <div className="leaderboard-status">{galleryError}</div>}
      {!galleryLoading &&
        !galleryError &&
        filteredGalleryEntries.length === 0 && (
          <div className="leaderboard-status">
            No casts match those filters yet.
          </div>
        )}
      {filteredGalleryEntries.length > 0 && (
        <div className="gallery-grid">
          {pagedGalleryEntries.map((entry) => {
            const castUrl =
              entry.castUrl ??
              (entry.id && /^0x[a-fA-F0-9]{64}$/.test(entry.id)
                ? `https://warpcast.com/~/cast/${entry.id}`
                : undefined);
            const rarityValue = entry.rarity
              ? String(entry.rarity).toUpperCase()
              : "Unknown";
            const presetValue = entry.presetKey
              ? (presetLabelMap[entry.presetKey] ?? entry.presetKey)
              : "Unknown";
            // Use logo image for gallery display context
            const galleryImageUrl = getImageForContext(
              {
                logoImageUrl: entry.logoImageUrl,
                cardImageUrl: entry.cardImageUrl,
                imageUrl: entry.imageUrl,
              },
              "gallery",
            );
            const CardBody = (
              <>
                {galleryImageUrl ? (
                  <NextImage
                    src={galleryImageUrl}
                    alt={`Cast by ${entry.username}`}
                    className="gallery-image"
                    width={320}
                    height={200}
                    unoptimized
                  />
                ) : (
                  <div className="gallery-text">
                    {entry.text || "View cast"}
                  </div>
                )}
                <div className="gallery-card-meta">
                  <span>@{entry.username}</span>
                  <span>
                    {formatHistoryTime(
                      typeof entry.createdAt === "string"
                        ? new Date(entry.createdAt).getTime()
                        : entry.createdAt,
                    )}
                  </span>
                </div>
                <div className="gallery-card-tags">
                  <span className="gallery-chip">{rarityValue}</span>
                  <span className="gallery-chip">{presetValue}</span>
                </div>
                <div className="gallery-card-seed">Seed: {entry.seed}</div>
                <div className="gallery-actions">
                  <button
                    type="button"
                    className="gallery-share-button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      openWarpcastShare(entry);
                    }}
                    aria-label={`Share cast by ${entry.username}`}
                  >
                    Share to Warpcast
                  </button>
                </div>
              </>
            );
            return castUrl ? (
              <a
                key={`gallery-${entry.id}`}
                className="gallery-card"
                href={castUrl}
                target="_blank"
                rel="noreferrer"
              >
                {CardBody}
              </a>
            ) : (
              <div key={`gallery-${entry.id}`} className="gallery-card">
                {CardBody}
              </div>
            );
          })}
        </div>
      )}
      {filteredGalleryEntries.length > 0 && galleryTotalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button"
            onClick={() => setGalleryPage((prev) => Math.max(1, prev - 1))}
            disabled={galleryPage === 1}
          >
            Prev
          </button>
          <span className="pagination-status">
            Page {galleryPage} of {galleryTotalPages}
          </span>
          <button
            type="button"
            className="pagination-button"
            onClick={() =>
              setGalleryPage((prev) => Math.min(galleryTotalPages, prev + 1))
            }
            disabled={galleryPage === galleryTotalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const leaderboardContent = (
    <div className="leaderboard">
      <div className="leaderboard-title">🏆 Hall of Fame</div>
      {dailyWinners.length > 0 && (
        <div className="daily-winners-section">
          <div className="leaderboard-title">🏆 Today&apos;s Winners</div>
          <div className="daily-winners-grid">
            {dailyWinners.map((winner) => {
              // Use logo image for leaderboard display context
              const leaderboardImageUrl = getImageForContext(
                {
                  logoImageUrl: winner.entry.logoImageUrl,
                  cardImageUrl: winner.entry.cardImageUrl,
                  imageUrl: winner.entry.imageUrl,
                },
                "leaderboard",
              );
              return (
                <div
                  key={`winner-${winner.rank}`}
                  className={`daily-winner-card rank-${winner.rank}`}
                >
                  <div className="daily-winner-rank">#{winner.rank}</div>
                  {leaderboardImageUrl ? (
                    <NextImage
                      src={leaderboardImageUrl}
                      alt={`Winner ${winner.rank} by ${winner.username}`}
                      className="daily-winner-image"
                      width={200}
                      height={120}
                      unoptimized
                    />
                  ) : (
                    <div className="daily-winner-text">{winner.entry.text}</div>
                  )}
                  <div className="daily-winner-info">
                    <div className="daily-winner-username">
                      @{winner.username}
                    </div>
                    <div className="daily-winner-stats">
                      ❤️ {winner.entry.likes} 🔁 {winner.entry.recasts ?? 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="leaderboard-meta">
        <span>{leaderboardDate}</span>
        <span>{leaderboard.length} entries</span>
      </div>
      <div className="leaderboard-narrative">🔥 Hot Today</div>
      <div className="leaderboard-filters">
        <button
          type="button"
          className={`leaderboard-filter-button${leaderboardSort === "score" ? " active" : ""}`}
          onClick={() => {
            setLeaderboardSort("score");
            setLeaderboardPage(1);
          }}
          aria-pressed={leaderboardSort === "score"}
        >
          Trending
        </button>
        <button
          type="button"
          className={`leaderboard-filter-button${leaderboardSort === "recent" ? " active" : ""}`}
          onClick={() => {
            setLeaderboardSort("recent");
            setLeaderboardPage(1);
          }}
          aria-pressed={leaderboardSort === "recent"}
        >
          Recent
        </button>
        <button
          type="button"
          className={`leaderboard-filter-button${leaderboardSort === "likes" ? " active" : ""}`}
          onClick={() => {
            setLeaderboardSort("likes");
            setLeaderboardPage(1);
          }}
          aria-pressed={leaderboardSort === "likes"}
        >
          Most liked
        </button>
      </div>
      {leaderboard.length === 0 && (
        <div className="leaderboard-status">
          No casts yet today. Be the first!
        </div>
      )}
      {leaderboard.length > 0 && (
        <div className="leaderboard-grid">
          {pagedLeaderboard.map((entry, index) => {
            const castUrl =
              entry.castUrl ??
              (entry.id && /^0x[a-fA-F0-9]{64}$/.test(entry.id)
                ? `https://warpcast.com/~/cast/${entry.id}`
                : undefined);
            const isCastLink = !!castUrl;
            const rank =
              (leaderboardPage - 1) * leaderboardPageSize + index + 1;
            const rarityValue = entry.rarity
              ? String(entry.rarity).toUpperCase()
              : "Unknown";
            const presetValue = entry.presetKey ?? "Unknown";
            const CardContent = (
              <>
                <div className={`leaderboard-rank${rank <= 3 ? " top" : ""}`}>
                  #{rank}
                </div>
                <div className="leaderboard-card-header">
                  {entry.pfpUrl ? (
                    <NextImage
                      src={entry.pfpUrl}
                      alt={entry.username}
                      className="leaderboard-avatar"
                      width={28}
                      height={28}
                      unoptimized
                    />
                  ) : (
                    <div className="leaderboard-avatar placeholder" />
                  )}
                  <Link
                    href={`/profile/${encodeURIComponent(entry.username)}`}
                    className="leaderboard-user"
                    aria-label={`View profile for ${entry.username}`}
                  >
                    <div className="leaderboard-name">{entry.displayName}</div>
                    <div className="leaderboard-username">
                      @{entry.username}
                    </div>
                  </Link>
                </div>
                {(() => {
                  // Use logo image for leaderboard display context
                  const leaderboardImageUrl = getImageForContext(
                    {
                      logoImageUrl: entry.logoImageUrl,
                      cardImageUrl: entry.cardImageUrl,
                      imageUrl: entry.imageUrl,
                    },
                    "leaderboard",
                  );
                  return leaderboardImageUrl ? (
                    <NextImage
                      src={leaderboardImageUrl}
                      alt="Cast media"
                      className="leaderboard-image"
                      width={400}
                      height={120}
                      unoptimized
                    />
                  ) : (
                    <div className="leaderboard-text">
                      {entry.text || "View cast"}
                    </div>
                  );
                })()}
                <div className="leaderboard-tags">
                  <span className="leaderboard-chip">{rarityValue}</span>
                  <span className="leaderboard-chip">{presetValue}</span>
                </div>
                <div className="leaderboard-metrics">
                  <div className="leaderboard-metrics-values">
                    <span>❤️ {entry.likes}</span>
                    <span>🔁 {entry.recasts ?? 0}</span>
                  </div>
                  <div className="leaderboard-metrics-actions">
                    <button
                      type="button"
                      className="leaderboard-like"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleLeaderboardLike(entry.id);
                      }}
                      aria-label={`Like cast by ${entry.username}`}
                    >
                      {likedEntryIds.has(entry.id) ? "💔 Unlike" : "❤️ Like"}
                    </button>
                    <button
                      type="button"
                      className="leaderboard-share"
                      onClick={(event) => {
                        event.preventDefault();
                        openWarpcastShare(entry);
                      }}
                      aria-label={`Share cast by ${entry.username}`}
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>
              </>
            );

            return isCastLink ? (
              <a
                key={entry.id}
                className="leaderboard-card"
                href={castUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open cast by ${entry.username}`}
              >
                {CardContent}
              </a>
            ) : (
              <div
                key={entry.id}
                className="leaderboard-card"
                aria-label={`Local entry by ${entry.username}`}
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      )}
      {leaderboard.length > 0 && leaderboardTotalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button"
            onClick={() => setLeaderboardPage((prev) => Math.max(1, prev - 1))}
            disabled={leaderboardPage === 1}
          >
            Prev
          </button>
          <span className="pagination-status">
            Page {leaderboardPage} of {leaderboardTotalPages}
          </span>
          <button
            type="button"
            className="pagination-button"
            onClick={() =>
              setLeaderboardPage((prev) =>
                Math.min(leaderboardTotalPages, prev + 1),
              )
            }
            disabled={leaderboardPage === leaderboardTotalPages}
          >
            Next
          </button>
        </div>
      )}
      {leaderboard.length > 0 && (
        <div className="recent-casts">
          <div className="leaderboard-title">⚡ Rising</div>
          <div className="recent-casts-list">
            {[...leaderboard]
              .sort((a, b) => {
                const bCreated =
                  typeof b.createdAt === "string"
                    ? new Date(b.createdAt).getTime()
                    : b.createdAt;
                const aCreated =
                  typeof a.createdAt === "string"
                    ? new Date(a.createdAt).getTime()
                    : a.createdAt;
                return bCreated - aCreated;
              })
              .slice(0, 5)
              .map((entry) => (
                <div key={`recent-${entry.id}`} className="recent-cast">
                  {(() => {
                    const castUrl =
                      entry.castUrl ??
                      (entry.id && /^0x[a-fA-F0-9]{64}$/.test(entry.id)
                        ? `https://warpcast.com/~/cast/${entry.id}`
                        : undefined);
                    return (
                      <>
                        <span>
                          {formatHistoryTime(
                            typeof entry.createdAt === "string"
                              ? new Date(entry.createdAt).getTime()
                              : entry.createdAt,
                          )}
                        </span>
                        <span>@{entry.username}</span>
                        {castUrl ? (
                          <a href={castUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        ) : (
                          <span>Local</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const challengeProgress =
    dailyChallenges.length > 0
      ? Object.values(challengeDone).filter(Boolean).length /
        dailyChallenges.length
      : 0;
  const topPercent = Math.max(5, Math.round(40 - challengeProgress * 30));

  const challengeContent = (
    <div className="challenge">
      <div className="leaderboard-title">Mini‑Series Challenge</div>
      <div className="leaderboard-status">
        Complete all 6 prompts: Generate a logo for each brand below, then cast
        your favorites to earn the Daily Champion badge!
      </div>
      <div className="challenge-stats">
        <div className="challenge-streak">
          <span className="challenge-streak-icon" aria-hidden="true">
            🔥
          </span>
          Streak: {getChallengeStreak(challengeDays)} day
          {getChallengeStreak(challengeDays) === 1 ? "" : "s"}
        </div>
        <div className="challenge-progress">
          Progress: {Object.values(challengeDone).filter(Boolean).length} /{" "}
          {dailyChallenges.length} prompts
        </div>
      </div>
      <div className="challenge-progress-ring" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="img">
          <circle className="challenge-ring-track" cx="50" cy="50" r="42" />
          <circle
            className="challenge-ring-fill"
            cx="50"
            cy="50"
            r="42"
            style={{
              strokeDasharray: 264,
              strokeDashoffset: 264 - 264 * challengeProgress,
            }}
          />
        </svg>
        <span>{Math.round(challengeProgress * 100)}%</span>
      </div>
      <div className="challenge-top-percent">
        You&apos;re in the top {topPercent}% today
      </div>
      {timeUntilReset && (
        <div className="challenge-reset-timer">
          ⏰ Resets in: {timeUntilReset}
        </div>
      )}
      <div className="challenge-progress-bar">
        <div
          className="challenge-progress-fill"
          style={{
            width: `${dailyChallenges.length > 0 ? (Object.values(challengeDone).filter(Boolean).length / dailyChallenges.length) * 100 : 0}%`,
          }}
        />
      </div>
      {dailyChallenges.length > 0 ? (
        <div className="challenge-list">
          {dailyChallenges.map(
            (prompt: (typeof ALL_CHALLENGE_PROMPTS)[number]) => {
              const promptName = prompt.name;
              return (
                <div
                  key={promptName}
                  className={`challenge-item ${challengeDone[promptName] ? "completed" : ""}`}
                >
                  <div className="challenge-item-content">
                    <label className="challenge-label">
                      <input
                        type="checkbox"
                        checked={!!challengeDone[promptName]}
                        onChange={() => toggleChallengeDone(promptName)}
                      />
                      <div className="challenge-info">
                        <span className="challenge-name">{promptName}</span>
                        <span className="challenge-description">
                          {prompt.description}
                        </span>
                      </div>
                      {challengeDone[promptName] && (
                        <span className="challenge-check">✓</span>
                      )}
                    </label>
                  </div>
                  <button
                    type="button"
                    className="challenge-button"
                    onClick={() => {
                      setInputText(promptName);
                      setActiveTab("home");
                      // Note: Seed field remains available - you can use any seed with prompts
                    }}
                  >
                    Generate
                  </button>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="challenge-loading">
          Loading today&apos;s challenges...
        </div>
      )}
      {Object.values(challengeDone).every(Boolean) && (
        <div className="challenge-complete">
          <div className="challenge-confetti" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={`confetti-${index}`} />
            ))}
          </div>
          🎉 Challenge complete! You earned the Daily Champion badge! ✅
        </div>
      )}
      {challengeHistory.length > 0 && (
        <div className="challenge-history-section">
          <div className="leaderboard-title">Recent History</div>
          <div className="challenge-history-grid">
            {challengeHistory.map((item) => (
              <div
                key={item.date}
                className={`challenge-history-item ${item.completed ? "completed" : "incomplete"}`}
              >
                <div className="challenge-history-date">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="challenge-history-status">
                  {item.completed ? "✅" : "⏳"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const profileTabContent = (
    <div className="profile-tab">
      <div className="leaderboard-title">Your Profile</div>
      {userInfo?.username ? (
        <div className="profile-tab-card">
          <div className="profile-tab-name">@{userInfo.username}</div>
          {profileLoading && (
            <div className="profile-tab-meta">Loading profile...</div>
          )}
          {profileError && (
            <div className="profile-tab-meta">{profileError}</div>
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
                  getChallengeStreak(challengeDays),
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
            href={`/profile/${encodeURIComponent(userInfo.username)}`}
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

  return (
    <div className={`logo-generator${isGenerating ? " is-generating" : ""}`}>
      {showDailyBoot && (
        <div
          className="daily-boot-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Daily boot screen"
        >
          <div className="daily-boot-card">
            <div className="daily-boot-title">Pixel Logo Forge</div>
            <div className="daily-boot-subtitle">Terminal boot</div>
            <div className="daily-boot-lines">
              <div>Daily seeds available: {TRIES_PER_DAY}</div>
              <div>
                Rarity odds: Common 50% · Rare 30% · Epic 15% · Legendary 5%
              </div>
            </div>
            <button
              type="button"
              className="daily-boot-start"
              onClick={dismissDailyBoot}
            >
              Tap to start
            </button>
          </div>
        </div>
      )}
      {activeMoment && (
        <div
          className="moment-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Achievement unlocked"
        >
          <div className="moment-card">
            <div className="moment-icon" aria-hidden="true">
              {activeMoment.icon}
            </div>
            <div className="moment-title">{activeMoment.title}</div>
            <div className="moment-subtitle">{activeMoment.subtitle}</div>
            <div className="moment-actions">
              <button
                type="button"
                className="moment-share"
                onClick={shareMoment}
              >
                Share this moment
              </button>
              <button
                type="button"
                className="moment-close"
                onClick={dismissMoment}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => {
            setShowOnboarding(false);
            setOnboardingDone(true);
            try {
              localStorage.setItem("plf:onboardingDone", "true");
            } catch (error) {
              console.error("Failed to save onboarding state:", error);
            }
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setOnboardingDone(true);
            try {
              localStorage.setItem("plf:onboardingDone", "true");
            } catch (error) {
              console.error("Failed to save onboarding state:", error);
            }
          }}
        />
      )}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={async (feedback) => {
            try {
              await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...feedback,
                  userId: userInfo?.fid ? String(userInfo.fid) : undefined,
                  username: userInfo?.username,
                }),
              });
              setToast({
                message: "Thanks for your feedback!",
                type: "success",
              });
            } catch (error) {
              setToast({ message: "Failed to submit feedback", type: "error" });
            }
          }}
        />
      )}
      {rewardAnimation && (
        <RewardAnimation
          type={rewardAnimation.type}
          title={rewardAnimation.title}
          subtitle={rewardAnimation.subtitle}
          onComplete={() => setRewardAnimation(null)}
        />
      )}
      {showCastPreview && castPreviewImage && (
        <CastPreviewModal
          previewImage={castPreviewImage}
          castText={castDraftText || castPreviewText}
          onConfirm={() =>
            handleCast(
              castTarget ?? undefined,
              castTargetRemixSeed,
              castDraftText,
            )
          }
          onCancel={() => setShowCastPreview(false)}
          onTagFriend={handleTagFriend}
          isCasting={isCasting}
        />
      )}
      {showHowItWorks && (
        <div
          className="how-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="How it works"
        >
          <div className="how-modal">
            <div className="how-modal-title">How it works</div>
            <div className="how-modal-body">
              <p>Each logo is generated from your text and a seed.</p>
              <p>The same text + seed always recreates the exact logo.</p>
              <p>Rarity is a random roll that unlocks extra effects.</p>
              <p>You can generate up to 3 words per day.</p>
              <p>You can enter a custom seed once per day.</p>
            </div>
            <button
              className="how-modal-close"
              onClick={() => setShowHowItWorks(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {activeTab === "home" && (
        <div className="input-panel">
          <div className="input-section">
            {/* NEW: Mode Toggle */}
            <div
              className="mode-toggle-wrapper"
              style={{
                marginBottom: "1rem",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className={`mode-toggle-button ${uiMode === "simple" ? "active" : ""}`}
                onClick={() => {
                  setUiMode("simple");
                  try {
                    localStorage.setItem("plf:uiMode", "simple");
                  } catch (error) {
                    console.error("Failed to save UI mode:", error);
                  }
                }}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  border: "2px solid",
                  borderColor: uiMode === "simple" ? "#00ff00" : "#444",
                  background: uiMode === "simple" ? "#00ff0020" : "transparent",
                  color: uiMode === "simple" ? "#00ff00" : "#888",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.2s",
                }}
              >
                🎮 Simple
              </button>
              <button
                type="button"
                className={`mode-toggle-button ${uiMode === "advanced" ? "active" : ""}`}
                onClick={() => {
                  setUiMode("advanced");
                  try {
                    localStorage.setItem("plf:uiMode", "advanced");
                  } catch (error) {
                    console.error("Failed to save UI mode:", error);
                  }
                }}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  border: "2px solid",
                  borderColor: uiMode === "advanced" ? "#00ff00" : "#444",
                  background:
                    uiMode === "advanced" ? "#00ff0020" : "transparent",
                  color: uiMode === "advanced" ? "#00ff00" : "#888",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.2s",
                }}
              >
                ⚙️ Advanced
              </button>
            </div>

            <div className="daily-limit">
              Tries left today:{" "}
              {userInfo?.username?.toLowerCase() === "ladymel"
                ? "Unlimited"
                : `${Math.max(0, TRIES_PER_DAY - dailyLimit.words.length)}/${TRIES_PER_DAY}`}
            </div>
            <div className="prompt-of-day">
              Prompt of the day: <span>{getPromptOfDay()}</span>
              <button
                type="button"
                className="prompt-button"
                onClick={() => {
                  setInputText(getPromptOfDay());
                  // Note: Seed field remains available - you can use any seed with prompts
                }}
              >
                Use prompt
              </button>
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter your text (max 30 chars)"
              maxLength={30}
              className="terminal-input"
              disabled={isGenerating}
              aria-label="Text input for logo generation"
              aria-required="true"
            />
            {/* Only show seed input in Advanced Mode */}
            {uiMode === "advanced" && (
              <div className="seed-input-group">
                <div className="seed-label">
                  <svg
                    className="seed-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect x="6" y="2" width="4" height="2" />
                    <rect x="5" y="4" width="6" height="2" />
                    <rect x="4" y="6" width="8" height="2" />
                    <rect x="4" y="8" width="8" height="2" />
                    <rect x="5" y="10" width="6" height="2" />
                    <rect x="6" y="12" width="4" height="2" />
                  </svg>
                  <span>Seed</span>
                  <button
                    type="button"
                    className={`remix-pill${remixMode ? " active" : ""}`}
                    onClick={() => {
                      if (!customSeed.trim()) {
                        setToast({
                          message: "Enter a seed to enable remix.",
                          type: "info",
                        });
                        return;
                      }
                      if (!inputText.trim()) {
                        setToast({
                          message: "Enter the original text to remix.",
                          type: "info",
                        });
                        return;
                      }
                      setRemixMode((prev) => !prev);
                    }}
                    aria-pressed={remixMode}
                  >
                    Remix
                  </button>
                </div>
                <input
                  type="text"
                  value={customSeed}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setCustomSeed(value);

                    if (value === "") {
                      setSeedError("");
                      return;
                    }

                    const parsedSeed = parseInt(value, 10);
                    if (isNaN(parsedSeed)) {
                      setSeedError("Seed must be a number");
                    } else if (parsedSeed < 0 || parsedSeed > 2147483647) {
                      setSeedError("Seed must be between 0 and 2147483647");
                    } else {
                      setSeedError("");
                    }
                  }}
                  placeholder="Optional: Use a seed once per day"
                  className="seed-input"
                  disabled={isGenerating || dailyLimit.seedUsed}
                  aria-label="Optional seed input for deterministic logo generation"
                  aria-invalid={seedError !== ""}
                  aria-describedby={seedError ? "seed-error" : "seed-hint"}
                />
                {seedError ? (
                  <span id="seed-error" className="seed-error" role="alert">
                    {seedError}
                  </span>
                ) : (
                  <span id="seed-hint" className="seed-hint">
                    {dailyLimit.seedUsed
                      ? "Seed used today — try again tomorrow"
                      : "One seed entry per day"}
                  </span>
                )}
                <span className="seed-tip">Tip: seed = recreate</span>
              </div>
            )}
            {/* End of Advanced Mode section */}
            <button
              type="button"
              className="how-link"
              onClick={() => setShowHowItWorks(true)}
              aria-label="How it works"
            >
              How it works
            </button>
            <button
              type="button"
              className="sound-toggle"
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              aria-label={`Sound ${soundEnabled ? "on" : "off"}`}
            >
              Sound: {soundEnabled ? "On" : "Off"}
            </button>
            {/* NEW: Feedback Button */}
            <button
              type="button"
              className="feedback-button"
              onClick={() => setShowFeedbackModal(true)}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.7rem",
                border: "1px solid #ff00ff",
                background: "transparent",
                color: "#ff00ff",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "monospace",
                marginTop: "0.25rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ff00ff20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              💬 Feedback
            </button>
            <div className="button-group">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="arcade-button"
                aria-label="Generate pixel logo"
                aria-busy={isGenerating ? "true" : "false"}
              >
                {isGenerating ? "FORGING..." : "FORGE"}
              </button>
              <button
                onClick={handleRandomize}
                disabled={isGenerating}
                className="arcade-button secondary"
                aria-label="Randomize logo"
              >
                RANDOMIZE
              </button>
            </div>
            {isGenerating && seedCrackStage && (
              <div className="seed-crack-overlay">
                <div
                  className={`seed-crack${seedCrackRarity ? ` rarity-${seedCrackRarity.toLowerCase()}` : ""}`}
                  aria-live="polite"
                >
                  {(seedCrackStage === "dormant" ||
                    seedCrackStage === "stress" ||
                    seedCrackStage === "crawl-1" ||
                    seedCrackStage === "crawl-2" ||
                    seedCrackStage === "fissure" ||
                    seedCrackStage === "swell" ||
                    seedCrackStage === "shake" ||
                    seedCrackStage === "pause" ||
                    seedCrackStage === "bloom") && (
                    <>
                      <span className="seed-crack-label">Cracking seed</span>
                      <div
                        className={`seed-crack-icon stage-${seedCrackStage}${
                          seedCrackStage === "bloom" ? " is-split" : ""
                        }`}
                        style={{
                          ["--seed-shake" as any]: seedCrackVariance
                            ? `${seedCrackVariance.shakeAmp.toFixed(2)}px`
                            : undefined,
                          ["--seed-crack-offset" as any]: seedCrackVariance
                            ? `${seedCrackVariance.crackOffset.toFixed(2)}px`
                            : undefined,
                          ["--seed-glow-hue" as any]: seedCrackVariance
                            ? `${seedCrackVariance.glowHue.toFixed(2)}deg`
                            : undefined,
                          ["--seed-bloom-angle" as any]: seedCrackVariance
                            ? `${seedCrackVariance.bloomAngle.toFixed(2)}deg`
                            : undefined,
                        }}
                        aria-hidden="true"
                      >
                        <div
                          className={`seed-crack-shake${seedCrackStage === "shake" ? " is-active" : ""}`}
                        >
                          <div className="seed-crack-body" />
                          <div className="seed-crack-flap left" />
                          <div className="seed-crack-flap right" />
                          <div className="seed-crack-line" />
                          <div className="seed-crack-highlight" />
                          <div className="seed-crack-glow" />
                          <div
                            className="seed-crack-sparkles"
                            aria-hidden="true"
                          >
                            <span className="seed-sparkle sparkle-1" />
                            <span className="seed-sparkle sparkle-2" />
                            <span className="seed-sparkle sparkle-3" />
                          </div>
                        </div>
                      </div>
                      <span className="seed-crack-stage">
                        {seedCrackStage === "dormant" && "Stage 1/9"}
                        {seedCrackStage === "stress" && "Stage 2/9"}
                        {seedCrackStage === "crawl-1" && "Stage 3/9"}
                        {seedCrackStage === "crawl-2" && "Stage 4/9"}
                        {seedCrackStage === "fissure" && "Stage 5/9"}
                        {seedCrackStage === "swell" && "Stage 6/9"}
                        {seedCrackStage === "shake" && "Stage 7/9"}
                        {seedCrackStage === "pause" && "Stage 8/9"}
                        {seedCrackStage === "bloom" && "Stage 9/9"}
                      </span>
                    </>
                  )}
                  {seedCrackStage === "ticket" && (
                    <>
                      <div
                        className={`seed-ticket from-seed rarity-${(seedCrackRarity || "COMMON").toLowerCase()}`}
                      >
                        <span className="seed-ticket-label">Seed ticket</span>
                        <span className="seed-ticket-value">
                          {seedCrackValue}
                        </span>
                      </div>
                      <span className="seed-crack-stage">Stage 10/10</span>
                      <div className="seed-congrats">
                        {seedCrackRarity === "LEGENDARY"
                          ? "Legendary forge unlocked."
                          : "Congratulations."}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="preset-group">
              <div className="preset-title">Style presets</div>
              <div className="preset-list">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    className={`preset-button${selectedPreset === preset.key ? " active" : ""}`}
                    onClick={() => {
                      setSelectedPreset(preset.key);
                      if (inputText.trim()) {
                        setTimeout(() => handleGenerate(), 0);
                      }
                    }}
                    type="button"
                    aria-pressed={selectedPreset === preset.key}
                  >
                    {preset.label}
                    <span className="preset-swatches">
                      <span
                        className="preset-thumb"
                        style={{
                          background: `linear-gradient(90deg, ${(PRESET_SWATCHES[preset.key] || []).join(", ")})`,
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "home" && logoResult && (
        <div className="output-section">
          <div className="logo-card">
            <div
              className="rarity-badge"
              style={{ borderColor: getRarityColor(logoResult.rarity) }}
            >
              <div
                className="rarity-glow"
                style={{ background: getRarityColor(logoResult.rarity) }}
                aria-hidden="true"
              />
              <span className="rarity-label">RARITY:</span>
              <span
                className="rarity-value"
                style={{ color: getRarityColor(logoResult.rarity) }}
              >
                {logoResult.rarity}
              </span>
              <button
                type="button"
                className="rarity-tooltip"
                aria-label="Rarity breakdown: Common 50, Rare 30, Epic 15, Legendary 5"
              >
                i
                <span className="rarity-tooltip-text">
                  Common 50% • Rare 30% • Epic 15% • Legendary 5%
                </span>
              </button>
            </div>
            <div
              className={`logo-image-wrapper rarity-${logoResult.rarity.toLowerCase()}`}
            >
              <div className="logo-card-frame" aria-hidden="true" />
              <NextImage
                key={`${logoResult.seed}-${logoResult.config.text}`}
                src={logoResult.dataUrl}
                alt={`Pixel logo: ${logoResult.config.text} with ${logoResult.rarity} rarity`}
                className="logo-image logo-image-reveal"
                role="img"
                aria-label={`Generated pixel logo for "${logoResult.config.text}" with ${logoResult.rarity} rarity.${isMobile ? " Long-press to save to camera roll." : ""}`}
                width={512}
                height={512}
                unoptimized
              />
              <div className="logo-shine" aria-hidden="true" />
              <div className="rarity-sparkle" aria-hidden="true" />
              <button
                type="button"
                className="logo-download-button"
                onClick={() => setShowDownloadOptions(true)}
                aria-label="Download options"
              >
                ⬇
              </button>
            </div>
            {showDownloadOptions && (
              <div className="download-modal">
                <div
                  className="download-modal-card"
                  role="dialog"
                  aria-label="Download options"
                >
                  <div className="download-modal-title">Save image</div>
                  <div className="download-modal-actions">
                    <button
                      type="button"
                      onClick={() => openImageForSave("photos")}
                    >
                      Save to Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => openImageForSave("files")}
                    >
                      Save to Files
                    </button>
                    <button
                      type="button"
                      onClick={() => openImageForSave("download")}
                    >
                      Download image
                    </button>
                  </div>
                  <button
                    type="button"
                    className="download-modal-cancel"
                    onClick={() => setShowDownloadOptions(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="logo-info">
              <button
                className="how-it-works"
                type="button"
                onClick={() => setShowHowItWorks(true)}
                aria-label="How it works"
              >
                How it works
              </button>
              <div className="seed-display">
                <span>Seed: </span>
                <span className="seed-value">{logoResult.seed}</span>
                <span className="seed-help">(Permanent)</span>
              </div>
              <div className="seed-permanence">
                This seed is permanent. Anyone can recreate it.
              </div>
              <div className="logo-footer">Generated by Pixel Logo Forge</div>
            </div>
            <div className="actions-divider">Actions</div>
            <div className="auto-reply-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(event) => {
                    const nextValue = event.target.checked;
                    setAutoReplyEnabled(nextValue);
                    saveAutoReplySetting(nextValue);
                  }}
                />
                Auto-reply with app link
              </label>
            </div>
            <div className="logo-actions">
              <div className="logo-actions-primary action-row action-row-two">
                <button
                  onClick={() =>
                    remixMode ? handleRemixCast() : handleCastClick()
                  }
                  className="action-button cast-button"
                  disabled={isCasting || isGenerating}
                  aria-label="Cast logo to Farcaster"
                  aria-busy={isCasting ? "true" : "false"}
                >
                  {isCasting ? "CASTING..." : "CAST"}
                </button>
                <button
                  onClick={handleDownload}
                  className="action-button"
                  disabled={isGenerating}
                  aria-label={
                    isMobile
                      ? "Save image to Photos or Files"
                      : "Download image as PNG"
                  }
                >
                  DOWNLOAD
                </button>
              </div>
              <div className="logo-actions-secondary">
                <div className="action-icons">
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={copySeed}
                    aria-label={`Copy seed ${logoResult.seed} to clipboard`}
                    disabled={isGenerating}
                  >
                    🔑
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={() => toggleFavorite(logoResult)}
                    aria-label="Save logo to favorites"
                    disabled={isGenerating}
                  >
                    ⭐<span>{isFavorite(logoResult) ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={() => setRemixMode((prev) => !prev)}
                    aria-label="Toggle remix mode"
                    disabled={isGenerating}
                  >
                    ♻️
                    <span>{remixMode ? "Remix on" : "Remix"}</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={handleShare}
                    aria-label="Share logo link"
                    aria-busy={isSharing}
                    disabled={isSharing || isGenerating}
                  >
                    🔗
                    <span>{isSharing ? "Sharing" : "Share"}</span>
                  </button>
                </div>
              </div>
            </div>
            {sdkReady && !miniappAdded && (
              <div className="miniapp-cta">
                <span>Add to collection for quick access.</span>
                <button
                  type="button"
                  className="miniapp-cta-button"
                  onClick={handleAddMiniapp}
                >
                  Add to Collection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "home" && (
        <div className="output-section">
          <div className="home-top-casts">
            <div className="leaderboard-title">Top 3 casts today</div>
            {sortedLeaderboard.length === 0 ? (
              <div className="leaderboard-status">
                No casts yet today. Be the first!
              </div>
            ) : (
              <div className="home-top-casts-grid">
                {sortedLeaderboard.slice(0, 3).map((entry, index) => (
                  <div key={`home-top-${entry.id}`} className="home-top-cast">
                    {index === 0 && (
                      <div className="home-top-cast-champion">
                        <span className="champion-crown" aria-hidden="true">
                          👑
                        </span>
                        Today&apos;s Champion
                      </div>
                    )}
                    {(() => {
                      // Use card image for highlighted cast display (like trophy display)
                      const previewImageUrl = getImageForContext(
                        {
                          logoImageUrl: entry.logoImageUrl,
                          cardImageUrl: entry.cardImageUrl,
                          imageUrl: entry.imageUrl,
                        },
                        "preview",
                      );
                      return previewImageUrl ? (
                        <NextImage
                          src={previewImageUrl}
                          alt={`Logo by ${entry.username}`}
                          className="home-top-cast-image"
                          width={160}
                          height={110}
                          unoptimized
                        />
                      ) : (
                        <div className="home-top-cast-text">
                          {entry.text || "View cast"}
                        </div>
                      );
                    })()}
                    <div className="home-top-cast-meta">
                      <span>@{entry.username}</span>
                      <span>❤️ {entry.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "gallery" && (
        <div className="output-section">
          {castGalleryContent}
          {favoritesContent}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="output-section">{leaderboardContent}</div>
      )}

      {activeTab === "challenge" && (
        <div className="output-section">{challengeContent}</div>
      )}

      {activeTab === "profile" && (
        <div className="output-section">{profileTabContent}</div>
      )}

      <nav className="bottom-nav" aria-label="Main navigation">
        <button
          type="button"
          className={`bottom-nav-button${activeTab === "home" ? " active" : ""}`}
          onClick={() => setActiveTab("home")}
          aria-pressed={activeTab === "home"}
          aria-label="Home"
          data-label="Home"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🏠
          </span>
        </button>
        <button
          type="button"
          className={`bottom-nav-button${activeTab === "gallery" ? " active" : ""}`}
          onClick={() => setActiveTab("gallery")}
          aria-pressed={activeTab === "gallery"}
          aria-label="Gallery"
          data-label="Gallery"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🖼️
          </span>
          {hasNewGallery && <span className="nav-dot" aria-hidden="true" />}
        </button>
        <button
          type="button"
          className={`bottom-nav-button${activeTab === "leaderboard" ? " active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
          aria-pressed={activeTab === "leaderboard"}
          aria-label="Leaderboard"
          data-label="Leaderboard"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🏆
          </span>
        </button>
        <button
          type="button"
          className={`bottom-nav-button${activeTab === "challenge" ? " active" : ""}`}
          onClick={() => setActiveTab("challenge")}
          aria-pressed={activeTab === "challenge"}
          aria-label="Challenge"
          data-label="Challenge"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            🎯
          </span>
        </button>
        <button
          type="button"
          className={`bottom-nav-button${activeTab === "profile" ? " active" : ""}`}
          onClick={() => setActiveTab("profile")}
          aria-pressed={activeTab === "profile"}
          aria-label="Profile"
          data-label="Profile"
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            👤
          </span>
          {hasNewProfile && <span className="nav-dot" aria-hidden="true" />}
        </button>
      </nav>
    </div>
  );
}
