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
    <div className="w-full" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          style={{
            padding: "2px 4px",
            fontSize: "11px",
            border: "1px solid #ccc",
            borderRadius: "2px",
            background: "white",
          }}
        >
          <option value="username">👤</option>
          <option value="seed">🎲</option>
          <option value="text">📝</option>
        </select>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search..."
          style={{
            flex: 1,
            padding: "2px 6px",
            fontSize: "11px",
            border: "1px solid #ccc",
            borderRadius: "2px",
          }}
        />

        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          style={{
            padding: "2px 8px",
            fontSize: "11px",
            border: "1px solid #0a0",
            borderRadius: "2px",
            background: "#0a0",
            color: "white",
            cursor: query.trim() ? "pointer" : "not-allowed",
            opacity: query.trim() ? 1 : 0.5,
          }}
        >
          🔍
        </button>
      </div>

      {showRandomButton && (
        <button
          onClick={handleRandomCast}
          style={{
            width: "100%",
            padding: "2px 4px",
            fontSize: "11px",
            border: "1px solid #a0a",
            borderRadius: "2px",
            background: "transparent",
            color: "#a0a",
            cursor: "pointer",
          }}
        >
          🎲 Random
        </button>
      )}
    </div>
  );
}
