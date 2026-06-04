/** Service API untuk data Kawasan Kumuh. */

import {
  apiClient,
  fetchApiList,
  fetchApiListWithMeta,
  type ApiRequestOptions,
  type ApiPaginatedResult,
  type ApiResponse,
  type CoordinateApi,
  type DistrictApi,
  type RegionApi,
} from "@/lib/api-client";
import {
  clampApiPageLimit,
  PUBLIC_KUMUH_YEAR_FILTER_OPTIONS,
  PUBLIC_LIST_FETCH_LIMIT,
} from "@/lib/constants";
import {
  normalizeYearOption,
  normalizeYearOptions,
  type YearOptionsResponse,
} from "@/lib/year-options";
import {
  ADMIN_RESOURCE_NAMES,
  fetchAdminResourcePage,
} from "@/services/admin-resource.service";
import type {
  ApiListQueryControls,
  KawasanKumuhFilterParams,
} from "@/types/api";

const KUMUH_BACKEND_PAGE_LIMIT = 100;

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

export interface KawasanKumuhData {
  id: string;
  districtId: string;
  regionId: string;
  name: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  lingkungan: string[];
  lingkunganText: string;
  villagesText: string;
  lat: number;
  lng: number;
  luas: number;
  penduduk: number;
  status: "berat" | "sedang" | "ringan";
  slumValue: number;
  legalitasLahan: "Legal" | "Tidak Legal";
  yearInspected: number;
}

export interface KumuhListParams
  extends ApiListQueryControls,
    KawasanKumuhFilterParams {
  yearInspected?: number;
  collectAllPages?: boolean;
}

export const kawasanStatusColors: Record<string, { fill: string; label: string }> = {
  berat: { fill: "#dc2626", label: "Kumuh Berat" },
  sedang: { fill: "#f59e0b", label: "Kumuh Sedang" },
  ringan: { fill: "#22c55e", label: "Kumuh Ringan" },
};

function deriveSlumStatus(
  slumValue: number
): "berat" | "sedang" | "ringan" {
  if (slumValue >= 71) return "berat";
  if (slumValue >= 40) return "sedang";
  return "ringan";
}

export function transformKumuhItem(item: KumuhApiItem): KawasanKumuhData {
  const kabupaten = item.region?.name ?? "";
  const kecamatan = item.district?.name ?? "";
  const lingkungan = item.environments
    ? item.environments.split(",").map((entry) => entry.trim()).filter(Boolean)
    : [];
  const villageNames = item.villages
    ? item.villages.split(",").map((entry) => entry.trim()).filter(Boolean)
    : [];

  return {
    id: item.id,
    districtId: item.district_id,
    regionId: item.region_id,
    name: item.area_name,
    kabupaten,
    kecamatan,
    kelurahan: villageNames[0] ?? "",
    lingkungan,
    lingkunganText: item.environments,
    villagesText: item.villages,
    lat: item.coordinate?.latitude ?? 0,
    lng: item.coordinate?.longitude ?? 0,
    luas: item.total_area,
    penduduk: item.total_population,
    status: deriveSlumStatus(item.slum_value),
    slumValue: item.slum_value,
    legalitasLahan: "Legal",
    yearInspected: normalizeYearOption(item.year_inspected),
  };
}

export async function fetchKumuhList(
  input?: number | KumuhListParams
): Promise<KawasanKumuhData[]> {
  const params = typeof input === "number" ? { year: input } : input ?? {};
  const collectAllPages = params.collectAllPages ?? true;
  const limit = Math.min(
    clampApiPageLimit(params.perPage, PUBLIC_LIST_FETCH_LIMIT),
    KUMUH_BACKEND_PAGE_LIMIT
  );

  const requestedYear = params.yearInspected ?? params.year;
  const items = await fetchApiList<KumuhApiItem, KawasanKumuhData>("/kumuh", {
    query: {
      year_inspected: requestedYear,
      page: params.page,
      limit,
      area_name: params.areaName ?? params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
      all: collectAllPages ? true : undefined,
    },
    transform: transformKumuhItem,
    errorMessage: "Gagal mengambil data kawasan kumuh dari server",
    requestOptions: { retry: 0 },
    collectAllPages: false,
    backendPageLimit: KUMUH_BACKEND_PAGE_LIMIT,
  });

  return requestedYear !== undefined && Number.isFinite(requestedYear)
    ? items.filter((item) => item.yearInspected === requestedYear)
    : items;
}

export async function fetchKumuhAvailableYears(): Promise<number[]> {
  try {
    const response = await apiClient.get<ApiResponse<YearOptionsResponse>>(
      "/kumuh/years",
      { retry: 0 }
    );

    if (!response.success) {
      return [...PUBLIC_KUMUH_YEAR_FILTER_OPTIONS];
    }

    return normalizeYearOptions(
      response.data?.years,
      PUBLIC_KUMUH_YEAR_FILTER_OPTIONS
    );
  } catch {
    return [...PUBLIC_KUMUH_YEAR_FILTER_OPTIONS];
  }
}

export async function fetchKumuhPage(
  input?: number | KumuhListParams,
  requestOptions?: ApiRequestOptions
): Promise<ApiPaginatedResult<KawasanKumuhData>> {
  const params = typeof input === "number" ? { year: input } : input ?? {};

  return fetchApiListWithMeta<KumuhApiItem, KawasanKumuhData>("/kumuh", {
    query: {
      year_inspected: params.yearInspected ?? params.year,
      page: params.page,
      limit: clampApiPageLimit(params.perPage, KUMUH_BACKEND_PAGE_LIMIT),
      area_name: params.areaName ?? params.keyword,
      sort_by: params.sortBy,
      sort_order: params.sortBy ? params.sortDirection : undefined,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    transform: transformKumuhItem,
    errorMessage: "Gagal mengambil data kawasan kumuh dari server",
    requestOptions,
    backendPageLimit: KUMUH_BACKEND_PAGE_LIMIT,
  });
}

export async function fetchAdminKumuhPage(
  input?: number | KumuhListParams,
  requestOptions?: ApiRequestOptions
): Promise<ApiPaginatedResult<KawasanKumuhData>> {
  const params = typeof input === "number" ? { year: input } : input ?? {};
  const requestedYear = params.yearInspected ?? params.year;

  return fetchAdminResourcePage<KumuhApiItem, KawasanKumuhData>(
    ADMIN_RESOURCE_NAMES.kumuh,
    {
      query: {
        year_inspected: requestedYear,
        page: params.page,
        limit: clampApiPageLimit(params.perPage, KUMUH_BACKEND_PAGE_LIMIT),
        area_name: params.areaName ?? params.keyword,
        sort_by: params.sortBy,
        sort_order: params.sortBy ? params.sortDirection : undefined,
        region_id: params.regionId,
        district_id: params.districtId,
        village_id: params.villageId,
      },
      transform: transformKumuhItem,
      errorMessage: "Gagal mengambil data kawasan kumuh admin dari server",
      requestOptions,
    }
  );
}
