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
                  padding: "0.4rem 0.8rem",
                  background: isHovering
                    ? "linear-gradient(135deg, #39ff14, #7fff00)"
                    : "#39ff14",
                  color: "#000",
                  textDecoration: "none",
                  border: "2px solid #ffff00",
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  fontFamily: "'Courier New', monospace",
                  textAlign: "center",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: isHovering
                    ? "0 0 20px rgba(57, 255, 20, 1), 0 0 40px rgba(255, 255, 0, 0.8), 0 0 60px rgba(57, 255, 20, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)"
                    : "0 0 15px rgba(57, 255, 20, 0.6), 0 0 30px rgba(255, 255, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1)",
                  transform: isHovering ? "scale(1.08)" : "scale(1)",
                  letterSpacing: isHovering ? "0.05em" : "0",
                  textShadow: isHovering
                    ? "0 0 10px rgba(255, 255, 0, 0.8)"
                    : "0 0 5px rgba(255, 255, 0, 0.4)",
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
