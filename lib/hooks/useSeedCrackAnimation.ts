import { useState, useEffect, useCallback, useRef } from "react";
import type { LogoResult, Rarity } from "@/lib/logoGenerator";

// Type definitions
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

export interface SeedCrackVariance {
  shakeAmp: number;
  crackOffset: number;
  glowHue: number;
  bloomAngle: number;
}

export interface UseSeedCrackAnimation {
  // State getters
  seedCrackStage: SeedCrackStage;
  seedCrackValue: string | null;
  seedCrackRarity: Rarity | null;
  seedCrackVariance: SeedCrackVariance | null;
  soundEnabled: boolean;

  // State setters
  setSoundEnabled: (value: boolean) => void;

  // Callbacks
  startSeedCrackSequence: (result: LogoResult, onComplete: () => void) => void;
  toggleSound: () => void;
  clearSeedCrackSequence: () => void;

  // Utility callbacks (for external sound control)
  playCrackSound: (params: { seed?: number; rarity?: Rarity | null }) => void;
  playBloomSound: (params: { seed?: number; rarity?: Rarity | null }) => void;
  playTicketSound: () => void;
}

/**
 * Hook to manage seed crack animation sequences and audio playback.
 * Handles all animation state, timing, Web Audio synthesis, and cleanup.
 *
 * @example
 * const { seedCrackStage, startSeedCrackSequence, soundEnabled, toggleSound } = useSeedCrackAnimation();
 * // Use seedCrackStage in className: seed-crack-${seedCrackStage}
 * // Call startSeedCrackSequence(logoResult, () => {}) when generation completes
 */
