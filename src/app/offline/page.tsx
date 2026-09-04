import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline | Pohonlink',
  description: 'Koneksi internet terputus',
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'var(--text, #f5f5f5)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--surface, #121212)',
          border: '1px solid var(--border, #262626)',
          borderRadius: '16px',
          padding: '40px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            color: 'var(--accent, #4ade80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Mode Offline
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-dim, #888888)', lineHeight: 1.6, marginBottom: '24px' }}>
          Koneksi internet Anda terputus. Halaman ini ditampilkan dari cache lokal perangkat Anda.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="/"
            style={{
              padding: '11px',
              background: 'var(--accent, #4ade80)',
              color: '#000000',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Muat Ulang
          </a>

          <Link
            href="/dashboard"
            style={{
              padding: '10px',
              background: 'transparent',
              border: '1px solid var(--border, #262626)',
              color: 'var(--text-muted, #aaaaaa)',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Buka Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
