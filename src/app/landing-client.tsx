'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  isLoggedIn: boolean;
  username?: string | null;
}

export default function LandingClient({ isLoggedIn, username }: Props) {
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  const [claimName, setClaimName] = useState('');

  const sampleProducts = [
    { title: 'Source Code SaaS Template', price: 'Rp 149.000', origPrice: 'Rp 299.000', badge: 'PROMO', discount: '-50%' },
    { title: 'E-Book Fullstack Next.js 16', price: 'Rp 79.000', origPrice: 'Rp 120.000', badge: 'BARU', discount: '-34%' },
  ];

  const sampleLinks = [
    { title: 'Portofolio & Project Showcase', subtitle: 'dgamexo.dev', icon: '🌐' },
    { title: 'YouTube Channel (Dev Tutorial)', subtitle: 'youtube.com/@dgamexo', icon: '▶️' },
    { title: 'Spotify Coding Playlist', subtitle: 'spotify.com/playlist', icon: '🎵' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#f0ece4', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 5, 5, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🌿</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '15px', letterSpacing: '0.08em', color: '#7DF9B6' }}>
            pohonlink
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/@dgamexo"
            style={{
              padding: '8px 12px',
              color: '#7DF9B6',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(125, 249, 182, 0.25)',
              borderRadius: '4px',
            }}
          >
            Demo: @dgamexo ↗
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                padding: '8px 16px',
                background: '#7DF9B6',
                color: '#000000',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Dashboard {username ? `(@${username})` : ''}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: '8px 14px',
                  color: 'rgba(240, 236, 228, 0.75)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                style={{
                  padding: '8px 16px',
                  background: '#7DF9B6',
                  color: '#000000',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Daftar Akun
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section (2 Columns: Value Proposition + Live Interactive Mockup) */}
      <section style={{
        maxWidth: '1120px',
        width: '100%',
        margin: '0 auto',
        padding: '64px 24px 72px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        alignItems: 'center',
      }}>
        {/* Left Column: Copywriting & Claim Input */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            background: '#161616',
            marginBottom: '20px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '1px', background: '#7DF9B6' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'monospace', color: '#7DF9B6', letterSpacing: '0.06em' }}>
              BIOLINK & STORE ENGINE
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 4.5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 18px',
            color: '#f0ece4',
          }}>
            Satu tautan untuk semua karya dan produk jualan.
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'rgba(240, 236, 228, 0.65)',
            lineHeight: 1.6,
            margin: '0 0 32px',
            maxWidth: '480px',
          }}>
            Halaman profil biolink berkinerja tinggi dengan katalog e-commerce bawaan, tautan checkout WhatsApp instan, serta pemutar media interaktif.
          </p>

          {/* Claim Bar Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px', marginBottom: '14px' }}>
            <form
              action={isLoggedIn ? '/dashboard' : '/register'}
              method="GET"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#161616',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '4px',
                padding: '6px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.45)', fontFamily: 'monospace', paddingLeft: '8px' }}>
                phn.my.id/@
              </span>
              <input
                name="username"
                type="text"
                placeholder="username"
                value={claimName}
                onChange={(e) => setClaimName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f0ece4',
                  fontSize: '13px',
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  background: '#7DF9B6',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isLoggedIn ? 'Dashboard' : 'Klaim'}
              </button>
            </form>

            <Link
              href="/@dgamexo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '4px',
                color: '#7DF9B6',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span>Lihat Contoh Demo Toko & Biolink (@dgamexo)</span>
              <span>↗</span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(240, 236, 228, 0.45)', fontFamily: 'monospace', flexWrap: 'wrap' }}>
            <span>✓ Open source (DDGXO)</span>
            <span>✓ Self-host ready</span>
            <span>✓ Tanpa iklan</span>
          </div>
        </div>

        {/* Right Column: Live Interactive Profile Preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '360px',
            background: '#111111',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '24px 18px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            boxSizing: 'border-box',
          }}>
            {/* Mock Header */}
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#161616',
                border: '2px solid rgba(125, 249, 182, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 10px',
              }}>
                🌿
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>DGameXO</h3>
              <p style={{ fontSize: '11px', color: 'rgba(240, 236, 228, 0.5)', margin: '0 0 6px', fontFamily: 'monospace' }}>@dgamexo</p>
              <p style={{ fontSize: '12px', color: 'rgba(240, 236, 228, 0.7)', margin: '0 0 10px', lineHeight: 1.4 }}>
                Building digital products, code templates, and developer tooling.
              </p>
              <Link
                href="/@dgamexo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  background: 'rgba(125, 249, 182, 0.1)',
                  border: '1px solid rgba(125, 249, 182, 0.3)',
                  borderRadius: '4px',
                  color: '#7DF9B6',
                  fontSize: '10px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Buka Profil Asli ↗
              </Link>
            </div>

            {/* Interactive Tab Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '9999px',
              padding: '3px',
              marginBottom: '16px',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeTab === 'links' ? '#1c1c1c' : 'transparent',
                  color: activeTab === 'links' ? '#7DF9B6' : 'rgba(240, 236, 228, 0.6)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Tautan (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeTab === 'shop' ? '#1c1c1c' : 'transparent',
                  color: activeTab === 'shop' ? '#7DF9B6' : 'rgba(240, 236, 228, 0.6)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Toko (2)
              </button>
            </div>

            {/* Links Content */}
            {activeTab === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sampleLinks.map(l => (
                  <div
                    key={l.title}
                    style={{
                      background: '#161616',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>{l.title}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(240, 236, 228, 0.4)', margin: 0, fontFamily: 'monospace' }}>{l.subtitle}</p>
                    </div>
                    <span style={{ fontSize: '14px' }}>{l.icon}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Shop Content */}
            {activeTab === 'shop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sampleProducts.map(p => (
                  <div
                    key={p.title}
                    style={{
                      background: '#161616',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', background: '#202020', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      📦
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#7DF9B6' }}>{p.price}</span>
                        <span style={{ fontSize: '9px', opacity: 0.5, textDecoration: 'line-through' }}>{p.origPrice}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '6px 8px',
                        background: '#7DF9B6',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Beli
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section style={{
        maxWidth: '1120px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 80px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>01 : E-COMMERCE</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Katalog & Checkout Terintegrasi</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Pajang produk fisik, barang digital, atau jasa dengan harga coret diskon otomatis dan pengalihan ke WhatsApp atau marketplace.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>02 : PERFORMANCE</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Kecepatan & Responsivitas</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Dirender di sisi server menggunakan Next.js 16 Server Components untuk memastikan waktu muat halaman di bawah 50 milidetik.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>03 : SECURITY</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Proteksi PIN & Batas Usia</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Kunci tautan eksklusif dengan kode PIN, verifikasi konfirmasi umur 18+, atau dialog peringatan konten sensitif.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>04 : VISUALS</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>11 Efek Canvas 60FPS</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Pilihan animasi canvas Matrix, Starfield, Synthwave Grid, Ambient Video loop, serta penyesuaian transparansi glassmorphism.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>05 : MEDIA</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Pemutar Spotify & YouTube</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Putar lagu, album Spotify, video YouTube Shorts, dan Apple Music langsung di dalam halaman profil tanpa keluar aplikasi.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', margin: '0 0 8px', fontWeight: 600 }}>06 : ANALYTICS</p>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Pelacakan Trafik & Ekspor</h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', lineHeight: 1.6, margin: 0 }}>
              Pantau CTR, perincian rujukan trafik (Instagram, TikTok, WhatsApp), jenis perangkat, serta ekspor rekaman ke file CSV atau JSON.
            </p>
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section style={{
        maxWidth: '1120px',
        width: '100%',
        margin: '0 auto 80px',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          background: '#161616',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '4px',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>
            Mulai buat profil Pohonlink Anda
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.6)', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Atur semua link dan produk Anda dari satu dasbor terpadu. Kode sumber tersedia terbuka di GitHub (DDGXO/PohonLink) jika ingin self-host secara mandiri.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              style={{
                padding: '10px 22px',
                background: '#7DF9B6',
                color: '#000000',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {isLoggedIn ? 'Buka Dashboard' : 'Daftar Sekarang'}
            </Link>
            <a
              href="https://github.com/DDGXO/PohonLink"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f0ece4',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              GitHub (DDGXO) ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 24px',
        color: 'rgba(240, 236, 228, 0.45)',
        fontSize: '12px',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'rgba(240, 236, 228, 0.7)' }}>
              POHONLINK
            </span>
            <span style={{ margin: '0 8px' }}>:</span>
            <span>Your Single Link for Everything.</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Tentang</Link>
            <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Masuk</Link>
            <Link href="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Daftar</Link>
            <a href="https://github.com/DDGXO/PohonLink" target="_blank" rel="noopener noreferrer" style={{ color: '#7DF9B6', textDecoration: 'none', fontWeight: 600 }}>
              GitHub (DDGXO) ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
