"use client";

interface EmptyStateProps {
  onClearFilters: () => void;
  onTryRandom: () => void;
}

export default function EmptyState({
  onClearFilters,
  onTryRandom,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon" aria-hidden="true">
          🎮
        </div>
        <h2 className="empty-state-headline">Game Over! No Logos Found</h2>
        <p className="empty-state-message">
          No logos match these filters. Try adjusting rarity or preset, or start
          fresh.
        </p>
        <div className="empty-state-actions">
          <button
            type="button"
            className="empty-state-button primary"
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="empty-state-button secondary"
            onClick={onTryRandom}
            aria-label="Generate a random logo"
          >
            Try Random
          </button>
        </div>
      </div>
    </div>
  );
}
