import Link from 'next/link';

export const metadata = {
  title: 'Thank You | Pohonlink',
  description: 'Terima kasih telah menggunakan dan mendukung platform Pohonlink.',
};

export default function ThankYouPage() {
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
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          background: 'var(--surface, #161616)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '44px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(125, 249, 182, 0.12)',
            border: '1px solid rgba(125, 249, 182, 0.3)',
            color: 'var(--accent, #7DF9B6)',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          🙏
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
          Terima Kasih!
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--accent, #7DF9B6)', fontWeight: 600, marginBottom: '16px' }}>
          Thank you for planting your tree with Pohonlink.
        </p>

        <p style={{ fontSize: '14px', color: 'var(--text-muted, rgba(240, 236, 228, 0.75))', lineHeight: 1.6, marginBottom: '28px' }}>
          Pohonlink didedikasikan untuk seluruh kreator konten, pengembang, dan komunitas open source. Setiap dukungan, masukan, dan kontribusi kode kamu membantu ekosistem ini tumbuh lebih kuat.
        </p>

        <div
          style={{
            background: 'var(--bg, #050505)',
            border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim, rgba(240, 236, 228, 0.5))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Apresiasi & Komunitas
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted, rgba(240, 236, 228, 0.8))', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Komunitas Open Source Next.js & Supabase</li>
            <li>Inspirasi arsitektur biolink modern berkinerja tinggi</li>
            <li>Kontributor dan penguji keamanan ekosistem DGXO</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            }}
          >
            Buka Dashboard
          </Link>
          <a
            href="https://github.com/DGameXO/pohonlink"
            target="_blank"
            rel="noopener noreferrer"
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
            Beri Bintang di GitHub ⭐
          </a>
        </div>
      </div>
    </main>
  );
}
