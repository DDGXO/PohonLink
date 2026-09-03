import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProfileSettings } from '@/types/database';
import { getAuthenticatedUser } from '@/lib/auth';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');

  const { user, profile } = auth;
  const headersList = await headers();
  const host = headersList.get('host') || 'pohonlink.id';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Pengaturan</h1>
      </div>
      <SettingsClient
        email={user.email || ''}
        username={profile?.username || ''}
        displayName={profile?.display_name || ''}
        bio={profile?.bio || ''}
        avatarUrl={profile?.avatar_url || null}
        host={host}
        settings={(profile?.settings as unknown as ProfileSettings) || { open_links_new_tab: false, show_share_button: true }}
      />
    </div>
  );
}
