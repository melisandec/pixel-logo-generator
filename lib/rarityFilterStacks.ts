/**
 * Rarity-Based Filter Stacks
 *
 * Apply progressive visual enhancements based on logo rarity tier.
 * Each tier adds more filters and increases their intensity.
 * Includes advanced filters from CSS Styling Guide Section 6A
 */

import {
  filterNeonGlow,
  filterChrome,
  filterBloom,
  filterHalftone,
  filterSpecular,
  filterLiquidNeon,
  filterComicBook,
  filterWaveRipple,
  filterHolographicShine,
  filterNeonGlowAdvanced,
  filterShadowDepth,
  filterNeonOutline,
  generateFilterDefs,
  getCanvasFilterString,
  FILTER_PRESETS,
} from "./svgFilterLibrary";

/**
 * Rarity tier definitions
 */
export type RarityTier = "common" | "rare" | "epic" | "legendary";

export const RARITY_TIERS = ["common", "rare", "epic", "legendary"] as const;

/**
 * Filter stack configuration for each rarity tier
 */
export interface FilterStackConfig {
  filters: Array<{
    name:
      | "neonGlow"
      | "chrome"
      | "bloom"
      | "halftone"
      | "scanlines"
      | "specular";
    intensity: number;
  }>;
  filterId: string;
  intensityMultiplier: number;
  description: string;
}

/**
 * COMMON RARITY
 * Subtle neon glow for basic logos
 */
export const COMMON_STACK: FilterStackConfig = {
  filters: [{ name: "neonGlow", intensity: 0.5 }],
  filterId: "rarity-common",
  intensityMultiplier: 0.5,
  description: "Subtle neon glow effect",
};

/**
 * RARE RARITY
 * Neon glow + bloom for enhanced visual appeal
 */
export const RARE_STACK: FilterStackConfig = {
  filters: [
    { name: "neonGlow", intensity: 0.6 },
    { name: "bloom", intensity: 0.5 },
  ],
  filterId: "rarity-rare",
  intensityMultiplier: 0.65,
  description: "Neon glow with bloom enhancement",
};

/**
 * EPIC RARITY
 * Chrome + neon glow + halftone for striking appearance
 */
export const EPIC_STACK: FilterStackConfig = {
  filters: [
    { name: "chrome", intensity: 0.7 },
    { name: "neonGlow", intensity: 0.8 },
    { name: "halftone", intensity: 0.6 },
  ],
  filterId: "rarity-epic",
  intensityMultiplier: 0.85,
  description: "Chrome metallic with neon and halftone pattern",
};

/**
 * LEGENDARY RARITY
 * Full filter stack for maximum visual impact
 */
export const LEGENDARY_STACK: FilterStackConfig = {
  filters: [
    { name: "chrome", intensity: 0.9 },
    { name: "neonGlow", intensity: 1.0 },
    { name: "bloom", intensity: 0.85 },
    { name: "specular", intensity: 0.9 },
    { name: "halftone", intensity: 0.8 },
  ],
  filterId: "rarity-legendary",
  intensityMultiplier: 1.0,
  description: "Maximum visual enhancement with all effects",
};

/**
 * Rarity tier metadata
 */
export interface RarityMetadata {
  tier: RarityTier;
  displayName: string;
  color: string;
  emoji: string;
  stack: FilterStackConfig;
}

export const RARITY_METADATA: Record<RarityTier, RarityMetadata> = {
  common: {
    tier: "common",
    displayName: "Common",
    color: "#808080", // Gray
    emoji: "⚪",
    stack: COMMON_STACK,
  },
  rare: {
    tier: "rare",
    displayName: "Rare",
    color: "#0080ff", // Blue
    emoji: "🔵",
    stack: RARE_STACK,
  },
  epic: {
    tier: "epic",
    displayName: "Epic",
    color: "#a335ee", // Purple
    emoji: "🟣",
    stack: EPIC_STACK,
  },
  legendary: {
    tier: "legendary",
    displayName: "Legendary",
    color: "#ff8000", // Orange/Gold
    emoji: "🟠",
    stack: LEGENDARY_STACK,
  },
};

/**
 * Get filter stack for a rarity tier
 *
 * @param rarity - Rarity tier ('common', 'rare', 'epic', 'legendary')
 * @returns FilterStackConfig with filters and metadata
 */
export function getFilterStackForRarity(rarity: RarityTier): FilterStackConfig {
  const metadata = RARITY_METADATA[rarity];
  return metadata.stack;
}

