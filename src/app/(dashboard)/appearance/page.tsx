import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import AppearanceClient from './appearance-client';

export default async function AppearancePage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');

  const { user, profile } = auth;

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
