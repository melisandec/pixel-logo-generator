/**
 * Client-side utility for requesting and consuming demo seeds
 * Only used when IS_DEMO_MODE is true
 */

export interface DemoSeedError {
  error: string;
  isExhausted: boolean;
}

/**
 * Get and consume the next available demo seed atomically.
 * Uses database transaction with row-level locking on the server.
 *
 * Returns:
 * - seed string on success
 * - null if pool is exhausted
 * - throws error on network/server failure
 */
export async function requestAndConsumeDemoSeed(
  userId?: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/demo/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = (await response.json()) as { seed?: string; error?: string };

    if (!response.ok) {
      // Check if it's an exhaustion error (429 status)
      if (response.status === 429) {
        console.warn("Demo seed pool exhausted:", data.error);
        return null;
      }

      console.error("Failed to get and consume demo seed:", data.error);
      throw new Error(data.error || "Failed to consume demo seed");
    }

    return data.seed ?? null;
  } catch (error) {
    console.error("Error requesting and consuming demo seed:", error);
    throw error;
  }
}

/**
 * Legacy: Request the next available demo seed without consuming (preview only)
 */
export async function requestDemoSeed(): Promise<string | null> {
  try {
    const response = await fetch("/api/demo/seed", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to get demo seed:", response.statusText);
      return null;
    }

    const data = (await response.json()) as { seed?: string; error?: string };
    return data.seed ?? null;
  } catch (error) {
    console.error("Error requesting demo seed:", error);
    return null;
  }
}

/**
 * Legacy: Consume (mark as used) a demo seed with optional user tracking.
 * Use requestAndConsumeDemoSeed() instead for atomic transactional safety.
 */
export async function consumeDemoSeed(
  seed: string,
  userId?: string,
): Promise<boolean> {
  try {
    const response = await fetch("/api/demo/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seed, userId }),
    });

    if (!response.ok) {
      console.error("Failed to consume demo seed:", response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error consuming demo seed:", error);
    return false;
  }
}

/**
 * Get current demo seed pool statistics
 */
export async function getDemoSeedPoolStats(): Promise<{
  total: number;
  used: number;
  available: number;
  percentageUsed: number;
} | null> {
  try {
    const response = await fetch("/api/demo/seed/stats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to get demo seed stats:", response.statusText);
      return null;
    }

    return (await response.json()) as {
      total: number;
      used: number;
      available: number;
      percentageUsed: number;
    };
  } catch (error) {
    console.error("Error fetching demo seed stats:", error);
    return null;
  }
}
