# Changelog

Semua perubahan dan pembaruan pada proyek **Pohonlink** dicatat di dalam dokumen ini sesuai **DGXO Versioning & Git Tagging Standard**.

---

## [v0.3.0] - 2026-09-03

### ✨ Fitur Baru (Linktree Parity & Media Embeds)
- **Standard Links & Subtitle**: Dukungan penambahan teks subtitle/deskripsi singkat di bawah judul tombol beserta favicon otomatis.
- **Media Embed Langsung**:
  - 🎵 **Spotify Embed**: Pemutar lagu, album, dan playlist interaktif.
  - ▶️ **YouTube Video & Shorts**: Pemutar video responsif di dalam profil.
  - 🍎 **Apple Music Embed**: Pemutar musik Apple Music terintegrasi.
- **Heading & Spacer**: Pemisah seksi kategori dan spacer jarak vertikal yang dapat disesuaikan tinggi pikselnya (`px`).
- **Penjadwalan Tayang (Schedule Links)**: Pengaturan otomatis tanggal mulai tayang (`schedule_start`) dan tanggal berakhir (`schedule_end`) dengan pemfilteran aman di sisi server.
- **Gated / Kunci Link (Link Protection)**:
  - 🔑 **Kunci PIN / Sandi**: Membuka link hanya setelah memasukkan kode PIN.
  - 🔞 **Verifikasi Usia 18+**: Dialog konfirmasi usia sebelum dialihkan.
  - ⚠️ **Peringatan Konten Sensitif**: Dialog peringatan sebelum melanjutkan.

### 🎨 Tampilan & Kustomisasi (Appearance & Styles)
- **Tema & Latar Belakang**:
  - **Warna Solid**: Color picker & custom hex.
  - **Latar Gradient**: 4 opsi arah (Bawah ↓, Atas ↑, Diagonal ↗, Radial 🔘), pemilih 2 warna independen, dan preset gradient populer.
  - **Gambar Kustom**: Unggah gambar dengan modal pemotong (cropper) otomatis.
  - **Video Ambient**: Dukungan direct video loop (.mp4/.webm) & preset video latar.
  - **11 Efek Animasi Canvas 60FPS**: Matrix code rain, ASCII Aquarium (ikan dengan orientasi arah swim yang presisi), Starfield warp, Particle mesh, Synthwave grid, Aura orbs, Cyberpunk Rain, Spiral Galaxy, Cyber Waves, Retro Terminal, dan Neon Embers.
- **Gaya Tombol & Glassmorphism**:
  - **Solid Fill**, **Outline**, **Glassmorphism**, **Hard Shadow 3D**, dan **Soft Shadow Glow**.
  - Slider kustom **Tingkat Transparansi (Opacity)** (0% - 100%) dan **Ketajaman Blur (Backdrop Blur)** (0px - 40px) untuk efek Glassmorphism.
  - Color picker untuk bayangan (shadow) dan garis tepi (border).
  - Pilihan sudut tombol: Sharp (4px), Rounded (12px), Pill (9999px).
- **Tata Letak Konten (Layout)**:
  - **Stack Klasik (`list`)**: Vertikal lebar penuh.
  - **Grid Kompak (`grid`)**: 2 Kolom modern.
  - **Carousel Slider (`carousel`)**: Kartu horizontal geser/swipe.
- **Header & Ikon Media Sosial**:
  - Avatar shape: Bulat (Circle), Rounded, Kotak Transparan (Square).
  - Penempatan deretan ikon medsos: Bagian Atas (di bawah bio) atau Bagian Bawah (di atas footer).

### 📊 Analitik & Statistik (Analytics)
- **Overview Trafik**: Total Views, Total Clicks, CTR (Click-Through Rate %), dan Jumlah Link Aktif.
- **Demografi & Sumber Trafik**:
  - Sumber Rujukan (Instagram, TikTok, X/Twitter, YouTube, WhatsApp, Facebook, Google, Direct).
  - Tipe Perangkat (Mobile, Tablet, Desktop).
  - Sistem Operasi (Android, iOS, Windows, macOS, Linux).
- **Performa Link Populer**: Bar persentase klik per link.
- **Ekspor Laporan**: Unduh rekaman event analitik ke format **CSV** dan **JSON**.

### 🛡️ Keamanan & Optimasi (Security & Performance)
- **Admin Protection**: Perlindungan akun admin di halaman overview dan user management agar tidak dapat diblokir atau dihapus oleh aksi admin lainnya.
- **Iframe Preview Bug Fix**: Menghilangkan false positive tracking view saat user membuka halaman dashboard, links, atau appearance melalui deteksi `?preview=true` dan context iframe.
- **Server Queries Optimization**: Parallel fetch lean queries dengan instant shimmer loading state.
