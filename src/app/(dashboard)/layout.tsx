import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/auth';
import { signOut } from '@/app/actions';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');
  if (auth.profile?.is_blocked) redirect('/blocked');

  const { user, profile } = auth;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/links', label: 'Links', icon: '⛓' },
    { href: '/shop', label: 'Toko / Shop', icon: '🛍️' },
    { href: '/appearance', label: 'Tampilan', icon: '◑' },
    { href: '/analytics', label: 'Analitik', icon: '↗' },
    { href: '/settings', label: 'Pengaturan', icon: '⚙' },
  ];

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
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '18px' }}>🌿</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>Pohonlink</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {profile?.username && (
            <a
              href={`/@${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              Lihat ↗
            </a>
          )}
          <form action={signOut}>
            <button
              type="submit"
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-dim)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Logo */}
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span style={{ fontSize: '20px' }}>🌿</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>Pohonlink</span>
            </Link>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-muted)', textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                prefetch={true}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--accent)', textDecoration: 'none',
                }}
              >
                <span>🛡</span> Admin Panel
              </Link>
            )}
          </nav>

          {/* User + Logout */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{profile?.display_name || user.email}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>@{profile?.username || '-'}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  width: '100%', padding: '8px 12px',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: '6px', color: 'var(--text-dim)',
                  fontSize: '12px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                Keluar
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>

      {/* Floating Glass Bottom Nav Dock (Mobile Only) */}
      <nav className="dashboard-bottom-dock" style={{
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        maxWidth: '420px',
        margin: '0 auto',
        background: 'rgba(18, 18, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        padding: '6px 10px',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
      }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 10px',
              borderRadius: '9999px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '10px',
              fontWeight: 600,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: '15px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            prefetch={true}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '6px 10px',
              borderRadius: '9999px',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: '15px' }}>🛡</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
