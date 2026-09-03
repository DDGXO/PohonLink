import Link from 'next/link';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan | Pohonlink',
  description: 'Halaman atau profil biolink yang kamu cari tidak ditemukan atau telah dipindahkan.',
};

export default function NotFound() {
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
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(125, 249, 182, 0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          background: 'var(--surface, #161616)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '48px 28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Icon / 404 Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '14px' }}>🌿</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent, #7DF9B6)', letterSpacing: '0.08em' }}>
            ERROR 404
          </span>
        </div>

        <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '14px', color: 'var(--text, #fff)' }}>
          4<span style={{ color: 'var(--accent, #7DF9B6)' }}>0</span>4
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text, #f0ece4)' }}>
          Halaman atau Profil Tidak Ditemukan
        </h1>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-dim, rgba(240, 236, 228, 0.6))',
            lineHeight: 1.6,
            maxWidth: '380px',
            margin: '0 auto 28px',
          }}
        >
          Tautan yang kamu tuju mungkin salah ketik, telah dihapus pemiliknya, atau belum pernah didaftarkan.
        </p>

        {/* Action Button */}
        <div style={{ maxWidth: '240px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              padding: '11px 20px',
              background: 'var(--accent, #7DF9B6)',
              color: '#000000',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
              display: 'block',
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.08))' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-dim, rgba(240, 236, 228, 0.4))', margin: 0 }}>
            Pohonlink: Satu Link untuk Semua Konten & Tokomu.
          </p>
        </div>
      </div>
    </main>
  );
}
