"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch?: (query: string, type: "username" | "seed" | "text") => void;
  placeholder?: string;
  showRandomButton?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search by username, seed, or text...",
  showRandomButton = true,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"username" | "seed" | "text">(
    "username",
  );
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query, searchType);
    } else {
      // Default navigation behavior
      if (searchType === "username") {
        router.push(`/profile/${encodeURIComponent(query.trim())}`);
      } else {
        // For seed and text, we'd navigate to a search results page
        const params = new URLSearchParams({
          q: query.trim(),
          type: searchType,
        });
        router.push(`/?${params.toString()}`);
      }
    }
  }, [query, searchType, onSearch, router]);

  const handleRandomCast = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard/random");
      if (!response.ok) throw new Error("Failed to fetch random cast");

      const data = await response.json();
      if (data.entry) {
        // Navigate to a detail view or profile
        router.push(`/profile/${data.entry.username}?seed=${data.entry.seed}`);
      }
    } catch (error) {
      console.error("Random cast error:", error);
    }
  }, [router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex gap-1 mb-2">
        {/* Search Type Selector */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="px-2 py-1 bg-[#0a0e27] border border-[#00ff00] text-[#00ff00] rounded font-mono text-xs focus:outline-none"
        >
          <option value="username">👤</option>
          <option value="seed">🎲</option>
          <option value="text">📝</option>
        </select>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-2 py-1 bg-[#0a0e27] border border-[#00ff00] text-white rounded font-mono text-xs focus:outline-none placeholder-white/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="px-3 py-1 bg-[#00ff00] text-[#0a0e27] rounded font-mono font-bold text-xs hover:bg-[#00ff00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          🔍
        </button>
      </div>

      {/* Random Cast Button */}
      {showRandomButton && (
        <button
          onClick={handleRandomCast}
          className="w-full px-2 py-1 border border-[#ff00ff] text-[#ff00ff] rounded font-mono text-xs hover:bg-[#ff00ff]/10 transition-all"
        >
          🎲 Random
        </button>
      )}
    </div>
  );
}
