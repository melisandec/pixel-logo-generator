/**
 * Analytics tracking utility for Pixel Logo Forge
 */

export async function trackEvent(
  eventType: string,
  metadata?: Record<string, any>,
  userId?: string,
  username?: string,
) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        userId,
        username,
        metadata,
      }),
    });
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.error("Analytics tracking failed:", error);
  }
}

export async function saveUserPreferences(
  preferences: {
    uiMode?: string;
    onboardingDone?: boolean;
    soundEnabled?: boolean;
  },
  userId?: string,
  username?: string,
) {
  try {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        username,
        preferences,
      }),
    });
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

export async function loadUserPreferences(userId?: string, username?: string) {
  try {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (username) params.set("username", username);

    const response = await fetch(`/api/preferences?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    return data.preferences;
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return null;
  }
}
