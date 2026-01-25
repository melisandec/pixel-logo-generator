/**
 * Seed crack animation sequence orchestrator
 * Manages the multi-stage animation timeline from dormant through ticket reveal
 * Coordinates: stage timing, visual effects, sound effects, variance calculations
 */

import {
  ANIMATION_STAGE_TIMING,
  SEED_CRACK_ANIMATION_DURATION,
} from "@/lib/logoGeneratorConstants";
import {
  playCrackSound,
  playBloomSound,
  playTicketSound,
} from "@/lib/audioSystem";

export type SeedCrackStage =
  | "dormant"
  | "stress"
  | "crawl-1"
  | "crawl-2"
  | "fissure"
  | "swell"
  | "shake"
  | "pause"
  | "bloom"
  | "ticket"
  | null;

interface AnimationConfig {
  onStageChange: (stage: SeedCrackStage) => void;
  onVarianceUpdate: (variance: {
    shakeAmp: number;
    crackOffset: number;
    glowHue: number;
    bloomAngle: number;
  }) => void;
  soundEnabled?: boolean;
}

interface SequenceTimings {
  [key: string]: { start: number; duration: number };
}

/**
 * Calculate timing for each animation stage
 */
const calculateSequenceTimings = (): SequenceTimings => {
  let currentTime = 0;
  const timings: SequenceTimings = {};

  Object.entries(ANIMATION_STAGE_TIMING).forEach(([stage, duration]) => {
    timings[stage] = {
      start: currentTime,
      duration,
    };
    currentTime += duration;
  });

  return timings;
};

/**
 * Execute seed crack animation sequence
 * Returns cleanup function to cancel ongoing animation
 */
export function executeSeedCrackAnimation(config: AnimationConfig): () => void {
  const { onStageChange, onVarianceUpdate, soundEnabled = true } = config;
  const timings = calculateSequenceTimings();
  const timeoutIds: NodeJS.Timeout[] = [];
  let rafId: number | null = null;

  // Helper to schedule stage transitions
  const scheduleStage = (stage: SeedCrackStage, delay: number) => {
    const id = setTimeout(() => {
      onStageChange(stage);
    }, delay);
    timeoutIds.push(id);
  };

  // Stage: Dormant (0ms) - Initialize
  onStageChange("dormant");

  // Stage: Stress (300ms) - Small tension crack appears
  scheduleStage("stress", timings.stress.start);

  // Stage: Crawl-1 (600ms) - Crack grows downward
  scheduleStage("crawl-1", timings["crawl-1"].start);
  if (soundEnabled) {
    const id = setTimeout(() => playCrackSound(500), timings["crawl-1"].start);
    timeoutIds.push(id);
  }

  // Stage: Crawl-2 (600ms) - Crack continues growing
  scheduleStage("crawl-2", timings["crawl-2"].start);

  // Stage: Fissure (300ms) - Crack fully splits
  scheduleStage("fissure", timings.fissure.start);

  // Stage: Swell (400ms) - Seed grows/swells
  scheduleStage("swell", timings.swell.start);

  // Stage: Shake (400ms) - Vibration effect
  scheduleStage("shake", timings.shake.start);

  // Continuous shake animation during shake stage
  const shakeStart = timings.shake.start;
  const shakeEnd = shakeStart + timings.shake.duration;

  const animateShake = () => {
    const elapsed = Date.now() - animationStartTime;
    const progress = (elapsed - shakeStart) / timings.shake.duration;

    if (progress >= 0 && progress < 1) {
      // Sine wave for shake amplitude
      const shakeAmp = Math.sin(progress * Math.PI * 6) * (progress * 15);
      onVarianceUpdate({
        shakeAmp,
        crackOffset: 0,
        glowHue: 0,
        bloomAngle: 0,
      });
      rafId = requestAnimationFrame(animateShake);
    } else if (progress >= 1) {
      cancelAnimationFrame(rafId!);
    }
  };

  const animationStartTime = Date.now();

  const id = setTimeout(animateShake, shakeStart);
  timeoutIds.push(id);

  // Stage: Pause (200ms) - Brief pause before bloom
  scheduleStage("pause", timings.pause.start);

  // Stage: Bloom (300ms) - Seed blooms open
  scheduleStage("bloom", timings.bloom.start);

  // Bloom animation (radial expansion effect)
  const bloomStart = timings.bloom.start;
  const bloomEnd = bloomStart + timings.bloom.duration;

  const animateBloom = () => {
    const elapsed = Date.now() - animationStartTime;
    const progress = (elapsed - bloomStart) / timings.bloom.duration;

    if (progress >= 0 && progress < 1) {
      // Expand angle 360 degrees during bloom
      const bloomAngle = progress * 360;
      onVarianceUpdate({
        shakeAmp: 0,
        crackOffset: 0,
        glowHue: progress * 60, // Color shift during bloom
        bloomAngle,
      });
      rafId = requestAnimationFrame(animateBloom);
    } else if (progress >= 1) {
      cancelAnimationFrame(rafId!);
      if (soundEnabled) {
        playBloomSound(300);
      }
    }
  };

  const id2 = setTimeout(animateBloom, bloomStart);
  timeoutIds.push(id2);

  // Stage: Ticket (300ms) - Rarity ticket revealed
  scheduleStage("ticket", timings.ticket.start);
  if (soundEnabled) {
    const id = setTimeout(
      () => playTicketSound(400),
      timings.ticket.start + 100,
    );
    timeoutIds.push(id);
  }

  // Cleanup function
  return () => {
    timeoutIds.forEach((id) => clearTimeout(id));
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}

/**
 * Get animation stage for progress (0-1)
 * Useful for testing or manual timeline control
 */
export function getAnimationStageAtProgress(progress: number): SeedCrackStage {
  const timings = calculateSequenceTimings();
  const elapsedMs = progress * SEED_CRACK_ANIMATION_DURATION;

  for (const [stage, { start, duration }] of Object.entries(timings)) {
    if (elapsedMs >= start && elapsedMs < start + duration) {
      return stage as SeedCrackStage;
    }
  }

  return null;
}

/**
 * Calculate variance values for a given progress
 * Returns shakeAmp, crackOffset, glowHue, bloomAngle
 */
export function getVarianceAtProgress(progress: number): {
  shakeAmp: number;
  crackOffset: number;
  glowHue: number;
  bloomAngle: number;
} {
  const timings = calculateSequenceTimings();
  const elapsedMs = progress * SEED_CRACK_ANIMATION_DURATION;

  const shakeStart = timings.shake.start;
  const shakeEnd = shakeStart + timings.shake.duration;
  const bloomStart = timings.bloom.start;
  const bloomEnd = bloomStart + timings.bloom.duration;

  let shakeAmp = 0;
  let glowHue = 0;
  let bloomAngle = 0;

  // Calculate shake amplitude
  if (elapsedMs >= shakeStart && elapsedMs < shakeEnd) {
    const shakeProg = (elapsedMs - shakeStart) / timings.shake.duration;
    shakeAmp = Math.sin(shakeProg * Math.PI * 6) * (shakeProg * 15);
  }

  // Calculate bloom animation
  if (elapsedMs >= bloomStart && elapsedMs < bloomEnd) {
    const bloomProg = (elapsedMs - bloomStart) / timings.bloom.duration;
    glowHue = bloomProg * 60;
    bloomAngle = bloomProg * 360;
  }

  return {
    shakeAmp,
    crackOffset: 0, // Could vary by crack stage if needed
    glowHue,
    bloomAngle,
  };
}
