# 📋 Developer Handoff — Klinik PKP

> Dokumen ini ditujukan untuk **developer selanjutnya** yang akan meng-handle project Klinik PKP.
> Format Notion-friendly — bisa langsung di-copy-paste ke Notion.

---

## 🏗️ Gambaran Singkat

**Klinik PKP** adalah portal informasi perumahan dan kawasan permukiman Sumatera Utara, dikelola oleh BP3KP Sumatera II.

| Item | Detail |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Bahasa | TypeScript 5.8 (strict) |
| Styling | Tailwind CSS 3 + Radix UI |
| State Management | TanStack React Query v5 |
| Peta | Leaflet (dynamic import, SSR disabled) |
| Backend | Go Fiber REST API (terpisah) |
| Auth | JWT (httpOnly cookie) dengan jose |
| Validasi | Zod 4 |

---

## 📁 Struktur Folder

```
src/
├── app/                     # Next.js App Router (halaman & API routes)
│   ├── page.tsx             # Landing page (/)
│   ├── layout.tsx           # Root layout (providers, font, metadata)
│   ├── globals.css          # Global styles + Tailwind + CSS variables
│   ├── not-found.tsx        # Halaman 404
│   ├── api/
│   │   ├── auth/login/      # POST /api/auth/login
│   │   ├── auth/logout/     # POST /api/auth/logout
│   │   └── health/          # GET /api/health
│   ├── bank-desain/         # Katalog desain rumah
│   ├── berita/              # Redirect → /sosialisasi-klinik-pkp
│   ├── informasi/           # Tentang, FAQ, Peraturan, dll
│   ├── kawasan-kumuh/       # Peta kawasan kumuh
│   ├── login/               # Halaman login
│   ├── lokasi-klinik/       # Info lokasi klinik
│   ├── penerimaan-bsps/     # Data bantuan BSPS
│   ├── sebaran-rusun/       # Peta sebaran rusun
│   └── sosialisasi-klinik-pkp/  # Jadwal, peta, berita sosialisasi
│
├── components/              # Komponen React
│   ├── landing/             # Komponen halaman utama (Hero, Services, dll)
│   ├── layout/              # Navbar, Footer
│   ├── shared/              # Komponen reusable (ApiStates, ImageZoom, dll)
│   ├── ui/                  # Primitif UI (Button, Dialog, Input, dll)
│   ├── providers/           # QueryProvider, ThemeProvider
│   ├── bank-desain/         # Komponen fitur Bank Desain
│   ├── berita/              # Komponen fitur Berita
│   ├── informasi/           # Komponen 6 halaman informasi
│   ├── kawasan-kumuh/       # Komponen fitur Kawasan Kumuh
│   ├── lokasi-klinik/       # Komponen fitur Lokasi Klinik
│   ├── login/               # Komponen halaman Login
│   ├── penerimaan-bsps/     # Komponen fitur BSPS
│   ├── sebaran-rusun/       # Komponen fitur Sebaran Rusun
│   └── sosialisasi-pkp/     # Komponen fitur Sosialisasi
│
├── hooks/                   # Custom React Hooks
│   ├── use-pagination.ts    # Pagination client-side
│   ├── use-debounce.ts      # Debounce input
│   ├── use-cascading-filter.ts  # Filter berjenjang (kabupaten→kecamatan→kelurahan)
│   ├── use-lazy-mount.ts    # Lazy mount untuk tab/section
│   ├── use-scroll-animation.ts  # Animasi scroll (IntersectionObserver)
│   ├── use-toast.ts         # Toast notification (shadcn pattern)
│   ├── use-year-filter.ts   # Filter tahun
│   ├── bank-desain/         # Query + filter + page hook Bank Desain
│   ├── berita/              # Detail berita hook
│   ├── kawasan-kumuh/       # Query + filter + map + page hook
│   ├── penerimaan-bsps/     # Query + filter + map + page hook
│   ├── sebaran-rusun/       # Query + filter + map hook
│   └── sosialisasi/         # Query + map + jadwal + berita + page hook
│
├── services/                # Integrasi API (fetch + transform)
│   ├── api-types.ts         # Tipe response API backend
│   ├── sosialisasi.service.ts
│   ├── bsps.service.ts
│   ├── rusun.service.ts
│   ├── kawasan-kumuh.service.ts
│   └── bank-desain.service.ts
│
├── content/                 # Data statis (halaman TANPA API)
│   ├── building-steps.ts    # Langkah pembangunan rumah (landing)
│   ├── housing-indicators.ts # Indikator kelayakan rumah (landing)
│   ├── informasi.ts         # FAQ, peraturan, perizinan, bahan bangunan
│   ├── lokasi-klinik.ts     # Alamat dan kontak klinik
│   └── tentang.ts           # Tentang organisasi
│
├── lib/                     # Utilitas & konfigurasi
│   ├── api-client.ts        # HTTP client (fetch wrapper)
│   ├── auth.ts              # JWT utilities (jose)
│   ├── constants.ts         # Konstanta (QUERY_CONFIG, tahun, dsb)
│   ├── date.ts              # Format tanggal Indonesia
│   ├── map-utils.ts         # Utilitas peta Leaflet
│   ├── security.ts          # Sanitasi input (XSS, SQL injection)
│   ├── utils.ts             # cn() utility (Tailwind merge)
│   └── validations.ts       # Validasi form (Zod wrapper)
│
├── proxy.ts                 # Middleware proxy API + security headers
│
docs/
├── API_DOCUMENTATION.md     # Referensi endpoint API backend
├── DOKUMENTASI-PROYEK.md    # Dokumentasi teknis lengkap
└── CHANGELOG-CLEANUP.md     # Log perubahan pembersihan kode
```

