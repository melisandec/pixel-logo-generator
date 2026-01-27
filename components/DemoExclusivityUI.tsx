"use client";

/**
 * Demo Logo Exclusivity UI Component
 *
 * Displays exclusive branding for demo logos and forge lock state
 */

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getDemoExclusivityBadge,
  getDemoExclusivityBanner,
  getDemoExclusivityStyles,
  getForgeLockUI,
  getForgeLockStyles,
  DEMO_EXCLUSIVITY_MESSAGE,
} from "@/lib/demoMetadata";

/**
 * Exclusivity Badge Component
 * Small badge for demo logos (use on cards, gallery items)
 */
export function DemoExclusivityBadge(): React.ReactElement {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: getDemoExclusivityBadge(),
      }}
    />
  );
}

/**
 * Exclusivity Banner Component
 * Large banner for logo detail pages
 */
export function DemoExclusivityBanner(): React.ReactElement {
  return (
    <>
      <style>{getDemoExclusivityStyles()}</style>
      <div
        dangerouslySetInnerHTML={{
          __html: getDemoExclusivityBanner(),
        }}
      />
    </>
  );
}

/**
 * Exclusivity Message Component
 * Simple text display of the exclusivity message
 */
export function DemoExclusivityMessage(): React.ReactElement {
  return (
    <div className="demo-exclusivity-message">
      <div className="message-text">{DEMO_EXCLUSIVITY_MESSAGE}</div>
    </div>
  );
}

/**
 * Forge Lock Display Component
 * Shows when all seeds are exhausted
 */
export function ForgeLockDisplay(): React.ReactElement {
  return (
    <>
      <style>{getForgeLockStyles()}</style>
      <div
        dangerouslySetInnerHTML={{
          __html: getForgeLockUI(),
        }}
      />
    </>
  );
}

/**
 * Forge Status Hook
 * Fetches current forge status from API
 */
export function useForgeStatus() {
  const [status, setStatus] = useState<{
    isLocked: boolean;
    totalSeeds: number;
    usedSeeds: number;
    availableSeeds: number;
    percentageUsed: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/demo/seed/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch forge status");
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { status, loading, error };
}

/**
 * Forge Status Indicator Component
 * Shows remaining seeds and lock status
 */
export function ForgeStatusIndicator(): React.ReactElement {
  const { status, loading } = useForgeStatus();

  if (loading || !status) {
    return <div className="forge-status-loading">Loading...</div>;
  }

  return (
    <div className="forge-status-indicator">
      {status.isLocked ? (
        <div className="forge-locked">
          <span className="lock-icon">🔒</span>
          <span className="lock-text">Forge Locked</span>
        </div>
      ) : (
        <div className="forge-active">
          <span className="flame-icon">⚡</span>
          <span className="status-text">
            {status.availableSeeds} seeds remaining
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${status.percentageUsed}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Styles for exclusivity components
 */
export function useExclusivityStyles(): void {
  useEffect(() => {
    // Inject styles into document head
    const style = document.createElement("style");
    style.textContent = `
      .demo-exclusivity-message {
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
        border-left: 3px solid #00ffff;
        border-radius: 4px;
        margin: 12px 0;
      }

      .message-text {
        color: #fff;
        font-size: 13px;
        line-height: 1.5;
        white-space: pre-line;
        font-weight: 500;
      }

      .forge-status-indicator {
        padding: 12px 16px;
        border-radius: 6px;
        background: #1a1a2e;
        margin: 12px 0;
      }

      .forge-locked {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ff4444;
        font-weight: bold;
      }

      .lock-icon {
        font-size: 18px;
      }

      .lock-text {
        font-size: 14px;
      }

      .forge-active {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #00ffff;
      }

      .flame-icon {
        font-size: 18px;
        animation: pulse 2s ease-in-out infinite;
      }

      .status-text {
        font-size: 14px;
        flex: 1;
      }

      .progress-bar {
        width: 120px;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000);
        transition: width 0.3s ease;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

/**
 * Complete Demo Logo Card Component
 * Use this to display demo logos with all exclusivity branding
 */
export function DemoLogoCard({
  imageUrl,
  title,
  logoMetadata,
}: {
  imageUrl: string;
  title: string;
  logoMetadata?: {
    source: string;
    style: string;
    seedExclusive: boolean;
  };
}): React.ReactElement {
  return (
    <div className="demo-logo-card">
      <Image
        src={imageUrl}
        alt={title}
        className="logo-image"
        width={300}
        height={300}
      />
      {logoMetadata?.source === "demo" && logoMetadata?.seedExclusive && (
        <>
          <DemoExclusivityBadge />
          <div className="logo-title">{title}</div>
        </>
      )}
    </div>
  );
}
