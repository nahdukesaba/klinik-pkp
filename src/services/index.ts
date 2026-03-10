/**
 * Services — Barrel export
 *
 * Folder ini berisi service layer yang menangani:
 * - Pemanggilan API ke backend
 * - Transformasi data dari format API ke format frontend
 * - Tipe data API dan frontend
 *
 * Service TIDAK boleh mengandung React state/hooks.
 * Untuk React state management, gunakan hooks di `@/hooks/`.
 */

export {
  fetchRusunList,
  buildImageUrl,
  transformRusunItem,
  type RusunData,
  type RusunApiItem,
} from "./rusun.service";

export {
  fetchBankDesainList,
  transformBankDesainItem,
  deriveFilterCategories,
  type BankDesainData,
  type BankDesainApiItem,
  type FilterCategories,
} from "./bank-desain.service";

export {
  fetchBspsList,
  transformBspsItem,
  bspsStatusColors,
  bspsStatusLabels,
  bspsRequirements,
  bspsProcessSteps,
  bspsKriteriaUtama,
  bspsPrioritasPenerima,
  type BspsData,
  type BspsApiItem,
  type BspsProcessStep,
} from "./bsps.service";

export {
  fetchKumuhList,
  transformKumuhItem,
  kawasanStatusColors,
  type KawasanKumuhData,
  type KumuhApiItem,
} from "./kawasan-kumuh.service";

export {
  fetchSosialisasiList,
  transformToLocation,
  transformToBerita,
  type SosialisasiLocation,
  type BeritaSosialisasi,
  type SosialisasiApiItem,
  type SosialisasiResult,
} from "./sosialisasi.service";

export type {
  ApiResponse,
  ProvinceApi,
  RegionApi,
  DistrictApi,
  VillageApi,
  CoordinateApi,
} from "./api-types";
