/**
 * Rusun API Service
 *
 * Modul ini menangani semua komunikasi dengan backend API untuk data Rusun.
 * Dipisahkan dari hooks agar:
 * - Logic API tidak tercampur dengan React state management
 * - Mudah di-test secara unit tanpa React
 * - Bisa dipakai ulang di server-side maupun client-side
 *
 * @module services/rusun
 */

import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
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

/** Struktur data rusun dari API (snake_case sesuai backend Go) */
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

// ============================================
// Tipe Data Frontend (camelCase untuk UI)
// ============================================

/** Data rusun yang sudah ditransformasi untuk UI */
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

// ============================================
// Fungsi Transformasi Data
// ============================================

/**
 * Bangun URL gambar lengkap dari path relatif yang dikembalikan API.
 *
 * API bisa mengembalikan format:
 *   - "rusun/1/file.jpg"          → /api/ext/uploads/rusun/1/file.jpg
 *   - "uploads/rusun/6/file.jpg"  → /api/ext/uploads/rusun/6/file.jpg
 *
 * File statis disajikan di GET /api/v1/uploads/* → di-rewrite ke /api/ext/uploads/*
 */
export function buildImageUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const withUploads = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `${API_BASE_URL}/${withUploads}`;
}

/**
 * Transformasi data API (snake_case) ke format frontend (camelCase).
 * Mengekstrak nama lokasi dari nested objects (Village → District → Region).
 */
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

// ============================================
// Fungsi API (pemanggilan backend)
// ============================================

/**
 * Ambil semua data rusun dari API backend.
 * Data di-cache oleh React Query di hook pemanggil.
 *
 * Endpoint: GET /api/ext/rusun → backend GET /api/v1/rusun
 * @throws Error jika API mengembalikan response tidak valid
 */
export async function fetchRusunList(): Promise<RusunData[]> {
  const res = await apiClient.get<ApiResponse<RusunApiItem[]>>("/rusun");

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data rusun dari server");
  }

  return res.data.map(transformRusunItem);
}
