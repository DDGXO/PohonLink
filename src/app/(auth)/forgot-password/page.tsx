'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo.svg"
            alt="Pohonlink"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              margin: '0 auto 16px',
              display: 'block',
              boxShadow: '0 0 16px rgba(125, 249, 182, 0.25)',
            }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Lupa Password</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Masukkan email kamu untuk reset password</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>📬</p>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Email terkirim!</p>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Cek inbox kamu untuk link reset password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <div style={{ padding: '10px 14px', background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--danger)' }}>{error}</div>}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" required style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '11px', background: loading ? 'var(--border-hover)' : 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)', marginTop: '20px' }}>
          <Link href="/login" style={{ color: 'var(--accent)' }}>← Kembali ke Login</Link>
        </p>
      </div>
    </main>
  );
}
