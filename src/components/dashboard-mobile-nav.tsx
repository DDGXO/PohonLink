'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/logout-button';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  navItems: NavItem[];
  profile: {
    username?: string;
    display_name?: string | null;
    role?: string;
  } | null;
  userEmail: string;
}

export default function DashboardMobileNav({ navItems, profile, userEmail }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="dashboard-topbar" style={{
        padding: '10px 14px',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Hamburger Toggle Button (Active only on small screens < 480px) */}
          <button
            type="button"
            className="mobile-burger-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Buka Menu Navigasi"
            style={{
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ☰
          </button>

          <Link href="/dashboard" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img
              src="/logo.svg"
              alt="Pohonlink"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                display: 'block',
              }}
            />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>Pohonlink</span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {profile?.username && (
            <a
              href={`/@${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 8px',
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
          <LogoutButton variant="topbar" />
        </div>
      </header>

      {/* Hamburger Slide-over Drawer for Small Screens */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Drawer Menu Body */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '80%',
              maxWidth: '300px',
              height: '100%',
              background: 'var(--bg2)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/logo.svg"
                  alt="Pohonlink"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    display: 'block',
                  }}
                />
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>Pohonlink</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup Menu"
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-dim)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Profile Info in Drawer */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
                {profile?.display_name || userEmail}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 8px' }}>
                @{profile?.username || '-'}
              </p>
              {profile?.username && (
                <a
                  href={`/@${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Buka Profil Publik ↗
                </a>
              )}
            </div>

            {/* Nav links in Drawer */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? 'var(--surface)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={handleClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: pathname.startsWith('/admin') ? 700 : 500,
                    background: pathname.startsWith('/admin') ? 'var(--surface)' : 'transparent',
                    color: 'var(--accent)',
                    border: `1px solid ${pathname.startsWith('/admin') ? 'var(--border)' : 'transparent'}`,
                    textDecoration: 'none',
                    marginTop: '4px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🛡</span>
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Logout and Secondary Links at bottom of drawer */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)', padding: '0 4px' }}>
                <Link href="/about" onClick={handleClose} style={{ color: 'inherit', textDecoration: 'none' }}>Tentang</Link>
                <span>•</span>
                <Link href="/thank-you" onClick={handleClose} style={{ color: 'inherit', textDecoration: 'none' }}>Terima Kasih</Link>
              </div>
              <LogoutButton variant="drawer" label="Keluar dari Akun" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Glass Bottom Nav Dock (Rendered on medium mobile screens 480px-767px) */}
      <nav className="dashboard-bottom-dock" style={{
        position: 'fixed',
        bottom: '14px',
        left: '12px',
        right: '12px',
        maxWidth: '460px',
        margin: '0 auto',
        background: 'rgba(18, 18, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        padding: '6px 10px',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
        boxShadow: '0 8px 24px rgba(0,0,0,0.75)',
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                borderRadius: '9999px',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '4px 8px',
              borderRadius: '9999px',
              color: pathname.startsWith('/admin') ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '10px',
              fontWeight: pathname.startsWith('/admin') ? 700 : 500,
            }}
          >
            <span style={{ fontSize: '15px' }}>🛡</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
}
