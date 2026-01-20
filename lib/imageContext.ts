/**
 * Context-based image selection helper
 * Separates gallery views (show clean logos) from social sharing (show framed cards)
 */

export type ImageRenderContext = "gallery" | "leaderboard" | "profile" | "share" | "preview";

export interface ImageUrls {
  logoImageUrl?: string;
  cardImageUrl?: string;
  imageUrl?: string; // Legacy fallback
}

/**
 * Get the appropriate image URL based on render context
 * - Gallery/Leaderboard/Profile contexts → logoImageUrl (clean art)
 * - Share context → cardImageUrl (framed, branded)
 * 
 * @param urls Object containing logoImageUrl, cardImageUrl, and legacy imageUrl
 * @param context Where the image is being displayed
 * @returns The appropriate image URL for the context
 */
export function getImageForContext(urls: ImageUrls, context: ImageRenderContext): string | null {
  if (context === "share" || context === "preview") {
    // For sharing contexts, prefer card image (framed, branded)
    // Fallback to logo, then to legacy imageUrl
    return urls.cardImageUrl || urls.logoImageUrl || urls.imageUrl || null;
  }

  // For gallery/leaderboard/profile viewing contexts, show clean logo
  // Fallback to card image, then to legacy imageUrl
  return urls.logoImageUrl || urls.cardImageUrl || urls.imageUrl || null;
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
    logoImageUrl: urls.logoImageUrl || fallback,
    cardImageUrl: urls.cardImageUrl || fallback,
    imageUrl: urls.imageUrl || fallback,
  };
}
