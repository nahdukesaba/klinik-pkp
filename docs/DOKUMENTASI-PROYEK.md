# Klinik PKP — Dokumentasi Teknis Lengkap

> **Portal informasi perumahan dan kawasan permukiman Sumatera Utara**
> Dikelola oleh BP3KP (Balai Pelaksana Penyediaan Perumahan) Sumatera II

---

## Daftar Isi

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Tech Stack & Dependensi](#2-tech-stack--dependensi)
3. [Cara Menjalankan Proyek](#3-cara-menjalankan-proyek)
4. [Struktur Folder](#4-struktur-folder)
5. [Arsitektur Aplikasi](#5-arsitektur-aplikasi)
6. [Sistem Routing (Halaman)](#6-sistem-routing-halaman)
7. [Service Layer — Integrasi API](#7-service-layer--integrasi-api)
8. [Hook Layer — Logic Bisnis](#8-hook-layer--logic-bisnis)
9. [Component Layer — Tampilan UI](#9-component-layer--tampilan-ui)
10. [Data Statis (Konten Tanpa API)](#10-data-statis-konten-tanpa-api)
11. [Keamanan & Middleware](#11-keamanan--middleware)
12. [Autentikasi (JWT)](#12-autentikasi-jwt)
13. [Theming & Styling](#13-theming--styling)
14. [Konvensi Kode](#14-konvensi-kode)
15. [Alur Pengembangan Fitur Baru](#15-alur-pengembangan-fitur-baru)
16. [Troubleshooting](#16-troubleshooting)
17. [Environment Variables](#17-environment-variables)

---

## 1. Gambaran Umum Proyek

Klinik PKP adalah **aplikasi web** yang menyediakan informasi lengkap tentang:

| Fitur | Deskripsi | Sumber Data |
|---|---|---|
| **Sebaran Rusun** | Peta lokasi rumah susun di Sumatera Utara | API Backend |
| **Kawasan Kumuh** | Peta dan data kawasan permukiman kumuh | API Backend |
| **Penerimaan BSPS** | Data bantuan stimulan perumahan swadaya | API Backend |
| **Bank Desain** | Katalog desain rumah (tipe, RAB, denah) | API Backend |
| **Sosialisasi** | Jadwal, peta, dan berita sosialisasi PKP | API Backend |
| **Berita** | Berita terkait sosialisasi dan kegiatan | API Backend |
| **Informasi** | FAQ, peraturan, perizinan, bahan bangunan | Data Statis |
| **Lokasi Klinik** | Alamat dan kontak klinik PKP | Data Statis |

**Backend**: Golang (Go Fiber), menyediakan REST API di `/api/v1/...`
**Frontend**: Next.js 16.2.1 (React 19.2.4), berkomunikasi dengan backend melalui proxy rewrite.

### Status Arsitektur Saat Ini

Jika ada bagian dokumentasi lama yang berbeda dengan poin di bawah, ikuti status ini sebagai sumber kebenaran terbaru:

- Dashboard admin sekarang **hanya untuk role `admin`**.
- Backend user directory memakai role `admin` dan `user`; role `user` tidak boleh masuk ke dashboard admin.
- Login admin menggunakan `email`, `nip`, dan `password`, dengan **NIP wajib tepat 18 digit**.
- Jika endpoint auth backend belum tersedia, aplikasi bisa memakai fallback login admin berbasis environment variable server-side (`ADMIN_EMAIL`, `ADMIN_NIP`, `ADMIN_PASSWORD`).
- Users di dashboard admin dibaca dari backend `/api/v1/users` dan tampil sebagai **read-only directory**.
- CRUD admin yang masih aktif diarahkan ke backend melalui route proxy `/api/admin/resources/[resource]`.
- Penyimpanan lokal `data/admin/*.json` sudah dihapus.
- Audit log admin saat ini masih **in-memory per server instance**, jadi belum persisten lintas restart.
- Login backend mengikuti dokumentasi terbaru: `POST /api/v1/authentications`, lalu profil pengguna diambil dari `GET /api/v1/users/me`.
- Jika login gagal, periksa `API_URL`, `AUTH_API_URL`, atau `AUTH_API_PATH`. Berdasarkan dokumentasi backend proyek, default path login adalah `POST /api/v1/authentications`.

---

## 2. Tech Stack & Dependensi

### Framework & Runtime

| Teknologi | Versi | Fungsi |
|---|---|---|
| **Next.js** | 16.2.1 | Framework React dengan App Router |
| **React** | 19.2.4 | Library UI |
| **TypeScript** | 6.0.2 | Bahasa pemrograman (strict mode) |
| **Turbopack** | built-in | Bundler untuk development (pengganti Webpack) |

### Library Utama

| Library | Fungsi |
|---|---|
| `@tanstack/react-query` | Pengambilan data dari API (caching, retry otomatis) |
| `leaflet` | Peta interaktif (sebaran rusun, kawasan kumuh, sosialisasi, BSPS) |
| `jose` | JWT untuk autentikasi (kompatibel Edge Runtime) |
| `zod` | Validasi data/form |
| `next-themes` | Fitur dark mode / light mode |
| `lucide-react` | Library ikon |
| `@radix-ui/react-*` | Komponen UI primitif (dialog, tooltip, toast, dll.) |
| `react-zoom-pan-pinch` | Zoom gambar desain rumah |
| `class-variance-authority` | Sistem varian komponen UI |
| `clsx` + `tailwind-merge` | Utility penggabungan class CSS |

### Development Tools

| Tool | Fungsi |
|---|---|
| `tailwindcss` + `@tailwindcss/typography` | Utility-first CSS framework |
| `eslint` + `eslint-plugin-import` | Linting kode + pengurutan import otomatis |
| `postcss` + `autoprefixer` | Pemrosesan CSS |

---

## 3. Cara Menjalankan Proyek

### Prasyarat

- **Node.js** ≥ 18.x
- **npm** (sudah termasuk dalam Node.js)
- **Backend API** berjalan di `http://localhost:8000/api/v1` (opsional — halaman tetap bisa dibuka, akan tampil error state jika backend mati)

### Langkah-Langkah

```bash
# 1. Clone repository
git clone <url-repository>
cd klinik-pkp

# 2. Install dependensi
npm install

# 3. Salin file environment
cp .env.example .env.local
# Edit .env.local sesuai kebutuhan (lihat bagian Environment Variables)

# 4. Jalankan development server
npm run dev
# Buka http://localhost:3000

# 5. Build untuk production
npm run build
npm start
```

### Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server (Turbopack, hot reload) |
| `npm run build` | Build production |
| `npm start` | Jalankan production build |
| `npm run lint` | Cek ESLint errors |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npx tsc --noEmit` | Cek TypeScript tanpa build |

---

## 4. Struktur Folder

```
klinik-pkp/
├── docs/                    # Dokumentasi proyek
├── public/                  # Asset statis (gambar, logo)
│   ├── logo-bp3kp.png
│   ├── sumatera-map-bg.jpg
│   ├── klinik.jpeg
│   └── service-*.jpg       # 6 gambar kartu layanan
├── src/
│   ├── app/                 # ⭐ Routing (App Router Next.js)
│   │   ├── layout.tsx       # Layout utama + providers
│   │   ├── page.tsx         # Landing page (/)
│   │   ├── not-found.tsx    # Halaman 404
│   │   ├── globals.css      # CSS global + variabel tema
│   │   ├── api/             # API Routes (auth, health)
│   │   └── [fitur]/         # Folder per halaman
│   │       ├── page.tsx     # Server Component (metadata SEO)
│   │       └── loader.tsx   # Client wrapper (dynamic import)
│   │
│   ├── types/               # Tipe data shared
│   │   └── api.ts           # Tipe API (Province, Region, ApiResponse, dll.)
│   │
│   ├── services/            # ⭐ Komunikasi dengan API Backend
│   │   ├── rusun.service.ts
│   │   ├── bank-desain.service.ts
│   │   ├── bsps.service.ts
│   │   ├── kawasan-kumuh.service.ts
│   │   └── sosialisasi.service.ts
│   │
│   ├── hooks/               # ⭐ React Hooks (logic bisnis)
│   │   ├── [fitur]/         # Folder per fitur
│   │   │   ├── use-*-query.ts   # Query hook (React Query)
│   │   │   ├── use-*.ts         # Hook spesifik
│   │   │   ├── use-*-page.ts    # Orkestrasi hook untuk halaman
│   │   │   └── index.ts         # Barrel export per subfolder
│   │   ├── use-cascading-filter.ts  # Filter bertingkat (kabupaten→kecamatan→kelurahan)
│   │   ├── use-scroll-animation.ts
│   │   └── use-debounce.ts
│   │
│   ├── components/          # ⭐ Komponen React (UI)
│   │   ├── [fitur]/         # Folder per fitur
│   │   ├── landing/         # Komponen halaman utama (hero, about, dll.)
│   │   ├── layout/          # Navbar, Footer
│   │   ├── shared/          # Komponen reusable (ApiStates, dll.)
│   │   ├── ui/              # Komponen primitif (button, card, skeleton)
│   │   └── providers/       # React context providers
│   │
│   ├── content/              # Data statis (konten tanpa API endpoint)
│   │   ├── building-steps.ts
│   │   ├── housing-indicators.ts
│   │   ├── informasi.ts
│   │   ├── lokasi-klinik.ts
│   │   └── tentang.ts
│   │
│   ├── lib/                 # Utility & konfigurasi
│   │   ├── api-client.ts    # HTTP client untuk API
│   │   ├── auth.ts          # JWT helper (create/verify token)
│   │   ├── constants.ts     # Konstanta aplikasi (URLs, navigasi)
│   │   ├── map-utils.ts     # Utility peta Leaflet
│   │   │   ├── security.ts      # escapeHtml, escapeAttr, sanitizeUrl, rate limiter
│   │   ├── date.ts          # Format tanggal Indonesia
│   │   ├── utils.ts         # cn() utility (className merger)
│   │   └── validations.ts   # Skema validasi Zod
│   │
│   └── proxy.ts             # Middleware (rate limit, CSP, keamanan)
│
├── eslint.config.mjs        # Konfigurasi ESLint + import ordering
├── tailwind.config.mjs      # Konfigurasi Tailwind CSS
├── tsconfig.json             # Konfigurasi TypeScript
├── next.config.mjs           # Konfigurasi Next.js (proxy, headers)
└── package.json
```

---

## 5. Arsitektur Aplikasi

### Diagram Alur Data

```
┌──────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                   │
│                                                                      │
│  ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────────────┐ │
│  │  Page    │───>│  Hook   │───>│  Service  │───>│  API Client     │ │
│  │  (UI)   │<───│  (Logic) │<───│  (Transform)│<───│  (HTTP Fetch)  │ │
│  └─────────┘    └─────────┘    └──────────┘    └────────┬─────────┘ │
│                                                          │           │
└──────────────────────────────────────────────────────────┼───────────┘
                                                           │
                                                  /api/ext/*  (proxy)
                                                           │
┌──────────────────────────────────────────────────────────┼───────────┐
│                      NEXT.JS SERVER                       │           │
│                                                           │           │
│  ┌────────────┐     ┌──────────────┐            Rewrite   │           │
│  │ proxy.ts   │────>│ Rate Limit   │              │       │           │
│  │ (middleware)│     │ CSP Nonce    │              ▼       │           │
│  │            │     │ Auth Check   │     next.config.mjs  │           │
│  └────────────┘     └──────────────┘    (rewrites rule)   │           │
│                                                           │           │
└──────────────────────────────────────────────────────────┼───────────┘
                                                           │
                                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      GOLANG BACKEND (Go Fiber)                       │
│                                                                      │
│  Base URL: http://localhost:8000/api/v1                               │
│                                                                      │
│  GET /rusun              → Data rumah susun                          │
│  GET /kawasan-kumuh      → Data kawasan kumuh                        │
│  GET /penerimaan-bsps    → Data penerima BSPS                       │
│  GET /berita             → Data bank desain rumah                    │
│  GET /sosialisasi        → Data sosialisasi (jadwal + berita)        │
│  GET /uploads/{cat}/{id}/{file} → Upload gambar                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Penjelasan Alur

1. **Browser** memanggil `/api/ext/rusun` (misalnya)
2. **Next.js Middleware** (`proxy.ts`) mengecek rate limit, menambah CSP nonce, dan memvalidasi path
3. **Next.js Rewrite** (`next.config.mjs`) meneruskan request ke backend `http://localhost:8000/api/v1/rusun`
4. **Backend** mengembalikan JSON dengan format `{ success: true, message: "...", data: [...] }`
5. **Service Layer** menerima JSON dan mentransformasi dari format API (snake_case) ke format frontend (camelCase)
6. **React Query** (di hook) meng-cache data, mengatur retry, dan menyediakan `isLoading/isError/refetch`
7. **Komponen UI** menampilkan loading spinner → data → atau error state

### Kenapa Pakai Proxy?

- **Keamanan**: URL backend tidak terekspose di browser (hanya `/api/ext/*` yang terlihat)
- **CORS**: Tidak perlu setting CORS di backend karena request berasal dari same-origin
- **Fleksibilitas**: URL backend bisa diganti di `.env.local` tanpa mengubah kode frontend

---

## 6. Sistem Routing (Halaman)

### Daftar Halaman

| Route | File | Tipe | Deskripsi |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Landing page — hero, about, layanan, indikator |
| `/bank-desain` | `app/bank-desain/page.tsx` | Server + Loader | Katalog desain rumah dengan filter |
| `/sebaran-rusun` | `app/sebaran-rusun/page.tsx` | Server + Loader | Peta sebaran rumah susun |
| `/kawasan-kumuh` | `app/kawasan-kumuh/page.tsx` | Server + Loader | Peta kawasan kumuh |
| `/penerimaan-bsps` | `app/penerimaan-bsps/page.tsx` | Server + Loader | Data penerima BSPS + peta |
| `/sosialisasi-klinik-pkp` | `app/sosialisasi-klinik-pkp/page.tsx` | Server + Loader | Peta, jadwal, berita sosialisasi |
| `/sosialisasi-klinik-pkp/berita/[id]` | `app/sosialisasi-klinik-pkp/berita/[id]/page.tsx` | Server | Detail berita sosialisasi |
| `/berita` | `app/berita/page.tsx` | Server | Daftar semua berita |
| `/berita/[id]` | `app/berita/[id]/page.tsx` | Server | Detail berita |
| `/informasi` | `app/informasi/page.tsx` | Server | Ringkasan informasi |
| `/informasi/[slug]` | `app/informasi/[slug]/page.tsx` | Server | Halaman informasi dinamis |
| `/lokasi-klinik` | `app/lokasi-klinik/page.tsx` | Server + Loader | Lokasi dan kontak klinik |
| `/login` | `app/login/page.tsx` | Server | Halaman login |
| `/api/auth/csrf` | `app/api/auth/csrf/route.ts` | API Route | Endpoint CSRF token |
| `/api/auth/login` | `app/api/auth/login/route.ts` | API Route | Endpoint login admin |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | API Route | Endpoint logout |
| `/api/health` | `app/api/health/route.ts` | API Route | Health check |

### Pola Server + Loader

Halaman yang menggunakan **peta Leaflet** memerlukan browser API (`window`, `document`). Karena Next.js App Router default-nya Server Component, kita menggunakan pola **loader**:

```
app/sebaran-rusun/
├── page.tsx        ← Server Component (export metadata untuk SEO)
└── loader.tsx      ← "use client" + dynamic(() => import("..."), { ssr: false })
```

**Alur:**
1. `page.tsx` → export metadata SEO, render `<Loader />`
2. `loader.tsx` → `"use client"`, lazy-load komponen utama dengan `ssr: false`
3. Komponen utama → render peta Leaflet (hanya di browser)

**Kenapa?** Leaflet butuh `window` dan `document` yang tidak ada di server. Dengan `ssr: false`, komponen hanya di-render di browser.

---

## 7. Service Layer — Integrasi API

### Lokasi File

```
src/types/
└── api.ts                    # Tipe API shared (ApiResponse, Province, Region, dll.)

src/services/
├── rusun.service.ts          # Sebaran Rusun
├── bank-desain.service.ts    # Bank Desain
├── bsps.service.ts           # Penerimaan BSPS
├── kawasan-kumuh.service.ts  # Kawasan Kumuh
└── sosialisasi.service.ts    # Sosialisasi (paling kompleks)
```

### Pola Umum Setiap Service

Setiap file service mengikuti pola yang sama:

```typescript
// 1. Tipe API (snake_case — sesuai format JSON dari backend)
interface XxxApiItem {
  id: number;
  name: string;
  area_name: string;       // ← snake_case dari backend
  total_population: number;
  coordinate: CoordinateApi;
  // ...
}

// 2. Tipe Frontend (camelCase — dipakai oleh hooks & komponen)
export interface XxxData {
  id: number;
  name: string;
  areaName: string;         // ← camelCase untuk frontend
  totalPopulation: number;
  coordinates: [number, number]; // tuple [lat, lng]
  // ...
}

// 3. Fungsi Transform (API → Frontend)
export function transformXxxItem(item: XxxApiItem): XxxData {
  return {
    id: item.id,
    name: item.name,
    areaName: item.area_name,
    totalPopulation: item.total_population,
    coordinates: [item.coordinate.latitude, item.coordinate.longitude],
    // ...
  };
}

// 4. Fungsi Fetch (dipanggil oleh React Query)
export async function fetchXxxList(): Promise<XxxData[]> {
  const response = await apiClient.get<ApiResponse<XxxApiItem[]>>("/endpoint");
  if (!response.success || !response.data) return [];
  return response.data.map(transformXxxItem);
}
```

### Detail Per Service

#### `rusun.service.ts` — Sebaran Rusun
- **Endpoint**: `GET /api/ext/rusun`
- **Transform**: Termasuk `buildImageUrl()` — fungsi shared untuk membangun URL gambar dari API
- **Ekstra**: `deriveRegionCenters()` — menghitung pusat region dari data koordinat

#### `bank-desain.service.ts` — Bank Desain
- **Endpoint**: `GET /api/ext/berita` (endpoint bernama "berita" tapi isinya desain rumah)
- **Transform**: Tipe desain ("T36", "T45", "T54", "T70") ditentukan dari `bedroom_count`
- **Ekstra**: `deriveFilterCategories()` — membuat daftar filter unik dari data

#### `bsps.service.ts` — Penerimaan BSPS
- **Endpoint**: `GET /api/ext/penerimaan-bsps`
- **Transform**: Status dari API ("Rencana"/"Dalam Proses"/"Selesai") → frontend ("rencana"/"proses"/"selesai")
- **Ekstra**: Menyimpan konstanta UI (warna status, persyaratan, prosedur, kriteria)

#### `kawasan-kumuh.service.ts` — Kawasan Kumuh
- **Endpoint**: `GET /api/ext/kawasan-kumuh`
- **Transform**: `deriveSlumStatus()` menentukan status berdasarkan nilai kumuh (≥71: berat, 40-70: sedang, <40: ringan)
- **Ekstra**: `kawasanStatusColors` — mapping warna per status

#### `sosialisasi.service.ts` — Sosialisasi ⭐ (Paling Kompleks)
- **Endpoint**: `GET /api/ext/sosialisasi`
- **Dua output type dari satu API:**
  - `SosialisasiLocation` — untuk peta dan jadwal (id, nama, koordinat, tanggal, status)
  - `BeritaSosialisasi` — untuk berita (judul, gambar, deskripsi, bulan)
- **Transform**: Parsing tanggal RFC3339 → format Indonesia, menghitung status ("selesai"/"mendatang")
- **Ekstra**: `computeStatus()`, `extractTimeRange()` dari timestamp

### Shared Types (`src/types/api.ts`)

```typescript
// Hierarki wilayah Indonesia (dari backend)
ProvinceApi → RegionApi → DistrictApi → VillageApi

// Envelope response standar dari semua endpoint
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Helper: Ekstrak nama dengan fallback bertingkat
extractVillageName(village?)     // nama kelurahan
extractDistrictName(district?)   // nama kecamatan
extractRegionName(region?)       // nama kabupaten/kota
```

---

## 8. Hook Layer — Logic Bisnis

### Lokasi File

```
src/hooks/
├── bank-desain/
│   ├── use-bank-desain-query.ts   # React Query: fetch + cache data
│   ├── use-bank-desain.ts          # Filter, pencarian, pagination
│   └── use-bank-desain-page.ts     # Orkestrasi untuk halaman
├── penerimaan-bsps/
│   ├── use-bsps-query.ts
│   ├── use-penerimaan-bsps.ts
│   ├── use-penerimaan-map.ts
│   └── use-penerimaan-bsps-page.ts
├── kawasan-kumuh/
│   ├── use-kawasan-kumuh-query.ts
│   ├── use-kawasan-kumuh.ts
│   ├── use-kawasan-kumuh-map.ts
│   └── use-kawasan-kumuh-page.ts
├── sebaran-rusun/
│   ├── use-rusun-query.ts
│   ├── use-sebaran-rusun.ts
│   ├── use-rusun-map.ts
│   └── use-sebaran-rusun-page.ts
├── sosialisasi/
│   ├── use-sosialisasi-query.ts
│   ├── use-sosialisasi-pkp-map.ts
│   ├── use-sosialisasi-pkp-jadwal.ts
│   ├── use-sosialisasi-pkp-berita.ts
│   └── use-sosialisasi-pkp-page.ts
├── berita/
│   └── use-berita-detail.ts
├── use-cascading-filter.ts    # Filter bertingkat (reusable)
├── use-pagination.ts          # Generic pagination (reusable)
├── use-year-filter.ts         # Default tahun sekarang (reusable)
├── use-scroll-animation.ts
├── use-debounce.ts
├── use-lazy-mount.ts
└── use-toast.ts
```

> **Catatan:** Setiap subfolder fitur memiliki `index.ts` barrel export.

### Pola Hook per Fitur

Setiap fitur memiliki 3-4 hook berlapis:

```
use-*-query.ts     → Ambil data dari API (React Query)
        ↓
use-*.ts           → Olah data (filter, search, pagination)
        ↓
use-*-map.ts       → Kelola peta Leaflet (opsional)
        ↓
use-*-page.ts      → Gabungkan semuanya untuk halaman
```

#### Layer 1: Query Hook (`use-*-query.ts`)

```typescript
// Contoh: use-bank-desain-query.ts
import { QUERY_CONFIG } from "@/lib/constants";

export function useBankDesainQuery() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bank-desain"],     // cache key
    queryFn: fetchBankDesainList,  // dari service
    ...QUERY_CONFIG,               // shared config (staleTime, gcTime, retry, dll.)
  });

  return {
    data: data ?? [],
    categories: derivedCategories,  // dihitung dari data
    isLoading,
    isError,
    error,
    refetch,
  };
}
```

#### Layer 2: Logic Hook (`use-*.ts`)

Menangani filter, pencarian, dan pagination — menerima data dari query hook.

#### Layer 3: Map Hook (`use-*-map.ts`)

Mengelola instance Leaflet: inisialisasi, marker, popup, cleanup. Menggunakan utility dari `lib/map-utils.ts`.

#### Layer 4: Page Hook (`use-*-page.ts`)

Menggabungkan semua hook menjadi satu objek yang langsung dikonsumsi oleh komponen halaman.

### Hook Reusable

| Hook | Fungsi |
|---|---|
| `useCascadingFilter` | Filter bertingkat: kabupaten → kecamatan → kelurahan. Dipakai di sebaran rusun, kawasan kumuh, sosialisasi, BSPS |
| `usePagination` | Generic pagination dengan auto-reset saat data berubah. Dipakai di bank desain, berita sosialisasi |
| `useYearFilter` | Filter tahun dengan default `CURRENT_YEAR`. Siap pakai untuk halaman yang butuh filter tahun |
| `useDebounce` | Delay eksekusi (untuk search input) |
| `useLazyMount` | Tunda render komponen berat (peta) hingga halaman siap |
| `useScrollAnimation` | Animasi scroll intersection observer |
| `useToast` | Notifikasi toast |

---

## 9. Component Layer — Tampilan UI

### Struktur

```
src/components/
├── landing/              # Komponen halaman utama (/)
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── BuildingStepsSection.tsx
│   ├── HousingIndicatorsSection.tsx
│   └── ...
├── bank-desain/
│   ├── BankDesainPage.tsx        # Halaman utama
│   └── DesignPreviewDialog.tsx   # Dialog preview gambar
├── sebaran-rusun/
│   ├── SebaranRusunPage.tsx
│   └── RusunComponents.tsx
├── kawasan-kumuh/
│   ├── KawasanKumuhPage.tsx
│   └── KawasanKumuhComponents.tsx
├── penerimaan-bsps/
│   ├── PenerimaanBspsPage.tsx
│   ├── BspsMapSection.tsx
│   ├── BspsSidebar.tsx
│   └── BspsSections.tsx
├── sosialisasi-pkp/
│   ├── SosialisasiKlinikPage.tsx
│   ├── PKPBeritaSection.tsx
│   ├── PKPJadwalSection.tsx
│   └── ...
├── berita/
│   ├── BeritaDetailPage.tsx
│   ├── BeritaCard.tsx
│   └── RelatedNewsCard.tsx
├── informasi/
│   ├── InformasiDynamicPage.tsx
│   ├── TentangPage.tsx
│   ├── FaqPage.tsx
│   └── ...
├── layout/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── shared/
│   ├── ApiStates.tsx             # ⭐ Loading, Error, Empty state
│   ├── GridPagination.tsx        # Pagination grid (nomor halaman + ellipsis)
│   ├── SidebarPagination.tsx     # Pagination sidebar (prev/next sederhana)
│   ├── DateRangeFilterGroup.tsx  # Filter tanggal (tahun, bulan, rentang)
│   └── ...
├── ui/                           # Komponen primitif (shadcn/ui pattern)
│   ├── button.tsx
│   ├── card.tsx
│   ├── skeleton.tsx
│   └── ...
└── providers/
    ├── QueryProvider.tsx          # TanStack React Query
    └── ThemeProvider.tsx          # Dark/Light mode
```

### Loading & Error States

Setiap halaman yang mengambil data dari API memiliki **tiga state**:

```tsx
// Di setiap halaman yang menggunakan API:
import { ApiLoadingState, ApiErrorState } from "@/components/shared";

export default function SomeDataPage() {
  const { data, isLoading, isError, refetch } = useSomeQuery();

  // State 1: Loading — spinner + pesan
  if (isLoading) return <ApiLoadingState message="Memuat data..." />;

  // State 2: Error — ikon error + tombol coba lagi
  if (isError) return <ApiErrorState onRetry={refetch} />;

  // State 3: Data berhasil dimuat — tampilkan konten
  return <div>{/* konten utama */}</div>;
}
```

Komponen `ApiStates.tsx` menyediakan:
- **`ApiLoadingState`** — Spinner animasi + pesan yang bisa dikustomisasi
- **`ApiErrorState`** — Ikon error + pesan + tombol "Coba Lagi" + petunjuk cek backend
- **`ApiEmptyState`** — Ikon inbox kosong + pesan "Tidak ada data"

---

## 10. Data Statis (Konten Tanpa API)

Beberapa konten **tidak memiliki API endpoint** di backend dan disimpan sebagai data statis di `src/content/`:

| File | Dipakai Oleh | Konten |
|---|---|---|
| `building-steps.ts` | Landing page | Langkah-langkah membangun rumah |
| `housing-indicators.ts` | Landing page | Indikator perumahan |
| `informasi.ts` | Halaman informasi | FAQ, peraturan, perizinan, bahan bangunan |
| `lokasi-klinik.ts` | Halaman lokasi klinik | Alamat dan kontak |
| `tentang.ts` | About section + halaman tentang | Profil BP3KP |

> **Catatan untuk developer selanjutnya:** Jika backend menambahkan endpoint baru untuk konten ini, ikuti pola migrasi yang sama — buat service baru di `src/services/`, buat query hook di `src/hooks/`, lalu ubah import di komponen terkait.

---

## 11. Keamanan & Middleware

### File: `src/proxy.ts`

Middleware ini berjalan di **setiap request** (kecuali static assets). Fungsinya:

#### 1. Rate Limiting
- **Batas**: 60 request per menit per IP
- **Penyimpanan**: In-memory (cocok untuk single instance)
- **Cleanup**: Otomatis setiap 5 menit

#### 2. API Path Allowlist
Hanya path berikut yang diizinkan melewati proxy ke backend:

```
/api/ext/rusun
/api/ext/uploads/*
/api/ext/sosialisasi
/api/ext/bank-desain
/api/ext/kumuh
/api/ext/bsps
/api/ext/regions
/api/ext/districts
/api/ext/villages
```

Path lain yang dimulai dengan `/api/ext/` akan mendapat response **403 Forbidden**.

#### 3. Content Security Policy (CSP)
- Menggunakan **nonce** unik per request (`crypto.randomUUID()`)
- Nonce diteruskan ke layout.tsx melalui header `x-nonce`
- Mengizinkan: Google Fonts, Leaflet tiles, Instagram/Facebook embed, CDN tertentu

#### 4. Proteksi Route
- `/dashboard`, `/admin` → redirect ke `/login` jika tidak ada cookie auth
- `/login` → redirect ke `/` jika sudah login

#### 5. Security Headers
| Header | Nilai |
|---|---|
| `X-Frame-Options` | `DENY` (cegah clickjacking) |
| `Strict-Transport-Security` | `max-age=63072000` (force HTTPS) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Blokir kamera, mikrofon, payment, USB |

---

## 12. Autentikasi (JWT)

### File: `src/lib/auth.ts`

| Komponen | Detail |
|---|---|
| **Library** | `jose` (kompatibel Edge Runtime) |
| **Algoritma** | HS256 (HMAC-SHA256) |
| **Access Token** | Masa berlaku 15 menit, disimpan di cookie `klinik-pkp-token` |
| **Refresh Token** | Masa berlaku 7 hari, disimpan di cookie `klinik-pkp-refresh` |
| **Cookie Options** | `httpOnly: true`, `secure: true` (production), `sameSite: lax` |
| **Issuer/Audience** | `klinik-pkp` |

### Interface User

```typescript
interface AuthUser {
  id: string;
  email: string;
  nip: string;
  role: "admin" | "user";
  name: string;
}
```

### Alur Login
1. Client meminta CSRF token ke `GET /api/auth/csrf`.
2. User mengirim `email`, `nip`, dan `password` ke `POST /api/auth/login`.
3. Frontend memvalidasi **NIP tepat 18 digit** sebelum submit.
4. Server memvalidasi input, CSRF token, dan rate limit login.
5. Server mencoba fallback admin lokal dari environment variable bila dikonfigurasi, lalu meneruskan autentikasi ke backend auth endpoint jika diperlukan.
6. Hanya role backend yang ternormalisasi menjadi `admin` yang boleh masuk dashboard.
7. Server membuat access token + refresh token dan menyimpannya di httpOnly cookies.
8. Middleware/protected layout memeriksa cookie untuk akses ke `/admin`.

---

## 13. Theming & Styling

### Konfigurasi

| Aspek | Detail |
|---|---|
| **Framework CSS** | Tailwind CSS 3.4 |
| **Dark Mode** | Class-based (`dark` class di `<html>`) via `next-themes` |
| **Default Theme** | Dark mode |
| **Font** | Plus Jakarta Sans |
| **Warna** | HSL CSS variables di `globals.css` |
| **Breakpoints** | `xs: 475px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px` |

### Sistem Warna

Warna didefinisikan sebagai CSS variables di `globals.css`, memungkinkan theme switching tanpa rebuild:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --primary: 221.2 83.2% 53.3%;
  --destructive: 0 84.2% 60.2%;
  --success: 142 76% 36%;
  /* ... */
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

### Komponen UI

Menggunakan pola **shadcn/ui** — komponen primitif di `src/components/ui/` yang bisa dikustomisasi langsung (bukan library terinstall, tapi kode yang di-copy ke project).

---

## 14. Konvensi Kode

### Penamaan File

| Tipe | Format | Contoh |
|---|---|---|
| Komponen React | PascalCase | `BankDesainPage.tsx` |
| Hook | kebab-case dengan prefix `use-` | `use-bank-desain-query.ts` |
| Service | kebab-case dengan suffix `.service` | `bank-desain.service.ts` |
| Utility | kebab-case | `map-utils.ts` |
| Data statis | kebab-case | `building-steps.ts` |

### Penamaan Variabel & Tipe

| Konteks | Format | Contoh |
|---|---|---|
| Tipe API (dari backend) | PascalCase + suffix `Api` | `BspsApiItem`, `KumuhApiItem` |
| Tipe Frontend | PascalCase + suffix `Data` | `BspsData`, `KawasanKumuhData` |
| Fungsi fetch | camelCase + prefix `fetch` | `fetchBspsList()`, `fetchRusunList()` |
| Fungsi transform | camelCase + prefix `transform` | `transformBspsItem()` |
| React Hook | camelCase + prefix `use` | `useBankDesainQuery()` |
| Konstanta | camelCase atau UPPER_SNAKE_CASE | `bspsStatusColors`, `API_BASE_URL` |

### Import Ordering (ESLint Enforced)

Import harus diurutkan dengan blank line antar grup:

```typescript
// 1. Built-in / React
import { useState, useEffect } from "react";

// 2. External packages
import dynamic from "next/dynamic";
import { Building2 } from "lucide-react";

// 3. Internal (@/) — diurutkan alfabet dalam grup ini
import { Footer, Navbar } from "@/components/layout";
import { useKawasanKumuh } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh";
import { escapeHtml } from "@/lib/security";
import { fetchKumuhList } from "@/services/kawasan-kumuh.service";

// 4. Type imports (selalu di akhir)
import type { Metadata } from "next";
import type { KawasanKumuhData } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh-query";
```

**Urutan internal**: `@/components` → `@/hooks` → `@/lib` → `@/services` (alfabet)

### Aturan Linting

| Aturan | Konfigurasi |
|---|---|
| `import/order` | Error — urutan import harus benar |
| `no-console` | Warning — hanya `console.warn` dan `console.error` yang diizinkan |
| `@typescript-eslint/no-unused-vars` | Warning — prefix `_` untuk mengabaikan |
| `@typescript-eslint/no-explicit-any` | Warning |
| `prefer-const` | Error |

---

## 15. Alur Pengembangan Fitur Baru

### Skenario: Menambah Fitur dengan API Baru

Misalnya kita ingin menambah halaman **"Data PKP"** yang mengambil data dari endpoint `GET /api/v1/data-pkp`:

#### Langkah 1: Buat Service

```typescript
// src/services/data-pkp.service.ts

import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CoordinateApi } from "@/services/api-types";

// Tipe dari API (snake_case)
interface DataPkpApiItem {
  id: number;
  nama_kegiatan: string;
  tahun: number;
  coordinate: CoordinateApi;
}

// Tipe untuk frontend (camelCase)
export interface DataPkpData {
  id: number;
  namaKegiatan: string;
  tahun: number;
  coordinates: [number, number];
}

// Transform
function transformItem(item: DataPkpApiItem): DataPkpData {
  return {
    id: item.id,
    namaKegiatan: item.nama_kegiatan,
    tahun: item.tahun,
    coordinates: [item.coordinate.latitude, item.coordinate.longitude],
  };
}

// Fetch
export async function fetchDataPkpList(): Promise<DataPkpData[]> {
  const response = await apiClient.get<ApiResponse<DataPkpApiItem[]>>("/data-pkp");
  if (!response.success || !response.data) return [];
  return response.data.map(transformItem);
}
```

#### Langkah 2: Buat Query Hook

```typescript
// src/hooks/data-pkp/use-data-pkp-query.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDataPkpList, type DataPkpData } from "@/services/data-pkp.service";

export function useDataPkpQuery() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["data-pkp"],
    queryFn: fetchDataPkpList,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return { data: data ?? [], isLoading, isError, error, refetch };
}

export type { DataPkpData };
```

#### Langkah 3: Buat Komponen

```tsx
// src/components/data-pkp/DataPkpPage.tsx
"use client";

import { Footer, Navbar } from "@/components/layout";
import { ApiLoadingState, ApiErrorState } from "@/components/shared";
import { useDataPkpQuery } from "@/hooks/data-pkp/use-data-pkp-query";

export default function DataPkpPage() {
  const { data, isLoading, isError, refetch } = useDataPkpQuery();

  if (isLoading) return <ApiLoadingState message="Memuat data PKP..." />;
  if (isError) return <ApiErrorState onRetry={refetch} />;

  return (
    <>
      <Navbar />
      <main>{/* tampilkan data */}</main>
      <Footer />
    </>
  );
}
```

#### Langkah 4: Buat Route

```tsx
// src/app/data-pkp/page.tsx (Server Component)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data PKP — Klinik PKP",
  description: "...",
};

// Jika butuh Leaflet (peta), gunakan pola loader:
// export { default } from "./loader";

// Jika tidak butuh peta:
import DataPkpPage from "@/components/data-pkp/DataPkpPage";
export default function Page() {
  return <DataPkpPage />;
}
```

#### Langkah 5: Update Barrel Exports

Tambahkan barrel export (`index.ts`) di folder hooks dan components baru.

#### Langkah 6: Tambahkan ke Allowlist Middleware

Di `src/proxy.ts`, tambahkan path baru:

```typescript
const ALLOWED_API_PATHS = [
  "/api/ext/rusun",
  "/api/ext/data-pkp",  // ← tambahkan ini
  // ...
];
```

---

## 16. Troubleshooting

### Masalah Umum

| Masalah | Penyebab | Solusi |
|---|---|---|
| **Port 3000 sudah terpakai** | Dev server sebelumnya masih berjalan | `Get-Process -Name "node" \| Stop-Process -Force` lalu `npm run dev` ulang |
| **Halaman menampilkan error state** | Backend tidak berjalan / URL salah | Pastikan backend berjalan di URL yang sesuai `.env.local` |
| **Peta tidak muncul** | Leaflet CSS tidak dimuat | Pastikan `import "leaflet/dist/leaflet.css"` ada di hook peta |
| **Import ordering error** | ESLint mendeteksi urutan import salah | Jalankan `npm run lint:fix` untuk auto-fix |
| **TypeScript error setelah edit** | Cache Turbopack stale | Hapus `.next/`, restart dev server |
| **Gambar dari API tidak muncul** | URL gambar salah / ngrok expired | Cek `buildImageUrl()` di `rusun.service.ts`, pastikan `API_URL` benar |
| **"Cannot find module" tapi file ada** | VS Code cache stale | Restart TS Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server" |

### Reset Total Development Environment

```bash
# Matikan semua proses Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Hapus cache
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Jalankan ulang
npm run dev
```

### Verifikasi Kode Sebelum Push

```bash
# 1. Cek TypeScript
npx tsc --noEmit

# 2. Cek ESLint
npx eslint src/

# 3. Build production
npm run build
```

---

## 17. Environment Variables

### File: `.env.local`

| Variable | Wajib? | Deskripsi | Contoh |
|---|---|---|---|
| `API_URL` | Ya | URL backend API (server-only, tidak terekspose ke browser) | `http://localhost:8000/api/v1` |
| `JWT_SECRET` | Ya | Secret untuk signing JWT token | `your-secret-key-min-32-chars` |
| `ADMIN_NAME` | Opsional | Nama admin lokal fallback | `Administrator Klinik PKP` |
| `ADMIN_EMAIL` | Opsional | Email admin lokal fallback | `admin@klinikpkp.go.id` |
| `ADMIN_NIP` | Opsional | NIP admin lokal fallback, tepat 18 digit | `199001012020000001` |
| `ADMIN_PASSWORD` | Opsional | Password admin lokal fallback | `password-kuat` |
| `AUTH_API_URL` | Opsional | Full URL endpoint login backend bila path auth tidak default | `https://api.example.com/api/v1/auth/login` |
| `AUTH_API_PATH` | Opsional | Path login relatif terhadap `API_URL` | `/auth/login` |
| `NEXT_PUBLIC_APP_NAME` | Opsional | Nama aplikasi (tampil di UI) | `Klinik PKP` |
| `NEXT_PUBLIC_APP_URL` | Opsional | URL aplikasi | `http://localhost:3000` |

> **Penting**: Variable tanpa prefix `NEXT_PUBLIC_` hanya bisa diakses di server (middleware, API routes, server components). Variable dengan prefix `NEXT_PUBLIC_` bisa diakses di browser.

### Catatan Operasional Login Admin

- `API_URL` harus aktif dan dapat dijangkau dari server Next.js.
- Jika backend auth belum tersedia, isi `ADMIN_EMAIL`, `ADMIN_NIP`, dan `ADMIN_PASSWORD` di `.env.local` untuk login admin lokal.
- Jika endpoint auth backend tidak berada di path default, isi `AUTH_API_URL` atau `AUTH_API_PATH`.
- Jika `API_URL` memakai ngrok, pastikan URL tersebut belum expired.
- Login admin akan gagal bila backend mengembalikan role selain `admin`.

---

## Catatan Penutup

### Untuk Mentor
- Arsitektur mengikuti pola **separation of concerns**: Service (API) → Hook (Logic) → Component (UI)
- Keamanan sudah ditangani di beberapa layer: middleware, CSP, rate limiting, input sanitization
- Semua data dinamis menggunakan React Query dengan error handling yang konsisten

### Untuk Developer Selanjutnya
- Ikuti pola yang sudah ada saat menambah fitur baru (lihat bagian 15)
- Pastikan setiap file baru memiliki **JSDoc comment** di bagian atas
- Selalu jalankan `npx tsc --noEmit` dan `npx eslint src/` sebelum push
- Jika backend menambah endpoint baru, ikuti pola service → query hook → komponen
- Data statis di `src/content/` hanya untuk konten yang **benar-benar tidak ada API-nya**

### Catatan Penamaan

> **Sosialisasi** menggunakan nama berbeda di tiap layer:
> - Route: `sosialisasi-klinik-pkp/` (URL publik, tidak boleh diubah)
> - Components: `sosialisasi-pkp/`
> - Hooks: `sosialisasi/`
> - Service: `sosialisasi.service.ts`
>
> Ini adalah *known inconsistency* yang tidak di-refactor karena mengubah route akan memecah URL yang sudah dishare.

### Dokumentasi Lainnya

| File | Isi |
|---|---|
| `docs/API_DOCUMENTATION.md` | Referensi lengkap semua endpoint REST API backend |
| `README.md` | Gambaran singkat proyek + quick start |

---

*Dokumentasi ini terakhir diperbarui: Juli 2025*
*Dibuat untuk proyek Klinik PKP — BP3KP Sumatera II*
