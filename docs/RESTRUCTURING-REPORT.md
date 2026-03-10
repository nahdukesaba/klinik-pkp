# Laporan Restrukturisasi Project — Best Practices Cleanup

Tanggal: Sesi saat ini  
Project: Klinik PKP (Next.js 16 + React 19 + TypeScript 5.8)

---

## Ringkasan Perubahan

| # | Perubahan | File/Folder | Status |
|---|-----------|-------------|--------|
| 1 | Hapus 12 barrel `index.ts` yang tidak terpakai | `src/hooks/`, `src/services/`, `src/components/` | ✅ |
| 2 | Update `.gitignore` untuk artefak AI | `.gitignore` | ✅ |
| 3 | Hapus artefak AI dari repo | `.agent/`, `.agents/`, `.claude/`, `skills-lock.json` | ✅ |
| 4 | Hapus `.cfpagesignore` (tidak relevan) | `.cfpagesignore` | ✅ |
| 5 | ~~Rename `proxy.ts` → `middleware.ts`~~ | `src/proxy.ts` | ❌ Dibatalkan |

---

## Detail Perubahan

### 1. Hapus 12 Barrel `index.ts` yang Tidak Terpakai

**Apa yang diubah:**  
Dihapus 12 file `index.ts` yang hanya berisi re-export tetapi tidak pernah digunakan oleh kode manapun.

**File yang dihapus:**
```
src/hooks/index.ts
src/services/index.ts
src/hooks/bank-desain/index.ts
src/hooks/berita/index.ts
src/hooks/kawasan-kumuh/index.ts
src/hooks/penerimaan-bsps/index.ts
src/hooks/sebaran-rusun/index.ts
src/hooks/sosialisasi/index.ts
src/components/bank-desain/index.ts
src/components/berita/index.ts
src/components/informasi/index.ts
src/components/kawasan-kumuh/index.ts
```

**Mengapa diubah:**  
Semua import di project menggunakan path langsung (contoh: `from "@/hooks/kawasan-kumuh/use-kawasan-kumuh"`) dan tidak ada satupun yang mengimport dari barrel (contoh: `from "@/hooks/kawasan-kumuh"`). File barrel ini adalah _dead code_ — ada tapi tidak pernah dijalankan.

**Dampak:**  
- Tidak ada perubahan fungsional — kode tetap berjalan sama persis
- Zero breaking changes karena memang tidak ada yang menggunakan file ini

**Keuntungan:**  
- Mengurangi file yang harus di-maintain (12 file × update setiap ada hook/service baru = potensi lupa update)
- Menghindari kebingungan developer baru ("barrel ini dipakai atau tidak?")
- Codebase lebih bersih — setiap file yang ada punya tujuan

**Catatan:** 3 barrel yang **tetap dipertahankan** karena aktif digunakan:
- `src/components/layout/index.ts` — 15 file mengimport `{ Navbar, Footer }` dari sini
- `src/components/shared/index.ts` — 12 file mengimport komponen shared dari sini  
- `src/components/landing/index.ts` — 1 file mengimport dari sini

---

### 2. Update `.gitignore` untuk Artefak AI

**Apa yang diubah:**  
Ditambahkan entri berikut ke `.gitignore`:
```gitignore
# AI Tool Artifacts
.agent/
.agents/
.claude/
skills-lock.json
```

**Mengapa diubah:**  
Folder `.agent/`, `.agents/`, `.claude/` dan file `skills-lock.json` adalah konfigurasi tool AI (GitHub Copilot, Claude) yang spesifik per-developer. File ini:
- Tidak relevan untuk kode project
- Berbeda di setiap mesin developer
- Berpotensi menimbulkan merge conflict yang tidak perlu

**Dampak:**  
- Git tidak akan track file AI di masa depan
- Tidak mempengaruhi kode atau build

**Keuntungan:**  
- Repository bersih dari file non-project
- Tidak ada merge conflict dari file konfigurasi AI
- Best practice — file tool-specific tidak masuk version control

---

### 3. Hapus Artefak AI dari Repository

**Apa yang diubah:**  
Dihapus folder dan file artefak AI:
```
.agent/     (folder konfigurasi AI agent)
.agents/    (folder konfigurasi AI skills)
.claude/    (folder konfigurasi Claude)
skills-lock.json  (lock file AI skills)
```

**Mengapa diubah:**  
Setelah ditambahkan ke `.gitignore`, file yang sudah ada harus dihapus secara manual agar Git berhenti melacaknya.

**Dampak & Keuntungan:**  
Sama dengan poin 2 — repository bersih.

---

### 4. Hapus `.cfpagesignore`

**Apa yang diubah:**  
Dihapus file `.cfpagesignore` dari root project.

**Mengapa diubah:**  
File ini adalah konfigurasi Cloudflare Pages, namun project ini di-deploy ke **Vercel**, bukan Cloudflare. Isi file tersebut bahkan menuliskan:
```
# Aplikasi ini di-deploy ke Vercel, bukan Cloudflare Pages
```

**Dampak:**  
- Tidak ada perubahan fungsional — file ini tidak pernah digunakan oleh Vercel

**Keuntungan:**  
- Menghindari kebingungan ("project ini pakai Cloudflare atau Vercel?")
- File konfigurasi platform yang tidak digunakan seharusnya tidak ada di repo

