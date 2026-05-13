/** Service API untuk data Rusun. Transform snake_case → camelCase. */

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
import { buildImageUrl } from "@/lib/constants";
import type { ApiListQueryControls } from "@/types/api";

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
  villageId: string;
  districtId: string;
  regionId: string;
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

export interface RusunListParams extends ApiListQueryControls {
  regionId?: string;
  districtId?: string;
  villageId?: string;
}

// --- Transformasi ---

/** Transform data API → format frontend. Ekstrak nama lokasi dari nested objects. */
export function transformRusunItem(item: RusunApiItem): RusunData {
  const kelurahan = extractVillageName(item.village);
  const kecamatan = extractDistrictName(item.district, item.village);
  const kabupaten = extractRegionName(item.region, item.district, item.village);

  const rawImagePath = item.image_urls?.[0];
  const image = rawImagePath ? buildImageUrl(rawImagePath) : undefined;

  return {
    id: item.id,
    villageId: item.village_id,
    districtId: item.district_id,
    regionId: item.region_id,
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
export async function fetchRusunList(
  params: RusunListParams = {}
): Promise<RusunData[]> {
  return fetchApiList<RusunApiItem, RusunData>("/rusun", {
    query: {
      page: params.page,
      limit: params.perPage,
      keyword: params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformRusunItem,
    errorMessage: "Gagal mengambil data rusun dari server",
    collectAllPages: false,
  });
}

export async function fetchRusunPage(
  params: RusunListParams = {}
): Promise<ApiPaginatedResult<RusunData>> {
  return fetchApiListWithMeta<RusunApiItem, RusunData>("/rusun", {
    query: {
      page: params.page,
      limit: params.perPage,
      keyword: params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformRusunItem,
    errorMessage: "Gagal mengambil data rusun dari server",
  });
}