/**
 * Get rarity metadata
 *
 * @param rarity - Rarity tier
 * @returns Rarity metadata including color, emoji, display name
 */
export function getRarityMetadata(rarity: RarityTier): RarityMetadata {
  return RARITY_METADATA[rarity];
}

/**
 * Generate SVG filter defs for a rarity tier
 *
 * Creates a complete <defs> element with all filters for the given rarity.
 *
 * @param rarity - Rarity tier
 * @returns SVG filter definitions string ready to insert into SVG
 *
 * @example
 * const defs = generateRarityFilterDefs('epic');
 * // Returns: <filter id="rarity-epic-chrome">...</filter><filter id="rarity-epic-neon">...</filter>...
 */
export function generateRarityFilterDefs(rarity: RarityTier): string {
  const stack = getFilterStackForRarity(rarity);
  let svgDefs = "<defs>";

  stack.filters.forEach((filter, index) => {
    const filterId = `${stack.filterId}-${filter.name}`;

    switch (filter.name) {
      case "neonGlow":
        svgDefs += filterNeonGlow(filterId, filter.intensity);
        break;
      case "chrome":
        svgDefs += filterChrome(filterId, filter.intensity);
        break;
      case "bloom":
        svgDefs += filterBloom(filterId, filter.intensity);
        break;
      case "halftone":
        svgDefs += filterHalftone(filterId, filter.intensity);
        break;
      case "specular":
        // Import specular if needed - for now, use a placeholder
        // Assuming filterSpecular is exported from svgFilterLibrary
        // svgDefs += filterSpecular(filterId, filter.intensity);
        break;
    }
  });

  svgDefs += "</defs>";
  return svgDefs;
}

/**
 * Get SVG filter attribute for a rarity tier
 *
 * Returns the filter ID to use in SVG filter attribute.
 * When multiple filters are stacked, they need to be applied in sequence.
 *
 * @param rarity - Rarity tier
 * @param filterIndex - Which filter in the stack (default: last/combined)
 * @returns Filter ID string for use in filter="url(#...)"
 */
export function getRarityFilterId(
  rarity: RarityTier,
  filterIndex?: number,
): string {
  const stack = getFilterStackForRarity(rarity);

  if (filterIndex !== undefined && filterIndex < stack.filters.length) {
    return `${stack.filterId}-${stack.filters[filterIndex].name}`;
  }

  // Return the first/primary filter ID by default
  return `${stack.filterId}-${stack.filters[0].name}`;
}

/**
 * Apply rarity filters to canvas using CSS filter strings
 *
 * Combines multiple CSS filters to approximate the rarity effect.
 * Note: This is an approximation since canvas doesn't support SVG filters directly.
 *
 * @param rarity - Rarity tier
 * @returns CSS filter string for canvas context
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * ctx.filter = getCanvasRarityFilter('epic');
 * ctx.drawImage(...);
 */
export function getCanvasRarityFilter(rarity: RarityTier): string {
  const stack = getFilterStackForRarity(rarity);
  const filters: string[] = [];

  stack.filters.forEach((filter) => {
    const cssFilter = getCanvasFilterString(filter.name, filter.intensity);
    if (cssFilter !== "none") {
      filters.push(cssFilter);
    }
  });

  return filters.length > 0 ? filters.join(" ") : "none";
}

/**
 * Get intensity multiplier for a rarity tier
 *
 * Used to scale other effects (particle size, glow amount, etc.)
 *
 * @param rarity - Rarity tier
 * @returns Multiplier value (0.5-1.0)
 */
export function getRarityIntensityMultiplier(rarity: RarityTier): number {
  return getFilterStackForRarity(rarity).intensityMultiplier;
}

/**
 * Get rarity tier color
 *
 * @param rarity - Rarity tier
 * @returns Hex color code for the rarity tier
 */
export function getRarityColor(rarity: RarityTier): string {
  return RARITY_METADATA[rarity].color;
}

/**
 * Get rarity tier emoji
 *
 * @param rarity - Rarity tier
 * @returns Emoji character representing the rarity
 */
export function getRarityEmoji(rarity: RarityTier): string {
  return RARITY_METADATA[rarity].emoji;
}

/**
 * Get rarity tier display name
 *
 * @param rarity - Rarity tier
 * @returns Human-readable name
 */
export function getRarityDisplayName(rarity: RarityTier): string {
  return RARITY_METADATA[rarity].displayName;
}

/**
 * Apply rarity styling to an HTML element
 *
 * Adds CSS classes and inline styles for rarity visualization.
 *
 * @param element - HTML element to style
 * @param rarity - Rarity tier
 * @param options - Styling options
 */
