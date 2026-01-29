"use client";

import LogoGenerator from "@/components/LogoGenerator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./globals.css";

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 480);
  }, []);

  return (
    <ErrorBoundary>
      <main className="main-container">
        <div className="crt-screen">
          <div className="scanlines"></div>
          <div className="content">
            <h1 className="pixel-title">PIXEL LOGO FORGE</h1>
            <p className="subtitle">Generate, save, and cast your pixel logo</p>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "2rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/demo"
                style={{
                  padding: isMobile ? "0.5rem 1rem" : "1rem 2rem",
                  background: "#f0f",
                  color: "#000",
                  textDecoration: "none",
                  border: "3px solid #0ff",
                  borderRadius: "8px",
                  fontSize: isMobile ? "0.75rem" : "1.1rem",
                  fontWeight: "bold",
                  fontFamily: "'Courier New', monospace",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  boxShadow: isHovering
                    ? "0 0 30px rgba(255, 0, 255, 0.8)"
                    : "0 0 20px rgba(255, 0, 255, 0.5)",
                  transform: isHovering ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                ⚡ Try Demo Mode - 80s Exclusive
              </Link>
            </div>

            <LogoGenerator demoMode={false} />
            <footer className="main-footer">
              Built for the Farcaster community • Generate, save, and cast your
              pixel logo
            </footer>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
