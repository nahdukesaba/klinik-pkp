# Panduan Engineering (Ringkas)

Dokumen ini dibuat agar mudah dipindahkan ke Notion. Fokus pada bagian Berita dan Penerimaan BSPS, serta pola yang konsisten untuk menjaga proyek tetap scalable dan readable.

## 1) Arsitektur Ringkas

- Routing berada di folder app/ (hanya routing).
- UI berada di folder components/ (presentational).
- Logic berada di folder hooks/ (filtering, state, event handler).
- Data statis/mock berada di folder data/.
- Helper berada di folder lib/ (mis. format tanggal).

## 2) Alur Berita (Berita Sosialisasi)

**Data**
- Sumber data: data/sosialisasi-klinik.ts (export `beritaSosialisasiList`).

**Logic**
- Hook list: hooks/berita/use-berita-list.ts (sorting berdasarkan tanggal).
- Hook detail: hooks/berita/use-berita-detail.ts (validasi `notFound`, related news, carousel).

**UI**
- components/berita/BeritaListView.tsx → tampilan daftar.
- components/berita/BeritaDetailView.tsx → tampilan detail.
- components/berita/RelatedNewsCard.tsx → kartu berita terkait.

**Reusable helper**
- lib/date.ts: `formatDateId()` dan `formatDayNameId()` digunakan di komponen berita.

## 3) Alur Penerimaan BSPS

**Data**
- Sumber data: data/penerimaan-bsps.ts.

**Logic**
- Hook utama: hooks/penerimaan-bsps/use-penerimaan-bsps-page.ts (orchestrator).
- Filter & search: hooks/penerimaan-bsps/use-penerimaan-bsps.ts (menggunakan `useDebounce`).
- Map: hooks/penerimaan-bsps/use-penerimaan-map.ts (Leaflet + dynamic import).
- Lazy mount: hooks/use-lazy-mount.ts → map hanya di-init ketika visible.

**UI**
- components/penerimaan-bsps/PenerimaanBspsPage.tsx → container UI.
- components/penerimaan-bsps/BspsMapSection.tsx → filter bar + map.
- components/penerimaan-bsps/BspsSections.tsx → section lainnya.

## 4) Best Practices yang Dipakai

- **Debounce** pada input pencarian: `useDebounce` di `use-penerimaan-bsps.ts`.
- **Lazy mount** untuk komponen berat (Leaflet) agar tidak memuat map sebelum terlihat.
- **Dynamic import** hanya untuk modul berat / client-only.
- **Single responsibility**: logic di hooks, UI di components.
- **Shared helpers**: format tanggal dipusatkan di lib/date.ts.

## 5) Cara Menambah / Mengubah Berita

1. Tambah item baru di data/sosialisasi-klinik.ts pada array `beritaSosialisasiList`.
2. Pastikan field `rawDate` menggunakan format `YYYY-MM-DD` agar sorting konsisten.
3. UI otomatis update lewat `useBeritaList` dan `useBeritaDetail`.

## 6) Cara Menambah / Mengubah Data Penerimaan BSPS

1. Update data di data/penerimaan-bsps.ts.
2. Perubahan filter otomatis muncul di `BspsMapSection`.
3. Map akan memuat marker baru tanpa ubah UI.

## 7) Checklist Maintenance

- Apakah ada file UI lama/duplikat yang tidak dipakai?
- Apakah logic di UI (components/) sudah dipindah ke hooks?
- Apakah komponen berat menggunakan lazy mount?
- Apakah helper yang berulang dipusatkan di lib/?

## 8) Referensi Best Practices (Sumber)

- Next.js App Router: https://nextjs.org/docs/app
- Next.js Lazy Loading: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
- Client vs Server Components: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- React Hooks Best Practices: https://react.dev/learn/reusing-logic-with-custom-hooks
