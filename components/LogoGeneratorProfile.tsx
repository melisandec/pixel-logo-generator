"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getImageForContext } from "@/lib/imageContext";
import { LeaderboardEntry, formatHistoryTime } from "@/lib/logoGeneratorTypes";

type UserProfile = {
  username: string;
  displayName?: string | null;
  pfpUrl?: string | null;
  stats?: Record<string, unknown> | null;
  entries: LeaderboardEntry[];
  best?: LeaderboardEntry | null;
};

interface LogoGeneratorProfileProps {
  profileData: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  username: string | undefined;
  challengeStreak: number;
  likedEntryIds?: Set<string>;
  onLike?: (entryId: string) => Promise<void>;
  onShare?: (entry: LeaderboardEntry) => Promise<void>;
}

export default function LogoGeneratorProfile(props: LogoGeneratorProfileProps) {
  const {
    profileData,
    isLoading,
    error,
    username,
    challengeStreak,
    likedEntryIds = new Set(),
    onLike = () => Promise.resolve(),
    onShare = () => Promise.resolve(),
  } = props;

  const [expandedEntry, setExpandedEntry] = useState<LeaderboardEntry | null>(
    null,
  );

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

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!profileData) {
    return (
      <div className="profile-empty">
        <div className="profile-empty-message">Profile not found</div>
      </div>
    );
  }

  const legendaryCount = profileData.entries.filter(
    (e) => e.rarity?.toUpperCase() === "LEGENDARY",
  ).length;
  const profileTitle = getProfileTitle(
    profileData.entries.length,
    legendaryCount,
    challengeStreak,
  );

  return (
    <div className="profile-tab">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          {profileData.pfpUrl && (
            <NextImage
              src={profileData.pfpUrl}
              alt={profileData.username}
              className="profile-avatar"
              width={64}
              height={64}
              unoptimized
            />
          )}
          <div className="profile-header-info">
            <div className="profile-username">@{profileData.username}</div>
            <div className="profile-display-name">
              {profileData.displayName || profileData.username}
            </div>
            <div className="profile-title">{profileTitle}</div>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-value">{profileData.entries.length}</div>
          <div className="stat-label">Logos Created</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{legendaryCount}</div>
          <div className="stat-label">Legendary</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{challengeStreak}</div>
          <div className="stat-label">Challenge Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">
            {profileData.entries.reduce((sum, e) => sum + (e.likes || 0), 0)}
          </div>
          <div className="stat-label">Total Likes</div>
        </div>
      </div>

      {/* Best Entry */}
      {profileData.best && (
        <div className="profile-section">
          <h3 className="profile-section-title">🌟 Best Logo</h3>
          <div className="profile-best-entry">
            {(() => {
              const imageUrl = getImageForContext(
                {
                  logoImageUrl: profileData.best?.logoImageUrl,
                  cardImageUrl: profileData.best?.cardImageUrl,
                  thumbImageUrl: profileData.best?.thumbImageUrl,
                  mediumImageUrl: profileData.best?.mediumImageUrl,
                  imageUrl: profileData.best?.imageUrl,
                },
                "preview",
              );
              return imageUrl ? (
                <NextImage
                  src={imageUrl}
                  alt={profileData.best?.text || "Best logo"}
                  className="best-entry-image"
                  width={300}
                  height={200}
                  unoptimized
                />
              ) : (
                <div className="best-entry-text">{profileData.best?.text}</div>
              );
            })()}
            <div className="best-entry-info">
              <div className="best-entry-text-label">
                &quot;{profileData.best?.text}&quot;
              </div>
              <div className="best-entry-stats">
                <span>❤️ {profileData.best?.likes || 0} likes</span>
                {profileData.best?.rarity && (
                  <span>✨ {profileData.best.rarity}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entries Grid */}
      <div className="profile-section">
        <h3 className="profile-section-title">
          📚 All Logos ({profileData.entries.length})
        </h3>
        {profileData.entries.length === 0 ? (
          <div className="profile-empty-entries">
            <div>No logos created yet</div>
          </div>
        ) : (
          <div className="profile-entries-grid">
            {profileData.entries.map((entry) => {
              const imageUrl = getImageForContext(
                {
                  logoImageUrl: entry.logoImageUrl,
                  cardImageUrl: entry.cardImageUrl,
                  thumbImageUrl: entry.thumbImageUrl,
                  mediumImageUrl: entry.mediumImageUrl,
                  imageUrl: entry.imageUrl,
                },
                "gallery",
              );
              return (
                <div
                  key={entry.id}
                  className="profile-entry-card"
                  onClick={() => setExpandedEntry(entry)}
                  role="button"
                  tabIndex={0}
                >
                  {imageUrl ? (
                    <NextImage
                      src={imageUrl}
                      alt={entry.text}
                      className="profile-entry-image"
                      width={200}
                      height={200}
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="profile-entry-text-placeholder">
                      {entry.text}
                    </div>
                  )}
                  <div className="profile-entry-overlay">
                    <div className="profile-entry-details">
                      <span className="profile-entry-text-label">
                        {entry.text}
                      </span>
                      {entry.rarity && (
                        <span
                          className={`rarity-badge rarity-${entry.rarity.toLowerCase()}`}
                        >
                          {entry.rarity}
                        </span>
                      )}
                      <div className="profile-entry-metrics">
                        <span>❤️ {entry.likes || 0}</span>
                        {entry.views && <span>👁 {entry.views}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Entry Modal */}
      {expandedEntry && (
        <div
          className="profile-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedEntry(null)}
        >
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setExpandedEntry(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {(() => {
              const imageUrl = getImageForContext(
                {
                  logoImageUrl: expandedEntry.logoImageUrl,
                  cardImageUrl: expandedEntry.cardImageUrl,
                  thumbImageUrl: expandedEntry.thumbImageUrl,
                  mediumImageUrl: expandedEntry.mediumImageUrl,
                  imageUrl: expandedEntry.imageUrl,
                },
                "profile",
              );
              return imageUrl ? (
                <NextImage
                  src={imageUrl}
                  alt={expandedEntry.text}
                  className="profile-modal-image"
                  width={500}
                  height={500}
                  unoptimized
                />
              ) : (
                <div className="profile-modal-text">{expandedEntry.text}</div>
              );
            })()}

            <div className="profile-modal-info">
              <div className="info-row">
                <span className="info-label">Text:</span>
                <span className="info-value">{expandedEntry.text}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Seed:</span>
                <span className="info-value">{expandedEntry.seed}</span>
              </div>
              {expandedEntry.rarity && (
                <div className="info-row">
                  <span className="info-label">Rarity:</span>
                  <span className="info-value">{expandedEntry.rarity}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {formatHistoryTime(
                    typeof expandedEntry.createdAt === "string"
                      ? new Date(expandedEntry.createdAt).getTime()
                      : expandedEntry.createdAt,
                  )}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">❤️ Likes:</span>
                <span className="info-value">{expandedEntry.likes || 0}</span>
              </div>
              {expandedEntry.views && (
                <div className="info-row">
                  <span className="info-label">👁 Views:</span>
                  <span className="info-value">{expandedEntry.views}</span>
                </div>
              )}
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => {
                  onLike(expandedEntry.id);
                  setExpandedEntry(null);
                }}
                disabled={likedEntryIds.has(expandedEntry.id)}
              >
                {likedEntryIds.has(expandedEntry.id) ? "❤️ Liked" : "🤍 Like"}
              </button>
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => {
                  onShare(expandedEntry);
                  setExpandedEntry(null);
                }}
              >
                🔗 Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
