/**
 * Tipe Data API Bersama
 *
 * Tipe-tipe yang digunakan oleh semua service API.
 * Hirarki lokasi: Province → Region → District → Village
 * Sesuai dengan struktur response backend Go Fiber.
 *
 * @module services/api-types
 */

// ============================================
// Hirarki Lokasi (sesuai backend)
// ============================================

export interface ProvinceApi {
  id: string;
  name: string;
}

export interface RegionApi {
  id: string;
  province_id: string;
  name: string;
  province?: ProvinceApi;
}

export interface DistrictApi {
  id: string;
  region_id: string;
  name: string;
  region?: RegionApi;
}

export interface VillageApi {
  id: string;
  district_id: string;
  name: string;
  district?: DistrictApi;
}

// ============================================
// Objek Koordinat
// ============================================

export interface CoordinateApi {
  latitude: number;
  longitude: number;
}

// ============================================
// Format Response Standar
// ============================================

/** Response standar dari semua endpoint API */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Helper: Ekstrak nama lokasi dari nested objects
// ============================================

/**
 * Ekstrak nama kelurahan/desa dari nested Village API object
 */
export function extractVillageName(village?: VillageApi): string {
  return village?.name ?? "";
}

/**
 * Ekstrak nama kecamatan dari nested District API object.
 * Fallback ke village.district jika district langsung tidak tersedia.
 */
export function extractDistrictName(
  district?: DistrictApi,
  village?: VillageApi
): string {
  return district?.name ?? village?.district?.name ?? "";
}

/**
 * Ekstrak nama kabupaten/kota dari nested Region API object.
 * Fallback ke district.region atau village.district.region.
 */
export function extractRegionName(
  region?: RegionApi,
  district?: DistrictApi,
  village?: VillageApi
): string {
  return (
    region?.name ??
    district?.region?.name ??
    village?.district?.region?.name ??
    ""
  );
}
