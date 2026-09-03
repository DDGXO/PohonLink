import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import type { Profile } from '@/types/database';
import AdminUsersClient from './users-client';

export default async function AdminUsersPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');
  if (auth.profile?.role !== 'admin') redirect('/dashboard');

  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, is_blocked, avatar_url, created_at, bio, bg_url')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Users</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>{profiles?.length ?? 0} pengguna terdaftar</p>
      </div>
      <AdminUsersClient users={(profiles ?? []) as unknown as Profile[]} />
    </div>
  );
}
