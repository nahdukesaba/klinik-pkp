/**
 * Custom Hooks — Barrel export
 *
 * Semua hooks untuk state management & data access dikumpulkan di sini.
 * Untuk data statis, import langsung dari `@/content/` tanpa melalui hook.
 * Untuk data API, gunakan hooks yang memanfaatkan React Query.
 */

// Sosialisasi PKP hooks
export { useSosialisasiPKPMap } from "./sosialisasi/use-sosialisasi-pkp-map";
export { useSosialisasiPKPJadwal } from "./sosialisasi/use-sosialisasi-pkp-jadwal";
export { useSosialisasiPKPBerita } from "./sosialisasi/use-sosialisasi-pkp-berita";

// Berita hooks
export { useBeritaDetail } from "./berita/use-berita-detail";

// Kawasan Kumuh hooks
export { useKawasanKumuh } from "./kawasan-kumuh/use-kawasan-kumuh";
export { useKawasanKumuhMap } from "./kawasan-kumuh/use-kawasan-kumuh-map";
export { useKawasanKumuhPage } from "./kawasan-kumuh/use-kawasan-kumuh-page";

// Sebaran Rusun hooks
export { useRusunQuery, type RusunData } from "./sebaran-rusun/use-rusun-query";
export { useSebaranRusun } from "./sebaran-rusun/use-sebaran-rusun";
export { useRusunMap } from "./sebaran-rusun/use-rusun-map";

// Penerimaan BSPS hooks
export { usePenerimaanBsps } from "./penerimaan-bsps/use-penerimaan-bsps";
export { usePenerimaanMap } from "./penerimaan-bsps/use-penerimaan-map";
export { usePenerimaanBspsPage } from "./penerimaan-bsps/use-penerimaan-bsps-page";

// Bank Desain hooks
export { useBankDesain } from "./bank-desain/use-bank-desain";
export { useBankDesainPage } from "./bank-desain/use-bank-desain-page";

// Re-export hook lainnya
export { useScrollAnimation } from "./use-scroll-animation";
export { useToast, toast } from "./use-toast";
export { useDebounce } from "./use-debounce";

// Utility hooks
export { useLazyMount } from "./use-lazy-mount";
export { usePagination } from "./use-pagination";
export { useYearFilter } from "./use-year-filter";
export { useCascadingFilter } from "./use-cascading-filter";
export type {
  CascadingFilterState,
  CascadingFilterActions,
  CascadingFilterLists,
  UseCascadingFilterReturn,
} from "./use-cascading-filter";