/**
 * Type definitions for demo logo styles and forged logos
 * Corresponds to Prisma models: LogoStyle, ForgedLogo, LogoRarity
 */

import type {
  LogoRarity as PrismaLogoRarity,
  LogoStyle as PrismaLogoStyle,
  ForgedLogo as PrismaForgedLogo,
} from "@prisma/client";

/**
 * Logo rarity tiers - matches Prisma enum
 */
export enum LogoRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export type LogoRarityType = keyof typeof LogoRarity;

/**
 * Rarity weight configuration for probability calculations
 */
export const RARITY_WEIGHTS: Record<LogoRarityType, number> = {
  COMMON: 50,
  RARE: 30,
  EPIC: 5,
  LEGENDARY: 15,
};

/**
 * Logo style layout configuration
 * Stores all canvas rendering parameters for consistency
 */
export interface LogoStyleLayout {
  pixelSize?: number; // Pixel size for rendering (default: 2)
  compositionMode?:
    | "centered"
    | "top-heavy"
    | "wide-cinematic"
    | "badge-emblem"
    | "vertical-stacked"
    | "curved-baseline";
  frameStyle?:
    | "none"
    | "arcade-bezel"
    | "computer-window"
    | "cartridge-label"
    | "floppy-disk"
    | "trading-card"
    | "terminal-box"
    | "nes-title"
    | "sega-plaque";
  backgroundStyle?:
    | "solid"
    | "crt-scanlines"
    | "starfield"
    | "grid-horizon"
    | "checkerboard"
    | "pixel-noise"
    | "sunset-gradient"
    | "terminal-green"
    | "paper-texture"
    | "dos-boot"
    | "vaporwave-sky";
}

/**
 * Text effects configuration
 * Stores all visual effects applied to the logo text
 */
export interface LogoStyleEffects {
  gradient?: boolean;
  doubleShadow?: boolean;
  chunkyOutline?: boolean;
  invertedPixels?: boolean;
  metallic?: boolean;
  cracked?: boolean;
  stacked3D?: boolean;
  slanted?: boolean;
  waveDistortion?: boolean;
  cartridgePrint?: boolean;
  pixelEmboss?: boolean;
  glitchOffset?: boolean;
  noiseOverlay?: boolean;
  neonOutline?: boolean;
  shadowGradient?: boolean;
  // Depth config
  extrusion?: boolean;
  lighting?: boolean;
  lightingDirection?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "top"
    | "left"
    | "right"
    | "bottom";
  atmosphericGlow?: boolean;
  glowIntensity?: number;
  glowColor?: string;
  innerShadow?: boolean;
  pixelReflections?: boolean;
  perspectiveTilt?: boolean;
  floatingShadow?: boolean;
  shadowBlur?: number;
  texture?: "metal" | "stone" | "plastic" | "crt-phosphor" | "none";
}

/**
 * Logo style model - represents a curated style configuration
 */
export interface LogoStyle extends Omit<PrismaLogoStyle, "layout" | "effects"> {
  layout: LogoStyleLayout;
  effects: LogoStyleEffects;
}

/**
 * Forged logo model - represents a generated logo using a specific style
 */
export interface ForgedLogo extends PrismaForgedLogo {
  style?: LogoStyle; // Optional relation
}

/**
 * Request payload for creating a forged logo
 */
export interface CreateForgedLogoRequest {
  text: string;
  seed: number;
  styleId: number;
}

/**
 * Response payload for forged logo
 */
export interface ForgedLogoResponse {
  id: string;
  seed: number;
  text: string;
  styleId: number;
  rarity: LogoRarity;
  createdAt: Date;
  style?: LogoStyle;
}

/**
 * Request payload for creating a logo style
 */
export interface CreateLogoStyleRequest {
  slug: string;
  displayName: string;
  rarity: LogoRarityType;
  weight?: number;
  baseHue: number;
  accentHue: number;
  bgHue: number;
  fontFamily?: string;
  layout: LogoStyleLayout;
  effects: LogoStyleEffects;
}

/**
 * Query params for filtering/sorting styles
 */
export interface LogoStyleQuery {
  rarity?: LogoRarityType;
  isActive?: boolean;
  sortBy?: "weight" | "createdAt" | "displayName";
  limit?: number;
  offset?: number;
}

/**
 * Seed-to-rarity mapping for consistent determination
 */
export function seedToRarity(seed: number): LogoRarityType {
  const normalized = seed % 100;
  if (normalized < 50) return "COMMON";
  if (normalized < 80) return "RARE";
  if (normalized < 95) return "EPIC";
  return "LEGENDARY";
}

/**
 * Get total probability weight for rarity distribution
 */
export function getTotalRarityWeight(): number {
  return Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
}

/**
 * Select rarity based on weighted random selection
 */
export function selectRarityByWeight(randomValue: number): LogoRarityType {
  const total = getTotalRarityWeight();
  const normalized = randomValue * total;

  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (normalized < cumulative) {
      return rarity as LogoRarityType;
    }
  }

  return "LEGENDARY";
}
