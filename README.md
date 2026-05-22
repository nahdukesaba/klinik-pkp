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

### Mengganti Server Backend

Backend aktif hanya dikontrol dari `API_URL`.

```env
API_URL=https://domain-backend-aktif.com/api/v1
```

Jika server lama expired atau pindah ke Cloudflare Tunnel/domain lain:

1. Pastikan server baru punya struktur endpoint yang sama, misalnya `/api/v1/faqs`, `/api/v1/kumuh`, `/api/v1/bsps`.
2. Ganti nilai `API_URL` di `.env.local` atau environment hosting production.
3. Restart `npm run dev` untuk lokal, atau redeploy/restart service production.

Frontend tidak perlu mengubah service satu per satu selama prefix endpoint backend tetap sama.

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

## Data Fetching, Pagination, dan Sort

Aturan yang dipakai sekarang:

- Halaman admin memakai `ADMIN_TABLE_PAGE_SIZE = 10` dari `src/lib/constants.ts`.
- Control Users juga dibatasi 10 data per halaman dari `ADMIN_USERS_PAGE_LIMIT`.
- Filter dropdown lokasi/tahun tidak dipakai di tabel admin; halaman yang membutuhkan pencarian tetap memakai search debounced.
- Sort table dikirim sebagai `sort_by` dan `sort_order` hanya dari kolom yang mendefinisikan `sortField`.
- Query admin memakai `placeholderData: keepPreviousData` agar tabel tidak melompat kosong saat pindah halaman/sort.
- Query function menerima `AbortSignal` dari TanStack Query supaya request lama bisa dibatalkan saat query key berubah cepat.
- Proxy `/api/ext/*` hanya melakukan retry otomatis untuk request `GET`/`HEAD` yang aman diulang, terutama error backend transient seperti prepared statement SQLSTATE `42P05` atau `26000`. Mutasi `POST`/`PUT`/`PATCH`/`DELETE` tidak di-retry otomatis agar tidak membuat data dobel.
- Proxy `/api/ext/*` memvalidasi `page`, `limit`, dan parameter tahun. Query invalid dikembalikan sebagai 400, dan `limit` selalu di-clamp maksimal `API_MAX_PAGE_LIMIT = 100`.
- Untuk halaman publik yang butuh seluruh data peta, service mengirim `all=true`; proxy lalu mengumpulkan page backend di sisi server dan mengembalikan satu response ke browser.
- Query peta publik memakai cache beberapa menit per tahun aktif, sehingga perpindahan tahun yang sudah pernah dibuka tidak selalu memukul backend lagi.

Catatan backend pagination:

Tabel admin tetap 10 data per halaman. Untuk halaman publik yang membutuhkan dataset lengkap, browser cukup memanggil satu endpoint dengan `all=true`; pagination backend dikumpulkan oleh proxy agar log browser tidak penuh request `page=2`, `page=3`, dan seterusnya. Jika backend mengembalikan 500 pada halaman list umum seperti BSPS, kawasan kumuh, rusun, sosialisasi, atau bank desain, proxy mengembalikan response kosong yang aman dengan metadata pagination, bukan 500 mentah ke browser.

## Response API

Response yang diharapkan dari backend/BFF:

```json
{
  "success": true,
  "message": "success",
  "data": {
    "items": [],
    "total_records": 0,
    "page": 1,
    "limit": 10
  },
  "meta": {}
}
```

Error yang diharapkan:

```json
{
  "success": false,
  "error": {
    "code": "BAD_GATEWAY",
    "message": "Layanan sedang tidak tersedia.",
    "details": {}
  }
}
```

Frontend menormalisasi variasi response di `src/lib/api-client.ts` dan `src/lib/api-response.ts`, jadi service fitur cukup fokus pada endpoint, query param, dan transform snake_case ke camelCase.

## Data Peta Publik

Halaman publik yang memakai peta mengambil dataset lengkap untuk tahun aktif:

- Dropdown tahun tidak menyediakan opsi semua tahun karena dataset lintas tahun terlalu berat untuk backend dan frontend.
- Daftar tahun dibaca dari endpoint metadata `/api/ext/bsps/years` dan `/api/ext/kumuh/years`, yang tetap ditangani route proxy existing `/api/ext/[...path]`. Proxy mengumpulkan distinct year dari data backend, mengurutkan DESC, dan menyimpan cache server-side 10 menit. Jika endpoint metadata gagal, UI memakai fallback `PUBLIC_YEAR_FILTER_OPTIONS`.
- Tahun spesifik: hook publik mengirim parameter tahun ke service, lalu service mengumpulkan seluruh page untuk tahun tersebut saat backend sehat.
- Sidebar/list dan marker peta memakai data tahun aktif yang sama, sehingga ketika user memilih 2024, sidebar dan peta ikut menampilkan data 2024.
- Sidebar/list boleh dipaginasi di client untuk kenyamanan baca, tetapi marker peta memakai seluruh data hasil filter, bukan hanya 10/20 item pertama.

## Lazy Loading

Kebijakan lazy loading:

- Konten/peta yang muncul di viewport awal tidak di-lazy-mount. Data awal harus segera diminta dan UI utama langsung disiapkan.
- Komponen berat yang berada di bawah viewport boleh memakai `useLazyMount`, contohnya map kontak atau section sekunder.
- Library browser-heavy seperti Leaflet tetap boleh diinisialisasi di client component, tetapi mount-nya tidak boleh menunda pengalaman utama halaman peta.
- Dialog/preview yang jarang dibuka boleh memakai `React.lazy` atau dynamic import.

Referensi resmi:

- TanStack Query: [paginated queries](https://github.com/tanstack/query/blob/main/docs/framework/react/guides/paginated-queries.md) dengan `placeholderData: keepPreviousData` dan [query cancellation](https://github.com/tanstack/query/blob/main/docs/framework/react/guides/query-cancellation.md) via `AbortSignal`.
- Next.js: [lazy loading client component](https://github.com/vercel/next.js/blob/v16.2.2/docs/01-app/02-guides/lazy-loading.mdx) dan [Route Handler sebagai Backend For Frontend/proxy](https://github.com/vercel/next.js/blob/v16.2.2/docs/01-app/02-guides/backend-for-frontend.mdx).

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
