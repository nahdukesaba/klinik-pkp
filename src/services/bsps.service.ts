/** Service API untuk data BSPS (Bantuan Stimulan Perumahan Swadaya). */

import {
  fetchApiList,
  fetchApiListWithMeta,
  extractVillageName,
  extractDistrictName,
  extractRegionName,
  type ApiPaginatedResult,
  type CoordinateApi,
  type VillageApi,
  type DistrictApi,
  type RegionApi,
} from "@/lib/api-client";
import type { ApiListQueryControls } from "@/types/api";

// --- Tipe API ---

/** Struktur data BSPS dari API (snake_case) */
export interface BspsApiItem {
  id: string;
  village_id: string;
  district_id: string;
  region_id: string;
  unit_count: number;
  year_given: number;
  status: "Rencana" | "Dalam Proses" | "Selesai";
  coordinate: CoordinateApi;
  village?: VillageApi;
  district?: DistrictApi;
  region?: RegionApi;
}

// --- Tipe Frontend ---

/** Penerima BSPS individual (disiapkan untuk API masa depan) */
export interface PenerimaBsps {
  nama: string;
  alamat: string;
  coordinates: [number, number];
}

/** Data desa penerima BSPS untuk UI (camelCase) */
export interface BspsData {
  id: string;
  villageId: string;
  districtId: string;
  regionId: string;
  nama: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  alokasiUnit: number;
  coordinates: [number, number];
  status: "selesai" | "proses" | "rencana";
  /** Tahun penerimaan BSPS */
  yearGiven: number;
  /** Daftar penerima per-desa (belum tersedia dari API) */
  penerimaList: PenerimaBsps[];
}

// --- Konstanta UI ---

export const bspsStatusColors: Record<string, { fill: string; stroke: string }> = {
  selesai: { fill: "#22c55e", stroke: "#16a34a" },
  proses: { fill: "#eab308", stroke: "#ca8a04" },
  rencana: { fill: "#3b82f6", stroke: "#2563eb" },
};

/** Label status untuk UI */
export const bspsStatusLabels: Record<string, string> = {
  selesai: "Selesai",
  proses: "Dalam Proses",
  rencana: "Rencana",
};

/** Persyaratan BSPS (konten statis) */
export const bspsRequirements: string[] = [
  "Warga Negara Indonesia (WNI)",
  "Sudah berkeluarga atau berusia minimal 21 tahun",
  "Memiliki atau menguasai tanah dengan bukti kepemilikan",
  "Belum pernah menerima bantuan perumahan dari pemerintah",
  "Berpenghasilan rendah (sesuai ketentuan yang berlaku)",
  "Rumah tidak layak huni atau belum memiliki rumah",
];

export interface BspsProcessStep {
  step: number;
  title: string;
}

/** Langkah proses BSPS (konten statis) */
export const bspsProcessSteps: BspsProcessStep[] = [
  { step: 1, title: "Pendaftaran" },
  { step: 2, title: "Verifikasi" },
  { step: 3, title: "Seleksi" },
  { step: 4, title: "Pencairan" },
  { step: 5, title: "Pembangunan" },
  { step: 6, title: "Serah Terima" },
];

/** Kriteria utama penerima BSPS */
export const bspsKriteriaUtama: string[] = [
  "Masyarakat Berpenghasilan Rendah (MBR)",
  "Memiliki rumah tidak layak huni",
  "Terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS)",
];

/** Prioritas penerima */
export const bspsPrioritasPenerima: string[] = [
  "Lansia, janda, dan penyandang disabilitas",
  "Keluarga miskin dengan anak balita",
  "Korban bencana alam",
];

// --- Mapping status ---

const STATUS_MAP: Record<string, "selesai" | "proses" | "rencana"> = {
  "Selesai": "selesai",
  "Dalam Proses": "proses",
  "Rencana": "rencana",
};

export interface BspsListParams extends ApiListQueryControls {
  year?: number;
  regionId?: string;
  districtId?: string;
  villageId?: string;
  collectAllPages?: boolean;
}

// --- Transformasi ---

/** Transform data API → format frontend */
export function transformBspsItem(item: BspsApiItem): BspsData {
  return {
    id: item.id,
    villageId: item.village_id,
    districtId: item.district_id,
    regionId: item.region_id,
    nama: extractVillageName(item.village),
    kelurahan: extractVillageName(item.village),
    kecamatan: extractDistrictName(item.district, item.village),
    kabupaten: extractRegionName(item.region, item.district, item.village),
    alokasiUnit: item.unit_count,
    coordinates: [
      item.coordinate?.latitude ?? 0,
      item.coordinate?.longitude ?? 0,
    ],
    status: STATUS_MAP[item.status] ?? "rencana",
    yearGiven: item.year_given,
    penerimaList: [], // Belum tersedia dari API
  };
}

// --- API ---

/** GET /api/ext/bsps — ambil data BSPS, opsional filter tahun */
export async function fetchBspsList(
  input?: number | BspsListParams
): Promise<BspsData[]> {
  const params =
    typeof input === "number"
      ? { year: input }
      : input ?? {};

  return fetchApiList<BspsApiItem, BspsData>("/bsps", {
    query: {
      year_given: params.year,
      page: params.page,
      limit: params.perPage,
      keyword: params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformBspsItem,
    errorMessage: "Gagal mengambil data BSPS dari server",
    collectAllPages: params.collectAllPages ?? false,
  });
}

export async function fetchBspsPage(
  input?: number | BspsListParams
): Promise<ApiPaginatedResult<BspsData>> {
  const params =
    typeof input === "number"
      ? { year: input }
      : input ?? {};

  return fetchApiListWithMeta<BspsApiItem, BspsData>("/bsps", {
    query: {
      year_given: params.year,
      page: params.page,
      limit: params.perPage,
      keyword: params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformBspsItem,
    errorMessage: "Gagal mengambil data BSPS dari server",
    requestOptions: { retry: 0 },
  });
}
