## 1. Ringkasan Proyek

Klinik PKP adalah frontend Next.js untuk layanan informasi dan pengelolaan data Perumahan dan Kawasan Permukiman. Aplikasi ini memiliki 2 area besar:

- Area publik untuk masyarakat, berisi landing page, peta tematik, bank desain, sosialisasi, dan halaman informasi.
- Area admin untuk login, monitoring, dan CRUD data konten.

Domain data utama yang saat ini sudah dipakai:

- Sebaran Rusun
- Kawasan Kumuh
- Penerimaan BSPS
- Bank Desain
- Sosialisasi Klinik PKP
- Informasi statis
- Dashboard Admin dan Control Users

## 2. Tech Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 4 |
| Primitive UI | Radix UI |
| State server/client cache | TanStack Query |
| Validasi | Zod |
| Peta | Leaflet |
| Auth token | `jose` |
| Theme | `next-themes` |
| Icon | `lucide-react` |

## 3. Cara Menjalankan Proyek

### Prasyarat

- Node.js modern yang kompatibel dengan Next.js 16
- `npm`
- Backend API yang bisa diakses dari nilai `API_URL`

### Setup awal

```bash
npm install
```

Salin environment:

```bash
cp .env.example .env.local
```

Jika memakai PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### Jalankan development server

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:3000
```

### Script yang tersedia

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server di port 3000 |
| `npm run dev:turbo` | Alias dev server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan hasil build di port 3000 |
| `npm run lint` | Menjalankan ESLint |
| `npm run lint:fix` | Menjalankan ESLint dengan auto-fix |

### Rekomendasi alur lokal

```bash
npm install
npm run lint
npm run dev
```

Jika ingin memastikan siap deploy:

```bash
npm run build
```

## 4. Environment Variable

Sumber acuan saat ini adalah `.env.example`.

| Variable | Wajib | Fungsi |
| --- | --- | --- |
| `JWT_SECRET` | Ya | Secret untuk sign dan verify JWT cookie admin. Minimal 32 karakter. |
| `ADMIN_NAME` | Tidak | Nama admin fallback lokal jika auth backend belum tersedia. |
| `ADMIN_EMAIL` | Tidak | Email admin fallback lokal. |
| `ADMIN_NIP` | Tidak | NIP admin fallback lokal. Harus 18 digit. |
| `ADMIN_PASSWORD` | Tidak | Password admin fallback lokal. |
| `NEXT_PUBLIC_APP_NAME` | Tidak | Nama aplikasi publik. |
| `NEXT_PUBLIC_APP_URL` | Ya | Base URL frontend, biasanya `http://localhost:3000`. |
| `API_URL` | Ya | Base URL backend API server-side, contoh `http://103.197.190.87/api/v1`. |
| `AUTH_API_URL` | Tidak | Override penuh URL login backend jika suatu hari endpoint auth pindah. |
| `AUTH_API_PATH` | Tidak | Path auth backend relatif terhadap `API_URL`, default `/authentications`. |

### Catatan penting env

- Browser tidak pernah mengakses `API_URL` langsung. Semua request publik lewat `/api/ext/*`.
- `JWT_SECRET` dipakai untuk cookie session admin.
- Login admin mendukung fallback lokal melalui env bila backend auth belum siap.
- Jangan commit `.env.local`.

## 5. Gambaran Arsitektur

### Struktur top-level

```text
.
|-- public/
|-- src/
|-- docs/
|-- .env.example
|-- next.config.mjs
|-- tailwind.config.mjs
|-- eslint.config.mjs
|-- package.json
```

### Fungsi folder dan file penting

