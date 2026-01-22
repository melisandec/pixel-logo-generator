/**
 * Context-based image selection helper
 * Separates gallery views (show clean logos) from social sharing (show framed cards)
 */

export type ImageRenderContext = "gallery" | "leaderboard" | "profile" | "share" | "preview";

export interface ImageUrls {
  logoImageUrl?: string;
  cardImageUrl?: string;
  thumbImageUrl?: string;
  mediumImageUrl?: string;
  imageUrl?: string; // Legacy fallback
}

/**
 * Get the appropriate image URL based on render context
 * - Gallery/Leaderboard/Profile contexts → clean logo (prefer smaller variants when available)
 * - Share context → cardImageUrl (framed, branded)
 * 
 * @param urls Object containing logoImageUrl, cardImageUrl, and legacy imageUrl
 * @param context Where the image is being displayed
 * @returns The appropriate image URL for the context
 */
export function getImageForContext(urls: ImageUrls, context: ImageRenderContext): string | null {
  const { cardImageUrl, logoImageUrl, thumbImageUrl, mediumImageUrl, imageUrl } = urls;

  if (context === "share") {
    // Sharing prefers branded card; fall back to the best available resolution
    return cardImageUrl || mediumImageUrl || logoImageUrl || thumbImageUrl || imageUrl || null;
  }

  if (context === "preview") {
    // Preview surfaces (home highlights) can use card for polish, then highest available logo size
    return cardImageUrl || mediumImageUrl || logoImageUrl || thumbImageUrl || imageUrl || null;
  }

  if (context === "leaderboard") {
    // Leaderboard tiles are mid-size; prefer medium, then full logo, then thumb
    return mediumImageUrl || logoImageUrl || thumbImageUrl || cardImageUrl || imageUrl || null;
  }

  if (context === "gallery" || context === "profile") {
    // Gallery/profile views show clean logos; lean on smaller variants first for perf
    return thumbImageUrl || mediumImageUrl || logoImageUrl || cardImageUrl || imageUrl || null;
  }

  // Default fallback path
  return logoImageUrl || cardImageUrl || mediumImageUrl || thumbImageUrl || imageUrl || null;
}

/**
 * Helper to check if we have both images available
 */
export function hasCompleteImages(urls: ImageUrls): boolean {
  return !!(urls.logoImageUrl && urls.cardImageUrl);
}

/**
 * Helper to populate legacy imageUrl field for backwards compatibility
 * If only one image exists, use it for both fields
 */
export function normalizeImageUrls(urls: ImageUrls): Required<ImageUrls> {
  const fallback = urls.imageUrl || "";
  return {
    thumbImageUrl: urls.thumbImageUrl || urls.logoImageUrl || fallback,
    mediumImageUrl: urls.mediumImageUrl || urls.logoImageUrl || fallback,
    logoImageUrl: urls.logoImageUrl || fallback,
    cardImageUrl: urls.cardImageUrl || fallback,
    imageUrl: urls.imageUrl || fallback,
  };
}
