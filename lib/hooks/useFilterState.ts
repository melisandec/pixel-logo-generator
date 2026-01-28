import { useCallback, useState, useEffect } from "react";

/**
 * Custom hook for managing gallery filter state
 * Handles rarity filtering, search, and filter clearing
 */
export function useFilterState() {
  const [galleryRarityFilter, setGalleryRarityFilter] = useState<string>("all");
  const [gallerySearchQuery, setGallerySearchQuery] = useState<string>("");
  const [filteredResultCount, setFilteredResultCount] = useState<number>(0);

  /**
   * Handle rarity filter change
   * Updates the rarity filter state
   */
  const handleRarityChange = useCallback((rarity: string | null) => {
    setGalleryRarityFilter(rarity || "all");
  }, []);

  /**
   * Handle search query change
   * Updates the search query state and resets to first page
   */
  const handleSearchChange = useCallback((query: string) => {
    setGallerySearchQuery(query);
  }, []);

  /**
   * Clear all active filters
   * Resets rarity filter and search query
   */
  const handleClearFilters = useCallback(() => {
    setGalleryRarityFilter("all");
    setGallerySearchQuery("");
  }, []);

  /**
   * Get the count of active filters
   */
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (galleryRarityFilter !== "all") count++;
    if (gallerySearchQuery.trim() !== "") count++;
    return count;
  }, [galleryRarityFilter, gallerySearchQuery]);

  return {
    galleryRarityFilter,
    setGalleryRarityFilter,
    gallerySearchQuery,
    setGallerySearchQuery,
    filteredResultCount,
    setFilteredResultCount,
    handleRarityChange,
    handleSearchChange,
    handleClearFilters,
    getActiveFilterCount,
  };
}
