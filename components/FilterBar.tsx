"use client";

import { useCallback } from "react";
import SearchField from "./SearchField";
import RarityControl from "./RarityControl";
import ActiveFilterPills from "./ActiveFilterPills";
import ResultCount from "./ResultCount";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onRarityChange: (rarity: string | null) => void;
  activeFilters: { rarity?: string | null };
  resultCount: number;
  totalFilters: number;
  onClearFilters: () => void;
}

export default function FilterBar({
  onSearch,
  onRarityChange,
  activeFilters,
  resultCount,
  totalFilters,
  onClearFilters,
}: FilterBarProps) {
  const hasFilters = totalFilters > 0;

  const handleClearRarity = useCallback(() => {
    onRarityChange(null);
  }, [onRarityChange]);

  const activePills = [];
  if (activeFilters.rarity) {
    activePills.push({
      label: "Rarity",
      value: activeFilters.rarity,
      onRemove: handleClearRarity,
    });
  }

  return (
    <div className="filter-bar-container">
      {/* Main filter bar */}
      <div className="filter-bar">
        <SearchField onSearch={onSearch} />
        <RarityControl
          selected={activeFilters.rarity || null}
          onChange={onRarityChange}
        />
      </div>

      {/* Active filters pills */}
      {hasFilters && (
        <div className="filter-pills-section">
          <ActiveFilterPills
            filters={activePills}
            onClearAll={onClearFilters}
          />
          <ResultCount
            count={resultCount}
            totalFilters={totalFilters}
            hasFilters={true}
          />
        </div>
      )}
    </div>
  );
}
