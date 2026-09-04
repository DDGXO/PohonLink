# Changelog

Semua perubahan dan pembaruan pada proyek **Pohonlink** dicatat di dalam dokumen ini sesuai **DGXO Versioning & Git Tagging Standard**.

---

## [v0.6.0] - 2026-09-04

### 🌿 Awwwards-Grade Bento Grid Showcase & Fluid Responsive Layout
- **Showcase Interaktif Bento Grid (`/`)**:
  - Mengganti tab slider horizontal tersembunyi dengan layout Bento Grid responsif penuh (12-kolom pada desktop, tumpuk vertikal alami pada mobile) sehingga seluruh fitur langsung terlihat tanpa perlu digeser.
  - **Katalog E-Commerce & WhatsApp Engine**: Simulasi live seleksi produk digital/fisik dengan generator chat order WhatsApp otomatis dan tombol uji kirim interaktif.
  - **Live Audio & Media HiFi**: Pemutar musik bawaan dengan animasi vinyl berputar, bar equalizer audio dinamis bergelombang, dan toggle interaktif Play/Pause lagu.
  - **60FPS Canvas Visuals**: Switcher preset tema visual (Matrix, Synthwave, Starfield, Neon) dengan pratinjau rendering kanvas bergerak secara real-time.
  - **PIN & Age Security Gate**: Keypad numerik 4-digit interaktif untuk menguji pembukaan tautan rahasia ber-PIN (kode tes: `1234`).
  - **Deep Telemetry**: Visualisasi bar chart persentase distribusi pengunjung (Instagram, TikTok, WhatsApp, Direct) serta tombol simulasi ekspor file CSV dan JSON.

### 📱 Navigasi Fluid & Pengalaman Seluler (Mobile-First)
- **Fluid Edge-to-Edge Navigation**: Bilah navigasi merentang dinamis mengikuti batas layar dengan skala padding adaptif `clamp(16px, 4vw, 48px)`.
- **Menu Burger Animasi Modern**:
  - Tombol hamburger 3 garis dengan transisi morphing mulus menjadi ikon silang (X) saat dibuka.
  - Drawer menu navigasi meluncur turun (slide down) dengan efek backdrop blur 20px.
- **Integrasi Logo Vektor Resmi**:
  - Mengganti ikon pohon generik dengan aset logo vektor resmi platform (`/logo.svg`) pada bilah navigasi dan footer.
  - Membersihkan emotikon berlebihan pada landing page dan menggantinya dengan ikon SVG monokrom presisi dari `lucide-react`.

### ⚙️ Restrukturisasi Hierarki Halaman Pengaturan (`/settings`)
- **Penataan Prioritas Identitas Akun**:
  - Kartu **Username Akun** dipindahkan ke posisi paling atas dengan pratinjau URL publik langsung (`pohonlink.id/@username`), handle `@`, dan tombol salin cepat.
  - Kartu **Info Profil** ditempatkan di posisi kedua mencakup nama tampilan, email terdaftar, dan bio profil dengan AI Bio Generator.
  - Kartu **Foto Profil & Avatar Bergerak** ditempatkan pada posisi ketiga lengkap dengan kontrol masking (Full Canvas vs Crop), tombol arah D-Pad, dan mini viewport drag-to-pan interaktif.

### 🚀 PWA, API Health Check & Rute Sistem Terpadu
- **PWA Ready**: Dukungan manifest PWA lengkap (`/manifest.json`), service worker (`/sw.js`), ikon maskable multi-resolusi, dan halaman offline fallback (`/offline`).
- **Health Check Endpoint (`/api/health`)**: API monitoring status layanan publik (status database, memory usage, latency, uptime, dan environment) tanpa mengekspos konfigurasi internal model.
- **vCard Contact Export (`/api/vcard/[username]`)**: Endpoint untuk mengunduh kontak profil langsung ke format `.vcf` buku telepon seluler.
- **Dynamic SEO Handlers**: Integrasi `src/app/sitemap.ts` dan `src/app/robots.ts` untuk pengindeksan mesin pencari secara dinamis.

---

## [v0.5.0] - 2026-09-03

