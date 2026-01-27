/**
 * Psychological Framing: Limited Edition Event
 *
 * Creates perceived value through:
 * - Scarcity messaging
 * - Prestige positioning
 * - Collectibility mechanics
 * - Visual superiority indicators
 */

/**
 * SCARCITY MESSAGING
 * Emphasizes limited supply and urgency
 */
export const SCARCITY_MESSAGES = {
  // Initial availability
  ABUNDANT: {
    message: "⚡ Unreleased seeds available",
    tone: "abundant",
    urgency: "low",
  },
  PLENTY: {
    message: "⚡ {count} exclusive seeds remaining",
    tone: "available",
    urgency: "low-medium",
  },
  RUNNING_LOW: {
    message: "🔥 Only {count} seeds left!",
    tone: "scarce",
    urgency: "medium-high",
  },
  CRITICAL: {
    message: "⚠️ {count} seeds remaining - Act fast!",
    tone: "very-scarce",
    urgency: "high",
  },
  ALMOST_GONE: {
    message: "🚨 ONLY {count} SEEDS LEFT - Rush!",
    tone: "ultra-scarce",
    urgency: "critical",
  },
  EXHAUSTED: {
    message: "🔒 SOLD OUT - Forge Locked Forever",
    tone: "exhausted",
    urgency: "none",
  },
} as const;

/**
 * Get scarcity message based on remaining count
 */
export function getScarcityMessage(
  remaining: number,
): (typeof SCARCITY_MESSAGES)[keyof typeof SCARCITY_MESSAGES] {
  if (remaining <= 0) return SCARCITY_MESSAGES.EXHAUSTED;
  if (remaining <= 50) return SCARCITY_MESSAGES.ALMOST_GONE;
  if (remaining <= 200) return SCARCITY_MESSAGES.CRITICAL;
  if (remaining <= 500) return SCARCITY_MESSAGES.RUNNING_LOW;
  if (remaining <= 2000) return SCARCITY_MESSAGES.PLENTY;
  return SCARCITY_MESSAGES.ABUNDANT;
}

/**
 * Format scarcity message with count
 */
export function formatScarcityMessage(remaining: number): string {
  const template = getScarcityMessage(remaining).message;
  return template.replace("{count}", remaining.toLocaleString());
}

/**
 * PRESTIGE POSITIONING
 * Language that elevates demo logos
 */
export const PRESTIGE_COPY = {
  headline: "80s Exclusive Forge",
  tagline: "Forge unreleased limited edition logos",
  description:
    "Only 9,000 exclusive seeds exist. Each one creates a unique, never-to-be-recreated logo.",
  cta: "⚡ Forge 80s Exclusive Logo",
  callout: "Unreleased • Exclusive • Limited Edition",

  // Messaging around the experience
  premium_intro:
    "Step into the 80s Forge - where unreleased seeds create visual masterpieces",
  exclusive_note:
    "This is a limited edition experience. Participate while seeds remain.",

  // After generation
  achievement_text: "You have forged an exclusive 80s logo.",
  scarcity_note:
    "You own one of {total_forged} exclusive logos from {seeds_remaining} remaining seeds.",

  // Social/sharing
  share_prefix: "I forged an exclusive 80s logo! ",
  share_suffix: " #80sExclusive #PixelLogoForge #LimitedEdition",
} as const;

/**
 * COLLECTIBILITY MECHANICS
 * Features that encourage collection and repeat visits
 */
