"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./LogoGenerator.module.css";
import { LogoResult, Rarity } from "@/lib/logoGenerator";
import { getImageForContext } from "@/lib/imageContext";
import { LeaderboardEntry } from "@/lib/logoGeneratorTypes";
import DemoLogoDisplay from "./DemoLogoDisplay";
import {
  PRESETS,
  PRESET_SWATCHES,
  TRIES_PER_DAY,
} from "@/lib/logoGeneratorConstants";

interface LogoGeneratorHomeProps {
  // Generation state
  inputText: string;
  onInputChange: (text: string) => void;
  customSeed: string;
  onSeedChange: (seed: string) => void;
  seedError: string;
  isGenerating: boolean;

  // Preset state
  selectedPreset: string | null;
  onPresetChange: (preset: string | null) => void;

  // Generation handlers
  onGenerate: () => Promise<void>;
  onRandomGenerate: () => Promise<void>;

  // Logo result
  logoResult: LogoResult | null;

  // Daily limit
  dailyRemaining: number;
  dailyLimitSeedUsed: boolean;

  // UI state
  uiMode: "simple" | "advanced";
  onUIModeChange: (mode: "simple" | "advanced") => void;
  demoMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  remixMode: boolean;
  onToggleRemix: () => void;

  // Seed crack animation
  seedCrackStage: string | null;
  seedCrackValue: string | null;
  seedCrackRarity: string | null;
  seedCrackVariance: any;

  // Top casts
  topCasts: Array<{
    id: string;
    username: string;
    displayName: string;
    text: string;
    seed: number;
    likes: number;
    recasts?: number;
    views?: number;
    logoImageUrl?: string;
    cardImageUrl?: string;
    thumbImageUrl?: string;
    mediumImageUrl?: string;
    imageUrl?: string;
  }>;
  likedEntryIds: Set<string>;
  onLike: (entryId: string) => Promise<void>;
  onShare: (entry: LogoResult | LeaderboardEntry) => Promise<void>;
  onDownload: () => void;
  onCast: () => Promise<void>;
  onAddMiniapp: () => Promise<void>;
  onCopySeed: () => Promise<void>;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  sdkReady: boolean;
  miniappAdded: boolean;
  isCasting: boolean;
  isSharing: boolean;
  isMobile: boolean;
  showDownloadOptions: boolean;
  onShowDownloadOptions: (show: boolean) => void;
  onOpenImageForSave: (
    target: "photos" | "files" | "download",
  ) => Promise<void>;
  onShowHowItWorks: () => void;
  onSetToast: (message: string, type: "success" | "error" | "info") => void;
  getRarityColor: (rarity: Rarity) => string;
  userInfo?: { username?: string; fid?: number } | null;
  autoReplyEnabled: boolean;
  onAutoReplyChange: (enabled: boolean) => void;
  onShowFeedback: () => void;
  animatingLikeIds: Set<string>;
  shakingCardIds: Set<string>;
  floatingComboIds: Set<string>;
  reorderingCastIds: Set<string>;
  onToggleLeaderboardLike: (entryId: string) => Promise<void>;
}

