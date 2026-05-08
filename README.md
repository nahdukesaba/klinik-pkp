# Klinik PKP Frontend

Frontend Klinik PKP adalah aplikasi Next.js untuk halaman publik dan dashboard admin layanan Perumahan dan Kawasan Permukiman. Halaman publik dipakai masyarakat untuk melihat informasi layanan, peta, katalog desain, sosialisasi, dan FAQ. Dashboard admin dipakai untuk mengelola konten dinamis seperti BSPS, Rusun, Kawasan Kumuh, Bank Desain, Sosialisasi, FAQ, dan user internal.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| UI primitive | Radix UI |
| Data client | TanStack Query |
| Validasi | Zod |
| Peta | Leaflet |
| Auth/session | JWT cookie dengan `jose` |
| Icon | `lucide-react` |

## Menjalankan Project

```bash
npm install
npm run dev
```

Server development berjalan di:

```text
http://localhost:3000
```

Build production:

```bash
npm run lint
npm run build
npm run start
```

## Environment

Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `API_URL` | Ya | Base URL backend, contoh `http://103.197.190.87/api/v1`. Hanya dipakai server/proxy frontend. |
| `JWT_SECRET` | Ya | Secret untuk sign dan verify cookie session admin. Minimal 32 karakter. |
| `AUTH_API_URL` | Tidak | Full URL endpoint login backend jika berbeda dari default. |
| `AUTH_API_PATH` | Tidak | Path login backend. Default frontend: `/authentications`. |

File rahasia seperti `.env`, `.env.local`, dan `.env.*` sudah masuk `.gitignore`. `.env.example` tetap boleh di-commit sebagai contoh.

## Struktur Folder