---

## 🔄 Arsitektur Data Flow

```
API Backend (Go Fiber)
    ↓  HTTP via proxy rewrite (/api/v1/* → backend)
Services Layer (src/services/)
    ↓  fetch + transform response → tipe frontend
Query Hooks (use-*-query.ts)
    ↓  React Query: cache, retry, stale management
Feature Hooks (use-*-filter / use-*-map)
    ↓  Filter, search, pagination, map logic
Page Hooks (use-*-page.ts)
    ↓  Orchestrasi semua hook per halaman
Components (src/components/)
    ↓  Render UI dari data hook
```

### Penjelasan Tiap Layer

**Services** (`src/services/`) — Satu file per domain (sosialisasi, BSPS, rusun, kawasan kumuh, bank desain). Berisi fungsi `fetch*` dan `transform*`. Tipe API backend di `api-types.ts`, tipe frontend di masing-masing service.

**Query Hooks** (`use-*-query.ts`) — Wrapper React Query. Menangani cache, loading, error, retry. Menggunakan `QUERY_CONFIG` dari `lib/constants.ts` untuk staleTime (5 menit) dan gcTime (10 menit).

**Feature Hooks** — Logic bisnis spesifik:
- `use-cascading-filter.ts` — Filter berjenjang kabupaten → kecamatan → kelurahan
- `use-*-map.ts` — Inisialisasi dan manajemen peta Leaflet
- `use-pagination.ts` — Pagination client-side

**Page Hooks** (`use-*-page.ts`) — Menggabungkan semua hook untuk satu halaman. Satu halaman = satu page hook.

---

## 🗺️ Halaman Peta (Leaflet)

Semua halaman yang menggunakan peta Leaflet **wajib** menggunakan pola loader:

```
app/kawasan-kumuh/
├── page.tsx      ← Server Component (metadata, SEO)
└── loader.tsx    ← Client Component, dynamic import dengan ssr: false
```

**Alasan:** Leaflet membutuhkan `window` dan `document` yang tidak tersedia di server. Tanpa `ssr: false`, build akan crash.

**Halaman dengan peta:** kawasan-kumuh, sebaran-rusun, penerimaan-bsps, sosialisasi-klinik-pkp.

---

## 🔐 Keamanan

### Sanitasi Input
Semua input pengguna disanitasi melalui:
- `src/lib/security.ts` — `sanitizeInput()`, `sanitizeEmail()`, `sanitizeNip()`, `escapeHtml()`, `escapeAttr()`
- `src/lib/validations.ts` — Zod schema dengan transform sanitize
- 17+ pola RegExp di-hoist ke level modul untuk performa

### API Proxy
`src/proxy.ts` (middleware) menambahkan:
- Security headers (CSP, X-Frame-Options, dll)
- Path validation (whitelist endpoint yang diizinkan)
- Rate limiting di route auth

### Autentikasi
- JWT access token (15 menit) + refresh token (7 hari)
- Disimpan di httpOnly cookie (BUKAN localStorage)
- Library: `jose` (Web Crypto API)
- Demo mode: credentials dari environment variables

---

## 🎨 Theming & Styling

### Tema
- Dual theme (light/dark) via `next-themes`
- CSS variables berbasis HSL di `globals.css`
- Warna utama: `--primary: 191 79% 35%` (teal biru)

### Tailwind
- Config di `tailwind.config.ts`
- Font: Plus Jakarta Sans
- Animasi custom: fade-in, slide-up, slide-down, pulse-slow
- Kelas utility: `.content-auto` untuk `content-visibility: auto`

