"use client";

/* eslint-disable react/style-prop-object */

import NextImage from "next/image";
import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";
import { LeaderboardEntry } from "@/lib/logoGeneratorTypes";
import { getImageForContext } from "@/lib/imageContext";
import { useDebounce } from "@/lib/hooks/useDebounce";
import styles from "./LogoGenerator.module.css";

// Skeleton loader component
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className={`${styles.galleryItem} ${styles.skeletonCard}`}>
      <div className={styles.galleryImage} />
    </div>
  );
});

// Rarity color indicator component
const RarityColorIndicator = memo(function RarityColorIndicator({
  rarity,
}: {
  rarity: string | null | undefined;
}) {
  const rarityColors: Record<string, string> = {
    LEGENDARY: "#ffd700",
    EPIC: "#ba55d3",
    RARE: "#ffa500",
    COMMON: "#00ffff",
    UNKNOWN: "#888",
  };
  const rarityUpper = String(rarity || "UNKNOWN").toUpperCase();
  return (
    <div
      className={styles.rarityColorIndicator}
      title={rarity || "Unknown"}
      data-rarity={rarityUpper}
    >
      <div className={styles.rarityColorDot} />
    </div>
  );
});

// Active filter chips component
const ActiveFilterChips = memo(function ActiveFilterChips({
  searchQuery,
  rarityFilter,
  presetFilter,
  filterByArtist,
  onClear,
  onClearAll,
}: {
  searchQuery: string;
  rarityFilter: string;
  presetFilter: string;
  filterByArtist: string | null;
  onClear: (type: string) => void;
  onClearAll: () => void;
}) {
  const hasActiveFilters =
    searchQuery.trim() || rarityFilter || presetFilter || filterByArtist;

  if (!hasActiveFilters) return null;

  return (
    <div className={styles.activeFiltersSection}>
      {searchQuery.trim() && (
        <button
          type="button"
          className={styles.filterChip}
          onClick={() => onClear("search")}
          title="Click to remove search filter"
        >
          <span>🔍 &quot;{searchQuery.trim()}&quot;</span>
          <span className={styles.filterChipClose}>✕</span>
        </button>
      )}
      {rarityFilter && (
        <button
          type="button"
          className={styles.filterChip}
          onClick={() => onClear("rarity")}
          title="Click to remove rarity filter"
        >
          <span>{rarityFilter}</span>
          <span className={styles.filterChipClose}>✕</span>
        </button>
      )}
      {presetFilter && (
        <button
          type="button"
          className={styles.filterChip}
          onClick={() => onClear("preset")}
          title="Click to remove preset filter"
        >
          <span>{presetFilter}</span>
          <span className={styles.filterChipClose}>✕</span>
        </button>
      )}
      {filterByArtist && (
        <button
          type="button"
          className={styles.filterChip}
          onClick={() => onClear("artist")}
          title="Click to remove artist filter"
        >
          <span>@{filterByArtist}</span>
          <span className={styles.filterChipClose}>✕</span>
        </button>
      )}
      <button
        type="button"
        className={`${styles.filterChip} ${styles.clearAll}`}
        onClick={onClearAll}
        title="Clear all filters"
      >
        Clear All
      </button>
    </div>
  );
});

interface GalleryItemCardProps {
  entry: LeaderboardEntry;
  isLiked: boolean;
  isTrending: boolean;
  isRecentlyLiked: boolean;
  onLike: (entryId: string) => Promise<void>;
  onShare: (entry: LeaderboardEntry) => Promise<void>;
  onLoadFavorite: (result: any) => void;
  onSetExpandedEntry: (entry: LeaderboardEntry) => void;
  onFilterByArtist: (artist: string | null) => void;
  viewMode: "grid" | "list";
}

/**
 * Memoized gallery item card component
 * Prevents re-renders when parent re-renders but entry props haven't changed
 */
