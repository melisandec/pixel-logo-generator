"use client";

import { useState, useEffect } from "react";
import ProfileClient from "./ProfileClient";

const TRIES_PER_DAY = 3;
const BONUS_TRIES_FOR_MASTER = 1;

type ServerProfile = {
  username: string;
  entries: any[];
  badges: any[];
  rarities: string[];
  masterUnlocked: boolean;
  extraDailyGenerates: number;
  specialFrameUnlocked: boolean;
  specialBackgroundUnlocked: boolean;
};

const TEST_USERS = ["userA", "userB", "userC"];

export default function DevFarcasterTest() {
  const [selected, setSelected] = useState<string>(TEST_USERS[0]);
  const [profile, setProfile] = useState<ServerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchState = async (username: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dev/farcaster-test?username=${encodeURIComponent(username)}`,
      );
      const json = await res.json();
      setProfile(json);
    } catch (err) {
      console.error("fetchState error", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState(selected);
  }, [selected]);

  const grantRarity = async (
    rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY",
  ) => {
    if (!selected) return;
    setLoading(true);
    try {
      await fetch("/api/dev/farcaster-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selected, rarity }),
      });
      await fetchState(selected);
    } catch (err) {
      console.error("grant error", err);
    } finally {
      setLoading(false);
    }
  };

  const resetProgress = async (username: string) => {
    setLoading(true);
    try {
      await fetch("/api/dev/farcaster-test", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      await fetchState(username);
    } catch (err) {
      console.error("reset error", err);
    } finally {
      setLoading(false);
    }
  };

  const effectiveTries = (profile?.extraDailyGenerates ?? 0) + TRIES_PER_DAY;

  return (
    <div style={{ padding: 20 }}>
      <h2>Farcaster Dev Test</h2>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="user">User: </label>
        <select
          id="user"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {TEST_USERS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: 12 }}>
          {loading ? "Loading..." : `Effective daily tries: ${effectiveTries}`}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => grantRarity("COMMON")}>Grant Common</button>
        <button style={{ marginLeft: 8 }} onClick={() => grantRarity("RARE")}>
          Grant Rare
        </button>
        <button style={{ marginLeft: 8 }} onClick={() => grantRarity("EPIC")}>
          Grant Epic
        </button>
        <button
          style={{ marginLeft: 8 }}
          onClick={() => grantRarity("LEGENDARY")}
        >
          Grant Legendary
        </button>
        <button
          style={{ marginLeft: 8 }}
          onClick={() => resetProgress(selected)}
        >
          Reset Progress
        </button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Profile Viewer</h3>
          {profile ? (
            <ProfileClient
              profile={{
                username: profile.username,
                best: profile.entries[0] ?? null,
                latest: profile.entries[0] ?? null,
                entries: profile.entries,
              }}
              badges={profile.badges}
              devRewards={{
                specialFrameUnlocked: profile.specialFrameUnlocked,
                specialBackgroundUnlocked: profile.specialBackgroundUnlocked,
              }}
            />
          ) : (
            <div>No profile loaded</div>
          )}
        </div>
        <div style={{ width: 320 }}>
          <h3>Status</h3>
          <div>
            Current Rarities:{" "}
            {profile ? profile.rarities.join(", ") || "None" : "-"}
          </div>
          <div>
            Master Unlocked: {profile ? String(profile.masterUnlocked) : "-"}
          </div>
          <div>
            Extra Daily Generates:{" "}
            {profile ? `+${profile.extraDailyGenerates}` : "-"}
          </div>
          <div>
            Special Frame:{" "}
            {profile
              ? profile.specialFrameUnlocked
                ? "unlocked"
                : "locked"
              : "-"}
          </div>
          <div>
            Special Background:{" "}
            {profile
              ? profile.specialBackgroundUnlocked
                ? "unlocked"
                : "locked"
              : "-"}
          </div>
          <h4 style={{ marginTop: 12 }}>Raw</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
