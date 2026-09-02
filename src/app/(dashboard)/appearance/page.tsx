import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AppearanceClient from './appearance-client';

export default async function AppearancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, theme_config, bg_url')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Tampilan</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>Kustomisasi halaman profil kamu</p>
      </div>
      <AppearanceClient
        theme={profile?.theme_config}
        bgUrl={profile?.bg_url || null}
        username={profile?.username || ''}
        userId={user.id}
      />
    </div>
  );
}
