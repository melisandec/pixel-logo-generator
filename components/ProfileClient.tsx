"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { sdk } from "@farcaster/miniapp-sdk";
import { getImageForContext } from "@/lib/imageContext";
import { EXTRA_BADGE_TYPES } from "@/lib/badgeTypes";

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

const generatePlayerCard = (
  username: string,
  level: number,
  bestRarity: string,
  forgeRank: string,
  signatureLogo: LeaderboardEntry | null,
  isRarityMaster: boolean,
): Promise<string> => {
  return new Promise((resolve) => {
    // Create canvas (square 600x600)
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

    // Background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, 600, 600);

    // Gradient overlay for rarity
    const gradient = ctx.createLinearGradient(0, 0, 600, 600);
    let topColor = "rgba(0, 255, 0, 0.1)"; // Common
    let accentColor = "#00ff00";
    let glowColor = "rgba(0, 255, 0, 0.3)";

    switch (bestRarity.toUpperCase()) {
      case "LEGENDARY":
        topColor = "rgba(255, 170, 0, 0.15)";
        accentColor = "#ffaa00";
        glowColor = "rgba(255, 170, 0, 0.4)";
        break;
      case "EPIC":
        topColor = "rgba(170, 0, 255, 0.12)";
        accentColor = "#aa00ff";
        glowColor = "rgba(170, 0, 255, 0.35)";
        break;
      case "RARE":
        topColor = "rgba(0, 170, 255, 0.12)";
        accentColor = "#00aaff";
        glowColor = "rgba(0, 170, 255, 0.3)";
        break;
    }

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);

    // Border glow
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, 570, 570);

    // Top section - Title
    ctx.fillStyle = accentColor;
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PIXEL LOGO FORGE", 300, 50);

    // Player card title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText("PLAYER CARD", 300, 80);

    // Username section
    ctx.fillStyle = accentColor;
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`@${username}`, 300, 130);

    // Stats section - left side
    ctx.fillStyle = "#cccccc";
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("LEVEL", 40, 180);
    ctx.fillStyle = accentColor;
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText(`${level}`, 40, 220);

    // Forge Rank - center
    ctx.fillStyle = "#cccccc";
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("FORGE RANK", 300, 180);
    ctx.fillStyle = accentColor;
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.fillText(forgeRank, 300, 220);

    // Best Rarity - right side
    ctx.fillStyle = "#cccccc";
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("BEST RARITY", 560, 180);
    ctx.fillStyle = accentColor;
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText(bestRarity, 560, 220);

    // Divider line
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 240);
    ctx.lineTo(570, 240);
    ctx.stroke();

    // Signature logo section - use raw logo image (not card)
    if (signatureLogo) {
      // Prefer logoImageUrl (raw logo) over cardImageUrl, fallback to imageUrl
      const logoToDisplay = signatureLogo.logoImageUrl || signatureLogo.cardImageUrl || signatureLogo.imageUrl;
      if (logoToDisplay) {
      const imgElement = typeof window !== "undefined" ? new (window as any).Image() : null;
      if (!imgElement) {
        // Fallback: no image support
        ctx.fillStyle = "#333333";
        ctx.fillRect(65, 275, 470, 270);
        ctx.fillStyle = "#888888";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIGNATURE LOGO", 300, 410);

        if (isRarityMaster) {
          ctx.fillStyle = "#ffaa00";
          ctx.font = "bold 11px 'Courier New', monospace";
          ctx.textAlign = "right";
          ctx.fillText("★ RARITY MASTER", 530, 560);
        }

        resolve(canvas.toDataURL("image/png"));
        return;
      }

      imgElement.crossOrigin = "anonymous";
      imgElement.onload = () => {
        // Draw signature logo frame
        ctx.fillStyle = glowColor;
        ctx.fillRect(60, 270, 480, 280);
        ctx.fillStyle = "#0a0e27";
        ctx.fillRect(65, 275, 470, 270);

        // Draw image
        ctx.drawImage(imgElement, 65, 275, 470, 270);

        // Label
        ctx.fillStyle = "#cccccc";
        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.fillText("SIGNATURE LOGO", 70, 560);

        // Rarity Master badge
        if (isRarityMaster) {
          ctx.fillStyle = "#ffaa00";
          ctx.font = "bold 11px 'Courier New', monospace";
          ctx.textAlign = "right";
          ctx.fillText("★ RARITY MASTER", 530, 560);
        }

        // Convert canvas to data URL
        resolve(canvas.toDataURL("image/png"));
      };
      imgElement.onerror = () => {
        // If image fails to load, show placeholder
        ctx.fillStyle = "#333333";
        ctx.fillRect(65, 275, 470, 270);
        ctx.fillStyle = "#888888";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIGNATURE LOGO", 300, 410);
        if (isRarityMaster) {
          ctx.fillStyle = "#ffaa00";
          ctx.font = "bold 11px 'Courier New', monospace";
          ctx.textAlign = "right";
          ctx.fillText("★ RARITY MASTER", 530, 560);
        }

        resolve(canvas.toDataURL("image/png"));
      };
      imgElement.src = logoToDisplay;
      } else {
        // Logo data not available, show placeholder
        ctx.fillStyle = "#333333";
        ctx.fillRect(65, 275, 470, 270);
        ctx.fillStyle = "#888888";
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIGNATURE LOGO", 300, 410);

        if (isRarityMaster) {
          ctx.fillStyle = "#ffaa00";
          ctx.font = "bold 11px 'Courier New', monospace";
          ctx.textAlign = "right";
          ctx.fillText("★ RARITY MASTER", 530, 560);
        }

        resolve(canvas.toDataURL("image/png"));
      }
    } else {
      // No signature logo - show placeholder
      ctx.fillStyle = "#333333";
      ctx.fillRect(65, 275, 470, 270);
      ctx.fillStyle = "#888888";
      ctx.font = "14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SELECT A SIGNATURE LOGO", 300, 410);

      if (isRarityMaster) {
        ctx.fillStyle = "#ffaa00";
        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.fillText("★ RARITY MASTER", 530, 560);
      }

      resolve(canvas.toDataURL("image/png"));
    }
  });
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

