/**
 * Demo Metadata & Exclusivity Management
 *
 * Enforces:
 * - All demo images stored with exclusive metadata
 * - "Unreleased seed" message displayed everywhere
 * - Exactly 9000 total generations (matches seed pool)
 * - Forge locks when all seeds are consumed
 */

/**
 * Demo logo metadata stored in GeneratedLogo.metadata JSON field
 */
export interface DemoMetadata {
  source: "demo"; // Identifies as demo-exclusive
  style: "80s"; // Demo style theme
  seedExclusive: true; // Always true for demos
  seedNumber: string; // The actual seed string used
  generatedAt: string; // ISO timestamp
  rarity?: string; // Optional rarity from the demo
}

/**
 * Demo forge status
 */
export interface DemoForgeStatus {
  isLocked: boolean; // true when all 9000 seeds consumed
  totalSeeds: 9000; // Exactly 9000
  usedSeeds: number; // How many have been consumed
  availableSeeds: number; // Remaining (totalSeeds - usedSeeds)
  percentageUsed: number; // 0-100
  message: string; // Status message to display
}

/**
 * Validate demo metadata structure
 */
export function isDemoMetadata(obj: unknown): obj is DemoMetadata {
  if (typeof obj !== "object" || obj === null) return false;
  const meta = obj as Record<string, unknown>;
  return (
    meta.source === "demo" &&
    meta.style === "80s" &&
    meta.seedExclusive === true &&
    typeof meta.seedNumber === "string" &&
    typeof meta.generatedAt === "string"
  );
}

/**
 * Create demo metadata for a generated logo
 *
 * @param seed - The demo seed string used
 * @param rarity - Optional rarity tier
 * @returns Complete demo metadata
 */
export function createDemoMetadata(
  seed: string,
  rarity?: string,
): DemoMetadata {
  return {
    source: "demo",
    style: "80s",
    seedExclusive: true,
    seedNumber: seed,
    generatedAt: new Date().toISOString(),
    rarity,
  };
}

/**
 * Exclusivity message displayed on all demo logos
 */
export const DEMO_EXCLUSIVITY_MESSAGE =
  `This logo was forged using an unreleased 80s seed.
Once used, it can never be recreated.` as const;

/**
 * Message shown when forge is locked
 */
export const FORGE_LOCKED_MESSAGE =
  `⚡ The 80s Forge has exhausted its unreleased seeds.
All 9000 exclusive logos have been forged.` as const;

/**
 * Create forge status from seed pool statistics
 *
 * @param stats - Pool statistics { total, used, available, percentageUsed }
 * @returns Forge status object
 */
export function createDemoForgeStatus(stats: {
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
}): DemoForgeStatus {
  const isLocked = stats.available === 0;

  return {
    isLocked,
    totalSeeds: 9000,
    usedSeeds: stats.used,
    availableSeeds: stats.available,
    percentageUsed: stats.percentageUsed,
    message: isLocked
      ? FORGE_LOCKED_MESSAGE
      : `${stats.available} unreleased seeds remaining`,
  };
}

/**
 * Get exclusivity badge HTML
 * Displayed on demo logo cards/galleries
 */
export function getDemoExclusivityBadge(): string {
  return `
    <div class="demo-exclusivity-badge">
      <div class="badge-icon">⚡</div>
      <div class="badge-text">
        <div class="badge-title">80s Exclusive</div>
        <div class="badge-subtitle">Unreleased Seed</div>
      </div>
    </div>
  `;
}

/**
 * Get full exclusivity banner HTML
 * Larger display for logo view pages
 */
export function getDemoExclusivityBanner(): string {
  return `
    <div class="demo-exclusivity-banner">
      <div class="banner-header">⚡ This logo is 80s Exclusive ⚡</div>
      <div class="banner-message">
        ${DEMO_EXCLUSIVITY_MESSAGE}
      </div>
      <div class="banner-seed-note">
        Each unreleased seed can only forge one logo. Ever.
      </div>
    </div>
  `;
}

