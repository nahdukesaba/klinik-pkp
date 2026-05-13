# Klinik PKP Frontend

Klinik PKP Frontend adalah aplikasi web untuk portal publik dan dashboard admin BP3KP Provinsi Sumatera Utara. Aplikasi ini dibangun dengan Next.js App Router dan menggunakan pola BFF (Backend For Frontend). Browser tidak memanggil backend Golang secara langsung; semua request melewati route internal Next.js di `src/app/api`.

## Status Singkat

- Performa: sudah memakai dynamic import untuk halaman peta/client-heavy, React Query cache, `keepPreviousData`, skeleton loading, endpoint service terpusat, dan `optimizePackageImports` di Next.js. Hasil akhir tetap perlu diuji dengan Lighthouse/Web Vitals di environment production.
- Privasi data sensitif: `API_URL`, secret JWT, dan helper server-only tidak masuk client bundle. Cookie session admin memakai HTTP-only cookie, mutasi admin memakai CSRF, dan request backend lewat BFF.
- Arsitektur: struktur sudah mengikuti clean architecture pragmatis untuk frontend Next.js, yaitu route tipis, UI di component, logic di hook, API call di service, dan server-only logic di route handler/lib server.
- Rendering: project ini hybrid. Route Next.js memakai Server Component/SSR by default, fitur interaktif memakai CSR, dan beberapa halaman informasi memakai `generateStaticParams` untuk SSG. Karena banyak halaman membaca data runtime/API, hasil build juga menampilkan route dynamic server-rendered on demand.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16.2.4 App Router |
| Runtime UI | React 19.2.4, React DOM 19.2.4 |
| Bahasa | TypeScript 6.0.2 |
| Styling | Tailwind CSS 4.2.2, PostCSS 8.5.14 |
| UI Primitive | Radix UI |
| Async State | TanStack React Query 5.95.2 |
| Form/Validasi | Zod 4.3.6 dan validasi ringan client-side |
| Peta | Leaflet 1.9.4 |
| Auth Token | jose 6.2.2 |
| Icon | lucide-react 1.7.0 |
| Utility UI | clsx, tailwind-merge, class-variance-authority |

## Cara Menjalankan

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Validasi sebelum deploy:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Jalankan production build:

```bash
npm run start
```

## Environment

Buat `.env.local` dari `.env.example`.

| Variable | Wajib | Fungsi |
| --- | --- | --- |
| `API_URL` | Ya | Base URL backend Golang. Hanya dipakai server Next.js/BFF. |
| `JWT_SECRET` | Ya | Secret untuk session admin frontend. Minimal 32 karakter. |
| `AUTH_API_URL` | Tidak | Full URL login backend jika berbeda dari default. |
| `AUTH_API_PATH` | Tidak | Path login backend. Default: `/authentications`. |

Jangan commit `.env.local`.

## Alur Rendering

```text
Server Component / SSR
-> route di src/app
-> render shell awal, metadata, layout

CSR
-> komponen interaktif: admin table, form, map, filter, upload, toast

SSG
-> halaman informasi statis yang memakai generateStaticParams
```

Kesimpulan: project ini bukan SSR murni, CSR murni, atau SSG murni. Modelnya hybrid sesuai kebutuhan halaman.

## Alur Request Publik

```text
Browser
-> component halaman
-> hook fitur
-> service fitur di src/services
-> src/lib/api-client.ts
-> /api/ext/*
-> src/app/api/ext/[...path]/route.ts
-> backend Golang
```

Kegunaan:

- Service menentukan endpoint dan transform response.
- `api-client.ts` membangun URL, timeout, retry, parsing response, dan error.
- `/api/ext/*` menjadi proxy publik agar `API_URL` tidak bocor ke browser.

## Alur Request Admin

```text
Browser admin
-> component admin
-> hook admin
-> service admin/domain
-> src/lib/admin-client.ts
-> /api/admin/*
-> route handler BFF
-> backend Golang
```

Kegunaan:

- `admin-client.ts` mengambil CSRF sebelum mutasi.
- Route handler `/api/admin/*` memverifikasi session dan meneruskan request ke backend.
- Backend tetap menentukan otorisasi final.

## Alur Auth

```text
Login page
-> auth service
-> GET /api/auth/csrf
-> POST /api/auth/login
-> backend auth
-> set HTTP-only cookie
-> masuk dashboard admin
```

File penting:

- `src/services/auth-endpoints.ts`: daftar endpoint auth internal.
- `src/services/auth-token.service.ts`: ambil CSRF dan refresh session.
- `src/services/auth.service.ts`: operasi login/logout/forgot password dari browser.
- `src/lib/auth.ts`: helper session frontend.
- `src/app/api/auth/*`: route handler auth BFF.

## Alur Membuat Feature Baru

Urutan yang dipakai:

1. Buat route tipis di `src/app/<nama-feature>/page.tsx`.
2. Buat komponen halaman di `src/components/<nama-feature>`.
3. Buat hook data/state di `src/hooks/<nama-feature>`.
4. Buat service API di `src/services/<nama-feature>.service.ts`.
5. Tambahkan query key di `src/lib/constants.ts`.
6. Jika butuh endpoint backend baru, pastikan route BFF/proxy mengizinkan path tersebut.
7. Tambahkan loading, error, empty, dan success state.
8. Jalankan lint, typecheck, dan build.

Aturan penting:

- Component tidak boleh memanggil `fetch()` langsung.
- Hook tidak boleh menyimpan URL endpoint hardcoded.
- Service adalah satu-satunya tempat pemanggilan endpoint.
- File di `src/lib/server` tidak boleh diimpor dari client component, hook, atau service browser.

