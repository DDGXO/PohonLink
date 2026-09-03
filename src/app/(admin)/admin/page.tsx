import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function AdminPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');
  if (auth.profile?.role !== 'admin') redirect('/dashboard');

  const supabase = await createClient();
  const [
    { count: userCount },
    { count: linkCount },
    { data: clickData },
    { count: viewCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('links').select('*', { count: 'exact', head: true }),
    supabase.from('links').select('click_count'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event', 'pageview'),
  ]);

  const totalClicks = (clickData || []).reduce((s, l) => s + (Number(l.click_count) || 0), 0);

  const stats = [
    { label: 'Total User', value: userCount ?? 0, icon: '👥' },
    { label: 'Total Link', value: linkCount ?? 0, icon: '⛓' },
    { label: 'Total Klik', value: totalClicks, icon: '↗' },
    { label: 'Total Views', value: viewCount ?? 0, icon: '👁' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Admin Overview</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>Statistik keseluruhan platform</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(card => (
          <div key={card.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '20px',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Aksi Admin</h2>
        <Link href="/admin/users" style={{
          display: 'inline-block', padding: '9px 18px',
          background: 'var(--accent)', color: '#000',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
        }}>Kelola Users →</Link>
      </div>
    </div>
  );
}