export default function LogoGeneratorHome(props: LogoGeneratorHomeProps) {
  const {
    inputText,
    onInputChange,
    customSeed,
    onSeedChange,
    seedError,
    isGenerating,
    selectedPreset,
    onPresetChange,
    onGenerate,
    onRandomGenerate,
    logoResult,
    dailyRemaining,
    dailyLimitSeedUsed,
    uiMode,
    onUIModeChange,
    demoMode,
    soundEnabled,
    onToggleSound,
    remixMode,
    onToggleRemix,
    seedCrackStage,
    seedCrackValue,
    seedCrackRarity,
    seedCrackVariance,
    topCasts,
    likedEntryIds,
    onLike,
    onShare,
    onDownload,
    onCast,
    onAddMiniapp,
    onCopySeed,
    onToggleFavorite,
    isFavorite,
    sdkReady,
    miniappAdded,
    isCasting,
    isSharing,
    isMobile,
    showDownloadOptions,
    onShowDownloadOptions,
    onOpenImageForSave,
    onShowHowItWorks,
    onSetToast,
    getRarityColor,
    userInfo,
    autoReplyEnabled,
    onAutoReplyChange,
    onShowFeedback,
    animatingLikeIds,
    shakingCardIds,
    floatingComboIds,
    reorderingCastIds,
    onToggleLeaderboardLike,
  } = props;

  const [expandedCastImage, setExpandedCastImage] = useState<string | null>(
    null,
  );

  const getPromptOfDay = () => {
    const epochDate = new Date("2020-01-01").getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceEpoch = Math.floor(
      (today.getTime() - epochDate) / (1000 * 60 * 60 * 24),
    );
    const DAILY_PROMPTS = ["Nike", "Apple", "Twitter", "GitHub"];
    const index = daysSinceEpoch % DAILY_PROMPTS.length;
    return DAILY_PROMPTS[index];
  };

  return (
    <>
      {/* INPUT PANEL */}
      <div className="input-panel">
        <div className="input-section">
          {/* Mode Toggle */}
          <div className={`mode-toggle-wrapper ${styles.modeToggleWrapper}`}>
            {demoMode ? (
              <div
                className={`demo-mode-pill ${styles.demoModePill}`}
                aria-label="Demo Mode"
              >
                Demo Mode
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={`mode-toggle-button ${uiMode === "simple" ? "active" : ""} ${styles.modeToggleButtonSimple}`}
                  onClick={() => {
                    onUIModeChange("simple");
                    try {
                      localStorage.setItem("plf:uiMode", "simple");
                    } catch (error) {
                      console.error("Failed to save UI mode:", error);
                    }
                  }}
                >
                  Simple
                </button>
                <button
                  type="button"
                  className={`mode-toggle-button ${uiMode === "advanced" ? "active" : ""} ${styles.modeToggleButtonAdvanced}`}
                  onClick={() => {
                    onUIModeChange("advanced");
                    try {
                      localStorage.setItem("plf:uiMode", "advanced");
                    } catch (error) {
                      console.error("Failed to save UI mode:", error);
                    }
                  }}
                >
                  Advanced
                </button>
              </>
            )}
          </div>

          <div className="daily-limit">
            Tries left today:{" "}
            {userInfo?.username?.toLowerCase() === "ladymel"
              ? "Unlimited"
              : `${Math.max(0, TRIES_PER_DAY - dailyRemaining)}/${TRIES_PER_DAY}`}
          </div>

          <div className="prompt-of-day">
            Prompt of the day: <span>{getPromptOfDay()}</span>
            <button
              type="button"
              className="prompt-button"
              onClick={() => onInputChange(getPromptOfDay())}
            >
              Use prompt
            </button>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onGenerate()}
            placeholder="Enter your text (max 30 chars)"
            maxLength={30}
            className="terminal-input"
            disabled={isGenerating}
            aria-label="Text input for logo generation"
            aria-required="true"
          />

          {/* Advanced Mode: Seed Input */}
          {!demoMode && uiMode === "advanced" && (
            <div className="seed-input-group">
              <div className="seed-label">
                <svg
                  className="seed-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
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
                      onSetToast("Enter a seed to enable remix.", "info");
                      return;
                    }
                    if (!inputText.trim()) {
                      onSetToast("Enter the original text to remix.", "info");
                      return;
                    }
                    onToggleRemix();
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
                  onSeedChange(value);
                }}
                placeholder="Optional: Use a seed once per day"
                className="seed-input"
                disabled={isGenerating || dailyLimitSeedUsed}
                aria-label="Optional seed input for deterministic logo generation"
              />
              {seedError && (
                <span id="seed-error" className="seed-error" role="alert">
                  {seedError}
                </span>
              )}
              <span className="seed-tip">Tip: seed = recreate</span>
            </div>
          )}

          <button
            type="button"
            className="how-link"
            onClick={onShowHowItWorks}
            aria-label="How it works"
          >
            How it works
          </button>

          <button
            type="button"
            className="sound-toggle"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={`Sound ${soundEnabled ? "on" : "off"}`}
          >
            Sound: {soundEnabled ? "On" : "Off"}
          </button>

          <div className="button-group">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !inputText.trim()}
              className="arcade-button"
              aria-label={
                demoMode
                  ? "Forge an 80s logo using unreleased exclusive seeds"
                  : "Generate pixel logo"
              }
              aria-busy={isGenerating}
            >
              {isGenerating
                ? demoMode
                  ? "FORGING 80s..."
                  : "FORGING..."
                : demoMode
                  ? "⚡ Forge 80s Logo"
                  : "FORGE"}
            </button>
            <button
              onClick={onRandomGenerate}
              disabled={isGenerating}
              className={`arcade-button secondary${demoMode ? " hidden" : ""}`}
              aria-label={demoMode ? undefined : "Randomize logo"}
            >
              RANDOMIZE
            </button>
          </div>

          {/* Seed crack animation */}
          {isGenerating && seedCrackStage && (
            <div className="seed-crack-overlay">
              <div
                className={`seed-crack${seedCrackRarity ? ` rarity-${seedCrackRarity.toLowerCase()}` : ""}`}
                aria-live="polite"
              >
                {seedCrackStage !== "ticket" ? (
                  <>
                    <span className="seed-crack-label">Cracking seed</span>
                    <div
                      className={`seed-crack-icon stage-${seedCrackStage}${seedCrackStage === "bloom" ? " is-split" : ""} ${styles.seedCrackIcon}`}
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
                        <div className="seed-crack-sparkles" aria-hidden="true">
                          <span className="seed-sparkle sparkle-1" />
                          <span className="seed-sparkle sparkle-2" />
                          <span className="seed-sparkle sparkle-3" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`seed-ticket from-seed rarity-${(seedCrackRarity || "COMMON").toLowerCase()}`}
                    >
                      <span className="seed-ticket-label">Seed ticket</span>
                      <span className="seed-ticket-value">
                        {seedCrackValue}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preset selector */}
          <div className="preset-group">
            <div className="preset-title">
              {demoMode ? "Demo Mode" : "Style presets"}
            </div>
            {demoMode ? (
              <div className="preset-locked">
                Locked to neon synthwave chrome. All logos use the exclusive
                preset and hidden seeds.
              </div>
            ) : (
              <div className="preset-list">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    className={`preset-button${selectedPreset === preset.key ? " active" : ""}`}
                    onClick={() => {
                      onPresetChange(preset.key);
                      if (inputText.trim()) {
                        setTimeout(() => onGenerate(), 0);
                      }
                    }}
                    type="button"
                    aria-pressed={selectedPreset === preset.key}
                  >
                    {preset.label}
                    <span className="preset-swatches">
                      <span
                        className={`preset-thumb ${styles.presetThumb}`}
                        style={{
                          background: `linear-gradient(90deg, ${(PRESET_SWATCHES[preset.key] || []).join(", ")})`,
                        }}
                      />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGO RESULT CARD */}
      {logoResult && (
        <div className="output-section">
          <div className="logo-card">
            <div
              className={`rarity-badge ${styles.rarityBadge}`}
              style={{ borderColor: getRarityColor(logoResult.rarity) }}
            >
              <div
                className={`rarity-glow ${styles.rarityGlow}`}
                style={{ background: getRarityColor(logoResult.rarity) }}
                aria-hidden="true"
              />
              <span className="rarity-label">RARITY:</span>
              <span
                className={`rarity-value ${styles.rarityValue}`}
                style={{ color: getRarityColor(logoResult.rarity) }}
              >
                {logoResult.rarity}
              </span>
            </div>

            <div
              className={`logo-image-wrapper rarity-${logoResult.rarity.toLowerCase()}`}
            >
              <div className="logo-card-frame" aria-hidden="true" />
              {demoMode ? (
                <DemoLogoDisplay
                  logoResult={logoResult}
                  className="logo-image logo-image-reveal"
                  alt={`Pixel logo: ${logoResult.config.text} with ${logoResult.rarity} rarity`}
                  width={512}
                  height={512}
                  unoptimized
                />
              ) : (
                <NextImage
                  key={`${logoResult.seed}-${logoResult.config.text}`}
                  src={logoResult.dataUrl}
                  alt={`Pixel logo: ${logoResult.config.text} with ${logoResult.rarity} rarity`}
                  className="logo-image logo-image-reveal"
                  role="img"
                  width={512}
                  height={512}
                  unoptimized
                />
              )}
              <div className="logo-shine" aria-hidden="true" />
              <div className="rarity-sparkle" aria-hidden="true" />
              <button
                type="button"
                className="logo-download-button"
                onClick={() => onShowDownloadOptions(true)}
                aria-label="Download options"
              >
                ⬇
              </button>
            </div>

            {/* Download modal */}
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
                      onClick={() => onOpenImageForSave("photos")}
                    >
                      Save to Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenImageForSave("files")}
                    >
                      Save to Files
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenImageForSave("download")}
                    >
                      Download image
                    </button>
                  </div>
                  <button
                    type="button"
                    className="download-modal-cancel"
                    onClick={() => onShowDownloadOptions(false)}
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
                onClick={onShowHowItWorks}
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
              <div className="logo-footer">
                <span>Generated by Pixel Logo Forge</span>
              </div>
            </div>

            <div className="actions-divider">Actions</div>

            <div className="auto-reply-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(event) => onAutoReplyChange(event.target.checked)}
                />
                Auto-reply with app link
              </label>
            </div>

            <div className="logo-actions">
              <div className="logo-actions-primary action-row action-row-two">
                <button
                  onClick={onCast}
                  className="action-button cast-button"
                  disabled={isCasting || isGenerating}
                  aria-label="Cast logo to Farcaster"
                  aria-busy={isCasting}
                >
                  {isCasting ? "CASTING..." : "CAST"}
                </button>
                <button
                  onClick={onDownload}
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
                    onClick={onCopySeed}
                    aria-label={`Copy seed ${logoResult.seed} to clipboard`}
                    disabled={isGenerating}
                  >
                    🔑<span>Copy</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={onToggleFavorite}
                    aria-label="Save logo to favorites"
                    disabled={isGenerating}
                  >
                    ⭐<span>{isFavorite ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={onToggleRemix}
                    aria-label="Toggle remix mode"
                    disabled={isGenerating}
                  >
                    ♻️<span>{remixMode ? "Remix on" : "Remix"}</span>
                  </button>
                  <button
                    type="button"
                    className="action-icon-button"
                    onClick={() => logoResult && onShare(logoResult)}
                    aria-label="Share logo link"
                    disabled={isSharing || isGenerating}
                  >
                    🔗<span>{isSharing ? "Sharing" : "Share"}</span>
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
                  onClick={onAddMiniapp}
                >
                  Add to Collection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP 3 CASTS */}
      {logoResult && (
        <div className="output-section">
          <div className="home-top-casts">
            <button
              type="button"
              className={`feedback-button ${styles.feedbackButton}`}
              onClick={onShowFeedback}
            >
              💬 Feedback
            </button>
            <div className="leaderboard-title">Top 3 casts today</div>
            {topCasts.length === 0 ? (
              <div className="leaderboard-status">
                No casts yet today. Be the first!
              </div>
            ) : (
              <div className="home-top-casts-grid">
                {topCasts.map((entry, index) => {
                  const medalEmoji =
                    index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                  const medalClass =
                    index === 0 ? "gold" : index === 1 ? "silver" : "bronze";
                  const previewImageUrl = getImageForContext(
                    {
                      logoImageUrl: entry.logoImageUrl,
                      cardImageUrl: entry.cardImageUrl,
                      thumbImageUrl: entry.thumbImageUrl,
                      mediumImageUrl: entry.mediumImageUrl,
                      imageUrl: entry.imageUrl,
                    },
                    "preview",
                  );

                  return (
                    <div
                      key={`home-top-${entry.id}`}
                      className={`home-top-cast home-top-cast-${medalClass} ${
                        shakingCardIds.has(entry.id) ? "shake" : ""
                      } ${reorderingCastIds.has(entry.id) ? "reordering" : ""}`}
                    >
                      <div className="home-top-cast-left">
                        <div className="home-top-cast-image-wrapper">
                          {previewImageUrl ? (
                            <button
                              type="button"
                              className="home-top-cast-image-btn"
                              onClick={() =>
                                setExpandedCastImage(previewImageUrl)
                              }
                              aria-label={`Expand logo by ${entry.username}`}
                            >
                              <NextImage
                                src={previewImageUrl}
                                alt={`Logo by ${entry.username}`}
                                className="home-top-cast-image"
                                width={140}
                                height={140}
                                loading="lazy"
                                unoptimized
                              />
                            </button>
                          ) : (
                            <div className="home-top-cast-text">
                              {entry.text || "View cast"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="home-top-cast-right">
                        <div className="home-top-cast-rank">
                          {medalEmoji} #{index + 1}
                        </div>
                        <Link
                          href={`/profile/${encodeURIComponent(entry.username)}`}
                          className="home-top-cast-username"
                          aria-label={`View profile for ${entry.username}`}
                        >
                          @{entry.username}
                        </Link>
                        <div className="home-top-cast-likes-section">
                          <span className="home-top-cast-likes-count">
                            {entry.likes}
                          </span>
                          <button
                            type="button"
                            className={`home-top-cast-like-btn ${
                              animatingLikeIds.has(entry.id) ? "animate" : ""
                            } ${likedEntryIds.has(entry.id) ? "liked" : ""}`}
                            onClick={() => {
                              if (likedEntryIds.has(entry.id)) return;
                              onToggleLeaderboardLike(entry.id);
                            }}
                            disabled={likedEntryIds.has(entry.id)}
                            aria-label={`Like cast by ${entry.username}`}
                          >
                            {likedEntryIds.has(entry.id) ? "❤️" : "🤍"}
                          </button>
                        </div>
                      </div>

                      <div className="home-top-cast-views">
                        viewed {entry.views || 0}
                      </div>
                      {floatingComboIds.has(entry.id) && (
                        <div className="floating-combo-text">+1 LIKE!</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded cast image modal */}
      {expandedCastImage && (
        <div
          className="expanded-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedCastImage(null)}
        >
          <div
            className="expanded-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <NextImage
              src={expandedCastImage}
              alt="Expanded cast image"
              className="expanded-image"
              width={512}
              height={512}
              unoptimized
            />
            <button
              type="button"
              className="expanded-modal-close"
              onClick={() => setExpandedCastImage(null)}
              aria-label="Close expanded image"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