const GalleryItemCard = memo(function GalleryItemCard({
  entry,
  isLiked,
  isTrending,
  isRecentlyLiked,
  onLike,
  onShare,
  onLoadFavorite,
  onSetExpandedEntry,
  onFilterByArtist,
  viewMode,
}: GalleryItemCardProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);
  const [isShareSuccess, setIsShareSuccess] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipeThreshold = 40; // Minimum swipe distance in pixels
  const imageUrl = getImageForContext(
    {
      logoImageUrl: entry.logoImageUrl,
      cardImageUrl: entry.cardImageUrl,
      thumbImageUrl: entry.thumbImageUrl,
      mediumImageUrl: entry.mediumImageUrl,
      imageUrl: entry.imageUrl,
    },
    "gallery",
  );

  const handleTouchStart = (event: React.TouchEvent) => {
    // Only enable swipe on list view
    if (viewMode !== "list") return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    // Only enable swipe on list view
    if (viewMode !== "list") return;
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;

    // Swipe left to reveal buttons (negative delta)
    if (delta < -swipeThreshold) {
      setIsSwiped(true);
    }
    // Swipe right to hide buttons (positive delta)
    else if (delta > swipeThreshold) {
      setIsSwiped(false);
    }

    touchStartX.current = null;
  };

  return (
    <div
      className={`${styles.galleryItem} ${isSwiped ? styles.galleryItemSwiped : ""} ${isFlipping ? styles.galleryItemFlip : ""} ${styles.hasFlipAnimation}`}
      onClick={() => {
        onSetExpandedEntry(entry);
        // Track view
        fetch("/api/leaderboard/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: entry.id }),
        }).catch(console.error);
      }}
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.innerWidth > 768) {
          setIsFlipping(true);
          setTimeout(() => setIsFlipping(false), 600);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {imageUrl ? (
        <NextImage
          src={imageUrl}
          alt={entry.text}
          className={styles.galleryImage}
          width={200}
          height={200}
          loading="lazy"
          unoptimized
        />
      ) : (
        <div className={styles.galleryImagePlaceholder}>{entry.text}</div>
      )}
      {/* Rarity color indicator */}
      <RarityColorIndicator rarity={entry.rarity} />
      {/* Trending and Recently Liked Badges */}
      {isTrending && (
        <div className={styles.trendingBadge} title="Top 5 most liked">
          🔥 Trending
        </div>
      )}
      {isRecentlyLiked && (
        <div className={styles.recentlyLikedBadge} title="Recently liked">
          ✨ Liked
        </div>
      )}
      <div className={styles.galleryOverlay}>
        <div className={styles.galleryCardInfo}>
          <button
            className={styles.galleryByBtn}
            onClick={(e) => {
              e.stopPropagation();
              onFilterByArtist(entry.username);
            }}
            title={`View ${entry.username}'s gallery`}
          >
            @{entry.username}
          </button>
          <span
            className={`${styles.galleryRarity} ${
              entry.rarity
                ? styles[
                    `galleryRarity${String(entry.rarity).charAt(0) + String(entry.rarity).slice(1).toLowerCase()}`
                  ]
                : styles.galleryRarityUnknown
            }`}
          >
            {entry.rarity || "Unknown"}
          </span>
        </div>
        <div className={styles.galleryActions}>
          <button
            type="button"
            className={`${styles.galleryLikeBtn} ${isAnimatingHeart ? styles.animatingHeart : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(entry.id);
              // Trigger heart pop animation
              setIsAnimatingHeart(true);
              setTimeout(() => setIsAnimatingHeart(false), 600);
              // Reset swipe state after action on mobile
              setIsSwiped(false);
            }}
            title={isLiked ? "Unlike" : "Like this logo"}
          >
            {isLiked ? "❤️" : "🤍"} {entry.likes}
          </button>
          <button
            type="button"
            className={styles.galleryViewsBtn}
            disabled
            title={`${entry.views || 0} views`}
          >
            👁️ {entry.views || 0}
          </button>
          <button
            type="button"
            className={styles.galleryFavBtn}
            onClick={(e) => {
              e.stopPropagation();
              onLoadFavorite(entry);
              // Reset swipe state after action on mobile
              setIsSwiped(false);
            }}
            title="Add to favorites"
          >
            ⭐
          </button>
          <button
            type="button"
            className={`${styles.galleryShareBtn} ${isShareSuccess ? styles.shareSuccess : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onShare(entry);
              // Trigger share success animation
              setIsShareSuccess(true);
              setTimeout(() => setIsShareSuccess(false), 800);
              // Reset swipe state after action on mobile
              setIsSwiped(false);
            }}
          >
            🔗 Share
          </button>
          <button
            type="button"
            className={styles.galleryFarcasterBtn}
            onClick={(e) => {
              e.stopPropagation();
              // Direct Farcaster cast integration
              if (entry.castUrl) {
                window.open(entry.castUrl, "_blank");
              } else {
                onShare(entry);
              }
              setIsSwiped(false);
            }}
            title="Cast on Farcaster"
          >
            ⬜ Cast
          </button>
        </div>
        <button
          type="button"
          className={`${styles.galleryViewAllBtn} ${styles.galleryViewAllLink}`}
          onClick={(e) => {
            e.stopPropagation();
            onFilterByArtist(entry.username || null);
          }}
          title="View all logos by this artist"
        >
          View all by @{entry.username}
        </button>
      </div>
    </div>
  );
});

interface LogoGeneratorGalleryProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;

  likedEntryIds: Set<string>;
  onLike: (entryId: string) => Promise<void>;
  onShare: (entry: LeaderboardEntry) => Promise<void>;

  favorites: Array<{ result: any; createdAt: number }>;
  onLoadFavorite: (result: any) => void;
  onRemoveFavorite: (result: any) => void;

  recentLogos: LeaderboardEntry[];
  onLoadRecentLogo: (entry: LeaderboardEntry) => void;
}

export default function LogoGeneratorGallery(props: LogoGeneratorGalleryProps) {
  const {
    entries,
    isLoading,
    error,
    page,
    onPageChange,
    pageSize,
    likedEntryIds,
    onLike,
    onShare,
    favorites,
    onLoadFavorite,
    onRemoveFavorite,
    recentLogos,
    onLoadRecentLogo,
  } = props;

  const [expandedEntry, setExpandedEntry] = useState<LeaderboardEntry | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [presetFilter, setPresetFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterByArtist, setFilterByArtist] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentlyLikedIds, setRecentlyLikedIds] = useState<Set<string>>(
    new Set(),
  );
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterTransition, setFilterTransition] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 480) {
      setFiltersExpanded(false);
    }
    // Detect mobile for infinite scroll
    const isMobileDevice =
      typeof window !== "undefined" && window.innerWidth <= 768;
    setIsMobile(isMobileDevice);
  }, []);

  // Debounce search query to reduce filter recalculations (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter entries by search, rarity, and preset
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter - include seed search (use debounced query)
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesText = entry.text.toLowerCase().includes(query);
        const matchesUsername =
          entry.username && entry.username.toLowerCase().includes(query);
        const matchesSeed = entry.seed && entry.seed.toString().includes(query);
        if (!matchesText && !matchesUsername && !matchesSeed) {
          return false;
        }
      }

      // Rarity filter
      if (rarityFilter && rarityFilter !== "") {
        const entryRarity = entry.rarity
          ? String(entry.rarity).toUpperCase()
          : "UNKNOWN";
        const filterRarity = rarityFilter.toUpperCase();
        if (entryRarity !== filterRarity) {
          return false;
        }
      }

      // Preset filter
      if (presetFilter && presetFilter !== "") {
        const entryPreset = entry.presetKey || "Unknown";
        if (entryPreset !== presetFilter) {
          return false;
        }
      }

      // Filter by artist
      if (filterByArtist) {
        if (entry.username !== filterByArtist) {
          return false;
        }
      }

      return true;
    });
  }, [
    entries,
    debouncedSearchQuery,
    rarityFilter,
    presetFilter,
    filterByArtist,
  ]);

  // Sort filtered entries
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          const aTime =
            typeof a.createdAt === "string"
              ? new Date(a.createdAt).getTime()
              : a.createdAt;
          const bTime =
            typeof b.createdAt === "string"
              ? new Date(b.createdAt).getTime()
              : b.createdAt;
          return bTime - aTime;
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const aTime =
            typeof a.createdAt === "string"
              ? new Date(a.createdAt).getTime()
              : a.createdAt;
          const bTime =
            typeof b.createdAt === "string"
              ? new Date(b.createdAt).getTime()
              : b.createdAt;
          return aTime - bTime;
        });
      case "most-liked":
        return sorted.sort((a, b) => b.likes - a.likes);
      case "least-liked":
        return sorted.sort((a, b) => a.likes - b.likes);
      case "rarity":
        const rarityOrder = {
          LEGENDARY: 4,
          EPIC: 3,
          RARE: 2,
          COMMON: 1,
          UNKNOWN: 0,
        };
        return sorted.sort((a, b) => {
          const aRarity = String(a.rarity || "UNKNOWN").toUpperCase();
          const bRarity = String(b.rarity || "UNKNOWN").toUpperCase();
          const aOrder = rarityOrder[aRarity as keyof typeof rarityOrder] || 0;
          const bOrder = rarityOrder[bRarity as keyof typeof rarityOrder] || 0;
          return bOrder - aOrder;
        });
      default:
        return sorted;
    }
  }, [filteredEntries, sortBy]);

  // Get unique presets from entries
  const availablePresets = useMemo(() => {
    const presets = new Set<string>();
    entries.forEach((entry) => {
      if (entry.presetKey) {
        presets.add(entry.presetKey);
      }
    });
    return Array.from(presets).sort();
  }, [entries]);

  // Calculate statistics
  const galleryStats = useMemo(() => {
    const uniqueArtists = new Set(sortedEntries.map((e) => e.username));
    const totalLikes = sortedEntries.reduce((sum, e) => sum + e.likes, 0);
    const avgLikes =
      sortedEntries.length > 0
        ? Math.round(totalLikes / sortedEntries.length)
        : 0;
    return {
      logoCount: sortedEntries.length,
      artistCount: uniqueArtists.size,
      totalLikes,
      avgLikes,
    };
  }, [sortedEntries]);

  // Get top 5 most-liked logos (trending)
  const trendingIds = useMemo(() => {
    if (sortedEntries.length === 0) return new Set<string>();
    const sorted = [...sortedEntries]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
    return new Set(sorted.map((e) => e.id));
  }, [sortedEntries]);

  // Pick random entry from filtered results
  const pickRandomFromResults = useCallback(() => {
    if (sortedEntries.length > 0) {
      const randomEntry =
        sortedEntries[Math.floor(Math.random() * sortedEntries.length)];
      setExpandedEntry(randomEntry);
    }
  }, [sortedEntries]);

  // Memoized callbacks to prevent unnecessary re-renders of child components
  const handleSetExpandedEntry = useCallback((entry: LeaderboardEntry) => {
    setExpandedEntry(entry);
  }, []);

  const handleLike = useCallback(
    (entryId: string) => {
      onLike(entryId);
      // Track recently liked
      setRecentlyLikedIds((prev) => {
        const updated = new Set(prev);
        updated.add(entryId);
        // Keep only last 10 liked
        if (updated.size > 10) {
          const arr = Array.from(updated);
          updated.clear();
          arr.slice(-10).forEach((id) => updated.add(id));
        }
        return updated;
      });
    },
    [onLike],
  );

  const handleFilterByArtist = useCallback(
    (artist: string | null) => {
      setFilterByArtist(artist);
      onPageChange(1);
    },
    [onPageChange],
  );

  // Trigger filter transition animation when filter criteria change
  useEffect(() => {
    setFilterTransition(true);
    const timer = setTimeout(() => setFilterTransition(false), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, rarityFilter, presetFilter, filterByArtist, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const pagedEntries = sortedEntries.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // Calculate displayed entries for infinite scroll on mobile
  const displayEntries = sortedEntries.slice(0, displayedCount);

  // Infinite scroll observer - load more entries as user scrolls
  useEffect(() => {
    if (!isMobile || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          displayedCount < sortedEntries.length &&
          !isLoading &&
          !isLoadingMore
        ) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount((prev) =>
              Math.min(prev + pageSize, sortedEntries.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [
    isMobile,
    displayedCount,
    sortedEntries.length,
    isLoading,
    isLoadingMore,
    pageSize,
  ]);

  return (
    <div className={styles.outputSection}>
      {/* Filters */}
      <button
        type="button"
        className={styles.galleryFiltersToggle}
        onClick={() => setFiltersExpanded((prev) => !prev)}
      >
        {filtersExpanded ? "Hide filters" : "Show filters"}
      </button>
      <div
        className={`${styles.galleryFilters} ${
          filtersExpanded
            ? styles.galleryFiltersExpanded
            : styles.galleryFiltersCollapsed
        }`}
      >
        <input
          type="text"
          placeholder="Search by text, artist, or seed..."
          value={searchQuery}
          aria-label="Search gallery"
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onPageChange(1);
          }}
          className={styles.gallerySearch}
        />
        <select
          value={rarityFilter}
          aria-label="Filter by rarity"
          onChange={(e) => {
            setRarityFilter(e.target.value);
            onPageChange(1);
          }}
          className={styles.galleryFilterSelect}
        >
          <option value="">All rarities</option>
          <option value="COMMON">Common</option>
          <option value="RARE">Rare</option>
          <option value="EPIC">Epic</option>
          <option value="LEGENDARY">Legendary</option>
        </select>
        {availablePresets.length > 0 && (
          <select
            value={presetFilter}
            aria-label="Filter by preset"
            onChange={(e) => {
              setPresetFilter(e.target.value);
              onPageChange(1);
            }}
            className={styles.galleryFilterSelect}
          >
            <option value="">All presets</option>
            {availablePresets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        )}
        <select
          value={sortBy}
          aria-label="Sort gallery"
          onChange={(e) => {
            setSortBy(e.target.value);
            onPageChange(1);
          }}
          className={styles.galleryFilterSelect}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most-liked">Most Liked</option>
          <option value="least-liked">Least Liked</option>
          <option value="rarity">Rarity</option>
        </select>
        <button
          type="button"
          onClick={pickRandomFromResults}
          disabled={sortedEntries.length === 0}
          className={styles.galleryClearFilters}
          title="Pick random from current results"
        >
          🎲 Random
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setRarityFilter("");
            setPresetFilter("");
            setSortBy("newest");
            setFilterByArtist(null);
            onPageChange(1);
          }}
          className={styles.galleryClearFilters}
        >
          Clear all
        </button>

        {/* View Mode Toggle */}
        <div className={styles.viewModeToggle}>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === "grid" ? styles.active : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            ⊞ Grid
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === "list" ? styles.active : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            ≡ List
          </button>
        </div>
      </div>

      {/* Artist filter display */}
      {filterByArtist && (
        <div className={styles.galleryInfo}>
          Viewing logos by <strong>@{filterByArtist}</strong>
          <button
            type="button"
            onClick={() => {
              setFilterByArtist(null);
              onPageChange(1);
            }}
            className={styles.artistFilterClearBtn}
          >
            (clear)
          </button>
        </div>
      )}

      {/* Gallery Statistics */}
      <div className={styles.galleryStatsSection}>
        <div className={styles.galleryStat}>
          <span className={styles.galleryStatLabel}>Logos:</span>
          <span className={styles.galleryStatValue}>
            {galleryStats.logoCount}
          </span>
        </div>
        <div className={styles.galleryStat}>
          <span className={styles.galleryStatLabel}>Artists:</span>
          <span className={styles.galleryStatValue}>
            {galleryStats.artistCount}
          </span>
        </div>
        <div className={styles.galleryStat}>
          <span className={styles.galleryStatLabel}>Total Likes:</span>
          <span className={styles.galleryStatValue}>
            {galleryStats.totalLikes}
          </span>
        </div>
        <div className={styles.galleryStat}>
          <span className={styles.galleryStatLabel}>Avg Likes:</span>
          <span className={styles.galleryStatValue}>
            {galleryStats.avgLikes}
          </span>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.galleryInfo}>
        {sortedEntries.length} logos found
      </div>

      {/* Error state */}
      {error && <div className={styles.galleryError}>{error}</div>}

      {/* Loading state */}
      {isLoading && displayEntries.length === 0 ? (
        <div className={styles.galleryGrid}>
          {Array.from({ length: isMobile ? 3 : 8 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      ) : null}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className={styles.gallerySection}>
          <div className={styles.gallerySectionTitle}>Favorites</div>
          <div className={styles.galleryGrid}>
            {favorites.map((item) => (
              <div
                key={`fav-${item.result.seed}`}
                className={styles.galleryItem}
                onClick={() => onLoadFavorite(item.result)}
              >
                <NextImage
                  src={item.result.dataUrl}
                  alt={`Favorite: ${item.result.config.text}`}
                  className={styles.galleryImage}
                  width={200}
                  height={200}
                  unoptimized
                />
                <div className={styles.galleryOverlay}>
                  <button
                    type="button"
                    className={styles.galleryActionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(item.result);
                    }}
                  >
                    Remove from favorites
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Liked Section */}
      {recentlyLikedIds.size > 0 && (
        <div className={styles.gallerySection}>
          <div className={styles.gallerySectionTitle}>✨ Recently Liked</div>
          <div className={styles.galleryGrid}>
            {Array.from(recentlyLikedIds)
              .slice(-10)
              .reverse()
              .map((likedId) => {
                const entry = sortedEntries.find((e) => e.id === likedId);
                return entry ? (
                  <GalleryItemCard
                    key={`recent-${entry.id}`}
                    entry={entry}
                    isLiked={likedEntryIds.has(entry.id)}
                    isTrending={trendingIds.has(entry.id)}
                    isRecentlyLiked={true}
                    onLike={onLike}
                    onShare={onShare}
                    onLoadFavorite={onLoadFavorite}
                    onSetExpandedEntry={handleSetExpandedEntry}
                    onFilterByArtist={handleFilterByArtist}
                    viewMode={viewMode}
                  />
                ) : null;
              })}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(searchQuery || rarityFilter || presetFilter || filterByArtist) && (
        <div className={styles.activeFiltersSection}>
          {searchQuery && (
            <div className={styles.filterChip}>
              <span>Search: {searchQuery}</span>
              <button
                className={styles.filterChipClose}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search filter"
              >
                ✕
              </button>
            </div>
          )}
          {rarityFilter && rarityFilter !== "" && (
            <div className={styles.filterChip}>
              <span>Rarity: {rarityFilter}</span>
              <button
                className={styles.filterChipClose}
                onClick={() => setRarityFilter("")}
                aria-label="Clear rarity filter"
              >
                ✕
              </button>
            </div>
          )}
          {presetFilter && presetFilter !== "" && (
            <div className={styles.filterChip}>
              <span>Preset: {presetFilter}</span>
              <button
                className={styles.filterChipClose}
                onClick={() => setPresetFilter("")}
                aria-label="Clear preset filter"
              >
                ✕
              </button>
            </div>
          )}
          {filterByArtist && (
            <div className={styles.filterChip}>
              <span>By: {filterByArtist}</span>
              <button
                className={styles.filterChipClose}
                onClick={() => setFilterByArtist("")}
                aria-label="Clear artist filter"
              >
                ✕
              </button>
            </div>
          )}
          <button
            className={styles.filterChipClear}
            onClick={() => {
              setSearchQuery("");
              setRarityFilter("");
              setPresetFilter("");
              setFilterByArtist("");
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main gallery grid */}
      <div className={styles.gallerySection}>
        <div className={styles.gallerySectionTitle}>All logos</div>
        {(isMobile ? displayEntries : pagedEntries).length === 0 ? (
          <div className={styles.galleryEmpty}>
            {sortedEntries.length === 0 ? (
              <>
                <div className={styles.galleryEmptyMessage}>
                  No logos in the gallery yet
                </div>
                <p style={{ fontSize: "12px", color: "#888" }}>
                  Be the first to generate and share a logo!
                </p>
              </>
            ) : (
              <>
                <div className={styles.galleryEmptyMessage}>
                  No logos match your filters
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "12px",
                  }}
                >
                  {searchQuery.trim()
                    ? `No results for "${searchQuery}"`
                    : "Try adjusting your filters"}
                </p>
              </>
            )}
            {(searchQuery.trim() ||
              rarityFilter ||
              presetFilter ||
              filterByArtist) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setRarityFilter("");
                  setPresetFilter("");
                  setSortBy("newest");
                  setFilterByArtist(null);
                  onPageChange(1);
                }}
                className={styles.galleryEmptyClearBtn}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`${styles.galleryGrid} ${viewMode === "list" ? styles.galleryListView : ""} ${filterTransition ? styles.filterTransition : ""}`}
            >
              {(isMobile ? displayEntries : pagedEntries).map(
                (entry, index) => (
                  <div
                    key={entry.id}
                    style={
                      { "--item-index": index } as React.CSSProperties & {
                        "--item-index": number;
                      }
                    }
                  >
                    <GalleryItemCard
                      entry={entry}
                      isLiked={likedEntryIds.has(entry.id)}
                      isTrending={trendingIds.has(entry.id)}
                      isRecentlyLiked={recentlyLikedIds.has(entry.id)}
                      onLike={onLike}
                      onShare={onShare}
                      onLoadFavorite={onLoadFavorite}
                      onSetExpandedEntry={handleSetExpandedEntry}
                      onFilterByArtist={handleFilterByArtist}
                      viewMode={viewMode}
                    />
                  </div>
                ),
              )}
              {isMobile && isLoadingMore && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}
            </div>

            {/* Infinite scroll observer target */}
            {isMobile && displayedCount < sortedEntries.length && (
              <div ref={observerTarget} className={styles.infiniteScrollLoader}>
                <div className={styles.loaderDot} />
                <div className={styles.loaderDot} />
                <div className={styles.loaderDot} />
              </div>
            )}

            {/* End of results message */}
            {isMobile &&
              displayedCount >= sortedEntries.length &&
              sortedEntries.length > 0 && (
                <div
                  className={styles.galleryInfo}
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#888",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>✓ End of results</span>
                </div>
              )}

            {/* Pagination - hidden on mobile */}
            {!isMobile && (
              <div className={styles.galleryPagination}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded entry modal */}
      {expandedEntry && (
        <div
          className={styles.expandedModalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedEntry(null)}
        >
          <div
            className={styles.expandedModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for bottom sheet on mobile */}
            <div className={styles.bottomSheetDragHandle} />
            <div className={styles.expandedEntryContent}>
              {(() => {
                const imageUrl = getImageForContext(
                  {
                    logoImageUrl: expandedEntry.logoImageUrl,
                    cardImageUrl: expandedEntry.cardImageUrl,
                    thumbImageUrl: expandedEntry.thumbImageUrl,
                    mediumImageUrl: expandedEntry.mediumImageUrl,
                    imageUrl: expandedEntry.imageUrl,
                  },
                  "gallery",
                );
                return imageUrl ? (
                  <NextImage
                    src={imageUrl}
                    alt={expandedEntry.text}
                    className={styles.expandedImage}
                    width={400}
                    height={400}
                    unoptimized
                  />
                ) : (
                  <div className={styles.expandedText}>
                    {expandedEntry.text}
                  </div>
                );
              })()}
              <div className={styles.expandedEntryInfo}>
                <div>
                  <strong>Text:</strong> {expandedEntry.text}
                </div>
                <div>
                  <strong>Artist:</strong> @{expandedEntry.username}
                </div>
                <div>
                  <strong>Rarity:</strong> {expandedEntry.rarity}
                </div>
                <div>
                  <strong>❤️ {expandedEntry.likes}</strong>
                </div>
              </div>
              <div className={styles.expandedEntryActions}>
                <button
                  type="button"
                  className={styles.expandedActionBtn}
                  onClick={() => {
                    onLike(expandedEntry.id);
                    setExpandedEntry(null);
                  }}
                >
                  {likedEntryIds.has(expandedEntry.id) ? "Unlike" : "Like"}
                </button>
                <button
                  type="button"
                  className={styles.expandedActionBtn}
                  onClick={() => {
                    onShare(expandedEntry);
                    setExpandedEntry(null);
                  }}
                >
                  Share
                </button>
              </div>
            </div>
            <button
              type="button"
              className={styles.expandedModalClose}
              onClick={() => setExpandedEntry(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
