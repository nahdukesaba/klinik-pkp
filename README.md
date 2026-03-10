# Klinik PKP - Perumahan dan Kawasan Permukiman

Aplikasi web untuk Klinik Perumahan dan Kawasan Permukiman BP3KP Sumatera II.  
Dibangun dengan **Next.js 16**, **TypeScript**, **Tailwind CSS**, dan **React Query**.

## Table of Contents

- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Getting Started](#getting-started)
- [Konfigurasi API](#konfigurasi-api)
- [Arsitektur](#arsitektur)
- [Konvensi Kode](#konvensi-kode)
- [Keamanan](#keamanan)
- [Panduan Kontribusi](#panduan-kontribusi)

## Teknologi

| Kategori       | Stack                                                      |
| -------------- | ---------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)  |
| Language       | [TypeScript](https://www.typescriptlang.org/) strict mode  |
| Styling        | [Tailwind CSS](https://tailwindcss.com/) + CSS Variables   |
| Data Fetching  | [TanStack React Query](https://tanstack.com/query) v5      |
| Maps           | [Leaflet](https://leafletjs.com/) via dynamic import       |
| Icons          | [Lucide React](https://lucide.dev/)                        |
| UI Components  | Custom components + [Radix UI](https://radix-ui.com/)      |
| Validation     | [Zod](https://zod.dev/)                                    |
| Auth           | JWT via [jose](https://github.com/panva/jose) (Edge-ready) |

## Struktur Folder

```
src/
├── app/                    # Next.js App Router (ROUTING ONLY)
│   ├── layout.tsx          # Root layout (Providers, CSP nonce)
│   ├── page.tsx            # Homepage / Landing
│   ├── not-found.tsx       # 404 page
│   ├── api/                # API Route Handlers (auth, health)
│   └── [route]/page.tsx    # Feature pages (import dari components/)
│
├── components/             # UI Components (PURE PRESENTATION)
│   ├── ui/                 # Base UI primitives (Button, Select, etc.)
│   ├── layout/             # Layout (Navbar, Footer)
│   ├── providers/          # Context providers (Theme, QueryClient)
│   ├── shared/             # Shared/reusable components
│   └── [feature]/          # Per-feature components
│
├── hooks/                  # Custom React Hooks (100% LOGIC)
│   ├── use-lazy-mount.ts   # IntersectionObserver lazy mount
│   ├── use-debounce.ts     # Input debouncing
│   ├── use-cascading-filter.ts # Cascading location filter
│   └── [feature]/          # Per-feature hooks (query, filter, map)
│
├── content/                # Static data files (konten statis)
│
├── lib/                    # Utilities & helpers
│   ├── api-client.ts       # Centralized fetch client
│   ├── auth.ts             # JWT token management
│   ├── constants.ts        # App constants & API config
│   ├── security.ts         # XSS/CSRF protection utilities
│   ├── map-utils.ts        # Leaflet map helpers
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # General utilities (cn, etc.)
│
└── proxy.ts                # Middleware: CSP, auth guard, rate limiting
```

## Getting Started

### Prerequisites

- Node.js 18.x atau lebih baru
- npm, yarn, atau pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd klinik-pkp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — isi API_URL dengan URL backend Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Konfigurasi API

### Environment Variables

Backend API URL dikonfigurasi di `.env.local`:

```bash
# URL backend API (server-side only — TIDAK terexpose ke browser)
API_URL=http://localhost:8000/api/v1
# atau dengan ngrok:
# API_URL=https://abc123.ngrok-free.dev/api/v1
```

> **PENTING:** Jangan gunakan prefix `NEXT_PUBLIC_` untuk `API_URL`.  
> Prefix tersebut membuat nilai masuk ke client-side JavaScript bundle  
> dan terlihat di browser DevTools.

### Bagaimana API Request Bekerja

```
Browser → /api/ext/rusun → Next.js Rewrite → Backend API_URL/rusun
          (same-origin)     (server-side)      (tersembunyi)
```

1. Browser mengirim request ke `/api/ext/rusun` (same-origin)
2. Next.js server me-rewrite ke `API_URL/rusun` (dikonfigurasi di `next.config.mjs`)
3. Response dikembalikan ke browser — backend URL tidak pernah terexpose

Ini menghindari CORS dan menyembunyikan URL backend dari client.

### API Documentation

Dokumentasi lengkap endpoint API ada di [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Arsitektur

### Prinsip Utama

1. **Separation of Concerns**
   - `app/` → Routing only (page.tsx, layout.tsx)
   - `components/` → Pure UI (no state/effects/fetch/filter logic)
   - `hooks/` → 100% business logic
   - `content/` → Static/mock data
   - `lib/` → Utilities & helpers

2. **Lazy Loading**
   - Gunakan `next/dynamic` untuk modul berat / client-only (contoh: map)
   - Skeleton loading untuk UX yang smooth
   - Map di-lazy mount agar tidak di-init sebelum terlihat

3. **Performance Optimizations**
   - Debounced inputs (250-300ms delay)
   - Lazy mounting untuk komponen berat
   - Image optimization dengan `next/image`
   - SSR dinonaktifkan hanya untuk bagian yang membutuhkan akses `window` (Leaflet)

### Contoh Page Flow (Static Data)

```
app/kawasan-kumuh/page.tsx
  └─> components/kawasan-kumuh/KawasanKumuhPage.tsx
      └─> useKawasanKumuhPage() hook
          └─> content/housing-indicators.ts   (static data)
```

### Contoh Page Flow (API Data — Sebaran Rusun)

```
app/sebaran-rusun/page.tsx
  └─> components/sebaran-rusun/SebaranRusunPage.tsx
      └─> useSebaranRusun()                   (filter, state, map, navigation)
          ├─> useRusunQuery()                 (React Query → API fetch)
          │   └─> apiClient.get("/rusun")      (via /api/ext rewrite)
          └─> useRusunMap()                   (Leaflet map, markers)
```

### Pola Migrasi Static → API

Saat memigrasikan fitur dari data statis ke API:

1. **Buat query hook** di `hooks/[feature]/use-[feature]-query.ts`
   - Definisikan API types (snake_case) dan frontend types (camelCase)
   - Transform data di `transformItem()` function
   - Gunakan React Query untuk caching & error handling
2. **Ubah data source** di hook utama (ganti import static → `useXxxQuery()`)
3. **Tambah loading/error state** di komponen page
4. **Komponen UI tidak perlu berubah** — mereka tetap menerima data yang sama

### Hook Pattern

Semua logic ada di hooks, contoh:

```typescript
// hooks/kawasan-kumuh/use-kawasan-kumuh.ts
export function useKawasanKumuh() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 300);
  
  // Filtered data dengan useMemo
  const filteredData = useMemo(() => {
    // filter logic
  }, [filter, debouncedSearch]);
  
  return { filter, setFilter, search, setSearch, filteredData };
}
```

## Konvensi Kode

### File Naming

- **Components**: PascalCase (`BankDesainPage.tsx`)
- **Hooks**: camelCase with `use-` prefix (`use-bank-desain.ts`)
- **Data files**: kebab-case (`bank-desain.ts`)

### Component Structure

```typescript
// 1. "use client" directive (jika perlu)
"use client";

// 2. React imports
import { useState, useCallback } from "react";

// 3. Next.js imports
import dynamic from "next/dynamic";
import Image from "next/image";

// 4. External library imports
import { MapPin, Calendar } from "lucide-react";

// 5. Internal imports - components
import { Button } from "@/components/ui/button";

// 6. Internal imports - hooks
import { useKawasanKumuh } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh";

// 7. Internal imports - data
import { kawasanData } from "@/content/housing-indicators";

// 8. Types/interfaces (jika ada)
interface Props {
  title: string;
}

// 9. Component
export default function ComponentName({ title }: Props) {
  // hooks first
  // state second
  // computed values third
  // handlers last
  
  return (
    // JSX
  );
}
```

### Export Patterns

```typescript
// Selalu gunakan NAMED exports (bukan default exports)
// Konsisten di seluruh codebase untuk better tree-shaking

// hooks/use-lazy-mount.ts
export function useLazyMount() { ... }

// Import langsung ke file spesifik (bukan via barrel)
import { useKawasanKumuh } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh";

// Barrel export HANYA untuk shared/layout components yang dipakai banyak tempat:
import { Navbar, Footer } from "@/components/layout";
import { SectionHeader, ApiLoadingState } from "@/components/shared";
```

## Keamanan

### Security Headers (proxy.ts)

| Header                        | Nilai                          | Tujuan                           |
| ----------------------------- | ------------------------------ | -------------------------------- |
| Content-Security-Policy       | nonce-based policy             | Blokir XSS & script injection   |
| X-Frame-Options               | DENY                           | Anti-clickjacking                |
| Strict-Transport-Security     | max-age=63072000               | Force HTTPS                      |
| X-Content-Type-Options        | nosniff                        | Prevent MIME sniffing            |
| Cross-Origin-Opener-Policy    | same-origin                    | Prevent window access            |
| Permissions-Policy            | camera=(), microphone=(), etc. | Restrict browser features        |

### Input Sanitization

- Semua input form divalidasi dengan **Zod schemas** (`lib/validations.ts`)
- HTML output di-escape via `escapeHtml()` (`lib/security.ts`)
- Map popup content menggunakan `buildSafePopup()` (`lib/map-utils.ts`)
- URL di-sanitize via `sanitizeUrl()` sebelum dirender

### Authentication

- JWT disimpan di **httpOnly cookie** (tidak accessible via JavaScript)
- Cookie flags: `Secure`, `SameSite=Lax`, `httpOnly`
- CSRF protection via double-submit cookie pattern

## Panduan Kontribusi

### Menambah Fitur Baru

1. **Buat hook untuk logic**
   ```
   hooks/[feature]/use-[feature].ts
   ```

2. **Buat komponen untuk UI**
   ```
   components/[feature]/[Feature]Page.tsx
   ```

3. **Buat route**
   ```
   app/[feature]/page.tsx
   ```

4. **Import langsung** (tidak perlu update barrel)
   - Import hook via path langsung: `from "@/hooks/[feature]/use-[feature]"`
   - Import component via path langsung: `from "@/components/[feature]/[Feature]Page"`

### Checklist Sebelum Commit

- [ ] Logic ada di hooks, bukan di komponen (state/effect/fetch → hooks)
- [ ] Semua input menggunakan debounce (300ms)
- [ ] Komponen berat menggunakan lazy mount / dynamic import
- [ ] Tidak ada file deprecated, dead code, atau unused imports
- [ ] Semua exports menggunakan named exports (bukan default)
- [ ] TypeScript types lengkap (tidak ada `any`)
- [ ] Imports diorganisir sesuai konvensi (React → Next → External → Internal)
- [ ] Tidak ada `NEXT_PUBLIC_` untuk data sensitif (URL, keys, credentials)
- [ ] `npm run build` berhasil tanpa error

## License

Copyright © 2025 BP3KP Sumatera II. All rights reserved.
