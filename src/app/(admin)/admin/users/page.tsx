import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminUsersClient from './users-client';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Users</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>{profiles?.length ?? 0} pengguna terdaftar</p>
      </div>
      <AdminUsersClient users={profiles || []} />
    </div>
  );
}