export function applyRarityStyles(
  element: HTMLElement,
  rarity: RarityTier,
  options: {
    addBorder?: boolean;
    addGlow?: boolean;
    addBackground?: boolean;
  } = {},
): void {
  const metadata = RARITY_METADATA[rarity];

  if (options.addBorder) {
    element.style.borderColor = metadata.color;
    element.style.borderWidth = "2px";
    element.style.borderStyle = "solid";
  }

  if (options.addGlow) {
    const stack = getFilterStackForRarity(rarity);
    const glowIntensity = stack.intensityMultiplier;
    element.style.boxShadow = `0 0 ${8 * glowIntensity}px ${metadata.color}`;
  }

  if (options.addBackground) {
    element.style.backgroundColor = metadata.color;
    element.style.opacity = "0.1";
  }

  // Add rarity class for CSS targeting
  element.classList.add(`rarity-${rarity}`);
}

/**
 * Create rarity badge HTML
 *
 * @param rarity - Rarity tier
 * @returns HTML string with rarity badge
 */
export function createRarityBadge(rarity: RarityTier): string {
  const metadata = RARITY_METADATA[rarity];
  return `
    <div class="rarity-badge rarity-${rarity}" style="color: ${metadata.color}">
      <span class="rarity-emoji">${metadata.emoji}</span>
      <span class="rarity-name">${metadata.displayName}</span>
    </div>
  `;
}

/**
 * Map numeric rarity level (0-3) to tier
 *
 * @param level - Rarity level (0=common, 1=rare, 2=epic, 3=legendary)
 * @returns RarityTier
 */
export function rarityLevelToTier(level: number): RarityTier {
  const tiers: RarityTier[] = ["common", "rare", "epic", "legendary"];
  return tiers[Math.max(0, Math.min(3, level))];
}

/**
 * Map tier to numeric rarity level
 *
 * @param tier - Rarity tier
 * @returns Numeric level (0-3)
 */
export function rarityTierToLevel(tier: RarityTier): number {
  return RARITY_TIERS.indexOf(tier);
}

/**
 * Get filter stack as JSON for database storage
 *
 * @param rarity - Rarity tier
 * @returns Serializable filter configuration
 */
export function getRarityFilterStackJSON(
  rarity: RarityTier,
): FilterStackConfig {
  return JSON.parse(JSON.stringify(getFilterStackForRarity(rarity)));
}

/**
 * Get all rarity tiers with metadata
 *
 * @returns Array of all rarity metadata sorted by tier level
 */
export function getAllRarities(): RarityMetadata[] {
  return RARITY_TIERS.map((tier) => RARITY_METADATA[tier]);
}

/**
 * Compare two rarities
 *
 * @param a - First rarity tier
 * @param b - Second rarity tier
 * @returns Negative if a < b, 0 if equal, positive if a > b
 */
export function compareRarity(a: RarityTier, b: RarityTier): number {
  return rarityTierToLevel(a) - rarityTierToLevel(b);
}

/**
 * Filter stack descriptor for UI display
 *
 * @param rarity - Rarity tier
 * @returns Human-readable description of the filter stack
 */
export function getFilterStackDescription(rarity: RarityTier): string {
  return getFilterStackForRarity(rarity).description;
}

/**
 * ADVANCED FILTER VARIANTS (Section 6A - Coding Dude Inspired)
 *
 * Modern filter combinations for enhanced visual effects
 * These can be optionally applied on top of base rarity stacks
 */

export type AdvancedFilterVariant =
  | "liquid-neon"
  | "comic-book"
  | "wave-ripple"
  | "holographic-shine"
  | "neon-glow-enhanced"
  | "shadow-depth"
  | "neon-outline";

export interface AdvancedFilterConfig {
  name: AdvancedFilterVariant;
  description: string;
  recommendedRarity: RarityTier[];
  filterFunction: (id: string, intensity: number) => string;
  defaultIntensity: number;
}

/**
 * Advanced filter configurations
 */
export const ADVANCED_FILTERS: Record<
  AdvancedFilterVariant,
  AdvancedFilterConfig
