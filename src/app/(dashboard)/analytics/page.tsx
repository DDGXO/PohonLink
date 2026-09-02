import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllLinks, getPageviewCount, getOsBreakdown } from '@/lib/db/queries';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [links, totalViews, osEntries] = await Promise.all([
    getAllLinks(user.id),
    getPageviewCount(user.id),
    getOsBreakdown(user.id),
  ]);

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
  const topLinks = [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 10);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Analitik</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginTop: '4px' }}>Performa halaman profilmu</p>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>Total Kunjungan</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)' }}>{(totalViews ?? 0).toLocaleString()}</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>Total Klik Link</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)' }}>{totalClicks.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Links */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Top Link</h2>
        {topLinks.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Belum ada data klik</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topLinks.map((link) => {
              const pct = totalClicks > 0 ? Math.round((link.click_count / totalClicks) * 100) : 0;
              return (
                <div key={link.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{link.title}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{link.click_count} klik</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OS Breakdown */}
      {osEntries.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Platform Pengunjung</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {osEntries.map(([os, count]) => {
              const pct = totalViews ? Math.round((count / totalViews) * 100) : 0;
              return (
                <div key={os}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{os}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