export function useSeedCrackAnimation(): UseSeedCrackAnimation {
  // State variables
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [seedCrackValue, setSeedCrackValue] = useState<string | null>(null);
  const [seedCrackStage, setSeedCrackStage] = useState<SeedCrackStage>(null);
  const [seedCrackRarity, setSeedCrackRarity] = useState<Rarity | null>(null);
  const [seedCrackVariance, setSeedCrackVariance] =
    useState<SeedCrackVariance | null>(null);

  // Refs for animation and audio management
  const seedCrackTimerRef = useRef<number | null>(null);
  const seedCrackTimeoutsRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("plf:sound");
      if (stored === "off") {
        setSoundEnabled(false);
      }
    } catch (error) {
      console.error("Failed to read sound preference:", error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (seedCrackTimerRef.current) {
        window.clearInterval(seedCrackTimerRef.current);
        seedCrackTimerRef.current = null;
      }
      seedCrackTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      seedCrackTimeoutsRef.current = [];
    };
  }, []);

  /**
   * Get or initialize Web Audio API context
   */
  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }, []);

  /**
   * Deterministic RNG for reproducible audio synthesis
   */
  const createSeededRandom = useCallback((seed: number) => {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    };
  }, []);

  /**
   * Get gain multiplier based on rarity tier
   */
  const getRarityGain = useCallback((rarity?: Rarity | null) => {
    if (rarity === "LEGENDARY") return 1.35;
    if (rarity === "EPIC") return 1.18;
    if (rarity === "RARE") return 1.08;
    return 1;
  }, []);

  /**
   * Clear all active timers and animation state
   */
  const clearSeedCrackSequence = useCallback(() => {
    if (seedCrackTimerRef.current) {
      window.clearInterval(seedCrackTimerRef.current);
      seedCrackTimerRef.current = null;
    }
    seedCrackTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    seedCrackTimeoutsRef.current = [];
    setSeedCrackStage(null);
    setSeedCrackValue(null);
    setSeedCrackRarity(null);
    setSeedCrackVariance(null);
  }, []);

  /**
   * Play crack sound effect (high-pass filtered noise + bass thump + debris + shard)
   */
  const playCrackSound = useCallback(
    (params: { seed?: number; rarity?: Rarity | null }) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const now = ctx.currentTime;
      const seed = params.seed ?? Math.floor((performance.now() % 1e6) * 1000);
      const rand = createSeededRandom(seed ^ 0x9e3779b9);
      const rarityGain = getRarityGain(params.rarity) * 0.9;

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.8 * rarityGain, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      master.connect(ctx.destination);

      const pan = ctx.createStereoPanner();
      pan.pan.value = (rand() * 2 - 1) * 0.25;
      pan.connect(master);

      const crackBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.08,
        ctx.sampleRate,
      );
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackData.length; i += 1) {
        const t = i / crackData.length;
        const decay = 1 - t;
        crackData[i] = (rand() * 2 - 1) * decay * Math.pow(1 - t, 1.25);
      }
      const crack = ctx.createBufferSource();
      crack.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "highpass";
      crackFilter.frequency.value = 900 + rand() * 600;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.14 * rarityGain, now);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(pan);
      crack.start(now);
      crack.stop(now + 0.22);

      const thump = ctx.createOscillator();
      thump.type = "triangle";
      thump.frequency.setValueAtTime(140 + rand() * 40, now);
      thump.frequency.exponentialRampToValueAtTime(
        60 + rand() * 18,
        now + 0.34,
      );
      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(0.18 * rarityGain, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      thump.connect(thumpGain);
      thumpGain.connect(master);
      thump.start(now);
      thump.stop(now + 0.38);

      const debrisBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.18,
        ctx.sampleRate,
      );
      const debrisData = debrisBuffer.getChannelData(0);
      for (let i = 0; i < debrisData.length; i += 1) {
        const t = i / debrisData.length;
        const decay = Math.pow(1 - t, 1.6);
        debrisData[i] = (rand() * 2 - 1) * decay * 0.9;
      }
      const debris = ctx.createBufferSource();
      debris.buffer = debrisBuffer;
      const debrisFilter = ctx.createBiquadFilter();
      debrisFilter.type = "bandpass";
      debrisFilter.frequency.value = 3800 + rand() * 1600;
      debrisFilter.Q.value = 3.2;
      const debrisGain = ctx.createGain();
      debrisGain.gain.setValueAtTime(0.08 * rarityGain, now + 0.02);
      debrisGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      debris.connect(debrisFilter);
      debrisFilter.connect(debrisGain);
      debrisGain.connect(pan);
      debris.start(now + 0.02);
      debris.stop(now + 0.3);

      const shard = ctx.createOscillator();
      shard.type = "sine";
      shard.frequency.setValueAtTime(780 + rand() * 220, now + 0.02);
      shard.frequency.exponentialRampToValueAtTime(
        320 + rand() * 60,
        now + 0.18,
      );
      const shardGain = ctx.createGain();
      shardGain.gain.setValueAtTime(0.06 * rarityGain, now + 0.02);
      shardGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      shard.connect(shardGain);
      shardGain.connect(master);
      shard.start(now + 0.02);
      shard.stop(now + 0.27);
    },
    [createSeededRandom, getAudioContext, getRarityGain, soundEnabled],
  );

  /**
   * Play bloom/reward sound effect (ethereal pad + shimmer + air)
   */
  const playBloomSound = useCallback(
    (params: { seed?: number; rarity?: Rarity | null }) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const seed =
        params.seed ?? Math.floor((performance.now() % 1e6) * 1000 + 17);
      const rand = createSeededRandom(seed ^ 0x85ebca6b);
      const rarityGain = getRarityGain(params.rarity);
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.gain.exponentialRampToValueAtTime(0.55 * rarityGain, now + 0.04);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      master.connect(ctx.destination);

      const pad = ctx.createOscillator();
      pad.type = "sawtooth";
      pad.frequency.setValueAtTime(260 + rand() * 40, now);
      pad.frequency.exponentialRampToValueAtTime(140 + rand() * 30, now + 0.5);
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.12 * rarityGain, now);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
      pad.connect(padGain);
      padGain.connect(master);
      pad.start(now);
      pad.stop(now + 0.54);

      const shimmer = ctx.createOscillator();
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(880 + rand() * 120, now + 0.08);
      shimmer.frequency.exponentialRampToValueAtTime(
        620 + rand() * 60,
        now + 0.34,
      );
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.05 * rarityGain, now + 0.08);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start(now + 0.08);
      shimmer.stop(now + 0.42);

      const airBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.25,
        ctx.sampleRate,
      );
      const airData = airBuffer.getChannelData(0);
      for (let i = 0; i < airData.length; i += 1) {
        const t = i / airData.length;
        const decay = Math.pow(1 - t, 1.4);
        airData[i] = (rand() * 2 - 1) * decay * 0.5;
      }
      const air = ctx.createBufferSource();
      air.buffer = airBuffer;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = "highpass";
      airFilter.frequency.value = 1800 + rand() * 400;
      const airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.04 * rarityGain, now + 0.02);
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      air.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(master);
      air.start(now + 0.02);
      air.stop(now + 0.5);
    },
    [createSeededRandom, getAudioContext, getRarityGain, soundEnabled],
  );

  /**
   * Play ticket reveal chirp
   */
  const playTicketSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [getAudioContext, soundEnabled]);

  /**
   * Toggle sound enabled and persist preference
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("plf:sound", next ? "on" : "off");
      } catch (error) {
        console.error("Failed to store sound preference:", error);
      }
      return next;
    });
  }, []);

  /**
   * Start the 10-stage animation sequence with synchronized audio cues
   * Timeline: dormant (0ms) → stress → crawl-1 → crawl-2 → fissure (crack sound) →
   * swell → shake → pause → bloom (bloom sound) → ticket (seed reveal + ticket sound) → cleanup (3800ms)
   *
   * All durations scale by rarity: COMMON = 1x, RARE = 1.2x, EPIC = 1.15x, LEGENDARY = 1.6x
   */
  const startSeedCrackSequence = useCallback(
    (result: LogoResult, onComplete: () => void) => {
      clearSeedCrackSequence();
      setSeedCrackStage("dormant");
      setSeedCrackRarity(result.rarity);
      setSeedCrackValue("—");

      // Generate unique variance for this animation
      const rarityMultiplier =
        result.rarity === "LEGENDARY"
          ? 1.6
          : result.rarity === "EPIC"
            ? 1.35
            : result.rarity === "RARE"
              ? 1.2
              : 1;
      setSeedCrackVariance({
        shakeAmp: 2 * (1 + (Math.random() * 0.2 - 0.1)) * rarityMultiplier,
        crackOffset: Math.random() * 2 - 1,
        glowHue: Math.random() * 10 - 5,
        bloomAngle:
          28 +
          (Math.random() * 6 - 3) +
          (result.rarity === "LEGENDARY" ? 4 : 0),
      });

      if (seedCrackTimerRef.current) {
        window.clearInterval(seedCrackTimerRef.current);
        seedCrackTimerRef.current = null;
      }

      // Calculate pacing multiplier based on rarity
      const pacingMultiplier =
        (result.rarity === "LEGENDARY"
          ? 1.35
          : result.rarity === "EPIC"
            ? 1.15
            : 1) * 1.15;

      // Helper to schedule stage transitions
      const scheduleStage = (delay: number, stage: SeedCrackStage) => {
        seedCrackTimeoutsRef.current.push(
          window.setTimeout(
            () => setSeedCrackStage(stage),
            delay * pacingMultiplier,
          ),
        );
      };

      // Schedule all animation stages
      scheduleStage(250, "stress");
      scheduleStage(550, "crawl-1");
      scheduleStage(900, "crawl-2");
      scheduleStage(1250, "fissure");
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playCrackSound({ seed: result.seed, rarity: result.rarity });
        }, 1250 * pacingMultiplier),
      );
      scheduleStage(1550, "swell");
      scheduleStage(1800, "shake");
      scheduleStage(1900, "pause");
      scheduleStage(1980, "bloom");
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playBloomSound({ seed: result.seed, rarity: result.rarity });
        }, 1980 * pacingMultiplier),
      );

      // Ticket (seed reveal)
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          setSeedCrackStage("ticket");
          setSeedCrackValue(String(result.seed));
        }, 2400 * pacingMultiplier),
      );
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          playTicketSound();
        }, 2400 * pacingMultiplier),
      );

      // Final cleanup
      seedCrackTimeoutsRef.current.push(
        window.setTimeout(() => {
          setSeedCrackStage(null);
          setSeedCrackValue(null);
          setSeedCrackRarity(null);
          setSeedCrackVariance(null);
          onComplete();
        }, 3800 * pacingMultiplier),
      );
    },
    [clearSeedCrackSequence, playBloomSound, playCrackSound, playTicketSound],
  );

  return {
    seedCrackStage,
    seedCrackValue,
    seedCrackRarity,
    seedCrackVariance,
    soundEnabled,
    setSoundEnabled,
    startSeedCrackSequence,
    toggleSound,
    clearSeedCrackSequence,
    playCrackSound,
    playBloomSound,
    playTicketSound,
  };
}
