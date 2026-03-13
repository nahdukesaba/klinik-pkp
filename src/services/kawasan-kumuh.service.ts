/** Service API untuk data Kawasan Kumuh. */

import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CoordinateApi,
  DistrictApi,
  RegionApi,
} from "@/types/api";

// --- Tipe API ---

/** Struktur data kawasan kumuh dari API (snake_case) */
export interface KumuhApiItem {
  id: string;
  district_id: string;
  region_id: string;
  area_name: string;
  environments: string;
  villages: string;
  total_area: number;
  total_population: number;
  slum_value: number;
  year_inspected?: number;
  coordinate: CoordinateApi;
  district?: DistrictApi;
  region?: RegionApi;
}

// --- Tipe Frontend ---

/** Data kawasan kumuh untuk UI (camelCase) */
export interface KawasanKumuhData {
  id: string;
  name: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  lingkungan: string[];
  lat: number;
  lng: number;
  /** Luas kawasan dalam hektar */
  luas: number;
  /** Total penduduk */
  penduduk: number;
  /** Status tingkat kekumuhan */
  status: "berat" | "sedang" | "ringan";
  /** Legalitas lahan (tidak tersedia di API, default "Legal") */
  legalitasLahan: "Legal" | "Tidak Legal";
  /** Tahun inspeksi kawasan */
  yearInspected: number;
}

// --- Konstanta UI ---

/** Warna status kawasan kumuh untuk peta dan legenda */
export const kawasanStatusColors: Record<string, { fill: string; label: string }> = {
  berat: { fill: "#dc2626", label: "Kumuh Berat" },
  sedang: { fill: "#f59e0b", label: "Kumuh Sedang" },
  ringan: { fill: "#22c55e", label: "Kumuh Ringan" },
};

// --- Transformasi ---

/**
 * Status kekumuhan berdasarkan slum_value:
 * >= 71: berat | 40–70: sedang | < 40: ringan
 */
function deriveSlumStatus(slumValue: number): "berat" | "sedang" | "ringan" {
  if (slumValue >= 71) return "berat";
  if (slumValue >= 40) return "sedang";
  return "ringan";
}

/** Transform data API → format frontend */
export function transformKumuhItem(item: KumuhApiItem): KawasanKumuhData {
  const kabupaten = item.region?.name ?? "";
  const kecamatan = item.district?.name ?? "";

  // Parse environments dari string comma-separated ke array
  const lingkungan = item.environments
    ? item.environments.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // villages berisi nama-nama desa/kelurahan (comma-separated)
  // Kita ambil item pertama sebagai "kelurahan" utama
  const villageNames = item.villages
    ? item.villages.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: item.id,
    name: item.area_name,
    kabupaten,
    kecamatan,
    kelurahan: villageNames[0] ?? "",
    lingkungan,
    lat: item.coordinate?.latitude ?? 0,
    lng: item.coordinate?.longitude ?? 0,
    luas: item.total_area,
    penduduk: item.total_population,
    status: deriveSlumStatus(item.slum_value),
    legalitasLahan: "Legal",
    yearInspected: item.year_inspected ?? new Date().getFullYear(),
  };
}

// --- API ---

/** GET /api/ext/kumuh — ambil data kawasan kumuh, opsional filter tahun */
export async function fetchKumuhList(year?: number): Promise<KawasanKumuhData[]> {
  const endpoint = year != null ? `/kumuh?year=${year}` : "/kumuh";
  const res = await apiClient.get<ApiResponse<KumuhApiItem[]>>(endpoint);

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data kawasan kumuh dari server");
  }

  return res.data.map(transformKumuhItem);
}
