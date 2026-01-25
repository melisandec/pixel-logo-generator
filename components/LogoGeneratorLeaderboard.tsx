'use client';

import { LeaderboardEntry } from '@/hooks/useLogoGenerator';

interface LogoGeneratorLeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  
  sortBy: 'score' | 'recent' | 'likes';
  onSortChange: (sort: 'score' | 'recent' | 'likes') => void;
  
  page: number;
  onPageChange: (page: number) => void;
  
  onLike: (entryId: string) => Promise<void>;
  onRemix: (entry: LeaderboardEntry) => void;
}

export default function LogoGeneratorLeaderboard(
  props: LogoGeneratorLeaderboardProps,
) {
  const { entries, isLoading, sortBy, onSortChange, page, onPageChange } =
    props;

  return (
    <div className="logo-generator-leaderboard">
      <h2>Leaderboard Tab</h2>
      {/* TODO: Implement leaderboard UI */}
      {/* - Sort selector (score/recent/likes) */}
      {/* - Top entries list */}
      {/* - Rankings with medals */}
      {/* - Like/interaction buttons */}
      {/* - Pagination */}
    </div>
  );
}
