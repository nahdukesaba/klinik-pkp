# Klinik PKP - Perumahan dan Kawasan Permukiman

Aplikasi web untuk Klinik Perumahan dan Kawasan Permukiman BP3KP Sumatera II. Dibangun dengan Next.js 14 App Router, TypeScript, dan Tailwind CSS.

## 📋 Table of Contents

- [Teknologi](#-teknologi)
- [Struktur Folder](#-struktur-folder)
- [Dokumentasi](#-dokumentasi)
- [Getting Started](#-getting-started)
- [Arsitektur](#-arsitektur)
- [Konvensi Kode](#-konvensi-kode)
- [Panduan Kontribusi](#-panduan-kontribusi)

## 🛠 Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) via dynamic import
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Custom components + Radix UI primitives

## 📁 Struktur Folder

```
src/
├── app/                    # Next.js App Router (ROUTING ONLY)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── not-found.tsx       # 404 page
│   └── [route]/            # Route folders
│       └── page.tsx        # Route page (import from components)
│
├── components/             # UI Components (PURE PRESENTATION)
│   ├── ui/                 # Base UI primitives (Button, Input, etc)
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── landing/            # Landing page sections
│   ├── informasi/          # Informasi page components
│   ├── berita/             # Berita page components
│   ├── kawasan-kumuh/      # Kawasan Kumuh page components
│   ├── sebaran-rusun/      # Sebaran Rusun page components
│   ├── penerimaan-bsps/    # Penerimaan BSPS page components
│   ├── bank-desain/        # Bank Desain page components
│   ├── sosialisasi-pkp/    # Sosialisasi PKP page components
│   ├── login/              # Login page components
│   ├── lokasi-klinik/      # Lokasi Klinik page components
│   └── shared/             # Shared/reusable components
│
├── hooks/                  # Custom React Hooks (100% LOGIC)
│   ├── index.ts            # Central export
│   ├── use-debounce.ts     # Input debouncing
│   ├── use-scroll-animation.ts
│   ├── use-toast.ts
│   ├── use-lazy-mount.ts   # Lazy mounting for heavy components
│   ├── use-sosialisasi-pkp-map.ts
│   ├── use-sosialisasi-pkp-jadwal.ts
│   ├── use-sosialisasi-pkp-berita.ts
│   ├── berita/             # Berita-specific hooks
│   ├── kawasan-kumuh/      # Kawasan Kumuh-specific hooks
│   ├── sebaran-rusun/      # Sebaran Rusun-specific hooks
│   ├── penerimaan-bsps/    # Penerimaan BSPS-specific hooks
│   └── bank-desain/        # Bank Desain-specific hooks
│
├── data/                   # Static data & mock data
│   ├── index.ts            # Central export
│   └── *.ts                # Feature-specific data files
│
└── lib/                    # Utilities & helpers
    ├── utils.ts            # General utilities
    └── constants.ts        # App constants
```

## 📚 Dokumentasi

- [Panduan Engineering](docs/engineering-guide.md) – ringkasan arsitektur, alur Berita & BSPS, dan referensi best practices.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x atau lebih baru
- npm atau yarn atau pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd klinik-pkp

# Install dependencies
npm install

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🏗 Arsitektur

### Prinsip Utama

1. **Separation of Concerns**
   - `app/` → Routing only (page.tsx, layout.tsx)
   - `components/` → Pure UI (no state/effects/fetch/filter logic)
   - `hooks/` → 100% business logic
   - `data/` → Static/mock data
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

### Contoh Page Flow

```
app/kawasan-kumuh/page.tsx          # Route entry
    └─> dynamic(() => import())     # Lazy load
        └─> components/kawasan-kumuh/KawasanKumuhPage.tsx
            └─> useKawasanKumuhPage() hook
                └─> data/peta-kawasan-kumuh.ts
```

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

## 📝 Konvensi Kode

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
import { useKawasanKumuh } from "@/hooks";

// 7. Internal imports - data
import { kawasanData } from "@/data";

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
// Central exports via index.ts
// hooks/index.ts
export { useKawasanKumuh } from "./kawasan-kumuh/use-kawasan-kumuh";

// components/kawasan-kumuh/index.ts
export { default as KawasanKumuhPage } from "./KawasanKumuhPage";
export { KawasanKumuhMap } from "./KawasanKumuhMap";
```

## 🤝 Panduan Kontribusi

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

4. **Update exports**
   - `hooks/index.ts`
   - `components/[feature]/index.ts`

### Checklist Sebelum Commit

- [ ] Tidak ada komponen dengan logic di dalam (state/effect/fetch harus di hooks)
- [ ] Semua input menggunakan debounce
- [ ] Page menggunakan dynamic import dengan skeleton
- [ ] Tidak ada file deprecated atau unused code
- [ ] Types/interfaces didefinisikan dengan benar
- [ ] Imports diorganisir sesuai konvensi

### Code Quality

- Gunakan `useCallback` untuk handler functions
- Gunakan `useMemo` untuk computed values yang expensive
- Avoid inline functions di JSX kecuali untuk kasus simple
- Prefer named exports untuk better tree-shaking

## 📜 License

Copyright © 2024 BP3KP Sumatera II. All rights reserved.
