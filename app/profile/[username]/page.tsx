import { headers } from 'next/headers';
import ProfileClient from '@/components/ProfileClient';

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
  rarity?: string | null;
  presetKey?: string | null;
  createdAt: string;
  castUrl?: string | null;
};

type UserProfile = {
  username: string;
  best: LeaderboardEntry | null;
  latest?: LeaderboardEntry | null;
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

  return <ProfileClient profile={data} />;
}
