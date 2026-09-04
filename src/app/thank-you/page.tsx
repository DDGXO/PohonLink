import Link from 'next/link';

export const metadata = {
  title: 'Konfirmasi & Terima Kasih | Pohonlink',
  description: 'Pendaftaran dan akun biolink Anda berhasil disiapkan.',
};

export default function ThankYouPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#f0ece4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          textAlign: 'center',
          background: '#121212',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '48px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(74, 222, 128, 0.12)',
            border: '1px solid rgba(74, 222, 128, 0.35)',
            color: '#4ade80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
          Akun Anda Siap Digunakan
        </h1>

        <p style={{ fontSize: '14px', color: 'rgba(240, 236, 228, 0.7)', lineHeight: 1.6, marginBottom: '28px' }}>
          Terima kasih telah bergabung dengan Pohonlink. Halaman biolink dan toko digital Anda sudah aktif dan siap disesuaikan.
        </p>

        {/* Onboarding Checklist Card */}
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(240, 236, 228, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            Langkah Awal Memulai
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#4ade80', fontWeight: 700, lineHeight: 1.4 }}>01</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>Tambah Tautan & Media</strong>
                <span style={{ color: 'rgba(240, 236, 228, 0.65)' }}>Masukkan link website, portofolio, video YouTube, atau musik Spotify.</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#4ade80', fontWeight: 700, lineHeight: 1.4 }}>02</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>Kustomisasi Tampilan</strong>
                <span style={{ color: 'rgba(240, 236, 228, 0.65)' }}>Pilih preset tema, ubah warna tombol, dan atur latar belakang visual profil.</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#4ade80', fontWeight: 700, lineHeight: 1.4 }}>03</span>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>Pasang di Bio Medsos</strong>
                <span style={{ color: 'rgba(240, 236, 228, 0.65)' }}>Salin tautan unik profil Anda dan pasang di bio Instagram, TikTok, atau X.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '11px 24px',
              background: '#4ade80',
              color: '#000000',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Buka Dashboard
          </Link>
          <Link
            href="/about"
            style={{
              padding: '11px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f0ece4',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Pelajari Fitur
          </Link>
        </div>
      </div>
    </main>
  );
}