export const COLLECTIBILITY_FEATURES = {
  // Numbers create sense of rarity
  numbers: {
    total_seeds: 9000,
    unique_combinations: 1800, // neon variant combinations
    current_forged: 0, // Dynamic
    seed_pool_milestone_10: "First of 900 forged",
    seed_pool_milestone_25: "In the first 25%",
    seed_pool_milestone_50: "In the first half",
    seed_pool_milestone_75: "In the final quarter",
    seed_pool_milestone_90: "In the last 10%",
  },

  // Achievement badges
  achievements: {
    FIRST_FORGER: {
      id: "first-forger",
      title: "⚡ First Forger",
      description: "Forged the first 80s exclusive logo",
      rarity: "mythic",
      icon: "⚡",
    },
    EARLY_ADOPTER: {
      id: "early-adopter",
      title: "🌅 Early Adopter",
      description: "Forged within the first 100",
      rarity: "legendary",
      icon: "🌅",
    },
    SEED_COLLECTOR: {
      id: "seed-collector",
      title: "🎨 Seed Collector",
      description: "Forged 10 exclusive logos",
      rarity: "epic",
      icon: "🎨",
    },
    NEON_MASTER: {
      id: "neon-master",
      title: "💜 Neon Master",
      description: "Forged 25 exclusive logos",
      rarity: "epic",
      icon: "💜",
    },
    EXCLUSIVE_COLLECTOR: {
      id: "exclusive-collector",
      title: "🏆 Exclusive Collector",
      description: "Forged 50 exclusive logos",
      rarity: "rare",
      icon: "🏆",
    },
    WITNESSED_SCARCITY: {
      id: "witnessed-scarcity",
      title: "👁️ Witnessed Scarcity",
      description: "Forged a logo in the last 100 remaining",
      rarity: "legendary",
      icon: "👁️",
    },
    FINAL_SEED: {
      id: "final-seed",
      title: "🔒 The Last Seed",
      description: "Forged the final 9000th exclusive logo",
      rarity: "mythic",
      icon: "🔒",
    },
  },

  // Limited runs/batches
  batches: {
    batch_1: { range: [1, 900], label: "First Wave", emoji: "🌊" },
    batch_2: { range: [901, 1800], label: "Second Wave", emoji: "🌊" },
    batch_3: { range: [1801, 2700], label: "Third Wave", emoji: "🌊" },
    batch_4: { range: [2701, 3600], label: "Fourth Wave", emoji: "🌊" },
    batch_5: { range: [3601, 4500], label: "Fifth Wave", emoji: "🌊" },
    batch_6: { range: [4501, 5400], label: "Sixth Wave", emoji: "🌊" },
    batch_7: { range: [5401, 6300], label: "Seventh Wave", emoji: "🌊" },
    batch_8: { range: [6301, 7200], label: "Eighth Wave", emoji: "🌊" },
    batch_9: { range: [7201, 8100], label: "Ninth Wave", emoji: "🌊" },
    batch_10: { range: [8101, 9000], label: "Final Wave", emoji: "🌊🔒" },
  },
} as const;

/**
 * Determine which batch a forged logo belongs to
 */
export function getLogoWave(forgeNumber: number): {
  label: string;
  emoji: string;
  range: [number, number];
  position: string; // e.g., "1st of 900"
} {
  const batches = Object.values(COLLECTIBILITY_FEATURES.batches);
  const batch = batches.find(
    (b) => forgeNumber >= b.range[0] && forgeNumber <= b.range[1],
  );

  if (!batch) {
    return {
      label: "Unknown",
      emoji: "❓",
      range: [0, 0],
      position: "",
    };
  }

  const positionInBatch = forgeNumber - batch.range[0] + 1;
  const batchSize = batch.range[1] - batch.range[0] + 1;

  return {
    label: batch.label,
    emoji: batch.emoji,
    range: [...batch.range] as [number, number],
    position: `${positionInBatch} of ${batchSize}`,
  };
}

/**
 * VISUAL SUPERIORITY INDICATORS
 * Design elements that signal premium status
 */
