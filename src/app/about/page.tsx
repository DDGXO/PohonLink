import Link from 'next/link';

export const metadata = {
  title: 'Tentang Pohonlink | Platform Biolink & Toko Online',
  description: 'Pusat integrasi portofolio, media sosial, dan transaksi penjualan produk digital dalam satu tautan terpadu.',
};

export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#f0ece4',
        padding: '56px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '840px' }}>
        {/* Navigation Breadcrumb / Top Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link
            href="/"
            style={{
              fontSize: '13px',
              color: 'rgba(240, 236, 228, 0.6)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Kembali ke Beranda
          </Link>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <Link href="/dashboard" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>
              Dashboard ↗
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ marginBottom: '36px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#4ade80',
              marginBottom: '12px',
            }}
          >
            Platform Overview
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#ffffff' }}>
            Tentang Pohonlink
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(240, 236, 228, 0.75)', lineHeight: 1.6, margin: 0, maxWidth: '640px' }}>
            Pohonlink adalah platform tautan bio dan etalase mikro terpadu yang dirancang untuk menyatukan seluruh portofolio digital, konten multimedia, dan transaksi penjualan dalam satu URL yang ringkas dan berkinerja tinggi.
          </p>
        </div>

        {/* Bento Grid Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {/* Card 1: Link Hub */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Sentralisasi Tautan
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Kelola tautan portofolio, artikel, formulir kontak, dan media sosial dengan kontrol drag-and-drop, pin link teratas, serta tautan terjadwal.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Manajemen Konten
            </div>
          </div>

          {/* Card 2: Micro Store */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Etalase & Katalog Produk
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Pajang produk digital maupun fisik dengan tata letak grid/list, label diskon, dan tombol checkout langsung ke WhatsApp atau marketplace.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Social Commerce
            </div>
          </div>

          {/* Card 3: Deep Analytics */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Analitik & Pelacakan
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Pantau tren kunjungan harian, rasio klik tayang (CTR) per link, pengunjung unik, serta integrasi Meta Pixel, GA4, dan Google Tag Manager.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Data & Wawasan
            </div>
          </div>

          {/* Card 4: Personalization */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Personalisasi Visual
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Kustomisasi warna, gaya tombol (solid, outline, glass), avatar animasi GIF/MP4, latar belakang canvas dinamis, dan custom CSS.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Desain & Tampilan
            </div>
          </div>

          {/* Card 5: PWA & Offline Support */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Progressive Web App (PWA)
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Dukungan instalasi aplikasi langsung ke layar utama ponsel atau desktop dengan service worker caching dan fallback halaman offline.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Performa & Offline
            </div>
          </div>

          {/* Card 6: Infrastructure */}
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>
                Arsitektur Modern
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', lineHeight: 1.5, margin: 0 }}>
                Dibangun menggunakan Next.js App Router, Server Components, dan basis data PostgreSQL Supabase untuk respon server cepat dan aman.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
              Kategori: Infrastruktur
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div
          style={{
            background: '#121212',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px' }}>
              Mulai Kelola Biolink Anda
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(240, 236, 228, 0.65)', margin: 0 }}>
              Buat akun gratis dan atur halaman profil publik Anda sekarang.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/register"
              style={{
                padding: '10px 20px',
                background: '#4ade80',
                color: '#000000',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Daftar Akun
            </Link>
            <Link
              href="/login"
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f0ece4',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
