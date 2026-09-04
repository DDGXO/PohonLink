import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthenticatedUser } from '@/lib/auth';
import DashboardMobileNav from '@/components/dashboard-mobile-nav';
import LogoutButton from '@/components/logout-button';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');
  if (auth.profile?.is_blocked) redirect('/blocked');

  const { user, profile } = auth;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '▦' },
    { href: '/links', label: 'Links', icon: '⛓' },
    { href: '/shop', label: 'Toko', icon: '🛍️' },
    { href: '/appearance', label: 'Tampilan', icon: '◑' },
    { href: '/analytics', label: 'Analitik', icon: '↗' },
    { href: '/settings', label: 'Pengaturan', icon: '⚙' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile Top Bar & Drawer & Compact Dock */}
      <DashboardMobileNav
        navItems={navItems}
        profile={profile}
        userEmail={user.email || ''}
      />

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
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{profile?.display_name || user.email}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>@{profile?.username || '-'}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
              <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Tentang</Link>
              <span>•</span>
              <Link href="/thank-you" style={{ color: 'inherit', textDecoration: 'none' }}>Terima Kasih</Link>
            </div>
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
