"use client";

import NextImage from "next/image";
import Link from "next/link";
import { getImageForContext } from "@/lib/imageContext";

type ExtendedLeaderboardEntry = {
  id: string;
  username: string;
  displayName: string;
  likes: number;
  recasts?: number;
  rarity?: string | null;
  presetKey?: string | null;
  text: string;
  castUrl?: string | null;
  pfpUrl?: string | null;
  logoImageUrl?: string | null | undefined;
  cardImageUrl?: string | null | undefined;
  thumbImageUrl?: string | null | undefined;
  mediumImageUrl?: string | null | undefined;
  imageUrl?: string | null | undefined;
  createdAt: number | string | Date;
  seed: number;
};

interface LogoGeneratorLeaderboardProps {
  entries: ExtendedLeaderboardEntry[];
  isLoading?: boolean;
  dailyWinners: Array<{
    rank: number;
    username: string;
    displayName: string;
    entry: ExtendedLeaderboardEntry;
  }>;

  sortBy: "score" | "recent" | "likes";
  onSortChange: (sort: "score" | "recent" | "likes") => void;

  page: number;
  onPageChange: (page: number) => void;

  onLike: (entryId: string) => Promise<void>;
  likedEntryIds: Set<string>;
  onShare: (entry: ExtendedLeaderboardEntry) => Promise<void>;

  leaderboardDate: string;
  pageSize: number;
}