const getForgeRank = (casts: number, bestRarity: string, legendaryCount: number): string => {
  // Scoring algorithm
  let score = 0;
  score += Math.min(casts, 50); // Max 50 points for casts
  
  // Rarity bonuses
  switch (bestRarity.toUpperCase()) {
    case "LEGENDARY":
      score += 40;
      break;
    case "EPIC":
      score += 25;
      break;
    case "RARE":
      score += 10;
      break;
    case "COMMON":
      score += 5;
      break;
  }
  
  score += legendaryCount * 15; // 15 points per legendary
  
  // Rank tiers
  if (score >= 120) return "S+";
  if (score >= 100) return "S";
  if (score >= 75) return "A";
  if (score >= 50) return "B";
  if (score >= 25) return "C";
  return "D";
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
  const [signatureLogo, setSignatureLogo] = useState<LeaderboardEntry | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showSignatureSelector, setShowSignatureSelector] = useState(false);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

  useEffect(() => {
    // Detect if viewing own profile
    if (typeof window !== "undefined") {
      const currentUsername = localStorage.getItem("farcasterUsername") || "";
      setIsOwnProfile(currentUsername === profile.username);
    }
  }, [profile.username]);

  useEffect(() => {
    // Trigger initial animations
    const timer = setTimeout(() => {
      setInitialAnimationDone(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

    // Calculate rarity counts
    const rarityCounts = {
      COMMON: profile.entries.filter(
        (e) => String(e.rarity).toUpperCase() === "COMMON",
      ).length,
      RARE: profile.entries.filter(
        (e) => String(e.rarity).toUpperCase() === "RARE",
      ).length,
      EPIC: profile.entries.filter(
        (e) => String(e.rarity).toUpperCase() === "EPIC",
      ).length,
      LEGENDARY: legendaryCount,
    };

    return {
      totalCasts,
      totalLikes,
      legendaryCount,
      bestRarity,
      topPreset: presetLabelMap[topPresetKey] ?? topPresetKey,
      raritySet,
      level: getProfileLevel(totalCasts),
      forgeRank: getForgeRank(totalCasts, bestRarity, legendaryCount),
      rarityCounts,
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
    
    // Generate player card image
    const isRarityMaster = userBadges.some(
      (b) => b.badgeType === EXTRA_BADGE_TYPES.RARITY_MASTER,
    );
    
    const playerCardDataUrl = await generatePlayerCard(
      profile.username,
      stats.level,
      stats.bestRarity,
      stats.forgeRank,
      signatureLogo,
      isRarityMaster,
    );

    const text = `My Pixel Logo Forge player card 🎮\n${profileUrl}`;
    
    try {
      // Try to upload player card image
      let playerCardImageUrl: string | null = null;
      try {
        const cardUploadResponse = await fetch("/api/logo-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataUrl: playerCardDataUrl,
            text: `${profile.username}'s Player Card`,
            seed: 0,
          }),
        });
        if (cardUploadResponse.ok) {
          const cardData = await cardUploadResponse.json();
          playerCardImageUrl = cardData.imageUrl;
        }
      } catch (uploadError) {
        console.error("Player card upload failed:", uploadError);
      }

      // Prepare embeds with player card + top logos (use card images for sharing)
      const topLogoEmbeds = topEntries
        .map((entry) => getImageForContext(
          {
            logoImageUrl: entry.logoImageUrl,
            cardImageUrl: entry.cardImageUrl,
            imageUrl: entry.imageUrl,
          },
          "share"
        ))
        .filter(
          (url) =>
            url && (url.startsWith("http://") || url.startsWith("https://")),
        )
        .slice(0, 1);

      const embedsForSdk = playerCardImageUrl
        ? [playerCardImageUrl, ...topLogoEmbeds]
        : topLogoEmbeds;

      const embedsForSDK = embedsForSdk.slice(0, 2) as [string] | [string, string] | [];

      await sdk.actions.composeCast({
        text,
        embeds:
          embedsForSDK.length === 2
            ? ([embedsForSDK[0], embedsForSDK[1]] as [string, string])
            : embedsForSDK.length === 1
              ? ([embedsForSDK[0]] as [string])
              : undefined,
      });
      return;
    } catch (error) {
      console.error("Share collection via SDK failed:", error);
    }

    // Fallback to web share
    const composeUrl = buildWarpcastComposeUrl(text, [playerCardDataUrl]);
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
      <div 
        className={`profile-header profile-aura-${String(stats.bestRarity).toLowerCase()}`}
        style={{
          animation: initialAnimationDone ? "none" : "slideInDown 0.6s ease-out",
        }}
      >
        <div className="profile-visit-state">
          {isOwnProfile ? "YOUR FORGE" : `VIEWING @${profile.username.toUpperCase()}'S FORGE`}
        </div>
        <Link href="/" className="profile-back">
          &larr; Back
        </Link>
        <div className="profile-name-badge">
          <span className="profile-username">@{profile.username}</span>
          <span 
            className="profile-emblems"
            style={{
              animation: initialAnimationDone ? "slideInRight 0.4s ease-out" : "none",
            }}
          >
            {getProfileEmblems(stats.legendaryCount, topEntries).join(" ")}
          </span>
        </div>
        <div className="profile-level-subtitle">
          {getProfileTitle(
            stats.totalCasts,
            stats.legendaryCount,
            stats.raritySet,
          )}{" "}
          Lv. {stats.level} • {stats.forgeRank}
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
        {!isOwnProfile && (
          <button
            type="button"
            className="profile-follow-button"
          >
            Follow
          </button>
        )}
      </div>

      {/* Signature Logo Section */}
      {signatureLogo ? (
        <div className={`signature-logo-section signature-rarity-${String(signatureLogo.rarity).toLowerCase()}`}>
          <div className="signature-logo-header">
            <div className="signature-logo-title">SIGNATURE LOGO</div>
            {isOwnProfile && (
              <button
                type="button"
                className="signature-logo-edit"
                onClick={() => setShowSignatureSelector(!showSignatureSelector)}
              >
                CHANGE
              </button>
            )}
          </div>
          {signatureLogo.imageUrl ? (
            <Image
              src={signatureLogo.imageUrl}
              alt={`Signature logo: ${signatureLogo.text}`}
              className="signature-logo-image"
              width={360}
              height={240}
              unoptimized
              priority
            />
          ) : (
            <div className="signature-logo-text">{signatureLogo.text}</div>
          )}
          <div className="signature-logo-quote">&quot;This is my identity.&quot;</div>
          <div className="signature-logo-meta">
            <span>{signatureLogo.text}</span>
            <span className={`rarity-${String(signatureLogo.rarity).toLowerCase()}`}>
              {signatureLogo.rarity
                ? String(signatureLogo.rarity).toUpperCase()
                : "UNKNOWN"}
            </span>
          </div>
        </div>
      ) : isOwnProfile ? (
        <div className="signature-logo-empty">
          <div className="signature-logo-title">SIGNATURE LOGO</div>
          <p>Choose your signature logo to showcase your masterpiece.</p>
          <button
            type="button"
            className="signature-logo-set"
            onClick={() => setShowSignatureSelector(true)}
          >
            Select Logo
          </button>
        </div>
      ) : null}

      {showSignatureSelector && isOwnProfile && (
        <div className="signature-selector-modal">
          <div className="signature-selector-content">
            <div className="signature-selector-title">Select Signature Logo</div>
            <div className="signature-selector-grid">
              {profile.entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="signature-selector-card"
                  onClick={() => {
                    setSignatureLogo(entry);
                    setShowSignatureSelector(false);
                  }}
                >
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.text}
                      width={120}
                      height={80}
                      unoptimized
                    />
                  ) : (
                    <div className="signature-selector-text">{entry.text}</div>
                  )}
                  <div className="signature-selector-label">
                    {entry.text}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="signature-selector-close"
              onClick={() => setShowSignatureSelector(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-label">TOTAL CASTS</span>
          <strong className="stat-value">{String(stats.totalCasts).padStart(3, "0")}</strong>
        </div>
        <div className="profile-stat">
          <span className="stat-label">FORGE RANK</span>
          <strong className="stat-value forge-rank">{stats.forgeRank}</strong>
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
        <div className="rarity-progress-console-compact">
          {["COMMON", "RARE", "EPIC", "LEGENDARY"].map((r) => {
            const has = profile.entries.some(
              (e) => String(e.rarity).toUpperCase() === r,
            );
            return (
              <div
                key={`rarity-${r}`}
                className={`rarity-progress-item-compact ${has ? "unlocked" : ""} ${r.toLowerCase()}`}
              >
                <span className="rarity-check-compact">{has ? "✔" : "☐"}</span>
                <span className="rarity-label-compact">
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

        <div className="rarity-stats">
          <div className="rarity-stat-row">
            <span className="rarity-stat-label">Common:</span>
            <span className="rarity-stat-count">{stats.rarityCounts.COMMON}</span>
          </div>
          <div className="rarity-stat-row">
            <span className="rarity-stat-label">Rare:</span>
            <span className="rarity-stat-count">{stats.rarityCounts.RARE}</span>
          </div>
          <div className="rarity-stat-row">
            <span className="rarity-stat-label">Epic:</span>
            <span className="rarity-stat-count epic">{stats.rarityCounts.EPIC}</span>
          </div>
          <div className="rarity-stat-row">
            <span className="rarity-stat-label">Legendary:</span>
            <span className="rarity-stat-count legendary">{stats.rarityCounts.LEGENDARY}</span>
          </div>
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
            {(() => {
              // Use card image for showcase/highlight context
              const showcaseImageUrl = getImageForContext(
                {
                  logoImageUrl: latestEntry.logoImageUrl,
                  cardImageUrl: latestEntry.cardImageUrl,
                  imageUrl: latestEntry.imageUrl,
                },
                "share"
              );
              return showcaseImageUrl ? (
              <Image
                src={showcaseImageUrl}
                alt={`Latest logo by ${latestEntry.username}`}
                className="profile-latest-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{latestEntry.text}</div>
            );
            })()}
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
            {filteredEntries.map((entry) => {
              // Use logo image for profile gallery context
              const profileGalleryImageUrl = getImageForContext(
                {
                  logoImageUrl: entry.logoImageUrl,
                  cardImageUrl: entry.cardImageUrl,
                  imageUrl: entry.imageUrl,
                },
                "profile"
              );
              return (
              <div key={`profile-${entry.id}`} className="profile-gallery-card">
                {profileGalleryImageUrl ? (
                  <Image
                    src={profileGalleryImageUrl}
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
            );
            })}
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
