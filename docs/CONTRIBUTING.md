# CONTRIBUTING.md: Panduan Kontribusi Pohonlink

> Panduan standar kontribusi kode, pelaporan issue, dan alur kerja pengembangan open source platform Pohonlink di bawah ekosistem DGXO.

---

## 1. Alur Kerja Kontribusi (Contribution Workflow)

1. **Fork Repositori**: Buat salinan (*fork*) repositori resmi [https://github.com/DGameXO/pohonlink](https://github.com/DGameXO/pohonlink) ke akun GitHub Anda.
2. **Buat Branch Fitur**: Buat cabang kerja baru dari branch `main`:
   ```bash
   git checkout -b feat/nama-fitur-anda
   ```
3. **Patuhi Standar Lingkungan**:
   - Salin `.env.example` ke `.env.local` untuk konfigurasi pengujian lokal.
   - Dilarang menambahkan nilai rahasia (API key, password, token) ke file yang di-commit.
4. **Jalankan Pengujian Lokal**:
   - Pastikan `pnpm lint` dan `pnpm typecheck` lolos tanpa error.
   - Pastikan proses `pnpm build` berhasil.
5. **Kirimkan Pull Request (PR)**:
   - Berikan deskripsi yang jelas mengenai perubahan yang dilakukan.
   - Sertakan bukti verifikasi dinamis (minimal 2 input berbeda).

---

## 2. Standar Pesan Commit (Conventional Commits)

Setiap pesan commit wajib mengikuti format [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <deskripsi singkat perubahan>
```

### Prefix yang Diizinkan:
- `feat:`: Penambahan fitur atau fungsionalitas baru.
- `fix:`: Perbaikan bug atau celah keamanan.
- `refactor:`: Restrukturisasi kode tanpa mengubah perilaku fungsional.
- `chore:`: Pembaruan konfigurasi, dependensi, atau dependensi build.
- `docs:`: Penambahan atau perbaikan berkas dokumentasi.
- `style:`: Perubahan format tampilan antarmuka tanpa menyentuh logika kode.

Contoh commit yang valid:
- `feat: add dynamic QR code export for public profile`
- `fix: prevent duplicate username registration race condition`
- `docs: update deployment guidelines and testing checklist`

---

## 3. Kebijakan Atribusi Kontributor (Credit Policy)

Ketentuan atribusi kontributor Pohonlink:
1. **Dilarang Menaruh Kredit di Main UI**: Atribusi kontributor atau ucapan terima kasih DILARANG ditaruh langsung di halaman utama UI (seperti banner atas, di bawah form input, atau footer utama).
2. **Penempatan di Modal About / Informasi**: Atribusi kontributor eksternal diletakkan secara elegan di dalam modal **About App** atau menu bantuan dengan format profesional:
   ```text
   Pohonlink Biolink Platform
   Engine: DGXO
   Contributors: @username
   ```
3. **Larangan Teks "Made with"**: Footer resmi hanya memuat informasi brand DGXO dan hak cipta resmi tanpa teks tambahan seperti "Made with love".

---

## 4. Aturan Kualitas Kode

- **Zero Any**: Dilarang keras menggunakan tipe `any` pada kode TypeScript.
- **Zero Fake Policy**: Dilarang menggunakan mock atau data tiruan statis untuk menyamarkan kegagalan sistem.
- **Larangan Karakter Em Dash (U+2014)**: Dilarang menggunakan karakter em dash di teks UI, komentar kode, dokumen, dan commit message. Gunakan tanda minus (`-`) atau titik dua (`:`).
- **A11y**: Sertakan atribut `aria-label` pada seluruh tombol atau kontrol interaktif.
