# Klinik PKP Frontend

Klinik PKP Frontend adalah aplikasi web untuk portal publik dan dashboard admin
BP3KP Provinsi Sumatera Utara. Project ini memakai Next.js App Router sebagai
UI runtime, React untuk pengalaman interaktif, dan Route Handler Next.js sebagai
BFF/proxy tipis ke backend Golang.

Next.js di repository ini tidak berperan sebagai backend bisnis. Backend Golang
tetap menjadi pemilik data, database, otorisasi akhir, dan aturan bisnis utama.
Frontend menjaga pengalaman pengguna, session browser, validasi ringan, upload
form, cache UI, dan normalisasi response agar kontrak browser tetap stabil.

## Sistem

```text
Browser
-> Next.js UI
-> Service client
-> Next.js Route Handler BFF
-> Backend Golang
```

Boundary utama:

- Browser tidak memanggil backend Golang secara langsung.
- `API_URL` hanya dibaca di server Next.js, bukan di bundle client.
- Route Handler di `src/app/api/*` adalah BFF, bukan backend domain baru.
- Backend Golang tetap menjadi sumber kebenaran untuk data dan otorisasi final.
- Admin mutation berjalan melalui session HTTP-only cookie dan CSRF.

## Stack

| Area | Stack |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, Radix UI, lucide-react |
| Bahasa | TypeScript strict mode |
| Data fetching | TanStack Query 5 |
| Map | Leaflet |
| Auth/session helper | jose, HTTP-only cookies |
| Validasi | Zod dan validasi payload internal |
| Proxy/BFF | Next.js Route Handler dan `src/proxy.ts` |

## Struktur Folder

```text
src/
|-- app/          Route tree App Router, layout, loading/error/not-found, API BFF.
|-- components/   Komponen UI, shell admin, komponen halaman, dan shared component.
|-- content/      Konten statis yang dipakai halaman publik.
|-- hooks/        State orchestration, React Query, filter, pagination, dan map logic.
|-- services/     Kontrak endpoint browser, payload builder, dan transform response.
|-- lib/          Utility lintas fitur, constants, security, date, API client.
|-- lib/admin/    Adapter admin, audit, role, cache, security, dan resource proxy.
|-- lib/server/   Helper server-only untuk backend URL, proxy, HTTP, dan rate limit.
|-- types/        Tipe global lintas fitur.
`-- proxy.ts      Next.js Proxy untuk CSP, API allowlist, dan rate limiting.
```

Catatan struktur:

- `src/app` hanya berisi route, layout, special files, dan internal API routes.
- Page di `src/app/**/page.tsx` dijaga tipis dan mendelegasikan UI ke
  `src/components`.
- Client side data flow berada di `hooks` dan `services`.
- Kode yang membaca secret atau environment server berada di `lib/server`,
  `lib/admin`, atau file yang diberi `server-only`.
- `components/ui` berisi primitive UI reusable; komponen domain tetap berada di
  folder domain masing-masing.

## Route Contract

| Route | Fungsi |
| --- | --- |
| `/` dan route publik lainnya | Portal publik Klinik PKP. |
| `/admin/*` | Dashboard admin, dilindungi oleh auth guard dan session. |
| `/api/ext/[...path]` | Proxy public same-origin ke backend Golang. |
| `/api/auth/*` | Login, logout, refresh session, dan CSRF. |
| `/api/admin/resources/[...path]` | BFF resource admin untuk list, detail, create, update, delete. |
| `/api/admin/users` | List dan create Control Users. |
| `/api/admin/users/[...path]` | Detail, update, dan delete Control Users. |
| `/api/admin/audit` | Ringkasan audit admin. |
| `/api/health` | Health check frontend runtime. |

## BFF

BFF digunakan karena browser membutuhkan kontrak yang aman dan stabil, sementara
backend Golang tetap menjadi pemilik domain. Di project ini BFF menangani:

- Menyembunyikan `API_URL` dan token backend dari browser.
- Menjaga session admin di HTTP-only cookie.
- Menambahkan CSRF untuk mutasi admin.
- Meneruskan access token backend hanya dari server.
- Menormalisasi response dan error agar UI tidak bergantung pada variasi response backend.
- Mengelola upload multipart, termasuk mempertahankan file lama saat edit.
- Menambahkan allowlist public API, timeout, retry GET, dan response 502/504 saat backend terganggu.
- Menginvalidasi cache frontend/proxy setelah mutasi admin.

Pola ini mempertahankan pemisahan tanggung jawab: Next.js melayani frontend dan
browser boundary, Golang melayani domain API dan persistence.

## Kenapa `/api/ext`

`/api/ext` adalah namespace eksplisit untuk request browser yang diteruskan ke
backend eksternal. Nama ini sengaja dipisahkan dari `/api/admin` dan `/api/auth`
agar developer langsung tahu bahwa route tersebut bukan endpoint domain baru di
Next.js.

Alurnya:

```text
/api/ext/rusun?page=1
-> API_URL/rusun?page=1
```

Manfaat utama `/api/ext`:

- Same-origin request dari browser tanpa membuka CORS backend ke publik frontend.
- Base URL backend tetap server-only.
- Proxy dapat mengembalikan error infrastruktur yang benar, misalnya 502 atau 504.
- Public endpoint yang boleh dipakai browser dapat dikontrol melalui allowlist di `src/proxy.ts`.
- File/upload backend dapat dibaca melalui path frontend yang konsisten.

## Environment

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `API_URL` | Ya | Base URL backend Golang, contoh `https://domain/api/v1`. Server-only. |
| `JWT_SECRET` | Ya | Secret session frontend, minimal 32 karakter. Server-only. |
| `AUTH_API_URL` | Tidak | Base URL auth backend jika berbeda dari `API_URL`. |
| `AUTH_API_PATH` | Tidak | Path login backend jika kontrak auth berbeda dari default project. |

`.env.example` berisi template environment. Secret lokal dan production tidak
masuk version control.

## Command

| Command | Keterangan |
| --- | --- |
| `npm run dev` | Development server di port 3000. |
| `npm run build` | Production build dan type check Next.js. |
| `npm run start` | Production server di port 3000. |
| `npm run lint` | ESLint untuk source code. |
| `npm run lint:fix` | ESLint auto-fix untuk issue yang aman diperbaiki otomatis. |

## Data Flow

Public page:

```text
Page/component
-> hook fitur
-> service fitur
-> /api/ext/*
-> backend Golang
```

Admin page:

```text
Admin page/component
-> hook admin
-> admin service
-> /api/admin/*
-> auth, CSRF, validasi ringan, audit
-> backend Golang
```

Service mengubah response backend ke bentuk frontend yang konsisten. Field
frontend memakai camelCase; field backend tetap berada di payload builder,
service, atau adapter BFF.

## Catatan Developer

- Tambahan endpoint public backend perlu masuk allowlist `ALLOWED_API_PATHS` di
  `src/proxy.ts`.
- Tambahan resource admin mengikuti pola `src/services/admin-resource.service.ts`
  dan handler `/api/admin/resources/[...path]`.
- Kode server-only tidak diimpor dari Client Component.
- Mutasi admin memakai CSRF melalui `adminFetch`.
- Query list admin memakai pagination server-side dan invalidate query setelah
  create, update, atau delete.
- Public data yang memakai filter tahun hanya mengambil dan menampilkan tahun aktif.
- Upload edit harus mempertahankan file lama bila user tidak memilih file baru.

Dokumentasi arsitektur yang lebih rinci ada di
[docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md).
