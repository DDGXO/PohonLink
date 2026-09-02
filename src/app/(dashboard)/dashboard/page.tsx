import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getProfileStats } from '@/lib/db/queries';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single();

  const headersList = await headers();
  const host = headersList.get('host') || 'pohonlink.id';
  const stats = await getProfileStats(user.id);

  const statCards = [
    { label: 'Total Link', value: stats.totalLinks, icon: '⛓' },
    { label: 'Total Klik', value: stats.totalClicks, icon: '↗' },
    { label: 'Total Views', value: stats.totalViews, icon: '👁' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Halo, {profile?.display_name || 'Pengguna'} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
          Profil kamu:{' '}
          <a
            href={`/@${profile?.username}`}
            target="_blank"
            style={{ color: 'var(--accent)', fontWeight: 500 }}
          >
            {host}/@{profile?.username}
          </a>
        </p>
      </div>

      {/* Stat cards */}
      <div className="responsive-stats-grid">
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Aksi Cepat</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/links" style={{
            padding: '9px 18px', background: 'var(--accent)', color: '#000',
            borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>+ Tambah Link</Link>
          <Link href="/appearance" style={{
            padding: '9px 18px', background: 'var(--bg)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
          }}>Edit Tampilan</Link>
          {profile?.username && (
            <a href={`/@${profile.username}`} target="_blank" style={{
              padding: '9px 18px', background: 'var(--bg)',
              border: '1px solid var(--border)', color: 'var(--text-muted)',
              borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
            }}>Lihat Profil ↗</a>
          )}
        </div>
      </div>
    </div>
  );
}
