# Changelog: Pembersihan & Optimasi Kode

> **Tanggal:** 27 Februari 2026
> **Build:** ✅ Berhasil (16 route, 0 error TypeScript)
> **Prinsip:** Zero perubahan UI/UX dan fungsionalitas

---

## Daftar Isi

1. [File yang Dihapus](#1-file-yang-dihapus)
2. [File yang Diubah](#2-file-yang-diubah)
3. [Optimasi Performa Sebelumnya](#3-optimasi-performa-sebelumnya)
4. [Ringkasan Dampak](#4-ringkasan-dampak)

---

## 1. File yang Dihapus

### Dead Code — Hook yang Tidak Dipakai

| File | Alasan Dihapus |
|---|---|
| `src/hooks/sosialisasi/use-sosialisasi-data.ts` | Wrapper kosong — hanya memanggil `useSosialisasiQuery()` lalu return hasilnya. Tidak diimport oleh file manapun (tidak ada consumer). Semua hook sudah langsung menggunakan `useSosialisasiQuery`. |
| `src/hooks/berita/use-berita-list.ts` | Hook untuk daftar berita + pagination yang tidak pernah diimport oleh komponen manapun. Tidak diekspor dari barrel file. Fungsionalitasnya sudah tertangani oleh `PKPBeritaSection` secara langsung. |

### Dead Code — Komponen yang Tidak Dipakai

| File | Alasan Dihapus |
|---|---|
| `src/components/berita/BeritaCard.tsx` | Komponen `BeritaCard`, `BeritaCardSkeleton`, dan tipe `BeritaData` tidak pernah diimport oleh file manapun. Halaman sosialisasi menggunakan `BeritaCard` lokal milik `PKPBeritaSection.tsx`, bukan yang ini. |

### Dead Code — Barrel File yang Tidak Diimport

| File | Alasan Dihapus |
|---|---|
| `src/data/index.ts` | Barrel file yang re-export dari `../content/*`. Tidak ada satupun file di project yang mengimport dari `@/data`. Semua consumer sudah import langsung dari `@/content/nama-file`. |
| `src/content/index.ts` | Barrel file yang re-export semua content. Tidak ada satupun file yang mengimport dari `@/content` (barrel) — semua import langsung ke file spesifik seperti `@/content/informasi`, `@/content/tentang`, dll. |

### Folder yang Dihapus

| Folder | Alasan |
|---|---|
| `src/data/` | Folder kosong setelah `index.ts` dihapus. Semua konten statis berada di `src/content/`. |

### Dokumentasi Lama yang Dihapus

| File | Alasan Dihapus |
|---|---|
| `docs/CHANGELOG-OPTIMASI.md` | Snapshot log refactoring lama. Isinya sudah tercakup di `DOKUMENTASI-PROYEK.md` yang lebih lengkap dan up-to-date. |
| `docs/notion-optimasi-report.md` | Laporan Notion untuk optimasi lama. Duplikat dari `CHANGELOG-OPTIMASI.md` dalam format yang berbeda. Sudah tidak relevan. |
| `docs/notion-report.md` | Laporan Notion untuk mentor. **Sudah usang** — masih menyebut `useSosialisasiData()` yang sudah dihapus, dan menyatakan "hanya fitur Sebaran Rusun yang menggunakan API" (sekarang semua 5 fitur sudah pakai API). |
| `docs/penjelasan-kode.md` | Penjelasan kode untuk mentor. **Sebagian usang** — referensi ke file-file yang sudah tidak ada (`InformasiDynamicPage.tsx`, `use-housing-indicators.ts`). Kontennya sudah tercakup di `DOKUMENTASI-PROYEK.md`. |

---

## 2. File yang Diubah

### A. Penghapusan Dead Export

| File | Export Dihapus | Alasan |
|---|---|---|
| `src/content/building-steps.ts` | `stepIconMapping` | Konstanta mapping ikon string → LucideIcon "untuk API" yang tidak pernah diimport oleh siapapun. Komentar JSDoc juga diperbarui agar tidak menyebut hook yang tidak ada. |
| `src/content/housing-indicators.ts` | `iconMapping` | Sama — mapping ikon string → LucideIcon yang tidak pernah diimport. Komentar JSDoc diperbarui. |
| `src/content/lokasi-klinik.ts` | `contactInfo` | Objek informasi kontak yang duplikat dengan data di `klinikData` dan tidak pernah diimport oleh komponen manapun. |

### B. Penghapusan Dual Export (Named + Default)

Semua file berikut memiliki **dua export**: `export function NamaKomponen` DAN `export default NamaKomponen`. Semua consumer di codebase menggunakan named import `{ NamaKomponen }`, jadi `export default` yang redundan dihapus untuk konsistensi.

| File | Export Default Dihapus |
|---|---|
| `src/components/landing/StepArrow.tsx` | `export default StepArrow` |
| `src/components/landing/ProgressIndicator.tsx` | `export default ProgressIndicator` |
| `src/components/shared/ImageZoomDialog.tsx` | `export default ImageZoomDialog` |
| `src/components/shared/MapFilterBar.tsx` | `export default MapFilterBar` |
| `src/components/bank-desain/DesignPreviewDialog.tsx` | `export default DesignPreviewDialog` |
| `src/components/berita/RelatedNewsCard.tsx` | `export default RelatedNewsCard` |
| `src/components/ui/searchable-select.tsx` | `export default SearchableSelect` |

### C. Update Barrel File

| File | Perubahan |
|---|---|
| `src/components/berita/index.ts` | Hapus re-export `BeritaCard`, `BeritaCardSkeleton`, dan tipe `BeritaData` karena file sumbernya sudah dihapus. |

### D. Fix Bug & Deprecation

| File | Perubahan | Dampak |
|---|---|---|
| `src/app/berita/[id]/page.tsx` | `params: { id: string }` → `params: Promise<{ id: string }>` + `await params`. Fungsi diubah jadi `async`. | Next.js 15+ mewajibkan `params` di-await. Tanpa ini, muncul deprecation warning dan akan error di versi mendatang. |
| `src/app/lokasi-klinik/page.tsx` | Komentar `src/data/lokasi-klinik.ts` → `src/content/lokasi-klinik.ts` | Akurasi dokumentasi kode — folder `src/data/` sudah tidak ada. |

### E. Perbaikan Komentar/Dokumentasi Kode

| File | Perubahan |
|---|---|
| `src/content/building-steps.ts` | Hapus komentar "Struktur ini siap untuk API - cukup ubah hook useBuildingSteps()" — hook tersebut tidak ada. Ganti dengan deskripsi akurat. |
| `src/content/housing-indicators.ts` | Hapus komentar "cukup ubah hook useHousingIndicators()" — hook tersebut tidak ada. Ganti deskripsi. Hapus komentar "dapat digunakan untuk validasi API response" pada interface — tidak ada API untuk data ini. |

---

## 3. Optimasi Performa Sebelumnya

Perubahan ini sudah diterapkan di sesi sebelumnya dan termasuk dalam build yang sama:

| File | Perubahan | Dampak |
|---|---|---|
| `next.config.mjs` | `optimizePackageImports` untuk lucide-react + 8 paket @radix-ui | Bundle size lebih kecil |
| `src/components/providers/QueryProvider.tsx` | Sinkronisasi `staleTime` dengan `QUERY_CONFIG` | Cache konsisten 5 menit |
| `src/hooks/use-pagination.ts` | Derive-state-during-render menggantikan useEffect | Eliminasi 1 extra render |
| `src/hooks/sosialisasi/use-sosialisasi-pkp-jadwal.ts` | `useCallback` untuk `resetFilters` | Referensi fungsi stabil |
| `src/hooks/sosialisasi/use-sosialisasi-pkp-berita.ts` | `useCallback` untuk `resetFilters` | Referensi fungsi stabil |
| `src/hooks/sosialisasi/use-sosialisasi-query.ts` | `EMPTY_RESULT` di level modul | Referensi stabil, useMemo tidak recalculate |
| `src/hooks/sebaran-rusun/use-rusun-query.ts` | `useMemo` + `EMPTY_RUSUN` | Memoize regionCenters |
| `src/hooks/bank-desain/use-bank-desain-query.ts` | `useMemo` + `EMPTY_DESAIN` | Memoize filterCategories |
| `src/hooks/kawasan-kumuh/use-kawasan-kumuh-query.ts` | `useMemo` + `EMPTY_KAWASAN` + `DEFAULT_CENTERS` | Memoize regionCenters |
| `src/hooks/kawasan-kumuh/use-kawasan-kumuh-map.ts` | `useCallback` untuk `flyTo` | Referensi fungsi stabil |
| `src/lib/security.ts` | 11 RegExp di-hoist ke level modul | Regex dikompilasi 1x |
| `src/lib/map-utils.ts` | 6 RegExp di-hoist ke level modul | Regex dikompilasi 1x |
| `src/proxy.ts` | 1 RegExp di-hoist ke level modul | Regex dikompilasi 1x |
| `src/services/sosialisasi.service.ts` | 3 iterasi array → 1 loop `for...of` | 3x lebih efisien |
| `src/app/globals.css` | Kelas `.content-auto` (content-visibility) | Render awal lebih cepat |

---

## 4. Ringkasan Dampak

### File Dihapus: 9 file
- 2 dead hook files
- 1 dead component file
- 2 dead barrel files
- 4 deprecated/redundant docs

### File Diubah: 12 file
- 3 file: hapus unused export
- 7 file: hapus redundant `export default`
- 1 file: update barrel setelah hapus komponen
- 1 file: fix Next.js deprecated params pattern

### Docs yang Dipertahankan: 2 file
- `docs/API_DOCUMENTATION.md` — Referensi API backend (essential)
- `docs/DOKUMENTASI-PROYEK.md` — Dokumentasi teknis utama (paling lengkap)

### Build Status
- ✅ 16 route compiled
- ✅ TypeScript passed
- ✅ 20/20 static pages generated
- ✅ 0 error, 0 warning
