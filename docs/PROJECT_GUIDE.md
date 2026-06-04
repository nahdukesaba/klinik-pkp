# Klinik PKP Project Guide

Dokumen ini mencatat keputusan arsitektur, boundary, dan kontrak teknis utama
untuk frontend Klinik PKP. README menjadi ringkasan project; file ini menjadi
rujukan internal saat developer menambah fitur atau merawat modul yang sudah ada.

## Peran Aplikasi

Klinik PKP adalah frontend portal publik dan dashboard admin BP3KP Provinsi
Sumatera Utara. Next.js dipakai untuk UI, routing, session browser, dan BFF tipis.
Backend Golang tetap menjadi pemilik API domain, database, otorisasi final, dan
business rules.

## Arsitektur Runtime

```text
Browser
-> Next.js App Router
-> hooks/services
-> Route Handler BFF
-> Backend Golang
```

Konsekuensi boundary:

- `API_URL` tidak pernah dipakai langsung oleh browser.
- Public browser request ke backend melewati `/api/ext/*`.
- Admin browser request melewati `/api/admin/*`.
- Login, logout, refresh, dan CSRF berada di `/api/auth/*`.
- Route handler Next.js boleh melakukan validasi ringan, normalisasi response,
  auth/session handling, proxy upload, audit side effect, dan cache invalidation.
- Route handler Next.js tidak mengambil alih business rules backend Golang.

## Struktur Source

```text
src/
|-- app/          Route tree, layout, special files, dan API BFF.
|-- components/   UI primitives, admin shell, komponen domain, shared component.
|-- content/      Konten statis halaman publik.
|-- hooks/        Orchestration state, query, filter, pagination, map behavior.
|-- services/     Kontrak request browser dan transform response.
|-- lib/          Utility lintas fitur, constants, date, security, API helpers.
|-- lib/admin/    Server/admin adapter, audit, role, cache, resource proxy.
|-- lib/server/   Server-only backend config, proxy, HTTP helpers, rate limit.
|-- types/        Shared TypeScript types.
`-- proxy.ts      Next.js Proxy untuk CSP, allowlist API, dan rate limiting.
```

`src/app` dipertahankan sebagai route tree. Non-route code tidak diletakkan di
`app` kecuali memang berupa route handler atau special file Next.js. Komponen
page-level berada di `components`, sedangkan state dan query berada di `hooks`.

## Route Handler

| Route | Contract |
| --- | --- |
| `/api/ext/[...path]` | Public proxy same-origin ke `API_URL/[path]`. |
| `/api/admin/resources/[...path]` | Admin resource list/detail/create/update/delete untuk FAQ, BSPS, Kumuh, Rusun, Bank Desain, dan Sosialisasi. |
| `/api/admin/users` | List dan create Control Users. |
| `/api/admin/users/[...path]` | Get, update, delete Control Users by id. |
| `/api/admin/audit` | Audit list untuk dashboard admin. |
| `/api/auth/*` | Auth frontend session, backend token cookie, refresh, logout, CSRF. |
| `/api/health` | Health check frontend runtime. |

Catch-all route dipakai pada resource admin dan detail users supaya list/detail
tetap stabil di App Router, mudah divalidasi, dan tidak ada duplikasi handler
untuk operasi per id.

## `/api/ext`

`/api/ext` adalah external API proxy namespace. Route ini menerima request
browser dan meneruskannya ke backend Golang berdasarkan `API_URL`.

```text
/api/ext/bank-desain?page=1&limit=20
-> API_URL/bank-desain?page=1&limit=20
```

Yang dilakukan proxy:

- Normalize path dan query.
- Clamp limit public API.
- Validasi `page`, `limit`, dan field tahun.
- Allowlist endpoint publik melalui `src/proxy.ts`.
- Forward header yang aman saja.
- Strip response header yang tidak boleh keluar ke browser.
- Retry GET untuk error transient.
- Return 502/504 untuk gangguan infrastruktur backend.
- Cache singkat untuk aggregated list dan opsi tahun.

## Admin BFF

Admin BFF menjaga semua operasi dashboard berada di same-origin route dan memakai
session frontend yang aman.

Alur admin:

```text
Admin UI
-> hook admin
-> admin service
-> /api/admin/*
-> authorizeAdminRequest
-> validasi ringan / CSRF / audit
-> backend Golang
```

Resource admin memakai `src/services/admin-resource.service.ts` di client dan
`src/lib/admin/external-resource.ts` di server. Resource yang sekarang didukung:

- `faq`
- `bsps`
- `kumuh`
- `rusun`
- `bank-desain`
- `sosialisasi`

Operasi yang harus aktif untuk resource tersebut:

- `GET /api/admin/resources/:resource`
- `GET /api/admin/resources/:resource/:id`
- `POST /api/admin/resources/:resource`
- `PUT /api/admin/resources/:resource/:id`
- `DELETE /api/admin/resources/:resource/:id`

Untuk compatibility, handler resource masih menerima `?id=` pada GET/PUT/DELETE,
tetapi path `/:resource/:id` adalah kontrak utama frontend.

## Auth Dan Security

- JWT frontend disimpan di HTTP-only cookie.
- Backend access token disimpan di cookie server-side dan diteruskan oleh BFF.
- Refresh cookie dibatasi ke path `/api/auth`.
- Mutasi admin wajib CSRF.
- `src/proxy.ts` memasang CSP nonce untuk halaman, API allowlist, dan rate limit.
- `src/lib/auth.ts`, `src/lib/server/*`, dan helper admin server memakai boundary
  server-only agar secret tidak bocor ke client bundle.

## Service Dan Data Shape

Service client berada di `src/services`. Service adalah tempat kontrak endpoint,
payload builder, dan transform response backend. Komponen dan hook tidak
mengandalkan bentuk mentah response backend.

Konvensi data:

- Frontend menggunakan camelCase.
- Backend payload tetap snake_case di service atau adapter BFF.
- Query key berada di `src/lib/constants.ts`.
- List admin memakai pagination server-side.
- Public data dengan filter tahun mengambil tahun aktif, bukan semua tahun tanpa
  kebutuhan eksplisit.

## Query Dan Cache

- TanStack Query menjadi cache client utama.
- List berpaginasi memakai `placeholderData: keepPreviousData`.
- Mutasi admin meng-invalidate query admin dan public terkait.
- Cache BFF public hanya untuk data yang aman dan singkat.
- Response partial tidak dianggap sebagai data final bila fetch lanjutan gagal.

## Upload

Resource `rusun`, `bank-desain`, dan `sosialisasi` memakai form-data. BFF
menangani batas ukuran, validasi ringan, dan hidrasi file lama saat edit.

Upload constraints berada di `src/lib/constants.ts`. Edit upload harus tetap
mempertahankan file existing ketika user tidak memilih file baru.

## Peta

Leaflet hanya berjalan di client. Hook peta bertanggung jawab terhadap marker,
fit bounds, fallback zoom, dan sanitasi popup. Dataset marker mengikuti filter
aktif, terutama tahun dan wilayah.

## Checklist Maintenance

- `npm run lint`
- `npm run build`
- Tidak ada direct call browser ke `API_URL`.
- Tidak ada import server-only helper dari Client Component.
- Resource admin baru masuk service, route handler config, query key, dan
  invalidation yang sesuai.
- Endpoint public baru masuk allowlist `src/proxy.ts`.
- README dan dokumen ini diperbarui bila route contract berubah.
