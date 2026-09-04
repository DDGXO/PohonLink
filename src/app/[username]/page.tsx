import { notFound, redirect } from 'next/navigation';
import { getProfileByUsername, getActiveLinks, getActiveProducts } from '@/lib/db/queries';
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

  const customSeo = profile.settings?.seo_meta;
  const pageTitle = customSeo?.title?.trim() || `${profile.display_name || profile.username} | Pohonlink`;
  const pageDesc = customSeo?.description?.trim() || profile.bio || `Profil biolink @${profile.username}`;
  const ogImage = customSeo?.og_image_url?.trim() || profile.avatar_url;

  return {
    title: pageTitle,
    description: pageDesc,
    keywords: customSeo?.meta_keywords ? customSeo.meta_keywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  let { username } = await params;
  if (username.startsWith('%40')) username = username.slice(3);
  if (username.startsWith('@')) username = username.slice(1);
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  // Auto redirect / forwarding if enabled
  const autoRedirect = profile.settings?.auto_redirect;
  if (autoRedirect?.enabled && autoRedirect?.url) {
    redirect(autoRedirect.url);
  }

  const [links, products] = await Promise.all([
    getActiveLinks(profile.id, Boolean(profile.settings?.smart_sorting_enabled)),
    getActiveProducts(profile.id),
  ]);

  return <ProfilePublic profile={profile} links={links} products={products} />;
}
