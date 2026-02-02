"use client";

import LogoGenerator from "@/components/LogoGenerator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { useState } from "react";
import "../globals.css";

export default function DemoPage() {
  const [showBanner, setShowBanner] = useState(true);
  return (
    <ErrorBoundary>
      <main className="demo-main-container">
        <div className="demo-crt-screen">
          <div className="scanlines"></div>
          <div className="content">
            {/* Navigation & Header */}
            <div className="demo-header-nav">
              <Link href="/" className="demo-back-button">
                <span className="arrow">←</span> BACK TO NORMAL MODE
              </Link>
            </div>

            {/* Main Title Section */}
            <div className="demo-title-section">
              <h1 className="demo-pixel-title">80s EXCLUSIVE FORGE</h1>
              <div className="demo-title-badge">DEMO MODE</div>
            </div>

            {/* Exclusivity Banner */}
            {showBanner && (
              <div className="demo-exclusivity-banner">
                <div className="banner-icon">🟣</div>
                <div className="banner-content">
                  <p className="banner-title">EXCLUSIVE LIMITED EDITION</p>
                  <p className="banner-subtitle">
                    1 logo attempt every 5 minutes • Premium neon styling •
                    Collectible designs
                  </p>
                </div>
                <button
                  className="banner-close-button"
                  onClick={() => setShowBanner(false)}
                  aria-label="Close banner"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Generator */}
            <div className="demo-generator-wrapper">
              <LogoGenerator demoMode={true} />
            </div>

            {/* Footer */}
            <footer className="demo-footer">
              <p>
                Exclusive demo mode • Limited seed pool • Premium styling
                applied
              </p>
            </footer>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