| Path | Fungsi |
| --- | --- |
| `public/` | Asset statis seperti logo dan gambar layanan |
| `src/app/` | Seluruh route App Router: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` |
| `src/components/` | UI reusable, komponen layout, komponen per fitur, dan area admin |
| `src/hooks/` | Stateful logic per fitur dan per area admin |
| `src/services/` | Fetch + transform data resource publik |
| `src/lib/` | Utility lintas layer, auth, security, admin helper, dan server helper |
| `src/content/` | Konten statis untuk halaman informasi dan landing |
| `src/types/` | Shared types lintas fitur |
| `src/proxy.ts` | Proxy/middleware utama untuk proteksi route, CSP, security headers, rate limiting, dan allowlist `/api/ext/*` |
| `next.config.mjs` | Konfigurasi Next.js, remote images, header tambahan, optimize package imports |
| `docs/` | Dokumen pendukung lama. README ini sekarang menjadi sumber utama onboarding. |

### Struktur `src/`

```text
src/
|-- app/
|   |-- admin/
|   |-- api/
|   |-- bank-desain/
|   |-- berita/
|   |-- informasi/
|   |-- login/
|   |-- kawasan-kumuh/
|   |-- lokasi-klinik/
|   |-- penerimaan-bsps/
|   |-- sebaran-rusun/
|   |-- sosialisasi-klinik-pkp/
|-- components/
|   |-- admin/
|   |-- bank-desain/
|   |-- berita/
|   |-- informasi/
|   |-- kawasan-kumuh/
|   |-- landing/
|   |-- layout/
|   |-- lokasi-klinik/
|   |-- login/
|   |-- penerimaan-bsps/
|   |-- providers/
|   |-- sebaran-rusun/
|   |-- shared/
|   |-- sosialisasi-pkp/
|   |-- ui/
|-- content/
|-- hooks/
|   |-- admin/
|   |-- auth/
|   |-- bank-desain/
|   |-- berita/
|   |-- kawasan-kumuh/
|   |-- penerimaan-bsps/
|   |-- sebaran-rusun/
|   |-- sosialisasi/
|-- lib/
|   |-- admin/
|   |-- server/
|-- services/
|-- types/
```

### Fungsi masing-masing folder inti di `src/`

| Folder | Fungsi |
| --- | --- |
| `src/app` | Routing, layout, loading state, error boundary, dan API route internal |
| `src/components/ui` | Primitive reusable seperti button, dialog, input, select, toast |
| `src/components/layout` | Navbar, footer, menu, dan shell layout publik |
| `src/components/shared` | Komponen lintas fitur seperti skeleton, pagination, API state, map helper UI |
| `src/components/<fitur>` | UI spesifik satu domain fitur |
| `src/components/admin` | Shell admin, sidebar, topbar, data table, dialog, dan halaman admin |
| `src/hooks/<fitur>` | Logic halaman, filter, map state, React Query, derived state |
| `src/hooks/admin` | Shared CRUD logic admin, controller per modul admin |
| `src/hooks/auth` | Logic login dan forgot password |
| `src/services` | Konversi respons backend dari snake_case ke format frontend camelCase |
| `src/lib` | Utility umum, constants, validations, auth, security, map helpers |
| `src/lib/admin` | Helper admin server-side, role, audit, backend proxy, form helper |
| `src/lib/server` | Helper server-only untuk backend config, auth strategy, HTTP util, rate limit |
| `src/content` | Data statis untuk halaman informasi dan landing |
| `src/types` | Tipe API umum dan tipe admin yang dipakai lintas module |

## 6. Aturan Penempatan File

Gunakan aturan ini agar struktur tetap konsisten:

### Untuk route baru

- Taruh route entry di `src/app/<route>/page.tsx`
- Tambahkan `loading.tsx` jika ada fetch berat atau lazy loading
- Tambahkan `loader.tsx` jika page client cukup berat dan ingin di-split
- Jangan menaruh business logic panjang di `page.tsx`

### Untuk UI baru

- Taruh di `src/components/<fitur>/` jika hanya dipakai satu fitur
- Naikkan ke `src/components/shared/` hanya jika benar-benar dipakai lintas fitur
- Taruh primitive reusable di `src/components/ui/`

### Untuk hook baru

- Taruh logic stateful reusable di `src/hooks/`
- Taruh logic domain-specific di `src/hooks/<fitur>/`
- Untuk admin CRUD, prioritaskan `src/hooks/admin/`

### Untuk akses data

- Resource publik: `src/services/<fitur>.service.ts`
- Admin server helper: `src/lib/admin/*`
- Server-only config/helper: `src/lib/server/*`

### Untuk tipe

- Tipe lintas fitur simpan di `src/types/`
- Tipe lokal cukup simpan dekat modulnya

## 7. Alur Data Aplikasi

### Alur publik

```text
Browser
-> hooks/<fitur>
-> services/<fitur>.service.ts
-> lib/api-client.ts
-> /api/ext/*
-> src/app/api/ext/[...path]/route.ts
-> API_URL backend
```

### Alur admin untuk list data konten

Modul admin konten seperti BSPS, Rusun, Kumuh, Bank Desain, dan Sosialisasi saat membaca list masih banyak memakai service publik yang sama.

```text
Admin page
-> hooks/admin/use-admin-<fitur>-page.tsx
-> services/<fitur>.service.ts
-> /api/ext/*
-> backend
```

### Alur admin untuk create/update/delete

```text
Admin page
-> hooks/admin/*
-> lib/admin-client.ts
-> /api/admin/resources/<resource> atau /api/admin/users/*
-> authorizeAdminRequest()
-> lib/admin/* helper
-> backend
```

### Alur autentikasi admin

```text
GET /api/auth/csrf
-> client simpan CSRF token

POST /api/auth/login
-> validasi Zod
-> verifikasi CSRF
-> server rate limit
-> auth backend atau fallback env
-> verifikasi user role admin
-> set cookie JWT access + refresh
-> redirect ke /admin
```

## 8. Daftar Route Frontend

### Route publik

| Route | Fungsi |
| --- | --- |
| `/` | Landing page utama. Memuat hero, daftar layanan, indikator, langkah pembangunan, dan about section. |
| `/lokasi-klinik` | Menampilkan alamat, kontak, jam layanan, dan peta Leaflet lokasi Klinik PKP. |
| `/sebaran-rusun` | Peta interaktif sebaran rusun lengkap dengan sidebar, filter wilayah, pencarian, dan pagination. |
| `/kawasan-kumuh` | Peta dan data kawasan kumuh dengan filter tahun, status, wilayah, dan statistik penduduk. |
| `/penerimaan-bsps` | Halaman BSPS berisi peta lokasi penerima, persyaratan, prosedur, kriteria, dan CTA. |
| `/bank-desain` | Katalog desain rumah/rusun, filter desain, preview gambar, dan download file desain. |
| `/sosialisasi-klinik-pkp` | Halaman sosialisasi berisi peta, jadwal kegiatan, dan berita sosialisasi. |
| `/sosialisasi-klinik-pkp/berita/[id]` | Route kanonis untuk detail berita sosialisasi. Menerima ID numerik. |
| `/informasi` | Redirect ke `/informasi/tentang`. |
| `/informasi/tentang` | Halaman profil singkat Klinik PKP/BP3KP. |
| `/informasi/kontak` | Informasi kontak dan jalur konsultasi. |
| `/informasi/faq` | Daftar pertanyaan umum seputar layanan, BSPS, rusun, dan kawasan kumuh. |
| `/informasi/bahan-bangunan` | Informasi material bangunan dan standar singkat. |
| `/informasi/perizinan` | Informasi perizinan yang relevan. |
| `/informasi/peraturan` | Daftar referensi regulasi dan tautan terkait. |
| `/berita` | Redirect ke `/sosialisasi-klinik-pkp`. |
| `/berita/[id]` | Redirect ke route detail kanonis `/sosialisasi-klinik-pkp/berita/[id]`. |
| `/login` | Halaman login admin. Jika sudah login akan diarahkan ke `/admin`. |
| `/login/forgot-password` | Halaman pengajuan lupa password. UI tersedia, tetapi flow backend masih perlu dipastikan end-to-end. |

### Route admin

| Route | Fungsi |
| --- | --- |
| `/admin` | Dashboard overview admin: external stats, preview user, dan aktivitas terbaru. |
| `/admin/sosialisasi` | Redirect ke `/admin/sosialisasi/lokasi`. |
| `/admin/sosialisasi/lokasi` | CRUD data titik/lokasi sosialisasi untuk kebutuhan peta publik. |
| `/admin/sosialisasi/jadwal` | CRUD jadwal kegiatan sosialisasi. |
| `/admin/sosialisasi/berita` | Upload atau perbarui gambar berita untuk kegiatan sosialisasi yang sudah selesai. |
| `/admin/bsps` | CRUD data BSPS. |
| `/admin/rusun` | CRUD data rusun dan file/gambar terkait. |
| `/admin/kawasan-kumuh` | CRUD data kawasan kumuh. |
| `/admin/bank-desain` | CRUD bank desain, gambar, dan file desain. |
| `/admin/users` | CRUD user dashboard admin dan audit terkait user. |
| `/admin/berita` | Redirect ke `/admin/sosialisasi/berita`. |
| `/admin/lokasi-klinik` | Redirect ke `/admin/sosialisasi/lokasi`. |

### Route API internal yang dipakai frontend

| Route | Fungsi |
| --- | --- |
| `/api/health` | Health check sederhana. |
| `/api/ext/[...path]` | Proxy publik ke backend dengan timeout, normalisasi error, dan allowlist path. |
| `/api/auth/csrf` | Menghasilkan token CSRF untuk login dan request admin yang mengubah data. |
| `/api/auth/login` | Login admin. |
| `/api/auth/logout` | Logout admin dan clear cookie sesi. |
| `/api/admin/users` | List dan create user admin/dashboard. |
| `/api/admin/users/[id]` | Detail, update, delete user admin/dashboard. |
| `/api/admin/resources/[resource]` | Create resource admin generik (`bsps`, `kumuh`, `rusun`, `bank-desain`, `sosialisasi`). |
| `/api/admin/resources/[resource]/[id]` | Update dan delete resource admin generik. |
| `/api/admin/audit` | Mengambil audit log admin yang tersimpan di memori server. |

## 9. Cara Menggunakan Dashboard Admin

### Login admin

1. Buka `/login`
2. Isi `email`
3. Isi `NIP` 18 digit
4. Isi `password`
5. Submit form
6. Jika sukses, user diarahkan ke `/admin` atau ke path `redirect` bila sebelumnya tertahan di route protected

### Modul yang tersedia di sidebar

| Modul | Fungsi operasional |
| --- | --- |
| Dashboard | Melihat ringkasan statistik, preview user, dan aktivitas terbaru |
| Sosialisasi > Info Peta | Menambah, mengubah, menghapus titik kegiatan sosialisasi |
| Sosialisasi > Jadwal Kegiatan | Mengelola jadwal kegiatan dan waktu pelaksanaan |
| Sosialisasi > Berita Sosialisasi | Mengunggah gambar dokumentasi untuk kegiatan yang sudah selesai |
| Penerimaan BSPS | Mengelola data BSPS |
| Sebaran Rusun | Mengelola data rusun |
| Kawasan Kumuh | Mengelola data kawasan kumuh |
| Bank Desain | Mengelola desain, gambar, dan file desain |
| Control Users | Mengelola akun admin/user internal |

### Pola umum penggunaan admin

- Tombol `Tambah ...` akan membuka `AdminFormDialog`
- Tombol `Edit` membuka dialog dengan nilai awal dari item terpilih
- Tombol `Hapus` meminta konfirmasi browser lalu menghapus data
- Table mendukung search, sort, pagination, dan aksi per baris
- Beberapa page menyediakan `publicHref` agar admin bisa melihat hasil di halaman publik
- Query string `?create=1` akan otomatis membuka form create pada page admin yang mendukung create intent

### Catatan khusus per modul

- Sosialisasi `berita` bukan membuat entri baru dari nol. Data berita diambil dari kegiatan sosialisasi yang sudah selesai dan punya deskripsi, lalu admin mengunggah 1-3 gambar.
- `rusun`, `bank-desain`, dan `sosialisasi` memakai `FormData` karena mendukung upload file/gambar.
- `bsps` dan `kawasan-kumuh` memakai payload JSON.
- `Control Users` hanya bisa diakses oleh role admin.

### Logout

- Klik avatar/profile di kanan atas
- Pilih `Keluar`
- Frontend memanggil `/api/auth/logout`, menghapus cookie, lalu redirect ke `/login`

## 10. Autentikasi Admin

Implementasi auth admin saat ini:

- Session memakai JWT berbasis cookie
- Access token disimpan di cookie `klinik-pkp-token`
- Refresh token disimpan di cookie `klinik-pkp-refresh`
- Access token berlaku 15 menit
- Refresh token berlaku 7 hari
- Cookie bersifat `httpOnly`
- Cookie `secure` aktif di production
- `sameSite` access/refresh memakai `lax`
- CSRF cookie terpisah memakai `sameSite=strict`

### Flow auth yang dipakai

1. Client me-request CSRF token ke `/api/auth/csrf`
2. Login page mengirim `email`, `nip`, `password`
3. Route login memvalidasi payload dengan Zod
4. Route memeriksa CSRF token dan rate limit
5. Server mencoba auth ke fallback env lokal terlebih dahulu jika cocok
6. Jika fallback tidak cocok, server lanjut ke auth backend
7. Setelah backend mengembalikan token, frontend memuat profil `users/me`
8. Hanya akun dengan role `admin` yang boleh membuat session dashboard
9. JWT access dan refresh diset sebagai cookie
10. `src/app/admin/layout.tsx` membaca cookie dan mem-protect seluruh dashboard admin

## 11. Security yang Digunakan

Security yang saat ini sudah terlihat di kode:

### Proxy dan route protection

- `src/proxy.ts` mem-protect route `/admin`
- user yang belum login akan diarahkan ke `/login?redirect=<path>`
- user yang sudah login dan membuka `/login` akan diarahkan ke `/admin`

### Content Security Policy dan headers

- CSP berbasis nonce di-generate per request
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` membatasi capability browser
- `X-Powered-By` dihapus

### Allowlist backend path

Request `/api/ext/*` tidak bebas. Hanya path backend yang di-allow melalui allowlist di `src/proxy.ts`, saat ini mencakup:

- `rusun`
- `uploads`
- `sosialisasi`
- `bank-desain`
- `kumuh`
- `bsps`
- `authentications`
- `users`
- `regions`
- `districts`
- `villages`

Jika ada endpoint backend baru, allowlist ini wajib diperbarui.

### CSRF

- Login admin dan request admin yang mengubah data memakai CSRF token
- Client memanaskan token dengan `ensureAdminCsrfToken` / `warmUpAdminCsrfToken`
- Server memverifikasi header `x-csrf-token` terhadap cookie `klinik-pkp-csrf`

### Rate limiting

- `src/proxy.ts` menerapkan rate limit pada `/api/ext/*`, `/api/auth/*`, dan request non-safe ke `/api/*`
- Login admin juga punya rate limit server-side
- Login dan forgot password juga punya rate limit client-side ringan
- Implementasi saat ini masih in-memory per instance server

### Validasi dan sanitasi

- Zod schema untuk login, forgot password, dan payload admin user
- Sanitasi `email`, `NIP`, input teks umum, dan URL
- Escaping HTML/attribute untuk popup Leaflet
- Validasi file upload di admin, termasuk jumlah file dan batas ukuran

### Authorization

- Hanya role `admin` yang bisa masuk dashboard saat ini
- Role check dipusatkan di `src/lib/admin/security.ts` dan `src/lib/admin/roles.ts`
- `authorizeAdminRequest()` dipakai oleh internal admin API routes

### Audit

- Mutasi admin membuat audit log non-blocking
- Audit saat ini disimpan in-memory melalui `src/lib/admin/audit-log.ts`
- Maksimum 200 entri tersimpan per instance

### Timeout dan error normalization

- Proxy publik punya timeout backend
- Error infrastruktur upstream dinormalisasi menjadi respons yang lebih ramah
- Route logout mencoba mengakhiri sesi backend, tetapi logout lokal tetap sukses walau backend gagal

## 12. Checklist Status Implementasi

### Fitur yang sudah berjalan di frontend

- [x] Landing page publik
- [x] Navbar, footer, dan navigasi layanan publik
- [x] Halaman `Lokasi Klinik`
- [x] Halaman `Sebaran Rusun`
- [x] Halaman `Kawasan Kumuh`
- [x] Halaman `Penerimaan BSPS`
- [x] Halaman `Bank Desain`
- [x] Halaman `Sosialisasi Klinik PKP`
- [x] Detail berita sosialisasi dengan route kanonis
- [x] Halaman informasi statis (`tentang`, `kontak`, `faq`, `bahan-bangunan`, `perizinan`, `peraturan`)
- [x] Login admin
- [x] Logout admin
- [x] Dashboard admin overview
- [x] CRUD admin untuk BSPS
- [x] CRUD admin untuk Rusun
- [x] CRUD admin untuk Kawasan Kumuh
- [x] CRUD admin untuk Bank Desain
- [x] CRUD admin untuk Sosialisasi lokasi dan jadwal
- [x] Upload gambar berita sosialisasi dari dashboard admin
- [x] CRUD admin untuk users
- [x] Internal proxy `/api/ext/*`
- [x] JWT cookie auth + CSRF + security headers

### Hal yang masih perlu diperhatikan / belum benar-benar final

- [ ] Flow `forgot password` belum dapat dinyatakan end-to-end siap sebelum endpoint backend dan allowlist `/api/ext/forgot-password` dipastikan ada
- [ ] Audit log masih in-memory, belum persisten ke database atau storage terpusat
- [ ] Rate limiting masih in-memory, belum distributed
- [ ] Belum ada test suite otomatis yang terlihat di repo saat ini

## 13. Panduan Menambah Fitur Baru

### Jika menambah fitur publik baru yang membaca data backend

1. Tentukan route baru di `src/app/<route>/page.tsx`
2. Buat komponen halaman di `src/components/<fitur>/`
3. Buat hook orchestration di `src/hooks/<fitur>/`
4. Buat service fetch + transform di `src/services/<fitur>.service.ts`
5. Gunakan `lib/api-client.ts` agar semua request tetap lewat `/api/ext/*`
6. Jika endpoint backend baru, tambahkan allowlist path di `src/proxy.ts`
7. Jika route cukup berat, tambahkan `loader.tsx` dan `loading.tsx`
8. Tambahkan item navigasi bila memang perlu tampil di navbar atau landing page

### Jika menambah fitur admin CRUD baru

1. Buat page admin tipis di `src/app/admin/<fitur>/page.tsx`
2. Buat implementasi UI di `src/components/admin/pages/`
3. Buat hook controller di `src/hooks/admin/`
4. Untuk list/read, pertimbangkan pakai service publik yang sudah ada bila endpoint sama
5. Untuk create/update/delete, gunakan internal admin API route
6. Tambahkan resource mapping jika perlu di `src/lib/admin/external-resource.ts`
7. Tambahkan validasi form di `src/lib/validations.ts` bila payload khusus
8. Tambahkan item sidebar di `src/components/admin/admin-sidebar-config.tsx`
9. Pastikan role check dan audit tetap konsisten

### Jika menambah field lokasi

Gunakan pola yang sudah ada:

- options kabupaten dari `fetchRegionOptions()`
- options kecamatan dari `fetchDistrictOptions(regionId)`
- options desa/kelurahan dari `fetchVillageOptions(districtId)`
- helper hook: `src/hooks/use-admin-location-options.ts`

### Jika menambah upload file

- Gunakan `FormData`
- Gunakan helper `validateFileField` di `src/lib/admin/form.ts`
- Simpan logika form di hook admin atau config form fitur
- Pastikan endpoint resource di `external-resource.ts` memakai `bodyMode: "form-data"`

## 14. Aturan Khusus Saat Maintenance

- Jangan bypass `/api/ext/*` langsung ke backend dari browser
- Jangan tambahkan endpoint backend baru tanpa update allowlist `src/proxy.ts`
- Jangan taruh logic berat di file route `page.tsx`
- Jangan naikkan komponen ke `shared` kalau masih spesifik satu fitur
- Untuk admin, utamakan reuse `useAdminCrud` jika pola CRUD-nya seragam
- Simpan helper server-only di `src/lib/server` atau `src/lib/admin`
- Kalau tipe hanya dipakai lokal, simpan dekat fitur; pindahkan ke `src/types` hanya bila dipakai lintas layer

## 15. File yang Paling Sering Perlu Dibuka Developer Baru

| File | Kenapa penting |
| --- | --- |
| `src/proxy.ts` | Security headers, route protection, rate limit, allowlist API |
| `src/app/layout.tsx` | Provider global: theme, query, tooltip, toaster |
| `src/lib/api-client.ts` | Entry point fetch publik |
| `src/lib/admin-client.ts` | Entry point fetch admin dari client |
| `src/lib/admin/security.ts` | Session user, CSRF, auth guard admin |
| `src/lib/server/auth-strategies.ts` | Fallback auth lokal dan auth backend |
| `src/lib/validations.ts` | Validasi input utama |
| `src/services/*.service.ts` | Transform data backend ke format frontend |
| `src/hooks/admin/use-admin-crud.ts` | Fondasi CRUD admin reusable |
| `src/components/admin/admin-sidebar-config.tsx` | Struktur menu dan route admin |

## 16. Catatan Penutup

Jika developer selanjutnya ingin menambahkan fitur, pola yang paling aman adalah:

```text
route tipis
-> komponen page
-> hook fitur
-> service/helper
-> internal proxy
-> backend
```

Untuk area admin, pertahankan prinsip ini:

```text
page admin tipis
-> komponen admin
-> hook admin
-> admin-client
-> internal admin API
-> backend
```

Selama pola itu dijaga, proyek ini akan tetap mudah dirawat walaupun modulnya terus bertambah.
