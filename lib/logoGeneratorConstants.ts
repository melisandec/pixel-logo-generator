import type { LogoConfig, Rarity } from "@/lib/logoGenerator";

// Daily limits and tries
export const TRIES_PER_DAY = 3;
export const BONUS_TRIES_FOR_MASTER = 1;

// Word list for random generation
export const RANDOM_WORDS = [
  "Arcade",
  "Pixel",
  "Forge",
  "Neon",
  "Crt",
  "Quest",
  "Byte",
  "Retro",
  "Glitch",
  "Tron",
  "Blade Runner",
  "Alien",
  "Predator",
  "The Matrix",
  "Dune",
  "Star Trek",
  "Doctor Who",
  "The Expanse",
  "Battlestar",
  "Neon Genesis",
  "Asteroids",
  "Galaga",
  "Centipede",
  "Tempest",
  "Defender",
  "Gauntlet",
  "Frogger",
  "Dig Dug",
  "Pac-Man",
  "Space Invaders",
  "Metroid",
  "Mega Man",
  "Contra",
  "OutRun",
  "Robotron",
  "Qbert",
  "Arkanoid",
  "Bubble Bobble",
  "R-Type",
  "Gradius",
  "Tekken",
  "Street Fighter",
  "Mortal Kombat",
  "Double Dragon",
  "Golden Axe",
  "After Burner",
  "Ms Pac-Man",
  "Star Wars",
  "The Fifth Element",
  "Terminator",
  "RoboCop",
  "Akira",
  "Ghost in the Shell",
  "Cowboy Bebop",
  "Firefly",
  "Stargate",
  "X-Files",
  "Westworld",
  "Black Mirror",
  "Altered Carbon",
  "Apple",
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Nvidia",
  "Intel",
  "AMD",
  "Samsung",
  "Sony",
  "Tesla",
  "OpenAI",
  "IBM",
  "Oracle",
  "Bitcoin",
  "Ethereum",
  "Solana",
  "Cardano",
  "Polkadot",
  "Litecoin",
  "Dogecoin",
  "Shiba Inu",
  "Avalanche",
  "Chainlink",
  "Uniswap",
  "Tether",
  "USD Coin",
  "Ripple",
  "Stellar",
  "Monero",
  "Aave",
  "Cosmos",
  "Algorand",
  "Polygon",
  "Toncoin",
  "NEAR",
  "Filecoin",
  "Arbitrum",
] as const;

// Preset configurations
export const PRESETS: Array<{
  key: string;
  label: string;
  config: Partial<LogoConfig>;
}> = [
  {
    key: "arcade",
    label: "Arcade",
    config: {
      backgroundStyle: "crt-scanlines",
      frameStyle: "arcade-bezel",
      colorSystem: "Classic",
      compositionMode: "centered",
    },
  },
  {
    key: "vaporwave",
    label: "Vaporwave",
    config: {
      backgroundStyle: "vaporwave-sky",
      frameStyle: "trading-card",
      colorSystem: "Vaporwave",
      compositionMode: "vertical-stacked",
    },
  },
  {
    key: "gameboy",
    label: "Game Boy",
    config: {
      backgroundStyle: "grid-horizon",
      frameStyle: "none",
      colorSystem: "GameBoy",
      compositionMode: "centered",
    },
  },
];

// Rarity levels
export const RARITY_OPTIONS: Rarity[] = [
  "COMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
];

// Color swatches for presets
export const PRESET_SWATCHES: Record<string, string[]> = {
  arcade: ["#00ff00", "#ff00ff", "#ffff00"],
  vaporwave: ["#ff006e", "#8338ec", "#3a86ff"],
  gameboy: ["#0f380f", "#306230", "#9bbc0f"],
};

// Challenge prompts
export const ALL_CHALLENGE_PROMPTS = [
  { name: "Nike", description: "Generate a logo for Nike" },
  { name: "Adidas", description: "Generate a logo for Adidas" },
  { name: "Apple", description: "Generate a logo for Apple" },
  { name: "Tesla", description: "Generate a logo for Tesla" },
  { name: "Gucci", description: "Generate a logo for Gucci" },
  { name: "Spotify", description: "Generate a logo for Spotify" },
  { name: "Meta", description: "Generate a logo for Meta" },
  { name: "Sony", description: "Generate a logo for Sony" },
  { name: "Uber", description: "Generate a logo for Uber" },
  { name: "BMW", description: "Generate a logo for BMW" },
  { name: "Dior", description: "Generate a logo for Dior" },
  { name: "Amazon", description: "Generate a logo for Amazon" },
  { name: "Nintendo", description: "Generate a logo for Nintendo" },
] as const;

// Daily challenge rotation
export const DAILY_PROMPTS = [
  "Meta",
  "Sony",
  "Uber",
  "BMW",
  "Dior",
  "Amazon",
  "Nintendo",
] as const;