---

### 5. ~~Rename `proxy.ts` → `middleware.ts`~~ (DIBATALKAN)

**Apa yang direncanakan:**  
Rename `src/proxy.ts` ke `src/middleware.ts` karena ini adalah file middleware Next.js.

**Mengapa dibatalkan:**  
Setelah build, ditemukan bahwa **Next.js 16 telah mengganti konvensi penamaan** dari `middleware.ts` ke `proxy.ts`:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

File `proxy.ts` **sudah benar** untuk Next.js 16. Ini adalah perubahan breaking dari Next.js — versi sebelumnya (≤15) menggunakan `middleware.ts`, versi 16+ menggunakan `proxy.ts`.

**Pelajaran:**  
Selalu periksa versi framework yang digunakan sebelum menerapkan "best practices" dari dokumentasi versi lama.

---

## Perbedaan Middleware Frontend vs Backend

### Frontend Middleware (Next.js `proxy.ts`)

```
Browser Request → proxy.ts → Page Render → Response ke Browser
```

- **Berjalan di:** Edge Runtime / Server Node.js (sebelum halaman di-render)
- **Dipanggil:** Setiap HTTP request yang masuk ke Next.js
- **Tugas utama:**
  - Content Security Policy (CSP) — blokir script berbahaya
  - Security headers (HSTS, X-Frame-Options, dll)
  - Route protection — redirect user yang belum login
  - Rate limiting dasar
- **File:** `src/proxy.ts` (Next.js 16+)
- **Tidak bisa:** Akses database, query berat, business logic kompleks

### Backend Middleware (Go Fiber)

```
API Request → Go Fiber Middleware → Route Handler → Database → Response
```

- **Berjalan di:** Server Go (backend API)
- **Dipanggil:** Setiap HTTP request ke API endpoint
- **Tugas utama:**
  - CORS — izinkan request dari domain frontend
  - Authentication — verifikasi JWT token
  - Request parsing — validate body, query params
  - Logging — catat semua request
  - Error handling — tangkap panic/error
- **Tidak bisa:** Manipulasi UI, routing halaman, CSP headers

### Perbedaan Kunci

| Aspek | Frontend (proxy.ts) | Backend (Go Fiber) |
|-------|--------------------|--------------------|
| Bahasa | TypeScript | Go |
| Runtime | Edge/Node.js | Go Runtime |
| Fokus | Keamanan browser, routing | Auth, validasi, business logic |
| Akses DB | ❌ Tidak | ✅ Ya |
| Manipulasi UI | ✅ Redirect, rewrite | ❌ Tidak |
| Headers | CSP, HSTS, security | CORS, Auth tokens |

### Analoginya:
- **Frontend proxy** = Satpam di pintu masuk gedung (cek identitas, arahkan ke lantai yang benar)
- **Backend middleware** = Resepsionis di dalam gedung (verifikasi tujuan, catat kunjungan, hubungi ruangan yang dituju)

---

## Struktur Project Setelah Cleanup

```
klinik-pkp/
├── .gitignore          ← Updated (+ AI artifacts)
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── CHANGELOG-CLEANUP.md
│   ├── DEVELOPER-HANDOFF.md
│   ├── DOKUMENTASI-PROYEK.md
│   └── RESTRUCTURING-REPORT.md  ← Dokumen ini
├── public/
├── src/
│   ├── proxy.ts                  ← Next.js 16 proxy (benar, bukan middleware.ts)
│   ├── app/                      ← Route pages
│   ├── components/
│   │   ├── bank-desain/          ← Tanpa index.ts (dihapus)
│   │   ├── berita/               ← Tanpa index.ts (dihapus)
│   │   ├── informasi/            ← Tanpa index.ts (dihapus)
│   │   ├── kawasan-kumuh/        ← Tanpa index.ts (dihapus)
│   │   ├── landing/              ← index.ts TETAP ADA (dipakai)
│   │   ├── layout/               ← index.ts TETAP ADA (dipakai 15 file)
│   │   ├── shared/               ← index.ts TETAP ADA (dipakai 12 file)
│   │   └── ui/                   ← shadcn/ui components
│   ├── content/                  ← Static data
│   ├── hooks/
│   │   ├── use-*.ts              ← Shared hooks (tanpa index.ts)
│   │   ├── bank-desain/          ← Tanpa index.ts (dihapus)
│   │   ├── berita/               ← Tanpa index.ts (dihapus)
│   │   ├── kawasan-kumuh/        ← Tanpa index.ts (dihapus)
│   │   ├── penerimaan-bsps/      ← Tanpa index.ts (dihapus)
│   │   ├── sebaran-rusun/        ← Tanpa index.ts (dihapus)
│   │   └── sosialisasi/          ← Tanpa index.ts (dihapus)
│   ├── lib/                      ← Utilities
│   └── services/                 ← API services (tanpa index.ts)
```

**File yang dihapus total: 16 file**
- 12 barrel index.ts
- 3 folder AI artifacts (.agent/, .agents/, .claude/)
- 1 file konfigurasi tidak relevan (.cfpagesignore)
- 1 file lock AI (skills-lock.json)

**Build status: ✅ 20/20 halaman berhasil di-generate**