### UI Primitif
Semua di `src/components/ui/` — mengikuti pola shadcn/ui:
- `button.tsx` — dengan variants (default, outline, ghost, link)
- `dialog.tsx` — modal berbasis Radix
- `input.tsx`, `label.tsx`, `select.tsx`
- `searchable-select.tsx` — dropdown dengan pencarian
- `skeleton.tsx` — loading skeleton
- `toast.tsx` + `toaster.tsx` — notifikasi
- `tooltip.tsx` — tooltip (provider di root layout)

---

## 📝 Konvensi Kode

### Penamaan File
| Tipe | Pola | Contoh |
|---|---|---|
| Komponen | PascalCase | `BankDesainPage.tsx` |
| Hook | kebab-case + prefix `use-` | `use-bank-desain-query.ts` |
| Service | kebab-case + `.service.ts` | `bank-desain.service.ts` |
| Konten statis | kebab-case | `building-steps.ts` |
| Barrel | `index.ts` | Di setiap folder |

### Export
- **Komponen halaman**: `export default` (untuk `next/dynamic`)
- **Komponen shared/reusable**: `export function` (named export)
- **Hook**: Selalu named export (`export function useNamaHook`)
- **Barrel file**: Re-export named exports

### Import Order (diatur ESLint)
1. React / Next.js
2. Library eksternal (@tanstack, lucide-react, dll)
3. Internal absolut (@/components, @/hooks, @/lib, @/services, @/content)
4. Relative import
5. CSS import

---

## ⚡ Performa

### Optimasi yang Diterapkan

| Teknik | Detail |
|---|---|
| **optimizePackageImports** | lucide-react + 8 paket @radix-ui — tree-shake otomatis |
| **Dynamic Imports** | Semua halaman berat di-lazy-load via `next/dynamic` |
| **React Query Cache** | staleTime 5 menit, gcTime 10 menit — kurangi request API |
| **useMemo untuk derived data** | regionCenters, filterCategories dihitung sekali per perubahan data |
| **useCallback untuk handler** | resetFilters, flyTo — referensi stabil, cegah re-render |
| **Hoisted RegExp** | 17+ regex dikompilasi 1x di level modul (bukan per pemanggilan fungsi) |
| **Single-pass iteration** | Data sosialisasi diproses dalam 1 loop (bukan 3 loop terpisah) |
| **content-visibility: auto** | Elemen off-screen tidak di-render sampai terlihat |
| **Derive state during render** | usePagination reset halaman tanpa useEffect (eliminasi 1 render) |

---

## ➕ Cara Menambah Fitur Baru

### 1. Fitur dengan API

```
1. Tambah tipe API di src/services/api-types.ts
2. Buat service baru: src/services/nama-fitur.service.ts
   - fetchNamaFiturList(): fetch + transform
3. Buat query hook: src/hooks/nama-fitur/use-nama-fitur-query.ts
   - Wrapper React Query + QUERY_CONFIG
4. Buat filter/logic hook: src/hooks/nama-fitur/use-nama-fitur.ts
5. Buat page hook: src/hooks/nama-fitur/use-nama-fitur-page.ts
6. Buat komponen: src/components/nama-fitur/NamaFiturPage.tsx
7. Buat route: src/app/nama-fitur/page.tsx + loader.tsx (jika pakai peta)
8. Update barrel files (index.ts) di setiap folder
```

### 2. Halaman Informasi (Statis)

```
1. Tambah data di src/content/informasi.ts
2. Buat komponen: src/components/informasi/NamaPage.tsx
3. Tambah slug di src/app/informasi/[slug]/page.tsx → pageComponents
4. Update generateStaticParams()
```

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---|---|
| Peta tidak muncul | Pastikan halaman peta menggunakan `ssr: false` di loader.tsx |
| Data tidak muncul | Cek backend berjalan, cek `.env.local` untuk `NEXT_PUBLIC_API_URL` |
| Build error "Cannot find module" | Cek path import — harus `@/content/nama-file` (bukan `@/data/`) |
| Login gagal | Pastikan `DEMO_USER_EMAIL`, `DEMO_USER_NIP`, `DEMO_USER_PASSWORD` di `.env.local` |
| TypeScript error di route | Pastikan `params` di-await: `const { id } = await params` |

---

## 🌿 Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000  # atau URL production

# Auth (Demo Mode)
DEMO_USER_EMAIL=admin@example.com
DEMO_USER_NIP=123456789
DEMO_USER_PASSWORD=password123

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Security
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 📚 Dokumentasi Lainnya

| File | Isi |
|---|---|
| `docs/API_DOCUMENTATION.md` | Referensi lengkap semua endpoint REST API backend |
| `docs/DOKUMENTASI-PROYEK.md` | Dokumentasi teknis detail (versi diperluas dari dokumen ini) |
| `docs/CHANGELOG-CLEANUP.md` | Log pembersihan dan optimasi kode terakhir |
