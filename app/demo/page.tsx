"use client";

import LogoGenerator from "@/components/LogoGenerator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import "../globals.css";

export default function DemoPage() {
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
            <div className="demo-exclusivity-banner">
              <div className="banner-icon">🟣</div>
              <div className="banner-content">
                <p className="banner-title">EXCLUSIVE LIMITED EDITION</p>
                <p className="banner-subtitle">
                  1 logo attempt every 5 minutes • Premium neon styling • Collectible designs
                </p>
              </div>
            </div>

            {/* Main Generator */}
            <div className="demo-generator-wrapper">
              <LogoGenerator demoMode={true} />
            </div>

            {/* Features Grid */}
            <div className="demo-features-grid">
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>Premium Styling</h3>
                <p>Advanced neon and 80s aesthetic effects</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Limited Availability</h3>
                <p>Exclusive to demo mode with rate limiting</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Collectible</h3>
                <p>Share and track your unique creations</p>
              </div>
            </div>

            {/* Footer */}
            <footer className="demo-footer">
              <p>Exclusive demo mode • Limited seed pool • Premium styling applied</p>
            </footer>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
