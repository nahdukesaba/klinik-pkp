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

export interface ApiPaginatedCollection<T> {
  items: T[];
  total_records?: number;
  page?: number;
  limit?: number;
}

export interface ApiPaginationMeta {
  totalRecords?: number;
  page?: number;
  limit?: number;
}

const API_COLLECTION_KEYS = [
  "items",
  "rows",
  "records",
  "results",
  "list",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function extractApiCollectionItems<T>(data: unknown): T[] | null {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!isRecord(data)) {
    return null;
  }

  for (const key of API_COLLECTION_KEYS) {
    const candidate = data[key];
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return null;
}

export function extractApiPaginationMeta(data: unknown): ApiPaginationMeta {
  if (!isRecord(data)) {
    return {};
  }

  return {
    totalRecords: getNumberValue(data.total_records),
    page: getNumberValue(data.page),
    limit: getNumberValue(data.limit),
  };
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
