import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProfileSettings } from '@/types/database';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const headersList = await headers();
  const host = headersList.get('host') || 'pohonlink.id';

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url, settings')
    .eq('id', user.id)
    .single();

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
