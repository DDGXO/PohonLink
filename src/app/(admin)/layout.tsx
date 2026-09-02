import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile Top Bar */}
      <header className="dashboard-topbar" style={{
        padding: '12px 16px',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🛡</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger)' }}>Admin Panel</span>
        </div>
        <Link
          href="/dashboard"
          style={{
            padding: '5px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          ← Dashboard
        </Link>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        <aside className="dashboard-sidebar">
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontSize: '18px' }}>🛡</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger)' }}>Admin Panel</span>
            </Link>
          </div>
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { href: '/admin', label: 'Overview', icon: '▦' },
              { href: '/admin/users', label: 'Pengguna', icon: '👥' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                color: 'var(--text-muted)', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>{item.label}
              </Link>
            ))}
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500,
              color: 'var(--accent)', textDecoration: 'none', marginTop: '12px',
              borderTop: '1px solid var(--border)',
            }}>
              <span>←</span> Kembali ke Dashboard
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>

      {/* Floating Bottom Nav Dock (Mobile Only) */}
      <nav className="dashboard-bottom-dock" style={{
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        maxWidth: '360px',
        margin: '0 auto',
        background: 'rgba(18, 18, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        padding: '6px 12px',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
      }}>
        <Link
          href="/admin"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '6px 12px',
            borderRadius: '9999px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '15px' }}>▦</span>
          <span>Overview</span>
        </Link>
        <Link
          href="/admin/users"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '6px 12px',
            borderRadius: '9999px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '15px' }}>👥</span>
          <span>Users</span>
        </Link>
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '6px 12px',
            borderRadius: '9999px',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '15px' }}>←</span>
          <span>Dashboard</span>
        </Link>
      </nav>
    </div>
  );
}
