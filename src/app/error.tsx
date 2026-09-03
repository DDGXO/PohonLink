'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime error to console
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        color: 'var(--text, #f0ece4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
          background: 'var(--surface, #161616)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '40px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          💥
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#f87171' }}>
          Terjadi Kesalahan Sistem
        </h1>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-dim, rgba(240, 236, 228, 0.6))',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          Maaf, terjadi kendala saat memproses permintaan Anda. Silakan coba muat ulang halaman ini.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 18px',
              background: 'var(--accent, #7DF9B6)',
              color: '#000000',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ↻ Coba Lagi
          </button>
          <Link
            href="/"
            style={{
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text, #f0ece4)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
