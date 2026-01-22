"use client";

import { useCallback } from "react";

interface FilterPill {
  label: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFilterPillsProps {
  filters: FilterPill[];
  onClearAll: () => void;
}

export default function ActiveFilterPills({
  filters,
  onClearAll,
}: ActiveFilterPillsProps) {
  const handleRemove = useCallback((callback: () => void) => {
    callback();
  }, []);

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="active-filter-pills">
      <div className="pills-list">
        {filters.map((filter) => (
          <div
            key={`${filter.label}-${filter.value}`}
            className="filter-pill"
            role="status"
            aria-label={`${filter.label}: ${filter.value}`}
          >
            <span className="pill-text">
              {filter.label}: {filter.value}
            </span>
            <button
              type="button"
              className="pill-remove"
              onClick={() => handleRemove(filter.onRemove)}
              aria-label={`Remove ${filter.label} filter`}
              title={`Remove ${filter.label}: ${filter.value}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="clear-all-link"
        onClick={onClearAll}
        aria-label="Clear all active filters"
      >
        Clear all
      </button>
    </div>
  );
}
