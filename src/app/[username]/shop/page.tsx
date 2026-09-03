import { notFound } from 'next/navigation';
import { getProfileByUsername, getActiveLinks, getActiveProducts } from '@/lib/db/queries';
import type { Metadata } from 'next';
import ProfilePublic from '../profile-public';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: 'Not Found' };
  const shopName = profile.settings?.shop_title || 'Toko';
  return {
    title: `${shopName} | @${profile.username} - Pohonlink`,
    description: `Katalog produk dan toko online @${profile.username}`,
    openGraph: {
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function UserShopPage({ params }: Props) {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);
  const profile = await getProfileByUsername(username);
  if (!profile || profile.settings?.enable_shop === false) notFound();

  const [links, products] = await Promise.all([
    getActiveLinks(profile.id),
    getActiveProducts(profile.id),
  ]);

  return <ProfilePublic profile={profile} links={links} products={products} initialTab="shop" />;
}
