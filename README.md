# Pohonlink

> Your single link for everything. Modern biolink platform built for speed.

Pohonlink adalah platform biolink modern berkecepatan tinggi yang dibangun dari nol menggunakan Next.js App Router dan Supabase. Dibuat sebagai alternatif modern dan efisien untuk menggantikan solusi biolink berbasis PHP tradisional, Pohonlink memberikan waktu muat instan (sub-50ms TTFB), tracking klik tanpa jeda redirect, dan kustomisasi visual bertema Dark-Brutalist.

---

## Fitur Utama

- **Instant Public Profiles**: Halaman biolink publik di `/@username` dirender di sisi server (SSR Server Components) dengan TTFB < 50ms.
- **Zero-Delay Beacon Tracking**: Pelacakan klik dan tayangan halaman asinkron via Beacon API tanpa memperlambat redirect pengguna.
- **Link Management Lengkap**: Tambah, edit, hapus, pin, aktifkan/nonaktifkan, dan susun urutan link secara fleksibel dengan drag-and-drop (@dnd-kit).
- **Theme Customizer**: Kustomisasi warna latar, kartu link, warna teks, sudut tombol, font, serta unggah avatar dan background secara instan dengan preview real-time.
- **Dashboard & Analytics**: Metrik pageview total, klik per link, breakdown OS, dan referrer pengunjung tanpa ketergantungan tracker pihak ketiga.
- **Admin Control Panel**: Manajemen pengguna terpusat, fitur blokir/unblokir akun, penghapusan data, dan impersonation untuk dukungan teknis.
- **Healthcheck & PWA Ready**: Endpoint `/api/ping` standar DGXO, manifest PWA standalone, serta konfigurasi SEO robots.txt dan sitemap.xml.

---

## Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| Framework | Next.js 16+ (App Router, Server Components, Server Actions) |
| Language | TypeScript (Strict mode, Zero `any`) |
| Styling | Tailwind CSS + Desain Dark-Brutalist DGXO |
| Database & Auth | Supabase (PostgreSQL 15+, Row Level Security, Supabase Auth) |
| File Storage | Supabase Storage (`avatars` dan `backgrounds` buckets) |
| Analytics | In-house logging via Supabase RPC & `analytics_events` (SHA-256 IP hash) |
| Icons | Lucide React + Simple Icons |
| Package Manager | pnpm |

---

## Cara Install & Menjalankan

### 1. Prasyarat
- Node.js versi 20 atau lebih baru
- pnpm (`npm install -g pnpm`)
- Akun dan project Supabase aktif

### 2. Instalasi Dependensi
```bash
git clone https://github.com/DDGXO/pohonlink.git
cd pohonlink
pnpm install
```

### 3. Konfigurasi Environment
Salin berkas contoh environment:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan lengkapi konfigurasi berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Pohonlink
```

### 4. Eksekusi Skema Basis Data
Jalankan skema SQL yang terdapat pada berkas [ARCHITECTURE.md](ARCHITECTURE.md) melalui Supabase SQL Editor untuk membuat tabel, trigger, enum, RLS policy, dan fungsi RPC `track_link_click`.

### 5. Menjalankan Server Pengembangan
```bash
pnpm dev
```
Akses aplikasi melalui peramban di `http://localhost:3000`.

### 6. Build Produksi
```bash
pnpm build
pnpm start
```

---

## Dokumentasi Proyek

Dokumentasi lengkap standar DGXO tersedia pada repositori ini:
- [AGENTS.md](AGENTS.md): Panduan instruksi untuk AI coding agent.
- [PLANNING.md](PLANNING.md): Visi proyek, arsitektur, constraints, dan metrik keberhasilan.
- [TASK.md](TASK.md): Checklist pelacakan fase pengembangan dan cursor kerja.
- [DECISIONS.md](DECISIONS.md): Log keputusan arsitektur terkunci (append-only).
- [CHANGELOG.md](CHANGELOG.md): Riwayat rilis dan catatan pembaruan versi.
- [VERSIONING.md](VERSIONING.md): Standar penomoran versi (Odometer style) dan SOP rilis git tag DGXO.
- [CONVENTIONS.md](CONVENTIONS.md): Standar penulisan kode, error handling, dan penamaan.
- [SCOPE.md](SCOPE.md): Cakupan fitur in-scope v1.0.0 dan fitur yang ditunda.
- [ARCHITECTURE.md](ARCHITECTURE.md): Diagram alur arsitektur, skema DB, RLS, dan storage.
- [SECURITY.md](SECURITY.md): Kebijakan keamanan dan pelaporan kerentanan.
- [TESTING.md](TESTING.md): SOP verifikasi dinamis 2 input dan strategi pengujian.
- [DESIGN.md](DESIGN.md): Panduan visual Dark-Brutalist dan palet Neon Mint.
- [CONTRIBUTING.md](CONTRIBUTING.md): Panduan kontribusi open source ekosistem DGXO.

---

## Lisensi & Hak Cipta

Powered by DGXO | Open Source under MIT License
