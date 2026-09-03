# 📦 DGXO Versioning & Git Tagging Standard
*Standar resmi penomoran versi, sinkronisasi file, dan prosedur rilis git tag untuk ekosistem DGXO.*

---

## 1. Struktur Versi (Odometer Style)
Format versi menggunakan tiga digit angka: `[MAJOR].[MINOR].[PATCH]`

*   **MAJOR**: Perubahan besar arsitektur (Contoh: Rombak total sistem core, konversi runtime).
*   **MINOR**: Penambahan fitur baru yang signifikan (Contoh: Fitur Linktree Parity, Media Embeds, Canvas Backgrounds).
*   **PATCH**: Perbaikan bug, optimasi kode, atau polesan UI ringan.

---

## 2. Aturan Kenaikan (The Overflow Rules)
Sistem ini menggunakan logika **Odometer (0-9)**. Jika sebuah digit mencapai batas maksimal (9) dan mendapat update, maka digit tersebut kembali ke 0 dan digit di sebelah kirinya bertambah 1.

### A. Aturan Patch (.0 - .9)
*   Update Patch dilakukan setiap kali ada perubahan kecil (Commit/Bugfix).
*   Jika posisi versi `X.X.9` dan ada 1 update Patch baru -> Versi menjadi `X.(X+1).0`.

### B. Aturan Minor (.0 - .9)
*   Dilakukan jika ada penambahan fitur fungsional baru.
*   Kenaikan angka Minor otomatis **me-reset** angka Patch menjadi **0**.
*   Jika posisi versi `X.9.X` dan ada update Minor baru -> Versi menjadi `(X+1).0.0`.

### C. Aturan Major
*   Dilakukan untuk perubahan fundamental sistem.
*   Kenaikan angka Major otomatis **me-reset** angka Minor dan Patch menjadi **0**.

---

## 3. Sinkronisasi Versi File (Sebelum Rilis)
Sebelum melakukan commit dan tagging, pastikan nomor versi diperbarui secara konsisten di berkas-berkas berikut:
1.  **`package.json`**: Update kolom `"version": "X.Y.Z"`
2.  **`CHANGELOG.md`**: Tambahkan entri release notes versi baru `[vX.Y.Z] - YYYY-MM-DD` di bagian teratas.

---

## 4. Prosedur Git Tagging (Mandatori SOP)
Setiap rilis pembaruan wajib menggunakan git tag dengan format versi: `vX.Y.Z`.

### A. Membuat / Mengganti Tag ke Commit Terbaru (Force-Update)
Jika ada komit baru pada versi yang sama, tag lokal harus diperbarui agar menunjuk ke commit terbaru:
```bash
git tag -fa vX.Y.Z -m "vX.Y.Z release"
```

### B. Push Tag Secara Paksa ke Remote GitHub
```bash
git push origin main
git push origin --tags -f
git push ddgxo main
git push ddgxo --tags -f
```

### C. Penyelarasan di Sisi Server (Production / VPS)
Di server produksi, agar Git bersedia menimpa tag lokal yang sudah ada tanpa error *(would clobber existing tag)*, gunakan parameter `-f` pada `fetch`:
```bash
git fetch -f --tags && git pull origin main
```

---

## 5. Tabel Simulasi Kenaikan Odometer
| Versi Awal | Jenis Update | Versi Baru | Keterangan |
| :--- | :--- | :--- | :--- |
| **0.2.0** | Minor Update | **0.3.0** | Penambahan fitur besar |
| **0.3.0** | 9x Patch | **0.3.9** | Kenaikan normal bugfix |
| **0.3.9** | 1x Patch | **0.4.0** | Patch Overflow -> Minor naik |
| **0.9.0** | 1x Minor | **1.0.0** | Minor Overflow -> Major naik |
| **0.9.9** | 1x Patch | **1.0.0** | Patch & Minor Overflow sekaligus |
