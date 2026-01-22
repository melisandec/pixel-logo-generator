"use client";

interface ResultCountProps {
  count: number;
  totalFilters: number;
  hasFilters: boolean;
}

export default function ResultCount({
  count,
  totalFilters,
  hasFilters,
}: ResultCountProps) {
  const plural = count === 1 ? "logo" : "logos";
  const filterText =
    totalFilters === 1 ? "1 filter active" : `${totalFilters} filters active`;

  return (
    <div className="result-count">
      <span className="count-text">
        {count} {plural}
        {hasFilters && ` · ${filterText}`}
      </span>
    </div>
  );
}
