"use client";

import { useState, useCallback } from "react";

interface SearchFieldProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}

export default function SearchField({
  onSearch,
  placeholder = "Search by name, creator, or seed",
  onEnter,
}: SearchFieldProps) {
  const [query, setQuery] = useState("");

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSearch(query);
        onEnter?.();
      } else if (e.key === "Escape") {
        handleClear();
      }
    },
    [query, onSearch, onEnter, handleClear],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  }, []);

  return (
    <div className="search-field">
      <label htmlFor="search-input" className="search-field-label">
        Search logos
      </label>
      <div className="search-field-wrapper">
        <span className="search-field-icon" aria-hidden="true">
          🔍
        </span>
        <input
          id="search-input"
          type="text"
          className="search-field-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Search logos by name, creator, or seed"
        />
        {query && (
          <button
            type="button"
            className="search-field-clear"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
