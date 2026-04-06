# Struktur Project

Dokumen ini menjelaskan struktur folder yang dipakai di repo `klinik-pkp`, alasan pembagiannya, dan aturan praktis supaya developer berikutnya bisa melanjutkan tanpa harus menebak pola project.

## Prinsip

- `src/app` dipakai untuk routing, boundary server/client, metadata, error/loading state, dan route handler.
- `src/components` dipakai untuk UI dan komposisi tampilan.
- `src/hooks` dipakai untuk stateful client logic.
- `src/services` dipakai untuk akses data resource publik.
- `src/lib` dipakai untuk utilitas lintas fitur, auth, security, helper server, dan helper admin.
- `src/types` dipakai untuk type yang dipakai lintas layer.
- `src/content` dipakai untuk konten statis yang memang tidak perlu diambil dari backend.

Struktur ini sudah sejalan dengan pola yang disarankan di App Router: routing tetap berada di `app`, sedangkan implementasi detail bisa di-colocate atau dipisah berdasarkan kebutuhan fitur. Referensi resmi:

- https://nextjs.org/docs/app/getting-started/project-structure

## Peta Folder Saat Ini

```text
src/
  app/           -> route, layout, loading, error, API handlers
  components/    -> UI reusable dan komponen per fitur
  content/       -> data statis
  hooks/         -> client hooks reusable dan hooks per fitur
  lib/           -> helper umum + helper admin/server
  services/      -> akses data resource publik
  types/         -> shared types lintas fitur
```

## Aturan Penempatan File

### `src/app`

Simpan hanya file yang memang berkaitan dengan App Router:

- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- `route.ts` untuk API internal
- `loader.tsx` hanya bila route perlu lazy-load client page yang berat

Jangan taruh business logic panjang di route page. Idealnya `page.tsx` tipis dan hanya:

- ambil data server bila memang perlu
- set boundary loading/error
- render komponen feature/page

### `src/components`

Pakai pembagian ini:

- `components/ui` untuk primitive reusable seperti button, dialog, select
- `components/layout` untuk navbar, footer, shell global
- `components/shared` untuk komponen reusable lintas lebih dari satu fitur
- `components/admin` untuk area admin
- `components/admin/pages` untuk implementasi halaman admin yang berat, supaya route di `app/admin/*` tetap tipis
- `components/<fitur>` untuk komponen yang spesifik ke satu domain fitur

Kalau sebuah komponen hanya dipakai oleh satu fitur, simpan di folder fitur tersebut. Jangan naikkan ke `shared` terlalu cepat.

### `src/hooks`

Pakai root `hooks/` untuk hook generik lintas fitur:

- `use-debounce`
- `use-lazy-mount`
- `use-scroll-animation`
- `use-toast`

Pakai `hooks/<fitur>` untuk logic yang spesifik ke domain tertentu, misalnya query, filter, map state, dan controller page.

Khusus admin:

- `hooks/admin/*` dipakai untuk stateful logic halaman admin yang kompleks
- isi hook admin biasanya: query, pagination, dialog state, submit handler, delete handler, dan derived state
- file page admin sebaiknya tidak lagi berisi query/mutation panjang bila logic itu bisa dipindah ke `hooks/admin/*`

### `src/services`

Pakai untuk akses resource publik yang memiliki pola fetch sendiri. Contoh:

- `bank-desain.service.ts`
- `bsps.service.ts`
- `kawasan-kumuh.service.ts`

Kalau logic-nya khusus admin/server dan bergantung pada session atau backend admin, lebih cocok di `lib/admin`, bukan di `services`.

### `src/lib`

Gunakan `lib` untuk helper lintas layer:

- client umum: `api-client.ts`, `date.ts`, `utils.ts`
- security/auth: `auth.ts`, `security.ts`
- admin/server helper: `lib/admin/*`
- response/helper server umum: `lib/server/*`

Kalau sebuah helper hanya relevan untuk satu domain admin, simpan dekat domain admin tersebut.

## Konvensi yang Dipakai ke Depan

### 1. Hindari barrel file yang tidak dipakai

`index.ts` hanya boleh dibuat bila memang ada consumer yang mengimpor folder root tersebut, misalnya:

- `@/components/layout`
- `@/components/shared`
- `@/components/admin`

Kalau tidak ada import root seperti itu, lebih baik tidak membuat `index.ts` karena:

- menambah file yang harus dipelihara
- membuat struktur terasa lebih ramai
- membingungkan developer baru karena terlihat resmi, padahal tidak dipakai

### 2. Bedakan `shared` dan `feature-specific`

Masuk ke `shared` hanya jika:

- dipakai lintas dua fitur atau lebih
- API komponen cukup stabil
- namanya tetap masuk akal di luar konteks fitur asal

Kalau belum memenuhi itu, simpan di folder fitur.

### 3. Jaga page tetap tipis

Untuk route yang kompleks:

- `app/.../page.tsx` fokus ke route boundary
- komponen page di `components/<fitur>/...`
- logic page di `hooks/<fitur>/...`
- akses data di `services/...` atau `lib/admin/...`

Khusus area admin, pola yang dipakai sekarang:

- `app/admin/.../page.tsx` hanya sebagai route entry
- implementasi halaman berada di `components/admin/pages/...`
- stateful logic halaman berada di `hooks/admin/...`
- helper server admin tetap di `lib/admin/...`
- stateful client logic yang reusable bisa ditaruh di `hooks/...` bila nanti mulai dipakai lintas lebih dari satu halaman admin

### 4. Gunakan nama file yang menjelaskan peran

Contoh yang baik:

- `use-bank-desain-page.ts`
- `AdminSosialisasiManager.tsx`
- `backend-api.ts`

Hindari nama generik seperti:

- `helper.ts`
- `data.ts`
- `utils2.ts`

### 5. Types lokal tetap dekat dengan fitur bila belum lintas domain

Jangan semua type dipindah ke `src/types`. Pindahkan ke `src/types` hanya bila type dipakai lintas fitur atau lintas layer.

## Area yang Sudah Baik

- Pemisahan `app`, `components`, `hooks`, `services`, `lib`, dan `types` sudah cukup sehat.
- `components/admin` sudah terkumpul dengan baik.
- `lib/admin` membantu memisahkan concern admin/server dari resource publik.
- Route map berat memakai `loader.tsx`, ini masuk akal untuk App Router dan membantu menjaga bundle awal.

## Area yang Perlu Dijaga Saat Development Lanjutan

- Jangan menambah barrel `index.ts` baru tanpa consumer nyata.
- Jangan memindahkan komponen fitur ke `shared` hanya karena ingin terlihat rapi.
- Jika satu route makin besar, pertimbangkan colocation private folder seperti `_components` atau `_lib` di dalam route tersebut.
- Untuk modul admin baru, prioritaskan pola yang sudah ada:
  - page tipis di `app/admin/...`
  - UI di `components/admin/...`
  - helper server di `lib/admin/...`

## Cleanup yang Sudah Dilakukan

Cleanup aman yang sudah diterapkan:

- Menghapus `BeritaDetailLoader.tsx` yang tidak lagi dipakai route detail berita
- Menghapus barrel `index.ts` yang tidak punya consumer nyata di beberapa folder fitur dan hooks
- Memindahkan implementasi halaman admin yang berat keluar dari `src/app/admin/*` agar route App Router tetap fokus pada routing

Tujuannya bukan mengecilkan bundle secara langsung, melainkan:

- mengurangi file mati
- menyederhanakan struktur
- mengurangi kebingungan saat onboarding developer baru
