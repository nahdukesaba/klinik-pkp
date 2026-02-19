/**
 * Custom Hooks - Central Export
 *
 * Semua hooks untuk data access dikumpulkan di sini.
 * Ketika API sudah siap, cukup ubah implementasi hooks ini
 * untuk fetch dari API, tanpa perlu mengubah komponen UI.
 */

export { useHousingIndicators } from "./use-housing-indicators";
export { useBuildingSteps } from "./use-building-steps";

// Sosialisasi PKP hooks
export { useSosialisasiPKPMap } from "./sosialisasi/use-sosialisasi-pkp-map";
export { useSosialisasiPKPJadwal } from "./sosialisasi/use-sosialisasi-pkp-jadwal";
export { useSosialisasiPKPBerita } from "./sosialisasi/use-sosialisasi-pkp-berita";

// Berita hooks
export { useBeritaList } from "./berita/use-berita-list";
export { useBeritaDetail } from "./berita/use-berita-detail";

// Kawasan Kumuh hooks
export { useKawasanKumuh } from "./kawasan-kumuh/use-kawasan-kumuh";
export { useKawasanKumuhMap } from "./kawasan-kumuh/use-kawasan-kumuh-map";
export { useKawasanKumuhPage } from "./kawasan-kumuh/use-kawasan-kumuh-page";

// Sebaran Rusun hooks
export { useSebaranRusun } from "./sebaran-rusun/use-sebaran-rusun";
export { useRusunMap } from "./sebaran-rusun/use-rusun-map";
export { useSebaranRusunPage } from "./sebaran-rusun/use-sebaran-rusun-page";

// Penerimaan BSPS hooks
export { usePenerimaanBsps } from "./penerimaan-bsps/use-penerimaan-bsps";
export { usePenerimaanMap } from "./penerimaan-bsps/use-penerimaan-map";
export { usePenerimaanBspsPage } from "./penerimaan-bsps/use-penerimaan-bsps-page";

// Bank Desain hooks
export { useBankDesain } from "./bank-desain/use-bank-desain";
export { useBankDesainPage } from "./bank-desain/use-bank-desain-page";

// Re-export existing hooks
export { useScrollAnimation } from "./use-scroll-animation";
export { useToast, toast } from "./use-toast";
export { useDebounce } from "./use-debounce";

// Utility hooks
export { useLazyMount } from "./use-lazy-mount";
export { useCascadingFilter } from "./use-cascading-filter";
export type {
  CascadingFilterState,
  CascadingFilterActions,
  CascadingFilterLists,
  UseCascadingFilterReturn,
} from "./use-cascading-filter";