export const VISUAL_SUPERIORITY = {
  // Color schemes that signal exclusivity
  exclusive_gradient: "linear-gradient(135deg, #ff00ff, #00ffff)",
  premium_border: "2px solid #00ffff",
  glow_effect: "0 0 20px rgba(255, 0, 255, 0.8)",
  shimmer_animation: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,

  // Badge styles
  badges: {
    exclusive: {
      background: "linear-gradient(135deg, #ff00ff, #00ffff)",
      color: "#000",
      glow: "box-shadow: 0 0 15px rgba(255, 0, 255, 0.6)",
      text: "🎖️ EXCLUSIVE",
    },
    limited_edition: {
      background: "#ffaa00",
      color: "#000",
      glow: "box-shadow: 0 0 15px rgba(255, 170, 0, 0.6)",
      text: "🏅 LIMITED EDITION",
    },
    unreleased: {
      background: "#ff0055",
      color: "#fff",
      glow: "box-shadow: 0 0 15px rgba(255, 0, 85, 0.6)",
      text: "⚡ UNRELEASED",
    },
    collectible: {
      background: "#9900ff",
      color: "#fff",
      glow: "box-shadow: 0 0 15px rgba(153, 0, 255, 0.6)",
      text: "💎 COLLECTIBLE",
    },
  },

  // Container styles for demo logos
  premium_container_css: `
    position: relative;
    border: 2px solid #00ffff;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.05), rgba(0, 255, 255, 0.05));
    box-shadow: 
      0 0 20px rgba(255, 0, 255, 0.3),
      inset 0 0 20px rgba(0, 255, 255, 0.1);
    padding: 4px;
  `,

  // Overlay badges
  overlay_css: `
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #00ffff;
    color: #00ffff;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,
} as const;

/**
 * Get visual treatment based on scarcity level
 */
export function getVisualTreatment(remaining: number): {
  glowIntensity: number;
  borderColor: string;
  animationSpeed: string;
  textColor: string;
} {
  if (remaining <= 0) {
    return {
      glowIntensity: 0,
      borderColor: "#808080",
      animationSpeed: "none",
      textColor: "#808080",
    };
  }

  if (remaining <= 50) {
    return {
      glowIntensity: 3,
      borderColor: "#ff0000",
      animationSpeed: "0.5s",
      textColor: "#ff0000",
    };
  }

  if (remaining <= 200) {
    return {
      glowIntensity: 2.5,
      borderColor: "#ffaa00",
      animationSpeed: "1s",
      textColor: "#ffaa00",
    };
  }

  if (remaining <= 500) {
    return {
      glowIntensity: 2,
      borderColor: "#00ffff",
      animationSpeed: "1.5s",
      textColor: "#00ffff",
    };
  }

  // Normal availability
  return {
    glowIntensity: 1,
    borderColor: "#00ffff",
    animationSpeed: "2s",
    textColor: "#00ffff",
  };
}

/**
 * PRESTIGE SHOWCASE
 * Display elements that emphasize rarity
 */
export const PRESTIGE_SHOWCASE = {
  // "You own one of..." messaging
  ownership_message: (forgeNumber: number, totalRemaining: number) => `
    You own #${forgeNumber.toLocaleString()} of 9,000 exclusive 80s logos
    Only ${totalRemaining.toLocaleString()} remain unreleased
  `,

  // Global leaderboard position
  global_position: (position: number) => `
    Your 80s exclusive is 1 of 9,000
    You are the ${position}${getOrdinalSuffix(position)} to forge one
  `,

  // Comparison with non-exclusive
  premium_difference: `
    💜 This exclusive 80s logo features:
    ✨ Unreleased neon color palette
    ✨ Premium magenta/cyan/purple theme
    ✨ High contrast design
    ✨ Limited to 9,000 total
    ✨ One-of-a-kind seed fingerprint
  `,

  // Market value messaging (aspirational)
  value_messaging: `
    This exclusive is part of a limited 9,000 collection.
    As the pool exhausts, exclusivity increases.
  `,
} as const;

/**
 * Helper: Get ordinal suffix for numbers
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

/**
 * CALL-TO-ACTION PSYCHOLOGY
 * Messages that drive engagement
 */
export const CTA_PSYCHOLOGY = {
  // FOMO (Fear of Missing Out)
  fomo_urgent: "Forge now before this unreleased seed vanishes forever",
  fomo_limited: "Only {remaining} exclusive seeds left - claim yours",
  fomo_final: "The 80s Forge is almost locked. This may be your last chance.",

  // JOMO (Joy of Missing Out alternative)
  early_bird: "You forged early - you're among the first 10%",
  exclusive_access: "Access to unreleased 80s technology",
  member_status: "Congratulations! You're an Official 80s Exclusive Member",

  // Achievement framing
  achievement_unlocked: "Achievement Unlocked: Limited Edition Creator",
  badge_earned: "You earned the Early Adopter badge!",

  // Social proof
  social_proof: "{count} exclusive logos forged so far",
  prestigious_group: "Join the exclusive group of 80s creators",
} as const;

/**
 * COMPLETE PSYCHOLOGICAL FRAMEWORK
 * Combines all elements into unified messaging
 */
export function getPsychologicalFramework(stats: {
  totalForged: number;
  totalRemaining: number;
  userPosition: number;
}) {
  const scarcityMsg = formatScarcityMessage(stats.totalRemaining);
  const wave = getLogoWave(stats.totalForged);
  const visual = getVisualTreatment(stats.totalRemaining);

  return {
    scarcity: scarcityMsg,
    prestige: PRESTIGE_COPY.headline,
    collectibility: `${wave.emoji} ${wave.label} (${wave.position})`,
    visual_intensity: visual.glowIntensity,
    psychological_lever: (() => {
      if (stats.totalRemaining <= 50)
        return "EXTREME SCARCITY - CRITICAL URGENCY";
      if (stats.totalRemaining <= 200) return "HIGH SCARCITY - RUSH MESSAGING";
      if (stats.totalRemaining <= 500)
        return "MODERATE SCARCITY - EXCLUSIVITY FOCUS";
      return "ABUNDANT SCARCITY - EXPERIENCE FOCUS";
    })(),
  };
}

/**
 * Format statistics for psychological impact
 */
export function formatForPsychologicalImpact(stats: {
  totalForged: number;
  totalRemaining: number;
}) {
  return {
    // Highlight scarcity
    forged_count: stats.totalForged.toLocaleString(),
    remaining_count: stats.totalRemaining.toLocaleString(),

    // Show exclusivity of remaining
    exclusive_percentage: ((stats.totalRemaining / 9000) * 100).toFixed(1),

    // Wave positioning
    wave: getLogoWave(stats.totalForged),

    // Psychological message
    message: (() => {
      const percent = (stats.totalForged / 9000) * 100;
      if (percent >= 99) return "🔒 Nearly Mythic - Forge Locked Soon";
      if (percent >= 95) return "🚨 Critical Scarcity - Final Wave";
      if (percent >= 75) return "⚠️ Scarce - Get Yours Now";
      if (percent >= 50) return "🔥 Halfway Gone";
      if (percent >= 25) return "⚡ Exclusive Opportunity";
      return "🌅 Early Access Available";
    })(),
  };
}
