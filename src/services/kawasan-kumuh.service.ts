/** Service API untuk data Kawasan Kumuh. */

import {
  fetchApiList,
  fetchApiListWithMeta,
  type ApiPaginatedResult,
  type CoordinateApi,
  type DistrictApi,
  type RegionApi,
} from "@/lib/api-client";

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

export interface KumuhListParams {
  year?: number;
  page?: number;
  perPage?: number;
  regionId?: string;
  districtId?: string;
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
    yearInspected: item.year_inspected ?? new Date().getFullYear(),
  };
}

export async function fetchKumuhList(
  input?: number | KumuhListParams
): Promise<KawasanKumuhData[]> {
  const params = typeof input === "number" ? { year: input } : input ?? {};
  const limit = params.perPage ?? 1000;

  return fetchApiList<KumuhApiItem, KawasanKumuhData>("/kumuh", {
    query: {
      year_inspected: params.year,
      page: params.page,
      limit,
      region_id: params.regionId,
      district_id: params.districtId,
    },
    transform: transformKumuhItem,
    errorMessage: "Gagal mengambil data kawasan kumuh dari server",
    collectAllPages: params.collectAllPages ?? false,
  });
}

export async function fetchKumuhAvailableYears(): Promise<number[]> {
  const items = await fetchApiList<KumuhApiItem, KawasanKumuhData>("/kumuh", {
    query: {
      page: 1,
      limit: 1000,
    },
    transform: transformKumuhItem,
    errorMessage: "Gagal mengambil daftar tahun kawasan kumuh dari server",
    collectAllPages: true,
  });

  return [...new Set(items.map((item) => item.yearInspected))]
    .filter((year) => Number.isFinite(year))
    .sort((left, right) => right - left);
}

export async function fetchKumuhPage(
  input?: number | KumuhListParams
): Promise<ApiPaginatedResult<KawasanKumuhData>> {
  const params = typeof input === "number" ? { year: input } : input ?? {};

  return fetchApiListWithMeta<KumuhApiItem, KawasanKumuhData>("/kumuh", {
    query: {
      year_inspected: params.year,
      page: params.page,
      limit: params.perPage,
      region_id: params.regionId,
      district_id: params.districtId,
    },
    transform: transformKumuhItem,
    errorMessage: "Gagal mengambil data kawasan kumuh dari server",
    requestOptions: { retry: 0 },
  });
}
