import { NextResponse } from 'next/server';

const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster/cast/search/';
const HASHTAG = '#PixelLogoForge';
const DEFAULT_LIMIT = 10;
const FETCH_LIMIT = 50;
const MAX_PAGES = 4;

type NeynarCast = {
  hash: string;
  text?: string;
  timestamp?: string;
  created_at?: string;
  author?: {
    username?: string;
    display_name?: string;
    pfp_url?: string;
  };
  reactions?: {
    likes_count?: number;
  };
  recasts?: {
    recasts_count?: number;
  };
  embeds?: Array<{ url?: string; metadata?: { content_type?: string } }>;
};

type LeaderboardEntry = {
  hash: string;
  text: string;
  timestamp: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  likes: number;
  recasts: number;
  score: number;
  imageUrl: string | null;
};

const isImageUrl = (url: string) =>
  /\.(png|jpe?g|webp|gif)$/i.test(url);

const extractTimestamp = (cast: NeynarCast) => {
  const raw = cast.timestamp ?? cast.created_at ?? '';
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const getDayBoundsUtc = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const buildEntry = (cast: NeynarCast): LeaderboardEntry | null => {
  if (!cast.hash) return null;
  const timestamp = cast.timestamp ?? cast.created_at ?? '';
  const likes = cast.reactions?.likes_count ?? 0;
  const recasts = cast.recasts?.recasts_count ?? 0;
  const score = likes + recasts;
  const author = cast.author ?? {};
  const embedUrl =
    cast.embeds?.find((embed) => embed.url && isImageUrl(embed.url))?.url ??
    cast.embeds?.find((embed) => embed.metadata?.content_type?.startsWith('image'))?.url ??
    null;

  return {
    hash: cast.hash,
    text: cast.text ?? '',
    timestamp,
    username: author.username ?? 'unknown',
    displayName: author.display_name ?? author.username ?? 'unknown',
    pfpUrl: author.pfp_url ?? '',
    likes,
    recasts,
    score,
    imageUrl: embedUrl,
  };
};

async function fetchPage(cursor?: string) {
  const query = new URLSearchParams({
    q: HASHTAG,
    limit: FETCH_LIMIT.toString(),
    sortType: 'desc_chron',
  });
  if (cursor) query.set('cursor', cursor);

  const response = await fetch(`${NEYNAR_API_BASE}?${query.toString()}`, {
    headers: {
      'x-api-key': process.env.NEYNAR_API_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error(`Neynar API failed: ${response.status}`);
  }

  return response.json() as Promise<{ casts?: NeynarCast[]; cursor?: string }>;
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEYNAR_API_KEY) {
      return NextResponse.json({ error: 'Missing NEYNAR_API_KEY' }, { status: 500 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 25) : DEFAULT_LIMIT;

    const { start, end } = getDayBoundsUtc();
    const entries: LeaderboardEntry[] = [];
    let cursor: string | undefined = undefined;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const data = await fetchPage(cursor);
      const casts = data.casts ?? [];
      for (const cast of casts) {
        const createdAt = extractTimestamp(cast);
        if (!createdAt) continue;
        if (createdAt < start || createdAt >= end) continue;
        const entry = buildEntry(cast);
        if (entry) entries.push(entry);
      }
      cursor = data.cursor;
      if (!cursor) break;
    }

    const ranked = entries
      .sort((a, b) => b.score - a.score || b.likes - a.likes)
      .slice(0, limit);

    return NextResponse.json({ date: start.toISOString().slice(0, 10), entries: ranked });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
