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
  error?: string;
  details?: Record<string, string | string[]>;
}
