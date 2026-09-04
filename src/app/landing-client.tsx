'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Play,
  Music,
  ShoppingBag,
  ShoppingCart,
  Music2,
  Sparkles,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  ExternalLink,
  Pause,
  Lock,
  Unlock,
  User,
  ArrowUpRight,
  Check,
} from 'lucide-react';

interface Props {
  isLoggedIn: boolean;
  username?: string | null;
}

export default function LandingClient({ isLoggedIn, username }: Props) {
  // Hero Mockup State
  const [heroTab, setHeroTab] = useState<'links' | 'shop'>('links');
  const [claimName, setClaimName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Feature State
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [canvasTheme, setCanvasTheme] = useState<'matrix' | 'synthwave' | 'starfield' | 'neon'>('matrix');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const heroProducts = [
    { title: 'Source Code SaaS Template', price: 'Rp 149.000', origPrice: 'Rp 299.000', badge: 'PROMO' },
    { title: 'E-Book Fullstack Next.js 16', price: 'Rp 79.000', origPrice: 'Rp 120.000', badge: 'BARU' },
  ];

  const heroLinks = [
    { title: 'Portofolio & Project Showcase', subtitle: 'dgamexo.dev', icon: Globe },
    { title: 'YouTube Channel (Dev Tutorial)', subtitle: 'youtube.com/@dgamexo', icon: Play },
    { title: 'Spotify Coding Playlist', subtitle: 'spotify.com/playlist', icon: Music },
  ];

  const showcaseProducts = [
    { id: 'saas', name: 'Fullstack Next.js SaaS Template', price: 199000, desc: 'Source code boilerplate Next.js 16 + Supabase Auth + Tailwind CSS v4.' },
    { id: 'ebook', name: 'Buku Mahir Modern TypeScript', price: 89000, desc: 'Panduan mendalam strict typing, generics, dan arsitektur production.' },
    { id: 'asset', name: '3D Cyberpunk Icons Pack', price: 49000, desc: '120+ asset 3D resolusi tinggi untuk UI/UX dan presentasi desain.' },
  ];

  const handlePinInput = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin === '1234') {
        setPinSuccess(true);
      }
    }
  };

  const handlePinClear = () => {
    setEnteredPin('');
    setPinSuccess(false);
  };

  const showToast = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#f0ece4', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient Glowing Background Orbs */}
      <div
        className="landing-glow-orb"
        style={{
          position: 'absolute',
          top: '-140px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(320px, 70vw, 800px)',
          height: '400px',
          background: 'radial-gradient(circle, rgba(125, 249, 182, 0.12) 0%, rgba(125, 249, 182, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        className="landing-glow-orb"
        style={{
          position: 'absolute',
          top: '35%',
          right: '-120px',
          width: 'clamp(280px, 50vw, 600px)',
          height: '600px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(56, 189, 248, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Fluid Responsive Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
      }}>
        <div className="landing-fluid-nav">
          {/* Logo anchored fluidly left */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.svg"
              alt="Pohonlink"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                display: 'block',
                boxShadow: '0 0 12px rgba(125, 249, 182, 0.25)',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '16px', letterSpacing: '0.04em', color: '#7DF9B6' }}>
              pohonlink
            </span>
          </Link>

          {/* Desktop Nav Links anchored fluidly right */}
          <div style={{ display: 'none', alignItems: 'center', gap: '14px' }} className="hidden sm:flex">
            <Link
              href="/about"
              style={{
                padding: '8px 12px',
                color: 'rgba(240, 236, 228, 0.75)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Tentang
            </Link>
            <Link
              href="/@dgamexo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                color: '#7DF9B6',
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 600,
                textDecoration: 'none',
                background: 'rgba(125, 249, 182, 0.08)',
                border: '1px solid rgba(125, 249, 182, 0.25)',
                borderRadius: '6px',
              }}
            >
              <span>Demo: @dgamexo</span>
              <ArrowUpRight style={{ width: '12px', height: '12px' }} />
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  padding: '8px 18px',
                  background: '#7DF9B6',
                  color: '#000000',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 0 16px rgba(125, 249, 182, 0.3)',
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
                    padding: '8px 18px',
                    background: '#7DF9B6',
                    color: '#000000',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 0 16px rgba(125, 249, 182, 0.3)',
                  }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="sm:hidden">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  padding: '6px 12px',
                  background: '#7DF9B6',
                  color: '#000000',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                style={{
                  padding: '6px 12px',
                  background: '#7DF9B6',
                  color: '#000000',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Daftar
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                width: '36px',
                height: '36px',
              }}
              aria-label="Toggle Navigation Menu"
            >
              <span
                className="burger-icon-line"
                style={{
                  transform: mobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="burger-icon-line"
                style={{
                  opacity: mobileMenuOpen ? 0 : 1,
                  transform: mobileMenuOpen ? 'scale(0)' : 'scale(1)',
                }}
              />
              <span
                className="burger-icon-line"
                style={{
                  transform: mobileMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Animation */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden anim-drawer-slide"
            style={{
              padding: '16px clamp(16px, 4vw, 48px) 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(10, 10, 10, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '12px 14px', color: '#f0ece4', fontSize: '14px', fontWeight: 500, textDecoration: 'none', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Tentang Pohonlink
            </Link>
            <Link
              href="/@dgamexo"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', color: '#7DF9B6', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, textDecoration: 'none', background: 'rgba(125,249,182,0.08)', borderRadius: '8px', border: '1px solid rgba(125,249,182,0.2)' }}
            >
              <span>Demo Profil: @dgamexo</span>
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '12px 14px', color: '#f0ece4', fontSize: '14px', fontWeight: 500, textDecoration: 'none', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Masuk ke Akun
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="landing-fluid-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="landing-hero-grid">
          {/* Left Column: Headline & Claim */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 850,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: '#f0ece4',
              wordBreak: 'break-word',
            }}>
              Satu tautan untuk <span style={{ background: 'linear-gradient(135deg, #7DF9B6 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>semua karya</span> dan produk.
            </h1>

            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'rgba(240, 236, 228, 0.65)',
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '520px',
            }}>
              Biolink cepat, etalase produk digital, checkout WhatsApp instan, serta pemutar media interaktif dalam satu arsitektur modern.
            </p>

            {/* Claim Bar Form */}
            <div style={{ width: '100%', maxWidth: '440px', marginBottom: '20px' }}>
              <form
                action={isLoggedIn ? '/dashboard' : '/register'}
                method="GET"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(22, 22, 22, 0.95)',
                  border: '1px solid rgba(125, 249, 182, 0.35)',
                  borderRadius: '8px',
                  padding: '4px',
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.5)', fontFamily: 'monospace', paddingLeft: '8px', whiteSpace: 'nowrap' }}>
                  pohonlink.id/@
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
                    minWidth: 0,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f0ece4',
                    fontSize: '14px',
                    padding: '8px',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    background: '#7DF9B6',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {isLoggedIn ? 'Dashboard' : 'Klaim'}
                </button>
              </form>

              {/* Demo Shortcut */}
              <div style={{ marginTop: '10px' }}>
                <Link
                  href="/@dgamexo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgba(240, 236, 228, 0.65)',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Lihat profil langsung:</span>
                  <span style={{ color: '#7DF9B6', fontWeight: 600 }}>@dgamexo</span>
                  <ArrowUpRight style={{ width: '12px', height: '12px', color: '#7DF9B6' }} />
                </Link>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(240, 236, 228, 0.45)', fontFamily: 'monospace', flexWrap: 'wrap' }}>
              <span>Gratis</span>
              <span>•</span>
              <span>Cepat &lt; 50ms</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>

          {/* Right Column: Floating Interactive Mockup Phone */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div
              className="landing-mockup-float"
              style={{
                width: '100%',
                maxWidth: '350px',
                background: 'linear-gradient(180deg, #141414 0%, #0c0c0c 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                padding: '24px 18px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(125, 249, 182, 0.06)',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              {/* Phone Speaker Notch */}
              <div style={{ width: '48px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />

              {/* Avatar & Info */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#181818',
                  border: '2px solid #7DF9B6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  boxShadow: '0 0 16px rgba(125, 249, 182, 0.25)',
                }}>
                  <User style={{ width: '28px', height: '28px', color: '#7DF9B6' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px' }}>DGameXO</h3>
                <p style={{ fontSize: '11px', color: '#7DF9B6', margin: '0 0 6px', fontFamily: 'monospace' }}>@dgamexo</p>
                <p style={{ fontSize: '12px', color: 'rgba(240, 236, 228, 0.7)', margin: 0, lineHeight: 1.4 }}>
                  Building digital products, SaaS tools, and developer resources.
                </p>
              </div>

              {/* Interactive Tab Switcher */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '9999px',
                padding: '3px',
                marginBottom: '14px',
              }}>
                <button
                  type="button"
                  onClick={() => setHeroTab('links')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: heroTab === 'links' ? '#222' : 'transparent',
                    color: heroTab === 'links' ? '#7DF9B6' : 'rgba(240, 236, 228, 0.6)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Tautan ({heroLinks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab('shop')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: heroTab === 'shop' ? '#222' : 'transparent',
                    color: heroTab === 'shop' ? '#7DF9B6' : 'rgba(240, 236, 228, 0.6)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Toko ({heroProducts.length})
                </button>
              </div>

              {/* Tab: Links */}
              {heroTab === 'links' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {heroLinks.map(l => {
                    const IconComp = l.icon;
                    return (
                      <div
                        key={l.title}
                        style={{
                          background: '#161616',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ minWidth: 0, paddingRight: '8px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(240, 236, 228, 0.4)', margin: 0, fontFamily: 'monospace' }}>{l.subtitle}</p>
                        </div>
                        <IconComp style={{ width: '15px', height: '15px', color: '#7DF9B6', flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Shop */}
              {heroTab === 'shop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {heroProducts.map(p => (
                    <div
                      key={p.title}
                      style={{
                        background: '#161616',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', background: '#222', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShoppingBag style={{ width: '16px', height: '16px', color: '#7DF9B6' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#7DF9B6' }}>{p.price}</span>
                          <span style={{ fontSize: '9px', opacity: 0.5, textDecoration: 'line-through' }}>{p.origPrice}</span>
                        </div>
                      </div>
                      <span style={{ padding: '4px 8px', background: '#7DF9B6', color: '#000', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                        Beli
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Studio */}
      <section className="landing-fluid-section" style={{ position: 'relative', zIndex: 1 }}>
        {/* Studio Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(125, 249, 182, 0.08)',
            border: '1px solid rgba(125, 249, 182, 0.25)',
            borderRadius: '9999px',
            padding: '4px 14px',
            marginBottom: '14px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7DF9B6' }} className="landing-dot-pulse" />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#7DF9B6', letterSpacing: '0.06em' }}>
              FITUR LENGKAP PLATFORM
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(26px, 4.5vw, 42px)',
            fontWeight: 850,
            letterSpacing: '-0.02em',
            margin: '0 0 10px',
            color: '#f0ece4',
          }}>
            Eksplorasi Fitur Secara Langsung
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'rgba(240, 236, 228, 0.65)', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
            Semua modul aktif dan dapat diuji langsung: katalog checkout WhatsApp, audio player, efek canvas 60FPS, hingga proteksi PIN rahasia.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="bento-grid">
          {/* 1. STORE & WHATSAPP CHECKOUT STAGE (Full Width) */}
          <div className="bento-col-12" style={{
            background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', fontWeight: 700 }}>
                  FITUR 01 : COMMERCE ENGINE
                </span>
                <h3 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 800, margin: '8px 0 10px' }}>
                  Checkout WhatsApp Otomatis Tanpa Potongan Fee
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.6, margin: '0 0 18px' }}>
                  Pilih salah satu produk di bawah untuk melihat bagaimana sistem merakit pesan order WhatsApp secara otomatis.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {showcaseProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductIndex(idx)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: selectedProductIndex === idx ? '1px solid #7DF9B6' : '1px solid rgba(255,255,255,0.08)',
                        background: selectedProductIndex === idx ? 'rgba(125,249,182,0.08)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: selectedProductIndex === idx ? '#7DF9B6' : '#f0ece4' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#7DF9B6', fontFamily: 'monospace' }}>
                          Rp {p.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'rgba(240,236,228,0.5)', margin: 0 }}>
                        {p.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Message Generator Simulation */}
              <div style={{
                background: '#0d1418',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare style={{ width: '18px', height: '18px', color: '#25D366' }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>WhatsApp Order Simulator</p>
                      <p style={{ fontSize: '10px', color: '#25D366', margin: 0, fontFamily: 'monospace' }}>+62 812-xxxx-xxxx (Seller)</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(37,211,102,0.15)', color: '#25D366', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Auto-Formatted
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div style={{
                  background: '#005c4b',
                  borderRadius: '10px 10px 2px 10px',
                  padding: '14px',
                  color: '#e9edef',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  alignSelf: 'flex-end',
                  maxWidth: '92%',
                }}>
                  <p style={{ margin: '0 0 6px' }}>Halo kak! Saya ingin memesan produk dari profil Pohonlink:</p>
                  <p style={{ margin: '0 0 4px', fontWeight: 700 }}>{showcaseProducts[selectedProductIndex].name}</p>
                  <p style={{ margin: '0 0 6px', color: '#7DF9B6', fontWeight: 800 }}>Total: Rp {showcaseProducts[selectedProductIndex].price.toLocaleString('id-ID')}</p>
                  <p style={{ margin: 0, fontSize: '10px', opacity: 0.75, textAlign: 'right' }}>12:45</p>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Simulasi link WhatsApp: https://wa.me/?text=...')}
                  style={{
                    padding: '10px',
                    background: '#25D366',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Tes Kirim WhatsApp Order</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            </div>
          </div>

          {/* 2. LIVE AUDIO & MEDIA PLAYER STAGE */}
          <div className="bento-col-6" style={{
            background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', fontWeight: 700 }}>
                FITUR 02 : INTERACTIVE AUDIO
              </span>
              <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, margin: '8px 0 8px' }}>
                Streaming Musik &amp; Media Langsung di Halaman
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Pengunjung tidak perlu diarahkan keluar tab untuk mendengarkan lagu Spotify atau preview audio.
              </p>
            </div>

            {/* Vinyl & Visualizer Widget */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {/* Rotating Vinyl Record */}
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #2a2a2a 20%, #111 60%, #000 100%)',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
              }} className={isAudioPlaying ? 'anim-spin-slow' : ''}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7DF9B6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', background: '#1DB954', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>SPOTIFY</span>
                  <span style={{ fontSize: '10px', color: 'rgba(240,236,228,0.5)', fontFamily: 'monospace' }}>HiFi 320k</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Cyberpunk Midnight Beats
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  {/* Dynamic Equalizer Bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
                    <div style={{ width: '3px', background: '#7DF9B6', borderRadius: '2px' }} className={isAudioPlaying ? 'anim-bar-1' : ''} />
                    <div style={{ width: '3px', background: '#7DF9B6', borderRadius: '2px' }} className={isAudioPlaying ? 'anim-bar-2' : ''} />
                    <div style={{ width: '3px', background: '#7DF9B6', borderRadius: '2px' }} className={isAudioPlaying ? 'anim-bar-3' : ''} />
                    <div style={{ width: '3px', background: '#7DF9B6', borderRadius: '2px' }} className={isAudioPlaying ? 'anim-bar-4' : ''} />
                    <div style={{ width: '3px', background: '#7DF9B6', borderRadius: '2px' }} className={isAudioPlaying ? 'anim-bar-2' : ''} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAudioPlaying(prev => !prev)}
                    style={{
                      padding: '6px 14px',
                      background: isAudioPlaying ? '#7DF9B6' : 'rgba(255,255,255,0.08)',
                      color: isAudioPlaying ? '#000' : '#f0ece4',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isAudioPlaying ? <Pause style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
                    <span>{isAudioPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 60FPS CANVAS & VISUALS STAGE */}
          <div className="bento-col-6" style={{
            background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', fontWeight: 700 }}>
                FITUR 03 : VISUAL EFFECTS
              </span>
              <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, margin: '8px 0 8px' }}>
                11 Pilihan Efek Canvas 60FPS &amp; Full GIF Avatar
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Pilih preset tema visual di bawah untuk melihat transformasi background secara langsung.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {(['matrix', 'synthwave', 'starfield', 'neon'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCanvasTheme(t)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: canvasTheme === t ? '1px solid #7DF9B6' : '1px solid rgba(255,255,255,0.08)',
                      background: canvasTheme === t ? '#7DF9B6' : 'rgba(255,255,255,0.04)',
                      color: canvasTheme === t ? '#000' : '#f0ece4',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Live Canvas Simulation Frame */}
              <div style={{
                height: '110px',
                borderRadius: '10px',
                border: '1px solid rgba(125,249,182,0.25)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: canvasTheme === 'synthwave' ? 'linear-gradient(180deg, #180b2a 0%, #080314 100%)' :
                            canvasTheme === 'starfield' ? 'radial-gradient(circle, #0f172a 0%, #020617 100%)' :
                            canvasTheme === 'neon' ? 'linear-gradient(135deg, #1a052b 0%, #061826 100%)' :
                            '#050e08',
              }}>
                <div className="anim-grid-flow" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#7DF9B6', margin: '0 auto 4px', display: 'block' }} />
                  <p style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#7DF9B6', margin: 0 }}>
                    CANVAS: {canvasTheme.toUpperCase()} (60FPS)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PIN & AGE SECURITY STAGE */}
          <div className="bento-col-6" style={{
            background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', fontWeight: 700 }}>
                FITUR 04 : ACCESS GATING
              </span>
              <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, margin: '8px 0 8px' }}>
                Proteksi Tautan dengan PIN Rahasia
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Kunci link penting. Masukkan PIN <span style={{ color: '#7DF9B6', fontWeight: 700, fontFamily: 'monospace' }}>1234</span> pada keypad untuk tes simulasi.
              </p>
            </div>

            {/* Interactive PIN Pad */}
            <div style={{
              background: 'rgba(0,0,0,0.55)',
              border: pinSuccess ? '1px solid #7DF9B6' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '260px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                {pinSuccess ? (
                  <Unlock style={{ width: '16px', height: '16px', color: '#7DF9B6' }} />
                ) : (
                  <Lock style={{ width: '16px', height: '16px', color: 'rgba(240, 236, 228, 0.7)' }} />
                )}
                <span style={{ fontSize: '12px', fontWeight: 700, color: pinSuccess ? '#7DF9B6' : '#f0ece4' }}>
                  {pinSuccess ? 'Tautan Terbuka' : 'Masukkan PIN 4-Digit'}
                </span>
              </div>

              {/* PIN Indicator Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: i < enteredPin.length ? (pinSuccess ? '#7DF9B6' : '#f0ece4') : 'rgba(255,255,255,0.15)',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => key === 'C' ? handlePinClear() : key === 'OK' ? null : handlePinInput(key)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      color: key === 'C' ? '#ff4d4d' : '#f0ece4',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. DEEP TELEMETRY & ANALYTICS STAGE */}
          <div className="bento-col-6" style={{
            background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7DF9B6', fontWeight: 700 }}>
                FITUR 05 : REAL-TIME TELEMETRY
              </span>
              <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, margin: '8px 0 8px' }}>
                Pelacakan Trafik &amp; Ekspor Data Mandiri
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Pantau asal pengunjung secara akurat tanpa Google Analytics yang memberatkan browser pengguna.
              </p>
            </div>

            {/* Referrer Distribution Bar Chart */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span>Distribusi Referrer</span>
                <span style={{ color: '#7DF9B6', fontFamily: 'monospace' }}>Avg CTR 34.8%</span>
              </div>

              {[
                { name: 'Instagram', pct: 52, color: '#E1306C' },
                { name: 'TikTok', pct: 28, color: '#25F4EE' },
                { name: 'WhatsApp', pct: 12, color: '#25D366' },
                { name: 'Direct / Web', pct: 8, color: '#7DF9B6' },
              ].map(r => (
                <div key={r.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                    <span>{r.name}</span>
                    <span style={{ fontFamily: 'monospace' }}>{r.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => showToast('Ekspor data profil berhasil dimulai (CSV/JSON).')}
                style={{
                  marginTop: '4px',
                  padding: '8px 12px',
                  background: '#7DF9B6',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Unduh CSV / JSON
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="landing-fluid-section" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'radial-gradient(ellipse at top, rgba(125,249,182,0.1) 0%, rgba(22,22,22,0.95) 70%)',
          border: '1px solid rgba(125, 249, 182, 0.25)',
          borderRadius: '16px',
          padding: 'clamp(32px, 5vw, 48px) clamp(20px, 4vw, 36px)',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 850, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Mulai buat profil Pohonlink Anda
          </h2>
          <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: 'rgba(240, 236, 228, 0.65)', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Atur semua link dan etalase digital Anda dari satu dasbor terpadu. Terbuka untuk diself-host secara mandiri melalui GitHub (DDGXO/PohonLink).
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={isLoggedIn ? '/dashboard' : '/register'}
              style={{
                padding: '12px 28px',
                background: '#7DF9B6',
                color: '#000000',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 0 24px rgba(125, 249, 182, 0.35)',
              }}
            >
              {isLoggedIn ? 'Buka Dashboard' : 'Daftar Sekarang'}
            </Link>
            <a
              href="https://github.com/DDGXO/PohonLink"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 22px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f0ece4',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>GitHub (DDGXO)</span>
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </a>
          </div>
        </div>
      </section>

      {/* Fluid Footer */}
      <footer style={{
        background: '#070707',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
      }}>
        <div className="landing-fluid-nav" style={{ padding: '28px clamp(16px, 4vw, 48px)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'rgba(240, 236, 228, 0.8)' }}>
              POHONLINK
            </span>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>:</span>
            <span style={{ fontSize: '12px', color: 'rgba(240, 236, 228, 0.5)' }}>Your Single Link for Everything.</span>
          </div>

          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px', color: 'rgba(240, 236, 228, 0.55)' }}>
            <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Tentang</Link>
            <Link href="/thank-you" style={{ color: 'inherit', textDecoration: 'none' }}>Terima Kasih</Link>
            <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Masuk</Link>
            <Link href="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Daftar</Link>
          </div>
        </div>
      </footer>

      {/* Toast Floating Notification */}
      {copiedNotification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#161616',
          border: '1px solid #7DF9B6',
          color: '#7DF9B6',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          zIndex: 100,
        }}>
          {copiedNotification}
        </div>
      )}
    </div>
  );
}


