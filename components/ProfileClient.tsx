'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';

type LeaderboardEntry = {
  id: string;
  text: string;
  seed: number;
  imageUrl: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  recasts?: number;
  createdAt: string;
  castUrl?: string | null;
  rarity?: string | null;
  presetKey?: string | null;
};

type UserProfile = {
  username: string;
  best: LeaderboardEntry | null;
  latest?: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
};

const buildWarpcastComposeUrl = (text: string, embeds?: string[]) => {
  const params = new URLSearchParams();
  params.set('text', text);
  (embeds ?? []).slice(0, 2).forEach((embed) => params.append('embeds[]', embed));
  return `https://warpcast.com/~/compose?${params.toString()}`;
};

const PRESETS = [
  { key: 'arcade', label: 'Arcade' },
  { key: 'vaporwave', label: 'Vaporwave' },
  { key: 'gameboy', label: 'Game Boy' },
] as const;

const RARITIES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const;

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getProfileTitle = (casts: number, legendaryCount: number) => {
  if (legendaryCount >= 3) return 'Legend Hunter';
  if (casts >= 20) return 'Master Crafter';
  return 'Pixel Forger';
};

export default function ProfileClient({ profile }: { profile: UserProfile }) {
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [presetFilter, setPresetFilter] = useState<string>('all');
  const [recentOnly, setRecentOnly] = useState(false);

  const presetLabelMap = useMemo(() => {
    return PRESETS.reduce<Record<string, string>>((acc, preset) => {
      acc[preset.key] = preset.label;
      return acc;
    }, {});
  }, []);

  const stats = useMemo(() => {
    const totalCasts = profile.entries.length;
    const totalLikes = profile.entries.reduce((sum, entry) => sum + entry.likes, 0);
    const legendaryCount = profile.entries.filter(
      (entry) => String(entry.rarity).toUpperCase() === 'LEGENDARY'
    ).length;
    const bestRarity = profile.best?.rarity ? String(profile.best.rarity).toUpperCase() : 'Unknown';
    const presetCounts = profile.entries.reduce<Record<string, number>>((acc, entry) => {
      const key = entry.presetKey ?? 'Unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topPresetKey =
      Object.entries(presetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown';
    return {
      totalCasts,
      totalLikes,
      legendaryCount,
      bestRarity,
      topPreset: presetLabelMap[topPresetKey] ?? topPresetKey,
    };
  }, [presetLabelMap, profile.best?.rarity, profile.entries]);

  const latestEntry = useMemo(() => {
    return (
      profile.latest ??
      profile.entries.reduce<LeaderboardEntry | null>((latest, entry) => {
        if (!latest) return entry;
        return new Date(entry.createdAt).getTime() > new Date(latest.createdAt).getTime() ? entry : latest;
      }, null)
    );
  }, [profile.entries, profile.latest]);

  const topEntries = useMemo(() => {
    return [...profile.entries]
      .sort((a, b) => {
        const aScore = a.likes + (a.recasts ?? 0) * 2;
        const bScore = b.likes + (b.recasts ?? 0) * 2;
        if (aScore !== bScore) return bScore - aScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  }, [profile.entries]);

  const filteredEntries = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return profile.entries.filter((entry) => {
      const rarityValue = entry.rarity ? String(entry.rarity).toUpperCase() : 'UNKNOWN';
      const presetValue = entry.presetKey ?? 'Unknown';
      if (rarityFilter !== 'all') {
        if (rarityFilter === 'Unknown' && rarityValue !== 'UNKNOWN') return false;
        if (rarityFilter !== 'Unknown' && rarityValue !== rarityFilter) return false;
      }
      if (presetFilter !== 'all') {
        if (presetFilter === 'Unknown' && presetValue !== 'Unknown') return false;
        if (presetFilter !== 'Unknown' && presetValue !== presetFilter) return false;
      }
      if (recentOnly) {
        return new Date(entry.createdAt).getTime() >= cutoff;
      }
      return true;
    });
  }, [presetFilter, profile.entries, rarityFilter, recentOnly]);

  const handleCastBest = () => {
    if (!profile.best) return;
    const text = `My best pixel logo: "${profile.best.text}"`;
    const url = buildWarpcastComposeUrl(text, profile.best.imageUrl ? [profile.best.imageUrl] : undefined);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareCollection = async () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(profile.username)}`;
    const embeds = topEntries
      .map((entry) => entry.imageUrl)
      .filter((url) => url && (url.startsWith('http://') || url.startsWith('https://')));
    const text = `My Pixel Logo Forge collection (top 3)\n${profileUrl}`;
    try {
      const embedsForSdk = embeds.slice(0, 2) as string[];
      await sdk.actions.composeCast({
        text,
        embeds:
          embedsForSdk.length === 2
            ? ([embedsForSdk[0], embedsForSdk[1]] as [string, string])
            : embedsForSdk.length === 1
            ? ([embedsForSdk[0]] as [string])
            : undefined,
      });
      return;
    } catch (error) {
      console.error('Share collection via SDK failed:', error);
    }
    const composeUrl = buildWarpcastComposeUrl(text, embeds);
    const opened = window.open(composeUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = composeUrl;
    }
  };

  const handleCopyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(profile.username)}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch (error) {
      console.error('Failed to copy profile link:', error);
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link href="/" className="profile-back">
          &larr; Back
        </Link>
        <div className="profile-title">@{profile.username}</div>
        <div className="profile-title-badge">
          {getProfileTitle(stats.totalCasts, stats.legendaryCount)}
        </div>
      </div>
      <div className="profile-actions">
        <button type="button" className="profile-share-button" onClick={handleShareCollection}>
          Share collection
        </button>
        <button type="button" className="profile-share-link" onClick={handleCopyProfileLink}>
          Copy profile link
        </button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span>Total casts</span>
          <strong>{stats.totalCasts}</strong>
        </div>
        <div className="profile-stat">
          <span>Total likes</span>
          <strong>{stats.totalLikes}</strong>
        </div>
        <div className="profile-stat">
          <span>Best rarity</span>
          <strong>{stats.bestRarity}</strong>
        </div>
        <div className="profile-stat">
          <span>Top preset</span>
          <strong>{stats.topPreset}</strong>
        </div>
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Latest cast</div>
        {latestEntry ? (
          <div className="profile-latest-card">
            {latestEntry.imageUrl ? (
              <Image
                src={latestEntry.imageUrl}
                alt={`Latest logo by ${latestEntry.username}`}
                className="profile-latest-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{latestEntry.text}</div>
            )}
            <div className="profile-latest-meta">
              <span>{formatDate(latestEntry.createdAt)}</span>
              <span>❤️ {latestEntry.likes}</span>
            </div>
          </div>
        ) : (
          <div className="leaderboard-status">Cast your first logo to populate this.</div>
        )}
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Personal best</div>
        {profile.best ? (
          <div className="profile-best-card">
            {profile.best.imageUrl ? (
              <Image
                src={profile.best.imageUrl}
                alt={`Best logo by ${profile.best.username}`}
                className="profile-best-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{profile.best.text}</div>
            )}
            <div className="profile-best-meta">
              <span>❤️ {profile.best.likes}</span>
              <span>🔁 {profile.best.recasts ?? 0}</span>
            </div>
            <button type="button" className="profile-cast-button" onClick={handleCastBest}>
              Cast this
            </button>
          </div>
        ) : (
          <div className="leaderboard-status">Cast your first logo to populate this.</div>
        )}
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Filters</div>
        <div className="profile-filters">
          <div className="profile-filter-row">
            <span>Rarity</span>
            <div className="profile-filter-chips">
              {['all', ...RARITIES, 'Unknown'].map((option) => (
                <button
                  key={`rarity-${option}`}
                  type="button"
                  className={`profile-chip${rarityFilter === option ? ' active' : ''}`}
                  onClick={() => setRarityFilter(option)}
                  aria-pressed={rarityFilter === option}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
          </div>
          <div className="profile-filter-row">
            <span>Preset</span>
            <div className="profile-filter-chips">
              {['all', ...PRESETS.map((preset) => preset.key), 'Unknown'].map((option) => (
                <button
                  key={`preset-${option}`}
                  type="button"
                  className={`profile-chip${presetFilter === option ? ' active' : ''}`}
                  onClick={() => setPresetFilter(option)}
                  aria-pressed={presetFilter === option}
                >
                  {option === 'all' ? 'All' : presetLabelMap[option] ?? option}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={`profile-chip${recentOnly ? ' active' : ''}`}
            onClick={() => setRecentOnly((prev) => !prev)}
            aria-pressed={recentOnly}
          >
            Last 7 days
          </button>
        </div>
      </div>

      <div className="profile-section">
        <div className="leaderboard-title">Recent logos</div>
        {filteredEntries.length === 0 ? (
          <div className="leaderboard-status">No casts match those filters yet.</div>
        ) : (
          <div className="profile-gallery-grid">
            {filteredEntries.map((entry) => (
              <div key={`profile-${entry.id}`} className="profile-gallery-card">
                {entry.imageUrl ? (
                  <Image
                    src={entry.imageUrl}
                    alt={`Logo by ${entry.username}`}
                    className="profile-gallery-image"
                    width={200}
                    height={140}
                    unoptimized
                  />
                ) : (
                  <div className="profile-gallery-text">{entry.text}</div>
                )}
                <div className="profile-gallery-meta">
                  <span>{formatDate(entry.createdAt)}</span>
                  <span>{entry.rarity ? String(entry.rarity).toUpperCase() : 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Home"
          data-label="Home"
        >
          <span className="bottom-nav-icon" aria-hidden="true">🏠</span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Gallery"
          data-label="Gallery"
        >
          <span className="bottom-nav-icon" aria-hidden="true">🖼️</span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Leaderboard"
          data-label="Leaderboard"
        >
          <span className="bottom-nav-icon" aria-hidden="true">🏆</span>
        </Link>
        <Link
          href="/"
          className="bottom-nav-button"
          aria-label="Challenge"
          data-label="Challenge"
        >
          <span className="bottom-nav-icon" aria-hidden="true">🎯</span>
        </Link>
        <Link
          href={`/profile/${encodeURIComponent(profile.username)}`}
          className="bottom-nav-button active"
          aria-label="Profile"
          data-label="Profile"
        >
          <span className="bottom-nav-icon" aria-hidden="true">👤</span>
        </Link>
      </nav>
    </div>
  );
}
