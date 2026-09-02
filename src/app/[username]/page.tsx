import { notFound } from 'next/navigation';
import { getProfileByUsername, getActiveLinks } from '@/lib/db/queries';
import type { Metadata } from 'next';
import ProfilePublic from './profile-public';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: 'Not Found' };
  return {
    title: `${profile.display_name || profile.username} | Pohonlink`,
    description: profile.bio || `Profil biolink @${profile.username}`,
    openGraph: {
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const links = await getActiveLinks(profile.id);

  return <ProfilePublic profile={profile} links={links} />;
}
