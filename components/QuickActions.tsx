"use client";

import { useCallback } from "react";

interface QuickActionsProps {
  onRandom: () => void;
  onRandomLegendary: () => void;
  onSurpriseMe: () => void;
}

export default function QuickActions({
  onRandom,
  onRandomLegendary,
  onSurpriseMe,
}: QuickActionsProps) {
  const handleClick = useCallback((callback: () => void) => {
    callback();
  }, []);

  return (
    <div className="quick-actions">
      <button
        type="button"
        className="quick-action-button"
        onClick={() => handleClick(onRandom)}
        title="Feel lucky? Grab a random logo."
        aria-label="Generate a random logo"
      >
        🎲 Random
      </button>
      <button
        type="button"
        className="quick-action-button"
        onClick={() => handleClick(onRandomLegendary)}
        title="Only the rarest of the rare."
        aria-label="Generate a random legendary logo"
      >
        🎲✨ Legendary
      </button>
      <button
        type="button"
        className="quick-action-button"
        onClick={() => handleClick(onSurpriseMe)}
        title="Pick a preset at random. Live dangerously."
        aria-label="Surprise me with a random selection"
      >
        🎪 Surprise
      </button>
    </div>
  );
}
