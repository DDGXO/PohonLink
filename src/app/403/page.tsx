import Link from 'next/link';

export const metadata = {
  title: '403 Forbidden | Pohonlink',
  description: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.',
};

export default function ForbiddenPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'var(--text, #f0ece4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
          background: 'var(--surface, #161616)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
          borderRadius: '12px',
          padding: '40px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255, 77, 77, 0.12)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            color: 'var(--danger, #ff4d4d)',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          ⛔
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          403: Akses Ditolak
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-dim, rgba(240, 236, 228, 0.5))', lineHeight: 1.6, marginBottom: '28px' }}>
          Kamu tidak memiliki izin untuk membuka halaman ini. Area ini hanya dapat diakses oleh Administrator terverifikasi.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '10px 20px',
              background: 'var(--accent, #7DF9B6)',
              color: '#000000',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/login"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
              color: 'var(--text-muted, rgba(240, 236, 228, 0.75))',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Ganti Akun
          </Link>
        </div>
      </div>
    </main>
  );
}
