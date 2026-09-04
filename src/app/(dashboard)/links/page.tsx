import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAllLinks } from '@/lib/db/queries';
import LinksClient from './links-client';

export default async function LinksPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');

  const { user, profile } = auth;
  const links = await getAllLinks(user.id);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Links</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>{links.length} blok terdaftar</p>
      </div>
      <LinksClient
        initialLinks={links}
        userId={user.id}
        username={profile?.username || ''}
        smartSortingEnabled={Boolean(profile?.settings?.smart_sorting_enabled)}
      />
    </div>
  );
}
