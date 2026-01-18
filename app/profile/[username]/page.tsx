import Link from 'next/link';
import { headers } from 'next/headers';
import Image from 'next/image';

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
};

type UserProfile = {
  username: string;
  best: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
};

const getBaseUrl = () => {
  const host = headers().get('host');
  if (!host) return 'https://pixel-logo-generator.vercel.app';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent(params.username)}`, {
    cache: 'no-store',
  });
  const data = (await response.json()) as UserProfile;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link href="/" className="profile-back">
          ← Back
        </Link>
        <div className="profile-title">@{data.username}</div>
      </div>
      <div className="profile-section">
        <div className="leaderboard-title">Personal best</div>
        {data.best ? (
          <div className="profile-best-card">
            {data.best.imageUrl ? (
              <Image
                src={data.best.imageUrl}
                alt={`Best logo by ${data.best.username}`}
                className="profile-best-image"
                width={360}
                height={240}
                unoptimized
              />
            ) : (
              <div className="profile-best-text">{data.best.text}</div>
            )}
            <div className="profile-best-meta">
              <span>❤️ {data.best.likes}</span>
              <span>🔁 {data.best.recasts ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="leaderboard-status">No casts yet.</div>
        )}
      </div>
      <div className="profile-section">
        <div className="leaderboard-title">Recent logos</div>
        <div className="profile-gallery-grid">
          {data.entries.map((entry) => (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
