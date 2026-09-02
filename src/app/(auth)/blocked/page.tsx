import Link from 'next/link';

export default function BlockedPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Akun Diblokir</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6 }}>Akun kamu telah diblokir oleh administrator. Hubungi admin jika ini adalah kesalahan.</p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: '24px', padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>Kembali</Link>
      </div>
    </main>
  );
}
