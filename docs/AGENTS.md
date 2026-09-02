# Developer & Coding Assistant Guide: Pohonlink

Panduan teknis dan standar pengembangan untuk platform **Pohonlink**.

---

## 1. Ikhtisar Proyek & Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Bahasa**: TypeScript (Strict mode, zero `any`)
- **Styling**: Tailwind CSS v4 + Lucide React + Simple Icons
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **Package Manager**: pnpm

---

## 2. Perintah Pengembangan

```bash
pnpm dev          # Menjalankan development server
pnpm build        # Build produksi
pnpm start        # Menjalankan server produksi
pnpm lint         # Menjalankan ESLint
pnpm typecheck    # Menjalankan verifikasi tipe TypeScript (tsc --noEmit)
```

---

## 3. Standar Penulisan Kode

### A. Komponen & Arsitektur
- Gunakan **Server Components** secara default. Tambahkan `'use client'` hanya saat komponen membutuhkan event listener, state, atau hook browser.
- Seluruh kueri database Supabase wajib dipisahkan ke dalam `src/lib/db/queries.ts` atau Server Actions di `src/app/actions.ts`. Jangan menaruh kueri langsung di dalam berkas tampilan JSX.
- Sanitasi setiap URL yang bersumber dari input pengguna menggunakan `sanitizeUrl()` dan konten HTML menggunakan `sanitizeHtml()` di `src/lib/utils.ts`.

### B. Keamanan & Kredensial
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh diakses di sisi server (Server Actions & API Routes). Dilarang mengekspos kunci ini ke browser.
- Semua mutasi database wajib memverifikasi kepemilikan data (`eq('user_id', user.id)`).
- Operasi administratif wajib melalui verifikasi peran (`role === 'admin'`).

### C. Responsif & Aksesibilitas
- Desain antarmuka mengutamakan tampilan seluler (*mobile-first*).
- Seluruh tombol dan elemen interaktif wajib memiliki atribut `aria-label` yang jelas.