/**
 * Get CSS styles for demo exclusivity UI
 */
export function getDemoExclusivityStyles(): string {
  return `
    .demo-exclusivity-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      border-radius: 8px;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      box-shadow: 0 0 12px rgba(255, 0, 255, 0.5);
    }
    
    .badge-icon {
      font-size: 18px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .badge-text {
      display: flex;
      flex-direction: column;
    }
    
    .badge-title {
      font-size: 12px;
      font-weight: 700;
    }
    
    .badge-subtitle {
      font-size: 10px;
      opacity: 0.9;
    }
    
    .demo-exclusivity-banner {
      border: 2px solid;
      border-image: linear-gradient(135deg, #ff00ff, #00ffff) 1;
      padding: 20px;
      margin: 20px 0;
      background: linear-gradient(135deg, rgba(255, 0, 255, 0.05), rgba(0, 255, 255, 0.05));
      border-radius: 8px;
      text-align: center;
    }
    
    .banner-header {
      font-size: 18px;
      font-weight: bold;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }
    
    .banner-message {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 12px;
      color: #fff;
      white-space: pre-line;
    }
    
    .banner-seed-note {
      font-size: 12px;
      opacity: 0.8;
      color: #ccc;
      font-style: italic;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
  `;
}

/**
 * Forge lock UI - displayed when all seeds consumed
 */
export function getForgeLockUI(): string {
  return `
    <div class="forge-lock-container">
      <div class="lock-icon">🔒</div>
      <div class="lock-title">The 80s Forge is Locked</div>
      <div class="lock-message">
        ${FORGE_LOCKED_MESSAGE}
      </div>
      <div class="lock-stats">
        <div class="stat">
          <div class="stat-value">9,000</div>
          <div class="stat-label">Total Seeds</div>
        </div>
        <div class="stat">
          <div class="stat-value">9,000</div>
          <div class="stat-label">Forged Logos</div>
        </div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div class="stat-label">Remaining</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Forge lock CSS styles
 */
export function getForgeLockStyles(): string {
  return `
    .forge-lock-container {
      text-align: center;
      padding: 40px;
      background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
      border: 2px solid;
      border-image: linear-gradient(135deg, #808080, #404040) 1;
      border-radius: 12px;
      margin: 20px 0;
    }
    
    .lock-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    .lock-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #fff;
    }
    
    .lock-message {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #ccc;
      white-space: pre-line;
    }
    
    .lock-stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-label {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  `;
}

/**
 * Ensure GeneratedLogo has demo metadata
 * Call after storing a demo logo
 *
 * @param logoData - Partial GeneratedLogo data
 * @param demoSeed - Demo seed string
 * @param rarity - Optional rarity
 * @returns Updated logo data with metadata
 */
export function addDemoMetadataToLogo(
  logoData: Record<string, unknown>,
  demoSeed: string,
  rarity?: string,
): Record<string, unknown> {
  return {
    ...logoData,
    metadata: {
      ...(typeof logoData.metadata === "object" && logoData.metadata !== null
        ? logoData.metadata
        : {}),
      ...createDemoMetadata(demoSeed, rarity),
    },
  };
}

/**
 * Check if a logo is demo-exclusive
 *
 * @param logo - GeneratedLogo data or metadata
 * @returns true if logo is demo-exclusive
 */
export function isDemoExclusiveLogo(logo: { metadata?: unknown }): boolean {
  return isDemoMetadata(logo.metadata);
}

/**
 * Constants for demo seed constraints
 */
export const DEMO_CONSTRAINTS = {
  TOTAL_SEEDS: 9000,
  TOTAL_GENERATIONS: 9000, // 1:1 with seeds
  STYLE_THEME: "80s",
  MESSAGE: DEMO_EXCLUSIVITY_MESSAGE,
  LOCK_MESSAGE: FORGE_LOCKED_MESSAGE,
} as const;
