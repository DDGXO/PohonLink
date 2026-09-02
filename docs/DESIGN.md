# Pohonlink Design System & UI Specification

Dokumentasi resmi sistem desain antarmuka, tata letak responsif, palet warna, tipografi, dan selektor kustomisasi untuk platform **Pohonlink**.

---

## 1. Filosofi Desain

Pohonlink menggunakan pendekatan **Minimalis Modern Berkinerja Tinggi** dengan fokus pada estetika *Dark Mode*, kecepatan muat, dan ergonomi sentuh di perangkat seluler:

1. **Mobile-First Touch Ergonomics**: Kontrol navigasi utama diakses via Floating Glass Dock di bagian bawah layar ponsel.
2. **Instant Live Preview**: Setiap perubahan tautan, tema, CSS, dan HTML langsung divisualisasikan dalam mockup smartphone dengan Dynamic Island.
3. **Fleksibilitas Kustomisasi Penuh**: Pengguna dapat mengubah gaya tampilan menggunakan Theme Presets bawaan, palet warna dinamis, Custom CSS, hingga Custom HTML Embeds.

---

## 2. Palet Warna Resmi (Tokens)

```css
:root {
  /* Latar Belakang */
  --bg: #050505;          /* Latar utama hitam pekat */
  --bg2: #0a0a0a;         /* Latar sekunder (sidebar & panel) */
  --bg3: #111111;         /* Latar kartu / kontainer aktif */
  --surface: #161616;     /* Latar input, form, dan kartu utama */

  /* Garis Batas (Borders) */
  --border: rgba(255, 255, 255, 0.06);       /* Garis batas tipis */
  --border-hover: rgba(255, 255, 255, 0.14); /* Garis batas saat hover/fokus */

  /* Aksen Utama — Pohonlink Mint Green */
  --accent: #4ADE80;                         /* Hijau mint terang */
  --accent2: #22C55E;                        /* Hijau mint sedang */
  --accent-dim: rgba(74, 222, 128, 0.12);    /* Aksen transparan lembut */
  --accent-glow: rgba(74, 222, 128, 0.25);   /* Efek glow */

  /* Tipografi Teks */
  --text: #f0ece4;                           /* Teks utama (putih gading) */
  --text-muted: rgba(240, 236, 228, 0.7);    /* Teks sekunder */
  --text-dim: rgba(240, 236, 228, 0.5);      /* Teks keterangan/placeholder */

  /* Status Indikator */
  --success: #10b981;                        /* Sukses / aktif */
  --danger: #ff4d4d;                         /* Error / hapus */

  /* Radius Sudut */
  --radius: 8px;                             /* Tombol dan input */
  --radius-lg: 12px;                         /* Kartu dan kontainer */
}
```

---

## 3. Tipografi

| Penggunaan | Font Family | Bobot (Weight) | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Judul & Headline** | DM Sans | 700, 800 | Kontras tinggi, tegas, modern |
| **Teks Isi & Tombol** | DM Sans | 400, 500, 600 | Sangat terbaca di layar resolusi tinggi |
| **Kode & Custom CSS/HTML** | JetBrains Mono | 400, 500 | Monospace bersih untuk editor kustom |

---

## 4. Layout & Tata Letak Responsif

### A. Dashboard & Admin Panel
- **Desktop (≥ 768px)**:
  - Sidebar tetap (fixed left sidebar) berlebar `220px`.
  - Konten utama (`.dashboard-main`) menggunakan `width: calc(100% - 220px)`.
  - Halaman Links dan Appearance mengadopsi tata letak split (`.responsive-grid-split`): kolom editor di kiri dan live mockup smartphone `320px` di kanan.
- **Mobile (< 768px)**:
  - Topbar ramping dengan logo dan avatar.
  - **Floating Glass Bottom Dock**: Bar navigasi melayang ber-radius `16px` dengan efek `backdrop-filter: blur(16px)` di bawah layar ponsel.
  - Kartu link dan user otomatis beralih dari baris (*row*) menjadi kolom (*column*) pada layar kecil agar tidak terpotong.

---

## 5. Selektor Custom CSS Target (Public Profile)

Pengguna dapat menimpa gaya visual halaman profil mereka dengan menargetkan kelas-kelas CSS berikut pada editor **Custom CSS**:

| Selektor CSS | Elemen Target | Contoh Penggunaan |
| :--- | :--- | :--- |
| `.pohon-button` | Tombol link utama | Ubah border, shadow, hover effect, transisi |
| `.pohon-name` | Teks nama pemilik profil | Mengubah ukuran huruf, text-shadow, warna |
| `.pohon-bio` | Teks biografi profil | Menyesuaikan line-height, opacity, font-style |
| `.pohon-avatar` | Lingkaran foto profil | Menambahkan border neon glow atau animasi pulse |
| `.pohon-heading` | Blok teks heading pemisah | Menyesuaikan letter-spacing, uppercase text |
| `.pohon-text` | Blok teks deskripsi paragraf | Mengatur alignment teks, margin |
| `.pohon-html-block` | Blok Custom HTML per-link | Membungkus widget musik/iframe |
| `.pohon-global-html`| Custom HTML global profil | Banner alert pengumuman atas |
| `.pohon-footer` | Footer bawah halaman | Mengatur jarak dan transparansi |

---

## 6. Theme Presets Bawaan

| Preset | Latar Belakang | Warna Kartu | Warna Teks | Nuansa |
| :--- | :--- | :--- | :--- | :--- |
| **Dark (Default)** | `#0a0a0a` | `#161616` | `#f0ece4` | Kontras tinggi, elegan |
| **Light** | `#f5f5f0` | `#ffffff` | `#111111` | Bersih, minimalis siang hari |
| **Forest** | `#0d1f0d` | `#162516` | `#d4f5d4` | Alami, hijau hutan mendalam |
| **Ocean** | `#050d1f` | `#0d1a2e` | `#d4eaf5` | Sejuk, biru samudra |
| **Purple** | `#0d0514` | `#1a0d24` | `#f0d4f5` | Artistik, ungu neon futuristik |
