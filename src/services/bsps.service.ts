/** Service API untuk data BSPS (Bantuan Stimulan Perumahan Swadaya). */

import {
  fetchApiList,
  fetchApiListWithMeta,
  type ApiPaginatedResult,
} from "@/lib/api-client";
import type {
  CoordinateApi,
  VillageApi,
  DistrictApi,
  RegionApi,
} from "@/types/api";
import { extractVillageName, extractDistrictName, extractRegionName } from "@/types/api";

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
  id: number;
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
  description: string;
}

/** Langkah proses BSPS (konten statis) */
export const bspsProcessSteps: BspsProcessStep[] = [
  { step: 1, title: "Pendaftaran", description: "Mengisi formulir pendaftaran di kantor desa atau kelurahan" },
  { step: 2, title: "Verifikasi", description: "Tim melakukan verifikasi data dan survei lapangan" },
  { step: 3, title: "Seleksi", description: "Penetapan calon penerima berdasarkan kriteria" },
  { step: 4, title: "Pencairan", description: "Bantuan disalurkan secara bertahap sesuai progres" },
  { step: 5, title: "Pembangunan", description: "Pelaksanaan pembangunan dengan pendampingan" },
  { step: 6, title: "Serah Terima", description: "Verifikasi akhir dan serah terima rumah" },
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

export interface BspsListParams {
  year?: number;
  page?: number;
  perPage?: number;
  regionId?: string;
  districtId?: string;
  villageId?: string;
}

// --- Transformasi ---

/** Transform data API → format frontend */
export function transformBspsItem(item: BspsApiItem): BspsData {
  return {
    id: parseInt(item.id, 10) || 0,
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
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformBspsItem,
    errorMessage: "Gagal mengambil data BSPS dari server",
    collectAllPages: false,
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
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformBspsItem,
    errorMessage: "Gagal mengambil data BSPS dari server",
  });
}
