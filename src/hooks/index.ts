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
export { useSosialisasiPKPMap } from "./use-sosialisasi-pkp-map";
export { useSosialisasiPKPJadwal } from "./use-sosialisasi-pkp-jadwal";
export { useSosialisasiPKPBerita } from "./use-sosialisasi-pkp-berita";

// Kawasan Kumuh hooks
export { useKawasanKumuh } from "./use-kawasan-kumuh";

// Sebaran Rusun hooks
export { useSebaranRusun } from "./use-sebaran-rusun";
export { useRusunMap } from "./use-rusun-map";

// Penerimaan BSPS hooks
export { usePenerimaanBsps } from "./use-penerimaan-bsps";
export { usePenerimaanMap } from "./use-penerimaan-map";

// Re-export existing hooks
export { useScrollAnimation } from "./use-scroll-animation";
export { useToast, toast } from "./use-toast";
