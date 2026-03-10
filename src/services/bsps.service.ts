/**
 * BSPS API Service
 *
 * Modul ini menangani semua komunikasi dengan backend API untuk data BSPS
 * (Bantuan Stimulan Perumahan Swadaya).
 *
 * Data BSPS berisi lokasi penerima bantuan per desa/kelurahan,
 * jumlah unit alokasi, dan status penyaluran.
 *
 * @module services/bsps
 */

import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CoordinateApi,
  VillageApi,
  DistrictApi,
  RegionApi,
} from "@/services/api-types";
import { extractVillageName, extractDistrictName, extractRegionName } from "@/services/api-types";

// ============================================
// Tipe Data API (sesuai response backend Go)
// ============================================

/** Struktur data BSPS dari API (snake_case sesuai backend Go) */
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

// ============================================
// Tipe Data Frontend (camelCase untuk UI)
// ============================================

/** Penerima BSPS individual (saat ini tidak ada di API, disiapkan untuk masa depan) */
export interface PenerimaBsps {
  nama: string;
  alamat: string;
  coordinates: [number, number];
}

/** Data desa penerima BSPS yang sudah ditransformasi untuk UI */
export interface BspsData {
  id: number;
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

// ============================================
// Konstanta UI (tetap di frontend — tidak dari API)
// ============================================

/** Warna status penerima BSPS untuk peta dan UI */
export const bspsStatusColors: Record<string, { fill: string; stroke: string }> = {
  selesai: { fill: "#22c55e", stroke: "#16a34a" },
  proses: { fill: "#eab308", stroke: "#ca8a04" },
  rencana: { fill: "#3b82f6", stroke: "#2563eb" },
};

/** Label status untuk ditampilkan di UI */
export const bspsStatusLabels: Record<string, string> = {
  selesai: "Selesai",
  proses: "Dalam Proses",
  rencana: "Rencana",
};

/** Persyaratan BSPS (konten statis — tidak dari API) */
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

/** Langkah-langkah proses BSPS (konten statis — tidak dari API) */
export const bspsProcessSteps: BspsProcessStep[] = [
  { step: 1, title: "Pendaftaran", description: "Mengisi formulir pendaftaran di kantor desa atau kelurahan" },
  { step: 2, title: "Verifikasi", description: "Tim melakukan verifikasi data dan survei lapangan" },
  { step: 3, title: "Seleksi", description: "Penetapan calon penerima berdasarkan kriteria" },
  { step: 4, title: "Pencairan", description: "Bantuan disalurkan secara bertahap sesuai progres" },
  { step: 5, title: "Pembangunan", description: "Pelaksanaan pembangunan dengan pendampingan" },
  { step: 6, title: "Serah Terima", description: "Verifikasi akhir dan serah terima rumah" },
];

/** Kriteria utama penerima BSPS (konten statis) */
export const bspsKriteriaUtama: string[] = [
  "Masyarakat Berpenghasilan Rendah (MBR)",
  "Memiliki rumah tidak layak huni",
  "Terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS)",
];

/** Prioritas penerima BSPS (konten statis) */
export const bspsPrioritasPenerima: string[] = [
  "Lansia, janda, dan penyandang disabilitas",
  "Keluarga miskin dengan anak balita",
  "Korban bencana alam",
];

// ============================================
// Mapping Status API → Frontend
// ============================================

/** Mapping status dari API (Capitalized) ke frontend (lowercase) */
const STATUS_MAP: Record<string, "selesai" | "proses" | "rencana"> = {
  "Selesai": "selesai",
  "Dalam Proses": "proses",
  "Rencana": "rencana",
};

// ============================================
// Fungsi Transformasi Data
// ============================================

/**
 * Transformasi data API (snake_case) ke format frontend (camelCase).
 * Mengekstrak nama lokasi dari nested objects dan memetakan status.
 */
export function transformBspsItem(item: BspsApiItem): BspsData {
  return {
    id: parseInt(item.id, 10) || 0,
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

// ============================================
// Fungsi API (pemanggilan backend)
// ============================================

/**
 * Ambil data BSPS dari API, opsional filter berdasarkan tahun.
 * Data di-cache oleh React Query di hook pemanggil.
 *
 * Endpoint: GET /api/ext/bsps?year=2024 atau GET /api/ext/bsps (semua)
 */
export async function fetchBspsList(year?: number): Promise<BspsData[]> {
  const endpoint = year != null ? `/bsps?year=${year}` : "/bsps";
  const res = await apiClient.get<ApiResponse<BspsApiItem[]>>(endpoint);

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data BSPS dari server");
  }

  return res.data.map(transformBspsItem);
}