## Struktur Folder

```text
src/
|-- app/                 Route Next.js, layout, error, loading, dan BFF API
|-- components/          UI, halaman fitur, shared component, admin shell
|-- hooks/               React Query, state filter, pagination, dialog, map state
|-- services/            API call dan transform data
|-- lib/                 HTTP client, constants, error normalizer, auth, utils
|-- lib/server/          Helper server-only untuk route handler
|-- lib/admin/           Helper admin/server-side untuk auth, users, external resource
|-- types/               Tipe global lintas fitur
|-- content/             Konten statis
`-- proxy.ts             Proxy/middleware untuk security dan proteksi route
```

## File Penting

### `src/services`

| File | Fungsi |
| --- | --- |
| `auth-endpoints.ts` | Sumber endpoint auth internal. |
| `auth-token.service.ts` | Mengambil CSRF token dan refresh session. |
| `auth.service.ts` | Service login/logout/forgot password. |
| `admin-resource.service.ts` | CRUD generik untuk resource admin. |
| `admin-users.service.ts` | Service khusus Control User dan audit. |
| `bank-desain.service.ts` | Data Bank Desain dan transform upload/image. |
| `bsps.service.ts` | Data BSPS, status, dan koordinat. |
| `kawasan-kumuh.service.ts` | Data kawasan kumuh, status, tahun, dan koordinat. |
| `rusun.service.ts` | Data rusun dan lokasi. |
| `sosialisasi.service.ts` | Lokasi, jadwal, berita, dan status sosialisasi. |
| `faq.service.ts` | Data FAQ publik/admin. |
| `location.service.ts` | Region, district, village untuk filter lokasi. |

### `src/lib`

| File | Fungsi |
| --- | --- |
| `api-client.ts` | HTTP client publik ke `/api/ext/*`. |
| `admin-client.ts` | HTTP client admin dengan CSRF dan auth handling. |
| `api-response.ts` | Normalisasi response dan error API. |
| `constants.ts` | Query key, config query, upload constraint, dan nilai global. |
| `auth.ts` | Helper session/auth frontend. |
| `security.ts` | Sanitasi input client-side. |
| `utils.ts` | Utility umum seperti merge class. |

### `src/app/api`

| Folder | Fungsi |
| --- | --- |
| `auth/*` | Login, logout, refresh, CSRF. |
| `admin/*` | Endpoint BFF untuk dashboard admin. |
| `ext/[...path]` | Proxy publik ke backend Golang. |
| `health` | Health check frontend. |

## Fitur

Publik:

- Landing page: pengantar layanan Klinik PKP.
- Informasi: halaman statis edukasi dan panduan.
- Bank Desain: katalog desain rumah dan file RAB.
- Kawasan Kumuh: data, filter, dan peta kawasan kumuh.
- Sebaran Rusun: data, filter, dan peta rusun.
- Penerimaan BSPS: data, filter, dan peta BSPS.
- Sosialisasi Klinik PKP: jadwal, berita, dan peta sosialisasi.
- FAQ: pertanyaan umum.
- Hubungi Kami dan Konsultasi: kanal kontak layanan.

Admin:

- Dashboard: ringkasan data admin.
- Control User: kelola akun internal.
- Bank Desain: tambah, edit, hapus desain dan file.
- Kawasan Kumuh: kelola data kawasan kumuh.
- Rusun: kelola data rusun.
- BSPS: kelola data penerimaan BSPS.
- Sosialisasi: kelola lokasi, jadwal, dan dokumentasi berita.
- FAQ: kelola pertanyaan aktif/nonaktif.

## Checklist Pekerjaan Selesai

- [x] Route `page.tsx` dibuat tipis.
- [x] API call dipindahkan ke service layer.
- [x] Client tidak mengimpor `src/lib/server`.
- [x] Error handling dipusatkan di `src/lib/api-response.ts`.
- [x] Query key dipusatkan di `src/lib/constants.ts`.
- [x] CSRF admin mutation ditangani lewat `admin-client.ts`.
- [x] Control User tidak mengirim password saat edit.
- [x] Control User menjaga ID sebagai UUID string.
- [x] Tombol edit/hapus user mengikuti metadata backend.
- [x] Upload edit Bank Desain/Rusun/Sosialisasi tidak memaksa re-upload.
- [x] Preview file upload memiliki cleanup object URL.
- [x] Search/sort/pagination admin diteruskan ke service/BFF.
- [x] Komponen reusable dipindahkan ke `shared`.
- [x] Route client dynamic dipisah ke `components/route-clients`.
- [x] Tidak ada `console.log/warn/error` debug.
- [x] Tidak ada direct `fetch()` di component/hook.
- [x] `npm run lint` lolos.
- [x] `npx tsc --noEmit` lolos.
- [x] `npm run build` lolos.

## Rekomendasi Frontend Berikutnya

- [ ] Jalankan Lighthouse/Web Vitals di production untuk mengukur LCP, INP, CLS, dan bundle size.
- [ ] Tambahkan Playwright smoke test untuk login admin, CRUD user, upload edit file, dan halaman peta.
- [ ] Tambahkan monitoring client error seperti Sentry atau alternatif self-hosted.
- [ ] Evaluasi image optimization untuk gambar backend agar LCP halaman publik lebih cepat.
- [ ] Tambahkan bundle analyzer untuk melihat modul terbesar sebelum deploy besar.
- [ ] Samakan nama query search/sort dengan kontrak backend final jika backend tidak memakai `keyword`, `sort_by`, dan `sort_order`.
