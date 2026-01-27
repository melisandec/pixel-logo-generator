"use client";

import LogoGenerator from "@/components/LogoGenerator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import "../globals.css";

export default function DemoPage() {
  return (
    <ErrorBoundary>
      <main className="main-container">
        <div className="crt-screen">
          <div className="scanlines"></div>
          <div className="content">
            <div style={{ marginBottom: "1rem" }}>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: "#333",
                  color: "#0ff",
                  textDecoration: "none",
                  border: "2px solid #0ff",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ← Back to Normal Mode
              </Link>
            </div>
            <h1 className="pixel-title">80s EXCLUSIVE FORGE</h1>
            <p className="subtitle" style={{ color: "#f0f" }}>
              🟣 DEMO MODE – Limited 1 try every 5 minutes
            </p>
            <LogoGenerator demoMode={true} />
            <footer className="main-footer">
              Exclusive demo mode • 80s synthwave styling • Limited tries
            </footer>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
