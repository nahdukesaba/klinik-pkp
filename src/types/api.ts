/** Tipe bersama untuk semua service API. Hirarki: Province → Region → District → Village */

// --- Hirarki Lokasi ---

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

// --- Koordinat ---

export interface CoordinateApi {
  latitude: number;
  longitude: number;
}

// --- Response standar ---

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- Helper: ekstrak nama lokasi dari nested objects ---

export function extractVillageName(village?: VillageApi): string {
  return village?.name ?? "";
}

/** Fallback ke village.district jika district langsung tidak tersedia */
export function extractDistrictName(
  district?: DistrictApi,
  village?: VillageApi
): string {
  return district?.name ?? village?.district?.name ?? "";
}

/** Fallback ke district.region atau village.district.region */
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
