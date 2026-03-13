/** Service API untuk data Rusun. Transform snake_case → camelCase. */

import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
import type {
  ApiResponse,
  CoordinateApi,
  VillageApi,
  DistrictApi,
  RegionApi,
} from "@/types/api";
import { extractVillageName, extractDistrictName, extractRegionName } from "@/types/api";

// --- Tipe API ---

/** Struktur data rusun dari API (snake_case) */
export interface RusunApiItem {
  id: string;
  village_id: string;
  district_id: string;
  region_id: string;
  name: string;
  address: string;
  tower: number;
  unit_type: string;
  floor: number;
  unit_count: number;
  year_given: number;
  image_urls: string[] | null;
  coordinate: CoordinateApi;
  village?: VillageApi;
  district?: DistrictApi;
  region?: RegionApi;
}

// --- Tipe Frontend ---

/** Data rusun untuk UI (camelCase) */
export interface RusunData {
  id: string;
  name: string;
  address: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  units: number;
  tower: number;
  floors: number;
  type: string;
  yearGiven: string;
  lat: number;
  lng: number;
  image?: string;
}

// --- Transformasi ---

/**
 * Bangun URL gambar dari path relatif API.
 * "rusun/1/file.jpg" → /api/ext/uploads/rusun/1/file.jpg
 */
export function buildImageUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const withUploads = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `${API_BASE_URL}/${withUploads}`;
}

/** Transform data API → format frontend. Ekstrak nama lokasi dari nested objects. */
export function transformRusunItem(item: RusunApiItem): RusunData {
  const kelurahan = extractVillageName(item.village);
  const kecamatan = extractDistrictName(item.district, item.village);
  const kabupaten = extractRegionName(item.region, item.district, item.village);

  const rawImagePath = item.image_urls?.[0];
  const image = rawImagePath ? buildImageUrl(rawImagePath) : undefined;

  return {
    id: item.id,
    name: item.name,
    address: item.address,
    kelurahan,
    kecamatan,
    kabupaten,
    units: item.unit_count,
    tower: item.tower,
    floors: item.floor,
    type: item.unit_type,
    yearGiven: String(item.year_given),
    lat: item.coordinate?.latitude ?? 0,
    lng: item.coordinate?.longitude ?? 0,
    image,
  };
}

// --- API ---

/** GET /api/ext/rusun — ambil semua data rusun */
export async function fetchRusunList(): Promise<RusunData[]> {
  const res = await apiClient.get<ApiResponse<RusunApiItem[]>>("/rusun");

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data rusun dari server");
  }

  return res.data.map(transformRusunItem);
}
