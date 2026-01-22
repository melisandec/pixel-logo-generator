"use client";

import { useCallback } from "react";

interface RarityControlProps {
  selected: string | null;
  onChange: (value: string | null) => void;
}

const RARITY_OPTIONS = [
  { value: null, label: "⭐ All" },
  { value: "common", label: "Common" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
];

export default function RarityControl({
  selected,
  onChange,
}: RarityControlProps) {
  const handleChipClick = useCallback(
    (value: string | null) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <div className="rarity-control">
      <label className="rarity-control-label">Rarity</label>
      <div className="rarity-chips">
        {RARITY_OPTIONS.map((option) => (
          <button
            key={`rarity-${option.value || "all"}`}
            type="button"
            className={`rarity-chip${selected === option.value ? " active" : ""}`}
            onClick={() => handleChipClick(option.value)}
            aria-pressed={selected === option.value}
            aria-label={`Filter by ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
