# Laporan Harian Kegiatan Magang

**Proyek:** Website Klinik PKP (Perumahan & Kawasan Permukiman)  
**Tanggal:** *(sesuaikan dengan tanggal hari ini)*  
**Nama:** *(nama Anda)*  
**Pembimbing/Mentor:** *(nama mentor)*

---

## 1. Uraian Aktivitas

### A. Perbaikan Keamanan (Security Hardening)

| No | Aktivitas | File yang Diubah |
|----|-----------|------------------|
| 1 | Menambahkan verifikasi **CSRF token** di sisi server pada endpoint login — memastikan setiap request POST memiliki header `X-CSRF-Token` yang valid | `src/app/api/auth/login/route.ts` |
| 2 | Mengganti **mock authentication** (menerima semua kredensial) menjadi **demo mode** yang memvalidasi email, NIP, dan password terhadap kredensial yang dikonfigurasi via environment variable | `src/app/api/auth/login/route.ts` |
| 3 | Menghubungkan form login di frontend dengan API endpoint `/api/auth/login` menggunakan `fetch()` — sebelumnya hanya menampilkan toast placeholder tanpa memanggil API | `src/components/login/LoginPage.tsx` |
| 4 | Menambahkan **rate limit cleanup** (pembersihan otomatis setiap 5 menit) pada in-memory store di middleware dan login route untuk mencegah **memory leak** pada server yang berjalan lama | `src/middleware.ts`, `src/app/api/auth/login/route.ts` |
| 5 | Menambahkan penanganan error yang proper pada form login — response handling, redirect on success, dan error toast | `src/components/login/LoginPage.tsx` |

### B. Audit & Pembersihan Dead Code

| No | Dead Code yang Dihapus | Lokasi |
|----|------------------------|--------|
| 1 | Fungsi `getCsrfToken()` — tidak pernah diimport oleh modul lain | `src/lib/security.ts` |
| 2 | Fungsi `sanitizeSearchQuery()` — tidak pernah diimport oleh modul lain | `src/lib/security.ts` |
| 3 | Variabel `cspHeader` & `isDev` — sudah tidak digunakan karena CSP ditangani oleh middleware | `next.config.mjs` |
| 4 | Komponen `LazySection` — tidak pernah digunakan oleh halaman manapun | `src/components/shared/LazySection.tsx` (file dihapus) |
| 5 | Seluruh modul `api-security.ts` — 5 fungsi export, 0 consumer | `src/lib/api-security.ts` (file dihapus) |

### C. Verifikasi Build

- Menjalankan `npx next build` setelah semua perubahan — **build berhasil** tanpa error.

---

## 2. Pembelajaran yang Diperoleh

1. **CSRF (Cross-Site Request Forgery) Protection:**  
   Memahami bahwa CSRF token harus diverifikasi di **sisi server**, bukan hanya dikirim dari client. Tanpa verifikasi server-side, token hanya bersifat dekoratif dan tidak memberikan perlindungan nyata. Implementasinya minimal cukup memastikan header `X-CSRF-Token` ada dan memiliki panjang minimum.

2. **Anti-Enumeration pada Autentikasi:**  
   Pesan error login sebaiknya bersifat generik (misal: "Email, NIP, atau password salah") tanpa memberitahu field mana yang salah. Ini mencegah penyerang melakukan *user enumeration* untuk mengetahui akun mana yang terdaftar di sistem.

3. **Memory Leak pada In-Memory Rate Limiting:**  
   `Map` yang digunakan untuk menyimpan data rate limiting akan terus bertambah selama server berjalan. Tanpa mekanisme cleanup, map ini akan menghabiskan memori seiring waktu. Solusinya adalah menjalankan `setInterval` yang secara berkala menghapus entry yang sudah expired.

4. **Dead Code Audit:**  
   Belajar melakukan audit dead code secara sistematis — menelusuri setiap export lalu memeriksa apakah ada consumer yang mengimport-nya. Dead code menambah kompleksitas kode dan membingungkan developer lain.

5. **Demo Mode vs Mock Auth:**  
   Mock authentication yang menerima semua kredensial sangat berbahaya jika tidak sengaja terdeploy ke production. Pendekatan yang lebih aman adalah menggunakan *demo mode* dengan kredensial yang dikonfigurasi via environment variable, sehingga bisa dikontrol dan dinonaktifkan saat production.

---

## 3. Kendala yang Dialami

1. **Belum ada database backend:**  
   Saat ini autentikasi masih menggunakan demo mode (kredensial hardcoded/env variable) karena belum ada koneksi ke database. Untuk production, perlu integrasi dengan database menggunakan parameterized query dan password hashing (bcrypt).

2. **Rate limiting bersifat per-instance:**  
   In-memory rate limiting hanya berlaku per server instance. Pada deployment multi-instance (horizontal scaling), rate limiting tidak akan sinkron antar instance. Solusi jangka panjang membutuhkan Redis atau database terpusat.

3. **Tidak ada automated testing:**  
   Perubahan keamanan diverifikasi secara manual melalui build. Idealnya perlu dibuat unit test dan integration test untuk endpoint login dan middleware agar perubahan di masa depan tidak merusak fitur yang sudah berjalan.

---

## 4. Rencana Tindak Lanjut

- [ ] Integrasi database untuk autentikasi (mengganti demo mode)
- [ ] Implementasi password hashing dengan bcrypt
- [ ] Menambahkan unit test untuk login API route
- [ ] Menambahkan integration test untuk middleware security
- [ ] Mempertimbangkan Redis untuk rate limiting terpusat (multi-instance)

---

*Laporan ini dibuat sebagai dokumentasi kegiatan harian magang pada proyek Klinik PKP.*