### 🌿 Landing Page Interaktif & Pengamanan Sesi Auth
- **Landing Page Interaktif (`phn.my.id` / `/`)**:
  - Hero 2-kolom dengan form klaim username langsung (`phn.my.id/@username`).
  - **Live Interactive Profile Card Mockup**: Pratinjau profil biolink dan toko online yang dapat diklik secara interaktif langsung pada landing page.
  - Tombol demo langsung menuju profil `phn.my.id/@dgamexo` pada bilah navigasi, hero section, dan kartu pratinjau.
  - Grid fitur fungsional dengan ikon SVG monokrom, sudut tajam presisi (`4px`), dan palet warna resmi (`#050505`, `#161616`, `#7DF9B6`).
- **Proteksi Pengalihan Auth**:
  - Middleware (`src/lib/supabase/middleware.ts`) dan Server Layout (`src/app/(auth)/layout.tsx`) otomatis mengalihkan pengguna yang telah memiliki sesi aktif ke `/dashboard` saat mengakses rute otentikasi (`/login`, `/register`, `/forgot-password`, `/reset-password`).
  - Tombol aksi pada landing page otomatis menyesuaikan status login pengguna.
- **Atribusi Open Source & Sinkronisasi Brand**:
  - Menghapus klaim gratis permanen dan menambahkan atribusi repositori open source resmi di GitHub (`DDGXO/PohonLink`) bagi pengguna yang ingin melakukan self-host mandiri.
  - Menyelaraskan motto/tagline resmi: `Pohonlink: Your Single Link for Everything.`

---

## [v0.4.0] - 2026-09-03

### 🛍️ E-Commerce Showcase & Toko Online (`/@username/shop` & Tab Toko)
- **Toko Online & Showcase Produk**:
  - Dukungan penuh pajang produk fisik, barang digital, atau jasa dengan foto produk (rasio 1:1), nama produk, dan deskripsi singkat.
  - Penataan harga: Format mata uang Rupiah (`Rp`), harga coret / diskon asli (`original_price`), dan kalkulasi badge potongan persen otomatis (misal `-40%`).
  - **Badge Promo Khusus**: `🔥 Best Seller`, `💥 Diskon Spesial`, `✨ Produk Baru`, `⏳ Stok Terbatas`, `📦 Pre-Order`, `⭐ Rekomendasi`.
- **Checkout Hyperlink & Preset CTA**:
  - Tombol CTA fleksibel yang mengarahkan pembeli langsung ke link checkout penjual (Shopee, Tokopedia, TikTok Shop, Custom URL).
  - **WhatsApp Direct Order Generator**: Otomatis membuat link `https://wa.me/` dengan nomor telepon penjual dan template pesan pemesanan terformat rapi.
- **Tampilan Publik & Tab Switcher**:
  - Tab Switcher modern `[ 🔗 Tautan | 🛍️ Toko (N) ]` pada profil biolink publik (`/@username`).
  - Rute mandiri `/@username/shop` untuk membagikan toko online langsung ke pelanggan.
  - Tata letak grid kartu e-commerce 2-kolom responsif untuk mobile dan desktop.
- **Manajemen Toko di Dashboard (`/shop`)**:
  - Menu sidebar navigasi baru **Toko / Shop**.
  - Dashboard pengelolaan katalog produk dengan modal tambah & edit produk, toggle aktif/nonaktif, pin produk ke atas, dan live mobile preview iframe toko.
  - Pengaturan nama tab toko (misal: "Toko", "Katalog", "Merch", "Produk"), toggle visibilitas tab toko di profil, dan pemilih tata letak (Grid 2-kolom vs List vertikal).

### 🛠️ Halaman Status & Standarisasi Tipografi DGXO
- **Halaman Error Kustom**:
  - `src/app/not-found.tsx` (404 Not Found): Tampilan 404 modern dengan ambient glow dan tombol navigasi kembali ke beranda.
  - `src/app/error.tsx` (500 Error Boundary): Penanganan runtime error dengan tombol coba lagi (retry).
  - `src/app/403/page.tsx` & `src/app/forbidden.tsx` (403 Forbidden): Halaman proteksi akses terlarang.
- **Kepatuhan Tipografi DGXO**: Menghapus seluruh karakter em dash (`U+2014`) di seluruh basis kode `src/` dan menggantinya dengan pemisah standar.

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