export default function LogoGeneratorLeaderboard(
  props: LogoGeneratorLeaderboardProps,
) {
  const {
    entries,
    dailyWinners,
    sortBy,
    onSortChange,
    page,
    onPageChange,
    onLike,
    likedEntryIds,
    onShare,
    leaderboardDate,
    pageSize,
  } = props;

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const pagedEntries = entries.slice((page - 1) * pageSize, page * pageSize);

  const formatHistoryTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-title">🏆 Hall of Fame</div>
      {dailyWinners.length > 0 && (
        <div className="daily-winners-section">
          <div className="leaderboard-title">🏆 Today&apos;s Winners</div>
          <div className="daily-winners-grid">
            {dailyWinners.map((winner) => {
              const leaderboardImageUrl = getImageForContext(
                {
                  logoImageUrl: winner.entry.logoImageUrl ?? undefined,
                  cardImageUrl: winner.entry.cardImageUrl ?? undefined,
                  thumbImageUrl: winner.entry.thumbImageUrl ?? undefined,
                  mediumImageUrl: winner.entry.mediumImageUrl ?? undefined,
                  imageUrl: winner.entry.imageUrl ?? undefined,
                },
                "leaderboard",
              );
              return (
                <div
                  key={`winner-${winner.rank}`}
                  className={`daily-winner-card rank-${winner.rank}`}
                >
                  <div className="daily-winner-rank">#{winner.rank}</div>
                  {leaderboardImageUrl ? (
                    <NextImage
                      src={leaderboardImageUrl}
                      alt={`Winner ${winner.rank} by ${winner.username}`}
                      className="daily-winner-image"
                      width={200}
                      height={120}
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="daily-winner-text">{winner.entry.text}</div>
                  )}
                  <div className="daily-winner-info">
                    <div className="daily-winner-username">
                      @{winner.username}
                    </div>
                    <div className="daily-winner-stats">
                      ❤️ {winner.entry.likes} 🔁 {winner.entry.recasts ?? 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="leaderboard-meta">
        <span>{leaderboardDate}</span>
        <span>{entries.length} entries</span>
      </div>
      <div className="leaderboard-narrative">🔥 Hot Today</div>
      <div className="leaderboard-filters">
        <button
          type="button"
          className={`leaderboard-filter-button${sortBy === "score" ? " active" : ""}`}
          onClick={() => {
            onSortChange("score");
            onPageChange(1);
          }}
          aria-pressed={sortBy === "score"}
        >
          Trending
        </button>
        <button
          type="button"
          className={`leaderboard-filter-button${sortBy === "recent" ? " active" : ""}`}
          onClick={() => {
            onSortChange("recent");
            onPageChange(1);
          }}
          aria-pressed={sortBy === "recent"}
        >
          Recent
        </button>
        <button
          type="button"
          className={`leaderboard-filter-button${sortBy === "likes" ? " active" : ""}`}
          onClick={() => {
            onSortChange("likes");
            onPageChange(1);
          }}
          aria-pressed={sortBy === "likes"}
        >
          Most liked
        </button>
      </div>
      {entries.length === 0 && (
        <div className="leaderboard-status">
          No casts yet today. Be the first!
        </div>
      )}
      {entries.length > 0 && (
        <div className="leaderboard-grid">
          {pagedEntries.map((entry, index) => {
            const castUrl =
              entry.castUrl ??
              (entry.id && /^0x[a-fA-F0-9]{64}$/.test(entry.id)
                ? `https://warpcast.com/~/cast/${entry.id}`
                : undefined);
            const isCastLink = !!castUrl;
            const rank = (page - 1) * pageSize + index + 1;
            const rarityValue = entry.rarity
              ? String(entry.rarity).toUpperCase()
              : "Unknown";
            const presetValue = entry.presetKey ?? "Unknown";
            const CardContent = (
              <>
                <div className={`leaderboard-rank${rank <= 3 ? " top" : ""}`}>
                  #{rank}
                </div>
                <div className="leaderboard-card-header">
                  {entry.pfpUrl ? (
                    <NextImage
                      src={entry.pfpUrl}
                      alt={entry.username}
                      className="leaderboard-avatar"
                      width={28}
                      height={28}
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="leaderboard-avatar placeholder" />
                  )}
                  <Link
                    href={`/profile/${encodeURIComponent(entry.username)}`}
                    className="leaderboard-user"
                    aria-label={`View profile for ${entry.username}`}
                  >
                    <div className="leaderboard-name">{entry.displayName}</div>
                    <div className="leaderboard-username">
                      @{entry.username}
                    </div>
                  </Link>
                </div>
                {(() => {
                  const leaderboardImageUrl = getImageForContext(
                    {
                      logoImageUrl: entry.logoImageUrl ?? undefined,
                      cardImageUrl: entry.cardImageUrl ?? undefined,
                      thumbImageUrl: entry.thumbImageUrl ?? undefined,
                      mediumImageUrl: entry.mediumImageUrl ?? undefined,
                      imageUrl: entry.imageUrl ?? undefined,
                    },
                    "leaderboard",
                  );
                  return leaderboardImageUrl ? (
                    <NextImage
                      src={leaderboardImageUrl}
                      alt="Cast media"
                      className="leaderboard-image"
                      width={400}
                      height={120}
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="leaderboard-text">
                      {entry.text || "View cast"}
                    </div>
                  );
                })()}
                <div className="leaderboard-tags">
                  <span className="leaderboard-chip">{rarityValue}</span>
                  <span className="leaderboard-chip">{presetValue}</span>
                </div>
                <div className="leaderboard-metrics">
                  <div className="leaderboard-metrics-values">
                    <span>❤️ {entry.likes}</span>
                    <span>🔁 {entry.recasts ?? 0}</span>
                  </div>
                  <div className="leaderboard-metrics-actions">
                    <button
                      type="button"
                      className="leaderboard-like"
                      onClick={(event) => {
                        event.preventDefault();
                        onLike(entry.id);
                      }}
                      aria-label={`Like cast by ${entry.username}`}
                    >
                      {likedEntryIds.has(entry.id) ? "💔 Unlike" : "❤️ Like"}
                    </button>
                    <button
                      type="button"
                      className="leaderboard-share"
                      onClick={(event) => {
                        event.preventDefault();
                        onShare(entry);
                      }}
                      aria-label={`Share cast by ${entry.username}`}
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>
              </>
            );

            return isCastLink ? (
              <a
                key={entry.id}
                className="leaderboard-card"
                href={castUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open cast by ${entry.username}`}
              >
                {CardContent}
              </a>
            ) : (
              <div
                key={entry.id}
                className="leaderboard-card"
                aria-label={`Local entry by ${entry.username}`}
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      )}
      {entries.length > 0 && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="pagination-status">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {entries.length > 0 && (
        <div className="recent-casts">
          <div className="leaderboard-title">⚡ Rising</div>
          <div className="recent-casts-list">
            {[...entries]
              .sort((a, b) => {
                const bCreated =
                  typeof b.createdAt === "string"
                    ? new Date(b.createdAt).getTime()
                    : b.createdAt instanceof Date
                      ? b.createdAt.getTime()
                      : b.createdAt;
                const aCreated =
                  typeof a.createdAt === "string"
                    ? new Date(a.createdAt).getTime()
                    : a.createdAt instanceof Date
                      ? a.createdAt.getTime()
                      : a.createdAt;
                return (bCreated as number) - (aCreated as number);
              })
              .slice(0, 5)
              .map((entry) => (
                <div key={`recent-${entry.id}`} className="recent-cast">
                  {(() => {
                    const castUrl =
                      entry.castUrl ??
                      (entry.id && /^0x[a-fA-F0-9]{64}$/.test(entry.id)
                        ? `https://warpcast.com/~/cast/${entry.id}`
                        : undefined);
                    return (
                      <>
                        <span>
                          {formatHistoryTime(
                            typeof entry.createdAt === "string"
                              ? new Date(entry.createdAt).getTime()
                              : entry.createdAt instanceof Date
                                ? entry.createdAt.getTime()
                                : entry.createdAt,
                          )}
                        </span>
                        <span>@{entry.username}</span>
                        {castUrl ? (
                          <a href={castUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        ) : (
                          <span>Local</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
