'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { signUp } from '@/app/actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  const checkUsername = useCallback(async (val: string) => {
    if (!val || val.length < 3) { setUsernameStatus('idle'); return; }
    if (!/^[a-z0-9_-]{3,30}$/.test(val)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    const res = await fetch(`/api/check-username?username=${encodeURIComponent(val)}`);
    const data = await res.json();
    setUsernameStatus(data.available ? 'available' : 'taken');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 400);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (usernameStatus === 'taken') { setError('Username sudah dipakai'); return; }
    if (usernameStatus === 'invalid') { setError('Format username tidak valid'); return; }
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await signUp(fd);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  };

  const usernameColor = usernameStatus === 'available' ? 'var(--success)'
    : usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'var(--danger)'
    : 'var(--text-dim)';
  const usernameHint = usernameStatus === 'available' ? '✓ Username tersedia'
    : usernameStatus === 'taken' ? '✗ Username sudah dipakai'
    : usernameStatus === 'invalid' ? '✗ Hanya huruf kecil, angka, _ dan -'
    : usernameStatus === 'checking' ? 'Memeriksa...' : 'Huruf kecil, angka, _ dan - (3-30 karakter)';

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
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Buat Akun</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Mulai buat biolink dan toko online kamu</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--danger)' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>NAMA LENGKAP</label>
              <input name="display_name" type="text" placeholder="Nama kamu" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--text-dim)' }}>@</span>
                <input
                  name="username" type="text" placeholder="usernamekamu"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required
                  style={{ ...inputStyle, paddingLeft: '28px', borderColor: usernameStatus === 'available' ? 'rgba(16,185,129,0.5)' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'rgba(255,77,77,0.5)' : 'var(--border)' }}
                />
              </div>
              <p style={{ fontSize: '11px', marginTop: '4px', color: usernameColor }}>{usernameHint}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>EMAIL</label>
              <input name="email" type="email" placeholder="kamu@email.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>PASSWORD</label>
              <input name="password" type="password" placeholder="Min 6 karakter" required minLength={6} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid'} style={{ padding: '11px', background: loading ? 'var(--border-hover)' : 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)', marginTop: '20px' }}>
          Sudah punya akun?{' '}<Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Masuk</Link>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-dim)', marginTop: '24px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Beranda</Link>
          <span>•</span>
          <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Tentang</Link>
          <span>•</span>
          <Link href="/thank-you" style={{ color: 'inherit', textDecoration: 'none' }}>Terima Kasih</Link>
        </div>
      </div>
    </main>
  );
}
