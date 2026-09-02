import Link from 'next/link';

export const metadata = {
  title: 'About | Pohonlink',
  description: 'Mengenal Pohonlink — platform biolink modern, cepat, dan open source oleh DGXO.',
};

export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        color: 'var(--text, #f0ece4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--surface, #161616)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--accent, #7DF9B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            🌿
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            Tentang Pohonlink
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--accent, #7DF9B6)', fontFamily: 'monospace', fontWeight: 600 }}>
            Pohonlink — Your Digital Tree, Everywhere.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted, rgba(240, 236, 228, 0.8))' }}>
          <p>
            <strong>Pohonlink</strong> adalah platform biolink modern berkinerja tinggi yang dibangun dari nol menggunakan arsitektur Next.js 16 Server Components dan Supabase. Didesain dengan filosofi <em>Dark-Brutalist Minimalism</em> untuk kecepatan maksimum (TTFB &lt; 50ms) dan kemudahan kustomisasi tanpa batas.
          </p>

          <div
            style={{
              background: 'var(--bg, #050505)',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-dim, rgba(240, 236, 228, 0.5))' }}>Engine & Arsitektur</span>
              <strong style={{ color: 'var(--accent, #7DF9B6)' }}>DGXO</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-dim, rgba(240, 236, 228, 0.5))' }}>Lisensi</span>
              <span>Open Source (MIT)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-dim, rgba(240, 236, 228, 0.5))' }}>Repository Resmi</span>
              <a
                href="https://github.com/DDGXO/pohonlink"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent, #7DF9B6)', fontWeight: 600, textDecoration: 'none' }}
              >
                DDGXO/pohonlink ↗
              </a>
            </div>
          </div>

          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(240, 236, 228, 0.45)', textAlign: 'center', margin: '8px 0' }}>
            &ldquo;Code without limits, think beyond the universe.&rdquo;
          </p>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a
            href="https://github.com/DDGXO/pohonlink"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              background: 'var(--accent, #7DF9B6)',
              color: '#000000',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ⭐ GitHub Repository
          </a>
          <Link
            href="/dashboard"
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
              color: 'var(--text, #f0ece4)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
