"use client";

import React from "react";

interface QuickComparisonButtonProps {
  currentMode: "normal" | "demo";
  currentSeed: number;
  isGenerating: boolean;
  onCompare: (mode: "normal" | "demo", seed: number) => void;
}

export default function QuickComparisonButton({
  currentMode,
  currentSeed,
  isGenerating,
  onCompare,
}: QuickComparisonButtonProps) {
  const oppositeMode = currentMode === "normal" ? "demo" : "normal";
  const modeLabel = oppositeMode === "demo" ? "🌆 Demo" : "📝 Normal";

  const handleClick = () => {
    onCompare(oppositeMode, currentSeed);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isGenerating}
      className="
        w-full px-4 py-2 text-sm font-mono rounded
        bg-gradient-to-r from-cyan-500/20 to-magenta-500/20
        border border-cyan-400/50 hover:border-cyan-400/80
        text-cyan-300 hover:text-cyan-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20
      "
    >
      <span className="text-cyan-400">🔄</span> Compare {modeLabel} Mode (Same
      Seed)
    </button>
  );
}
