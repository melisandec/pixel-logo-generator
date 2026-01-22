"use client";

import { useCallback } from "react";

interface PresetControlProps {
  selected: string | null;
  onChange: (value: string | null) => void;
  options: Array<{ value: string; label: string }>;
}

export default function PresetControl({
  selected,
  onChange,
  options,
}: PresetControlProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "all" ? null : e.target.value;
      onChange(value);
    },
    [onChange],
  );

  const selectedLabel =
    selected && options.find((o) => o.value === selected)?.label
      ? options.find((o) => o.value === selected)?.label
      : "All";

  return (
    <div className="preset-control">
      <label htmlFor="preset-select" className="preset-control-label">
        Preset
      </label>
      <div className="preset-control-wrapper">
        <select
          id="preset-select"
          className="preset-control-select"
          value={selected || "all"}
          onChange={handleChange}
          aria-label="Filter by preset"
        >
          <option value="all">All Presets</option>
          {options.map((option) => (
            <option key={`preset-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="preset-control-arrow" aria-hidden="true">
          ▼
        </span>
      </div>
    </div>
  );
}
