'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            🌿
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Pohonlink</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Masuk ke akun kamu</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(255,77,77,0.12)',
              border: '1px solid rgba(255,77,77,0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="kamu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Lupa Password?</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: loading ? 'var(--border-hover)' : 'var(--accent)',
                color: loading ? 'var(--text-dim)' : '#000',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)', marginTop: '20px' }}>
          Belum punya akun?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Daftar</Link>
        </p>
      </div>
    </main>
  );
}
