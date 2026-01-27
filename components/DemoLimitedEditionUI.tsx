"use client";

/**
 * Limited Edition Psychological UI
 *
 * Implements scarcity, prestige, collectibility, and visual superiority
 */

import React, { useEffect, useState } from "react";
import {
  getPsychologicalFramework,
  formatForPsychologicalImpact,
  getScarcityMessage,
  getLogoWave,
  getVisualTreatment,
  PRESTIGE_COPY,
  CTA_PSYCHOLOGY,
  VISUAL_SUPERIORITY,
} from "@/lib/demoLimitedEditionPsychology";

/**
 * Scarcity Counter Component
 * Dynamic display showing remaining seeds with visual urgency
 */
export function ScarcityCounter({
  remaining,
  total = 9000,
}: {
  remaining: number;
  total?: number;
}): React.ReactElement {
  const forged = total - remaining;
  const percentUsed = (forged / total) * 100;
  const scarcity = getScarcityMessage(remaining);
  const visual = getVisualTreatment(remaining);

  return (
    <div className="scarcity-counter" data-urgency={scarcity.urgency}>
      <style>{`
        .scarcity-counter {
          padding: 16px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid ${visual.borderColor};
          margin: 16px 0;
        }

        .scarcity-counter[data-urgency="critical"] {
          animation: pulse-critical ${visual.animationSpeed} ease-in-out infinite;
        }

        .scarcity-header {
          font-size: 14px;
          font-weight: bold;
          color: ${visual.textColor};
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .progress-container {
          margin: 12px 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff00 0%, #ffff00 50%, #ff0000 100%);
          width: ${percentUsed}%;
          transition: width 0.3s ease;
        }

        .scarcity-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .stat-item {
          text-align: center;
          padding: 8px;
          background: rgba(0, 255, 255, 0.05);
          border-radius: 4px;
          font-size: 12px;
        }

        .stat-number {
          font-size: 16px;
          font-weight: bold;
          color: #00ffff;
        }

        .stat-label {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }

        @keyframes pulse-critical {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes glow-critical {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
        }
      `}</style>

      <div className="scarcity-header">
        {scarcity.message.replace("{count}", remaining.toLocaleString())}
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
        <div style={{ fontSize: "11px", color: "#999", textAlign: "center" }}>
          {percentUsed.toFixed(1)}% forged
        </div>
      </div>

      <div className="scarcity-stats">
        <div className="stat-item">
          <div className="stat-number">{forged.toLocaleString()}</div>
          <div className="stat-label">Forged</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{remaining.toLocaleString()}</div>
          <div className="stat-label">Remaining</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{total.toLocaleString()}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Prestige Badge Component
 * Shows exclusive, limited edition status
 */
export function PrestigeBadge({
  type = "exclusive",
}: {
  type?: "exclusive" | "limited-edition" | "unreleased" | "collectible";
}): React.ReactElement {
  const badges = VISUAL_SUPERIORITY.badges;
  const badge = badges[type as keyof typeof badges] || badges.exclusive;

  return (
    <div
      className="prestige-badge"
      style={{
        background: badge.background,
        color: badge.color,
      }}
    >
      <style>{`
        .prestige-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          ${badge.glow}
          cursor: default;
        }
      `}</style>
      {badge.text}
    </div>
  );
}

/**
 * Wave Position Component
 * Shows which batch this logo belongs to
 */
export function WavePosition({
  forgeNumber,
}: {
  forgeNumber: number;
}): React.ReactElement {
  const wave = getLogoWave(forgeNumber);

  return (
    <div className="wave-position">
      <style>{`
        .wave-position {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
          border-radius: 6px;
          border-left: 3px solid #00ffff;
        }

        .wave-icon {
          font-size: 24px;
        }

        .wave-info {
          flex: 1;
        }

        .wave-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .wave-name {
          font-size: 16px;
          font-weight: bold;
          color: #00ffff;
        }

        .wave-position-text {
          font-size: 12px;
          color: #ccc;
          margin-top: 4px;
        }
      `}</style>

      <div className="wave-icon">{wave.emoji}</div>
      <div className="wave-info">
        <div className="wave-label">Limited Edition Batch</div>
        <div className="wave-name">{wave.label}</div>
        <div className="wave-position-text">{wave.position}</div>
      </div>
    </div>
  );
}

/**
 * Premium Logo Container
 * Wraps demo logos with exclusive visual styling
 */
export function PremiumLogoContainer({
  children,
  scarcityLevel = "abundant",
}: {
  children: React.ReactNode;
  scarcityLevel?:
    | "abundant"
    | "plenty"
    | "running-low"
    | "critical"
    | "exhausted";
}): React.ReactElement {
  const borderColors: Record<string, string> = {
    abundant: "#00ffff",
    plenty: "#00ffff",
    "running-low": "#ffaa00",
    critical: "#ff0000",
    exhausted: "#808080",
  };

  const glowIntensities: Record<string, number> = {
    abundant: 1,
    plenty: 1.5,
    "running-low": 2,
    critical: 3,
    exhausted: 0,
  };

  const borderColor = borderColors[scarcityLevel];
  const glowIntensity = glowIntensities[scarcityLevel];

  return (
    <div
      className={`premium-logo-container ${scarcityLevel}`}
      style={{
        borderColor,
        boxShadow: `
          0 0 ${20 * glowIntensity}px rgba(${
            scarcityLevel === "critical"
              ? "255, 0, 0"
              : scarcityLevel === "running-low"
                ? "255, 170, 0"
                : "0, 255, 255"
          }, ${0.3 * glowIntensity})
        `,
      }}
    >
      <style>{`
        .premium-logo-container {
          position: relative;
          border: 2px solid;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.05), rgba(0, 255, 255, 0.05));
          padding: 4px;
          transition: all 0.3s ease;
        }

        .premium-logo-container.critical {
          animation: critical-pulse 0.5s ease-in-out infinite;
        }

        @keyframes critical-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
      {children}
    </div>
  );
}

/**
 * Collectibility Achievement Component
 * Shows badges and achievements earned
 */
export function CollectibilityAchievements({
  forgeCount,
  position,
}: {
  forgeCount: number;
  position: number;
}): React.ReactElement {
  const achievements = [];

  if (position === 1) {
    achievements.push({
      icon: "⚡",
      title: "First Forger",
      desc: "Forged the very first 80s exclusive",
    });
  }

  if (position <= 100) {
    achievements.push({
      icon: "🌅",
      title: "Early Adopter",
      desc: `Among the first 100 (${position}th)`,
    });
  }

  if (forgeCount >= 10) {
    achievements.push({
      icon: "🎨",
      title: "Seed Collector",
      desc: "Forged 10+ exclusive logos",
    });
  }

  if (forgeCount >= 25) {
    achievements.push({
      icon: "💜",
      title: "Neon Master",
      desc: "Forged 25+ exclusive logos",
    });
  }

  if (forgeCount >= 50) {
    achievements.push({
      icon: "🏆",
      title: "Exclusive Collector",
      desc: "Forged 50+ exclusive logos",
    });
  }

  return (
    <div className="collectibility-achievements">
      <style>{`
        .collectibility-achievements {
          padding: 16px;
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.05), rgba(0, 255, 255, 0.05));
          border-radius: 8px;
          border: 1px solid #00ffff;
        }

        .achievements-title {
          font-size: 14px;
          font-weight: bold;
          color: #00ffff;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .achievement-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
        }

        .achievement-item {
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #00ffff;
          border-radius: 4px;
          text-align: center;
        }

        .achievement-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .achievement-title {
          font-size: 11px;
          font-weight: bold;
          color: #00ffff;
        }

        .achievement-desc {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }
      `}</style>

      {achievements.length > 0 && (
        <>
          <div className="achievements-title">Your Achievements</div>
          <div className="achievement-list">
            {achievements.map((ach, idx) => (
              <div key={idx} className="achievement-item">
                <div className="achievement-icon">{ach.icon}</div>
                <div className="achievement-title">{ach.title}</div>
                <div className="achievement-desc">{ach.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Full Limited Edition Showcase
 * Complete psychological framing component
 */
export function LimitedEditionShowcase({
  totalForged,
  totalRemaining,
  userForgeCount,
  userPosition,
}: {
  totalForged: number;
  totalRemaining: number;
  userForgeCount: number;
  userPosition: number;
}): React.ReactElement {
  const stats = formatForPsychologicalImpact({
    totalForged,
    totalRemaining,
  });

  return (
    <div className="limited-edition-showcase">
      <style>{`
        .limited-edition-showcase {
          display: grid;
          gap: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 12px;
        }

        .showcase-headline {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #ff00ff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin: 12px 0;
        }

        .showcase-message {
          text-align: center;
          font-size: 16px;
          color: #ccc;
        }
      `}</style>

      <div className="showcase-headline">{PRESTIGE_COPY.headline}</div>

      <ScarcityCounter remaining={totalRemaining} total={9000} />

      <WavePosition forgeNumber={totalForged} />

      <div className="showcase-message">{stats.message}</div>

      {userForgeCount > 0 && (
        <>
          <CollectibilityAchievements
            forgeCount={userForgeCount}
            position={userPosition}
          />
        </>
      )}
    </div>
  );
}

/**
 * CTA Button with Psychological Messaging
 */
export function PsychologicalCTA({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}): React.ReactElement {
  const scarcity = getScarcityMessage(remaining);
  const visual = getVisualTreatment(remaining);

  const ctaText = (() => {
    if (remaining <= 0) return "🔒 Forge Locked";
    if (remaining <= 50) return `⚡ FORGE NOW - ${remaining} LEFT!`;
    if (remaining <= 200) return `🔥 Forge Before Gone`;
    return `⚡ Forge 80s Exclusive`;
  })();

  return (
    <button
      className="psychological-cta"
      onClick={onClick}
      disabled={remaining <= 0}
      style={{
        borderColor: visual.borderColor,
        color: visual.textColor,
      }}
    >
      <style>{`
        .psychological-cta {
          padding: 16px 32px;
          font-size: 16px;
          font-weight: bold;
          border: 2px solid;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }

        .psychological-cta:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.6);
        }

        .psychological-cta:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      {ctaText}
    </button>
  );
}
