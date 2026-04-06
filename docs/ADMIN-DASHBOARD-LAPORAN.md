# Laporan Admin Dashboard Klinik PKP

Terakhir diperbarui: 1 April 2026

## Ringkasan

Dashboard admin Klinik PKP saat ini sudah diposisikan sebagai lapisan administrasi yang tipis dan lebih aman. Source of truth utama berada di backend, sedangkan Next.js admin layer berfungsi untuk:

- autentikasi admin berbasis JWT + cookie
- proteksi route dan CSRF
- proxy request mutasi resource ke backend
- menampilkan direktori pengguna backend
- mencatat audit log sesi server aktif

Fitur admin lama yang bergantung pada file JSON lokal sudah dihapus agar tidak menimbulkan dua sumber data yang saling bertentangan.

## Keputusan Arsitektur yang Berlaku

### 1. Model Role

Role backend yang dipakai aplikasi sekarang:

- `admin`
- `user`

Aturan akses:

- hanya `admin` yang boleh login ke `/admin`
- `user` boleh tetap ada di backend dan tampil pada direktori pengguna
- `user` tidak boleh membuat session dashboard admin

### 2. Source of Truth Data

Pembagian source of truth saat ini:

- backend API:
  - users
  - bsps
  - rusun
  - kawasan kumuh
  - bank desain
  - sosialisasi
- frontend static content:
  - FAQ
  - peraturan
  - perizinan
  - bahan bangunan
  - kontak dan lokasi klinik
- Next.js in-memory store:
  - audit log sesi admin aktif

### 3. Yang Sudah Dihapus

Bagian berikut sudah dihapus karena redundant atau menyesatkan:

- `data/admin/users.json`
- `data/admin/informasi.json`
- `data/admin/settings.json`
- `data/admin/audit.json`
- CRUD admin lokal untuk users/settings/informasi
- route admin yang hanya menulis ke file lokal

## Alur Login Admin

1. Halaman login meminta CSRF token ke `GET /api/auth/csrf`.
2. User mengisi `email`, `nip`, dan `password`.
3. NIP divalidasi di client dan server agar **tepat 18 digit**.
4. `POST /api/auth/login` memverifikasi:
   - payload valid
   - CSRF token valid
   - rate limit login
   - fallback admin lokal dari environment variable bila tersedia
   - atau autentikasi backend berhasil melalui `POST /api/v1/authentications`
5. Role backend dinormalisasi.
6. Hanya role `admin` yang diterima untuk dashboard admin.
7. Access token dan refresh token disimpan pada `httpOnly cookie`.
8. Session lokal juga menyimpan `backend access token` agar route admin dapat meneruskan request terproteksi ke backend.
9. Setelah login backend berhasil, aplikasi mengambil profil user dari `GET /api/v1/users/me`.
10. Layout `/admin` mengecek cookie dan menolak session yang tidak valid.

## Endpoint Admin yang Aktif

### Auth

- `/api/auth/csrf`
- `/api/auth/login`
- `/api/auth/logout`

### Monitoring / Admin Layer

- `/api/admin/audit`
- `/api/admin/users`
- `/api/admin/resources/[resource]`
- `/api/admin/resources/[resource]/[id]`

Catatan:

- `/api/admin/users` sekarang read-only dan mengambil data dari backend `/api/v1/users`.
- Mutasi resource admin seperti BSPS, rusun, kawasan kumuh, bank desain, dan sosialisasi dilakukan lewat route proxy `/api/admin/resources/*`.

## File Kunci

File inti yang sekarang menjadi referensi utama:

```text
src/app/api/auth/csrf/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/admin/users/route.ts
src/app/api/admin/audit/route.ts
src/app/api/admin/resources/[resource]/route.ts
src/app/api/admin/resources/[resource]/[id]/route.ts
src/lib/auth.ts
src/lib/admin/security.ts
src/lib/admin/service.ts
src/lib/admin/backend-api.ts
src/lib/admin/audit-log.ts
src/lib/admin-client.ts
src/components/login/LoginPage.tsx
src/app/admin/users/page.tsx
```

## Keamanan yang Sudah Diterapkan

- JWT signed token dengan `jose`
- `httpOnly cookie` untuk token
- CSRF token untuk login dan mutasi admin
- rate limiting login
- input sanitization
- validasi schema berbasis Zod
- allowlist path untuk `/api/ext/*`
- middleware security headers + CSP
- admin-only guard untuk dashboard dan mutasi resource
- bridge token backend untuk route yang membutuhkan `Authorization: Bearer`

## Kondisi Saat Ini per Modul

### Users

- data diambil dari backend
- bersifat read-only di dashboard
- dipakai untuk monitoring user backend

### BSPS / Rusun / Kawasan Kumuh / Bank Desain / Sosialisasi

- data utama berasal dari backend
- halaman admin melakukan create/update/delete melalui proxy admin resource

### Informasi dan Settings

- modul admin lokal sudah dihapus
- informasi publik tetap dikelola sebagai konten statis frontend
- settings dinyatakan statis, bukan dynamic admin-managed data

## Environment yang Wajib Dipahami

Konfigurasi minimum:

```env
API_URL=http://localhost:8000/api/v1
JWT_SECRET=isi-dengan-secret-minimal-32-karakter
```

Fallback admin lokal opsional:

```env
ADMIN_NAME=Administrator Klinik PKP
ADMIN_EMAIL=admin@klinikpkp.go.id
ADMIN_NIP=199001012020000001
ADMIN_PASSWORD=isi-password-admin-kuat
```

Konfigurasi opsional untuk auth backend:

```env
AUTH_API_URL=
AUTH_API_PATH=/authentications
```

Gunakan `AUTH_API_URL` atau `AUTH_API_PATH` jika endpoint auth backend tidak berada di path default yang dicoba aplikasi. Berdasarkan dokumentasi backend proyek, default login path adalah `POST /api/v1/authentications`.

## Known Limitations

- audit log masih in-memory, jadi belum persisten lintas restart server
- login admin tetap bergantung pada endpoint auth backend yang valid
- bila `API_URL` menggunakan ngrok dan URL expired, login dan fetch backend akan gagal

## Rekomendasi Tahap Lanjut

Urutan pengembangan berikut yang disarankan:

1. pindahkan audit log ke backend/database resmi
2. dokumentasikan endpoint auth backend secara resmi di `API_DOCUMENTATION.md`
3. tambahkan health check khusus untuk dependency backend auth
4. tambah observability untuk error auth dan proxy admin

## Kesimpulan

Dashboard admin sekarang lebih selaras dengan praktik produksi dibanding versi sebelumnya karena:

- tidak lagi memakai file JSON lokal sebagai storage bayangan
- tidak lagi mengizinkan role selain admin masuk ke dashboard
- memiliki aturan NIP yang konsisten
- lebih jelas membedakan data backend, konten statis, dan state sesi server

Dokumen ini harus dipakai sebagai referensi utama untuk memahami status admin dashboard saat ini.