> = {
  "liquid-neon": {
    name: "liquid-neon",
    description: "Flowing morphing effects with animated turbulence",
    recommendedRarity: ["legendary"],
    filterFunction: filterLiquidNeon,
    defaultIntensity: 0.7,
  },
  "comic-book": {
    name: "comic-book",
    description: "Bold comic book effect with erosion/dilation",
    recommendedRarity: ["epic", "legendary"],
    filterFunction: filterComicBook,
    defaultIntensity: 0.6,
  },
  "wave-ripple": {
    name: "wave-ripple",
    description: "Undulating wave effects for dynamic motion",
    recommendedRarity: ["rare", "epic"],
    filterFunction: filterWaveRipple,
    defaultIntensity: 0.4,
  },
  "holographic-shine": {
    name: "holographic-shine",
    description: "Rainbow/holographic reflections with specular lighting",
    recommendedRarity: ["epic", "legendary"],
    filterFunction: filterHolographicShine,
    defaultIntensity: 0.75,
  },
  "neon-glow-enhanced": {
    name: "neon-glow-enhanced",
    description: "Advanced multi-stage glow with enhanced saturation",
    recommendedRarity: ["common", "rare"],
    filterFunction: filterNeonGlowAdvanced,
    defaultIntensity: 0.7,
  },
  "shadow-depth": {
    name: "shadow-depth",
    description: "Layered shadows for 3D depth perception",
    recommendedRarity: ["common", "rare", "epic", "legendary"],
    filterFunction: filterShadowDepth,
    defaultIntensity: 0.5,
  },
  "neon-outline": {
    name: "neon-outline",
    description: "Bold neon borders around shapes",
    recommendedRarity: ["common", "rare", "epic", "legendary"],
    filterFunction: filterNeonOutline,
    defaultIntensity: 0.7,
  },
};

/**
 * Get advanced filter configuration
 *
 * @param variant - Advanced filter variant name
 * @returns AdvancedFilterConfig
 */
export function getAdvancedFilterConfig(
  variant: AdvancedFilterVariant,
): AdvancedFilterConfig {
  return ADVANCED_FILTERS[variant];
}

/**
 * Get recommended advanced filters for a rarity tier
 *
 * @param rarity - Rarity tier
 * @returns Array of recommended advanced filter variants
 */
export function getRecommendedAdvancedFilters(
  rarity: RarityTier,
): AdvancedFilterVariant[] {
  return Object.entries(ADVANCED_FILTERS)
    .filter(([_, config]) => config.recommendedRarity.includes(rarity))
    .map(([variant, _]) => variant as AdvancedFilterVariant);
}

/**
 * Generate SVG filter def for advanced filter
 *
 * @param variant - Advanced filter variant
 * @param id - Filter ID
 * @param intensity - Filter intensity (0-1)
 * @returns SVG filter string
 */
export function generateAdvancedFilterDef(
  variant: AdvancedFilterVariant,
  id: string,
  intensity?: number,
): string {
  const config = getAdvancedFilterConfig(variant);
  return config.filterFunction(id, intensity ?? config.defaultIntensity);
}

/**
 * Generate combined filter defs for rarity + advanced filter
 *
 * @param rarity - Rarity tier
 * @param advancedVariant - Optional advanced filter variant
 * @returns SVG defs string with all filters
 */
export function generateCombinedFilterDefs(
  rarity: RarityTier,
  advancedVariant?: AdvancedFilterVariant,
): string {
  let svgDefs = "<defs>";

  // Add base rarity filters
  const baseStack = getFilterStackForRarity(rarity);
  baseStack.filters.forEach((filter) => {
    const filterId = `${baseStack.filterId}-${filter.name}`;
    switch (filter.name) {
      case "neonGlow":
        svgDefs += filterNeonGlow(filterId, filter.intensity);
        break;
      case "chrome":
        svgDefs += filterChrome(filterId, filter.intensity);
        break;
      case "bloom":
        svgDefs += filterBloom(filterId, filter.intensity);
        break;
      case "halftone":
        svgDefs += filterHalftone(filterId, filter.intensity);
        break;
      case "scanlines":
        // filterScanlines not exposed in original, but can be added
        break;
      case "specular":
        svgDefs += filterSpecular(filterId, filter.intensity);
        break;
    }
  });

  // Add advanced filter if specified
  if (advancedVariant) {
    const advancedId = `advanced-${advancedVariant}`;
    const config = getAdvancedFilterConfig(advancedVariant);
    svgDefs += config.filterFunction(advancedId, config.defaultIntensity);
  }

  svgDefs += "</defs>";
  return svgDefs;
}

/**
 * Get all filters used in a rarity tier
 *
 * @param rarity - Rarity tier
 * @returns Array of filter names
 */
export function getRarityFilterNames(
  rarity: RarityTier,
): Array<
  "neonGlow" | "chrome" | "bloom" | "halftone" | "scanlines" | "specular"
> {
  return getFilterStackForRarity(rarity).filters.map((f) => f.name);
}