```text
src/
|-- app/                 Route Next.js, layout, loading, error, dan API route internal
|-- components/          UI global, layout, admin shell, shared component, dan primitive UI
|-- hooks/               Hook reusable lintas fitur
|-- services/            Fetch dan transform data backend
|-- lib/                 Utility umum, auth, security, admin helper, server helper
|-- content/             Konten statis halaman informasi/landing
`-- types/               Tipe bersama lintas modul
```

Pola yang dipakai untuk fitur baru:

```text
src/app/<route>/page.tsx
-> src/components/<fitur>
-> src/hooks/<fitur>
-> src/services/<fitur>.service.ts
-> src/lib/api-client.ts atau src/lib/admin-client.ts
-> API route internal
-> backend
```

Untuk admin, page tetap tipis di `src/app/admin/<fitur>/page.tsx`, UI halaman berada di `src/components/admin/pages`, dan logic halaman berada di `src/hooks/admin`.

## Prinsip Clean Architecture

Struktur project ini memakai pendekatan pragmatic clean architecture untuk Next.js:

```text
Route tipis
-> UI component
-> hook/controller halaman
-> service data
-> client/proxy internal
-> backend
```

Aturan penempatan:

- `src/app` hanya untuk route entry, layout, loading, error, dan API route internal.
- `src/components/<fitur>` untuk UI satu fitur.
- `src/components/admin/pages` untuk halaman dashboard admin.
- `src/hooks/<fitur>` untuk state, filter, pagination, dan orchestration fitur publik.
- `src/hooks/admin` untuk logic halaman admin.
- `src/services` untuk fetch dan transform data backend.
- `src/lib/server` hanya untuk helper server-only.
- `src/lib/admin` untuk helper server-side admin, role, audit, proxy backend admin, dan cache admin.
- `src/types` untuk tipe yang benar-benar dipakai lintas fitur.

Pola ini lebih cocok untuk ukuran project sekarang daripada memaksa folder `features` baru di sebagian modul saja. Jika nanti semua modul ingin dipindahkan ke feature-based architecture, lakukan sekaligus dan bertahap dengan test, bukan satu modul saja.

## Alur Data Publik

```text
Browser
-> hook fitur
-> service/api fitur
-> src/lib/api-client.ts
-> /api/ext/*
-> src/app/api/ext/[...path]/route.ts
-> API_URL backend
```

Browser tidak memanggil backend langsung. Semua data publik lewat `/api/ext/*` supaya CORS, timeout, error handling, dan allowlist tetap dikendalikan frontend.

Endpoint publik yang boleh lewat proxy diatur di `src/proxy.ts` pada `ALLOWED_API_PATHS`. Jika backend menambah endpoint baru, path itu harus ditambahkan di allowlist.

## Alur Data Admin

List admin dapat memakai service publik jika datanya memang aman dan sama persis dengan tampilan publik.

```text
Admin page
-> hook admin/fitur
-> service/api fitur
-> /api/ext/*
-> backend
```

Untuk data yang punya status draft/nonaktif, list admin sebaiknya lewat API internal agar backend bisa mengembalikan data lengkap memakai session admin.

```text
Admin page
-> hook admin/fitur
-> service admin fitur
-> /api/admin/resources/<resource>
-> authorizeAdminRequest()
-> backend dengan token admin
```

Create, update, dan delete admin juga lewat API internal agar role, CSRF, audit, dan token backend tetap aman.

```text
Admin page
-> useAdminCrud / hook admin
-> src/lib/admin-client.ts
-> /api/admin/resources/<resource>
-> authorizeAdminRequest()
-> src/lib/admin/external-resource.ts
-> backend
```

## FAQ

FAQ mengikuti pola folder yang sama dengan modul lain:

```text
src/app/faq/page.tsx
src/app/admin/faq/page.tsx
src/components/faq/FaqPage.tsx
src/components/admin/pages/AdminFaqPage.tsx
src/hooks/faq/use-faq-page.ts
src/hooks/admin/use-admin-faq-page.tsx
src/services/faq.service.ts
```

Kontrak backend FAQ yang dipakai frontend:

```json
{
  "id": 1,
  "question": "Pertanyaan",
  "answer": "Jawaban",
  "is_active": true,
  "created_at": "2026-05-05T09:47:44+07:00",
  "updated_at": "2026-05-05T09:47:44+07:00",
  "deleted_at": null
}
```

Halaman publik hanya menampilkan FAQ aktif. Admin mengirim payload:

```json
{
  "question": "Pertanyaan",
  "answer": "Jawaban",
  "is_active": true
}
```

Frontend juga menormalisasi beberapa bentuk status lain seperti `isActive`, `active`, `status`, `0/1`, `true/false`, `aktif/nonaktif`, dan `active/inactive`. Ini menjaga tampilan publik tetap aman jika backend berubah sedikit, tetapi bentuk utama yang disarankan tetap `is_active: boolean`.

Filter FAQ publik dibuat sederhana:

- search dengan kata kunci
- tombol topik cepat: Semua, Layanan, Konsultasi, BSPS, Rusun, Bank Desain
- accordion pertanyaan dengan target sentuh besar untuk mobile

Filter FAQ admin:

- Semua
- Aktif
- Nonaktif

Setelah admin menyimpan atau menghapus FAQ, cache query admin dan query publik FAQ akan di-invalidate.

Catatan status FAQ:

- Halaman publik tetap mengambil data lewat `/api/ext/faqs` dan memfilter `is_active === true`.
- Dashboard admin mengambil data lewat `/api/admin/resources/faq?include_inactive=true`.
- Jika backend belum mengembalikan FAQ nonaktif untuk request admin, filter `Nonaktif` di frontend tidak punya data untuk ditampilkan.

## Cache

Cache yang ada di frontend:

- TanStack Query di browser, in-memory, hilang saat browser refresh penuh.
- Konfigurasi umum ada di `src/lib/constants.ts` melalui `QUERY_CONFIG`.
- Default: data fresh 5 menit, garbage collection 10 menit, retry 2 kali, tidak refetch saat window focus.
- FAQ memakai request `cache: "no-store"` agar browser tidak menyimpan respons lama.
- Mutasi admin FAQ menghapus cache `admin-faq` dan `faq-public`.

Cache server-side frontend:

- Dashboard admin membaca beberapa statistik backend melalui cache server Next.js.
- Cache statistik eksternal memakai tag dan revalidate sekitar 60 detik.
- Audit log dan rate limit masih in-memory per instance server.

Yang tidak dibuat frontend:

- Frontend tidak membuat cache database.
- Frontend tidak menyimpan data publik ke localStorage/sessionStorage.
- Jika backend punya cache sendiri, frontend hanya menerima hasil dari backend/proxy.

## Session dan Auth

Session admin dibuat di frontend dengan cookie HTTP-only.

| Cookie | Fungsi | Umur |
| --- | --- | --- |
| `klinik-pkp-token` | Access token JWT frontend | 15 menit |
| `klinik-pkp-refresh` | Refresh token JWT frontend | 7 hari |
| `klinik-pkp-csrf` | Token CSRF untuk login dan mutasi admin | pendek, dipakai per request |
| backend access cookie | Token akses backend bila backend login mengembalikan token | mengikuti konfigurasi frontend |
| backend refresh cookie | Refresh token backend bila tersedia | mengikuti konfigurasi frontend |

Flow login:

```text
GET /api/auth/csrf
POST /api/auth/login
-> validasi Zod
-> cek origin + CSRF
-> rate limit
-> auth local env bila tersedia
-> auth backend bila local env tidak dipakai
-> ambil/normalisasi user
-> hanya role admin yang boleh masuk dashboard
-> set cookie HTTP-only
```

Frontend membutuhkan backend untuk:

- endpoint login (`/authentications` atau yang diatur di env)
- endpoint refresh session jika backend memakai refresh token
- endpoint `users/me` untuk membaca profil setelah login backend
- token akses backend bila endpoint admin membutuhkan Authorization Bearer

## Route Utama

### Publik

| Route | Fungsi |
| --- | --- |
| `/` | Landing page |
| `/lokasi-klinik` | Alamat, kontak, dan peta lokasi |
| `/sebaran-rusun` | Peta dan daftar rusun |
| `/kawasan-kumuh` | Data dan peta kawasan kumuh |
| `/penerimaan-bsps` | Informasi penerimaan BSPS |
| `/bank-desain` | Katalog bank desain |
| `/sosialisasi-klinik-pkp` | Peta, jadwal, dan berita sosialisasi |
| `/faq` | FAQ publik aktif |
| `/hubungi-kami` | Kontak |
| `/konsultasi` | Kanal konsultasi |
| `/informasi/[slug]` | Halaman informasi statis |
| `/login` | Login admin |

### Admin

| Route | Fungsi |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/faq` | CRUD FAQ |
| `/admin/bsps` | CRUD BSPS |
| `/admin/rusun` | CRUD Rusun |
| `/admin/kawasan-kumuh` | CRUD Kawasan Kumuh |
| `/admin/bank-desain` | CRUD Bank Desain |
| `/admin/sosialisasi/lokasi` | CRUD titik sosialisasi |
| `/admin/sosialisasi/jadwal` | CRUD jadwal sosialisasi |
| `/admin/sosialisasi/berita` | Upload dokumentasi berita |
| `/admin/users` | CRUD user internal |

## Kebutuhan Backend Saat Ini

Endpoint yang sudah dipakai frontend:

- `GET /faqs`, `POST /faqs`, `PUT /faqs/:id`, `DELETE /faqs/:id`
- `GET /bsps`, `POST /bsps`, `PUT /bsps/:id`, `DELETE /bsps/:id`
- `GET /rusun`, `POST /rusun`, `PUT /rusun/:id`, `DELETE /rusun/:id`
- `GET /kumuh`, `POST /kumuh`, `PUT /kumuh/:id`, `DELETE /kumuh/:id`
- `GET /bank-desain`, `POST /bank-desain`, `PUT /bank-desain/:id`, `DELETE /bank-desain/:id`
- `GET /sosialisasi`, `POST /sosialisasi`, `PUT /sosialisasi/:id`, `DELETE /sosialisasi/:id`
- `GET /regions`, `GET /districts`, `GET /villages`
- `GET /uploads/*`
- auth endpoint sesuai `AUTH_API_PATH` atau `AUTH_API_URL`
- `GET /users/me`
- endpoint user admin sesuai implementasi backend

Kebutuhan backend yang penting untuk FAQ:

- `GET /faqs` untuk publik sebaiknya hanya mengembalikan FAQ aktif.
- `GET /faqs?include_inactive=true` dengan Authorization admin harus mengembalikan FAQ aktif dan nonaktif.
- `GET /faqs?is_active=false` sebaiknya mengembalikan FAQ nonaktif jika dipanggil admin.
- `POST /faqs` menerima `question`, `answer`, dan `is_active`.
- `PUT /faqs/:id` harus benar-benar menyimpan perubahan `is_active`.
- Respons list tetap menyertakan `is_active`, `created_at`, `updated_at`, dan `deleted_at`.

Peningkatan backend yang disarankan:

- Bedakan endpoint publik dan admin untuk resource yang punya status publikasi.
- Tambahkan filter standar: `search`, `page`, `limit`, `is_active`, `include_inactive`.
- Tambahkan endpoint ringkasan/agregat untuk dashboard admin, misalnya `/bsps/summary`, `/kumuh/summary`, `/rusun/summary`, dan `/bank-desain/summary`.
- Validasi input FAQ: pertanyaan dan jawaban wajib, trim string, panjang maksimum jelas.
- Kembalikan error validasi dengan format `details` per field.
- Simpan audit log admin di database, bukan hanya bergantung ke frontend.
- Pakai rate limit terpusat atau Redis jika deploy multi-instance.
- Buat cache/invalidation backend untuk data publik yang sering dibaca.
- Pastikan upload punya batas ukuran dan pesan error JSON, bukan HTML proxy.
- Tambahkan endpoint health yang memeriksa koneksi database.

Catatan performa statistik admin:

- Halaman admin tidak boleh mengambil semua data hanya untuk menghitung card statistik, misalnya request `limit=1000` dari frontend. Pola itu membuat halaman lambat dan mudah memicu `502/504` ketika backend sedang berat.
- Card yang aman ditampilkan dari frontend adalah angka yang sudah tersedia dari metadata pagination, seperti `totalRecords`.
- Statistik agregat lintas semua data, seperti total unit BSPS, jumlah status selesai/proses, total luas kumuh, total penduduk, atau jumlah kategori berat/sedang/ringan, sebaiknya dihitung oleh backend lewat endpoint summary/agregat. Frontend cukup membaca hasil ringkasan tersebut.
- Jika endpoint summary belum tersedia, prioritaskan kecepatan load halaman: tampilkan total record dari metadata dan hindari fetch-all di sisi client.

Format list yang paling aman untuk frontend:

```json
{
  "success": true,
  "message": "success",
  "data": {
    "data": [],
    "limit": 10,
    "page": 1,
    "total": 0,
    "total_page": 1
  }
}
```

Frontend juga masih bisa membaca beberapa variasi key list seperti `items`, `rows`, `records`, `results`, dan `list`.

## Catatan Maintenance

- Jangan panggil `API_URL` langsung dari browser.
- Tambahkan endpoint baru ke allowlist `src/proxy.ts`.
- Jangan taruh logic panjang di `src/app/**/page.tsx`; page cukup jadi entry route.
- Untuk fitur baru, ikuti pola folder yang sudah ada: `components/<fitur>`, `hooks/<fitur>`, dan `services/<fitur>.service.ts`.
- Untuk helper lintas fitur, baru pindahkan ke `components/shared`, `hooks`, atau `lib` jika benar-benar dipakai lebih dari satu modul.
- Jalankan `npm run lint` dan `npm run build` sebelum deploy.
