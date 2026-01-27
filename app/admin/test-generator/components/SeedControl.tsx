"use client";

import { useState, useEffect } from "react";

interface SeedControlProps {
  seed: number;
  onSeedChange: (seed: number) => void;
  onRandomize: () => void;
}

export function SeedControl({
  seed,
  onSeedChange,
  onRandomize,
}: SeedControlProps) {
  const [seedInput, setSeedInput] = useState(String(seed));

  useEffect(() => {
    setSeedInput(String(seed));
  }, [seed]);

  const handleSeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeedInput(value);

    if (value === "") return;

    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      onSeedChange(num);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-950 border border-magenta-500 rounded-lg">
      <label className="text-sm font-mono text-magenta-400">
        Seed (Deterministic Generation)
      </label>

      <div className="flex gap-2">
        <input
          type="number"
          value={seedInput}
          onChange={handleSeedInputChange}
          className="
            flex-1 px-3 py-2 font-mono text-sm bg-slate-900 text-cyan-100
            border border-slate-700 rounded transition-colors
            focus:outline-none focus:border-magenta-400 focus:bg-slate-800
            hover:border-slate-600
          "
          placeholder="Enter seed..."
          min="0"
        />

        <button
          onClick={onRandomize}
          className="
            px-4 py-2 font-mono text-sm font-bold rounded transition-all
            bg-magenta-500 text-white hover:bg-magenta-400 active:scale-95
          "
        >
          Random
        </button>
      </div>

      <div className="text-xs text-slate-500 font-mono">
        Current seed: <span className="text-cyan-400">{seed}</span>
      </div>
    </div>
  );
}
