import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllLinks } from '@/lib/db/queries';
import LinksClient from './links-client';

export default async function LinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  const links = await getAllLinks(user.id);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Links</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>{links.length} blok terdaftar</p>
      </div>
      <LinksClient initialLinks={links} userId={user.id} username={profile?.username || ''} />
    </div>
  );
}
