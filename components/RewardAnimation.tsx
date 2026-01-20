"use client";

import { useEffect, useState } from "react";

interface RewardAnimationProps {
  type: "rarity-master" | "forge-rank" | "level-up" | "achievement";
  title: string;
  subtitle?: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export default function RewardAnimation({
  type,
  title,
  subtitle,
  onComplete,
}: RewardAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate particles based on animation type
    const particleCount = type === "rarity-master" ? 40 : 30;
    const colors = getColorsForType(type);
    
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      return {
        id: i,
        x: 50, // Center (percentage)
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        life: 1,
      };
    });

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // Gravity
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    }, 30);

    // Auto-dismiss after animation
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(dismissTimer);
    };
  }, [type, onComplete]);

  if (!isVisible && particles.length === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Center Message */}
      <div
        className={`relative bg-gradient-to-br from-[#0a0e27] to-[#1a1e37] border-4 rounded-xl p-8 max-w-sm text-center shadow-2xl transition-all duration-500 ${
          isVisible ? "scale-100" : "scale-90"
        }`}
        style={{
          borderColor: getBorderColorForType(type),
          boxShadow: `0 0 40px ${getBorderColorForType(type)}40, inset 0 0 20px ${getBorderColorForType(type)}20`,
        }}
      >
        <div className="text-6xl mb-4 animate-bounce">{getIconForType(type)}</div>
        <h2
          className="text-3xl font-bold mb-2 font-mono tracking-wider"
          style={{ color: getBorderColorForType(type) }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/80 text-sm font-mono">{subtitle}</p>
        )}
      </div>

      {/* Glow Pulse */}
      <div
        className="absolute inset-0 animate-pulse pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${getBorderColorForType(type)}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

function getColorsForType(type: string): string[] {
  switch (type) {
    case "rarity-master":
      return ["#ffaa00", "#ff6600", "#ff0066", "#aa00ff"];
    case "forge-rank":
      return ["#00ff00", "#00ffaa", "#00aaff", "#0066ff"];
    case "level-up":
      return ["#ff00ff", "#ff0099", "#9900ff", "#6600ff"];
    default:
      return ["#00ff00", "#00ffff", "#ffff00", "#ff00ff"];
  }
}

function getBorderColorForType(type: string): string {
  switch (type) {
    case "rarity-master":
      return "#ffaa00";
    case "forge-rank":
      return "#00ff00";
    case "level-up":
      return "#ff00ff";
    default:
      return "#00ffff";
  }
}

function getIconForType(type: string): string {
  switch (type) {
    case "rarity-master":
      return "💎";
    case "forge-rank":
      return "🏆";
    case "level-up":
      return "⬆️";
    default:
      return "🎉";
  }
}
