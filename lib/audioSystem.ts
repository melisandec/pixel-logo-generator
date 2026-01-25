/**
 * Centralized audio and sound effect management
 * Handles: seed crack sounds, pop sounds, UI feedback sounds
 */

let audioContext: AudioContext | null = null;

const initAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a crack/fracture sound effect using Web Audio API
 */
export const playCrackSound = (duration: number = 500): void => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    // Create oscillator for crack sound (descending frequency)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Start high, descend quickly
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, endTime);

    // Fade out
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    osc.start(now);
    osc.stop(endTime);
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
};

/**
 * Play a bloom/pop sound effect
 */
export const playBloomSound = (duration: number = 300): void => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    // Create two oscillators for a pop sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    // Fundamental and harmonic
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(100, endTime);

    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.exponentialRampToValueAtTime(50, endTime);

    // Sharp attack, quick decay
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(endTime);
    osc2.stop(endTime);
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
};

/**
 * Play a ticket/chime sound (confirmation)
 */
export const playTicketSound = (duration: number = 400): void => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    // Create a higher-pitched, brighter sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Slightly ascending pitch
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, endTime);

    // Softer volume, slower decay
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    osc.start(now);
    osc.stop(endTime);
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
};

/**
 * Play a simple beep for UI interactions
 */
export const playBeepSound = (
  frequency: number = 600,
  duration: number = 100
): void => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    osc.start(now);
    osc.stop(endTime);
  } catch (error) {
    console.warn("Audio playback not available:", error);
  }
};

/**
 * Stop all audio (pause playback)
 */
export const stopAudio = (): void => {
  try {
    if (audioContext && audioContext.state === "running") {
      audioContext.suspend();
    }
  } catch (error) {
    console.warn("Could not stop audio:", error);
  }
};

/**
 * Resume audio playback
 */
export const resumeAudio = (): void => {
  try {
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch (error) {
    console.warn("Could not resume audio:", error);
  }
};

/**
 * Get audio context state
 */
export const getAudioState = (): "running" | "suspended" | "closed" | "unknown" => {
  try {
    return audioContext?.state ?? "unknown";
  } catch {
    return "unknown";
  }
};
