"use client";

import NextImage from "next/image";
import { useState, useMemo } from "react";
import { LeaderboardEntry } from "@/lib/logoGeneratorTypes";
import { getImageForContext } from "@/lib/imageContext";
import styles from "./LogoGenerator.module.css";

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

  // Filter entries by search, rarity, and preset
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter - include seed search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = entry.text.toLowerCase().includes(query);
        const matchesUsername =
          entry.username &&
          entry.username.toLowerCase().includes(query);
        const matchesSeed =
          entry.seed && entry.seed.toString().includes(query);
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
  }, [entries, searchQuery, rarityFilter, presetFilter, filterByArtist]);

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

  // Pick random entry from filtered results
  const pickRandomFromResults = () => {
    if (sortedEntries.length > 0) {
      const randomEntry =
        sortedEntries[Math.floor(Math.random() * sortedEntries.length)];
      setExpandedEntry(randomEntry);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
  const pagedEntries = sortedEntries.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className={styles.outputSection}>
      {/* Filters */}
      <div className={styles.galleryFilters}>
        <input
          type="text"
          placeholder="Search by text, artist, or seed..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onPageChange(1);
          }}
          className={styles.gallerySearch}
        />
        <select
          value={rarityFilter}
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
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "#0a0",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            (clear)
          </button>
        </div>
      )}

      {/* Results count */}
      <div className={styles.galleryInfo}>
        {sortedEntries.length} logos found
      </div>

      {/* Error state */}
      {error && <div className={styles.galleryError}>{error}</div>}

      {/* Loading state */}
      {isLoading && <div className={styles.galleryLoading}>Loading gallery...</div>}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className={styles.gallerySection}>
          <div className={styles.gallerySectionTitle}>Favorites</div>
          <div className={styles.galleryGrid}>
            {favorites.map((item) => (
              <div
                key={`fav-${item.result.seed}`}
                className={styles.galleryItem}
                role="button"
                tabIndex={0}
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

      {/* Main gallery grid */}
      <div className={styles.gallerySection}>
        <div className={styles.gallerySectionTitle}>All logos</div>
        {pagedEntries.length === 0 ? (
          <div className={styles.galleryEmpty}>
            <div className={styles.galleryEmptyMessage}>
              No logos match your filters
            </div>
            {(searchQuery.trim() || rarityFilter || presetFilter || filterByArtist) && (
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
          <div className={styles.galleryGrid}>
            {pagedEntries.map((entry) => {
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
              return (
                <div
                  key={entry.id}
                  className={styles.galleryItem}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedEntry(entry)}
                >
                  {imageUrl ? (
                    <NextImage
                      src={imageUrl}
                      alt={entry.text}
                      className={styles.galleryImage}
                      width={200}
                      height={200}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.galleryImagePlaceholder}>
                      {entry.text}
                    </div>
                  )}
                  <div className={styles.galleryOverlay}>
                    <div className={styles.galleryCardInfo}>
                      <span className={styles.galleryBy}>@{entry.username}</span>
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
                        className={styles.galleryLikeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike(entry.id);
                        }}
                        title={
                          likedEntryIds.has(entry.id)
                            ? "Unlike"
                            : "Like this logo"
                        }
                      >
                        {likedEntryIds.has(entry.id) ? "❤️" : "🤍"}{" "}
                        {entry.likes}
                      </button>
                      <button
                        type="button"
                        className={styles.galleryFavBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadFavorite(entry);
                        }}
                        title="Add to favorites"
                      >
                        ⭐
                      </button>
                      <button
                        type="button"
                        className={styles.galleryShareBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(entry);
                        }}
                      >
                        🔗 Share
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.galleryViewAllBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterByArtist(entry.username || null);
                        onPageChange(1);
                      }}
                      title="View all logos by this artist"
                      style={{ fontSize: "11px", marginTop: "5px" }}
                    >
                      View all by @{entry.username}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className={styles.paginationStatus}>
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
                  <div className={styles.expandedText}>{expandedEntry.text}</div>
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
