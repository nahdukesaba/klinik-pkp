import { ApiError, fetchApiList } from "@/lib/api-client";
import { fetchBspsList } from "@/services/bsps.service";
import { fetchRusunList } from "@/services/rusun.service";
import { fetchSosialisasiList } from "@/services/sosialisasi.service";
import type {
  DistrictApi,
  RegionApi,
  VillageApi,
} from "@/types/api";

export interface RegionOption {
  id: string;
  name: string;
}

export interface DistrictOption {
  id: string;
  name: string;
  regionId: string;
}

export interface VillageOption {
  id: string;
  name: string;
  districtId: string;
}

interface LocationFallbackOptions {
  regions: RegionOption[];
  districts: DistrictOption[];
  villages: VillageOption[];
}

let fallbackLocationOptionsPromise: Promise<LocationFallbackOptions> | null = null;

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, "id"));
}

async function buildFallbackLocationOptions(): Promise<LocationFallbackOptions> {
  const [bspsResult, rusunResult, sosialisasiResult] = await Promise.allSettled([
    fetchBspsList(),
    fetchRusunList(),
    fetchSosialisasiList(),
  ]);

  const regionMap = new Map<string, RegionOption>();
  const districtMap = new Map<string, DistrictOption>();
  const villageMap = new Map<string, VillageOption>();

  const registerLocation = (params: {
    regionId?: string;
    regionName?: string;
    districtId?: string;
    districtName?: string;
    villageId?: string;
    villageName?: string;
  }) => {
    if (params.regionId && params.regionName && !regionMap.has(params.regionId)) {
      regionMap.set(params.regionId, {
        id: params.regionId,
        name: params.regionName,
      });
    }

    if (
      params.districtId &&
      params.districtName &&
      params.regionId &&
      !districtMap.has(params.districtId)
    ) {
      districtMap.set(params.districtId, {
        id: params.districtId,
        name: params.districtName,
        regionId: params.regionId,
      });
    }

    if (
      params.villageId &&
      params.villageName &&
      params.districtId &&
      !villageMap.has(params.villageId)
    ) {
      villageMap.set(params.villageId, {
        id: params.villageId,
        name: params.villageName,
        districtId: params.districtId,
      });
    }
  };

  if (bspsResult.status === "fulfilled") {
    for (const item of bspsResult.value) {
      registerLocation({
        regionId: item.regionId,
        regionName: item.kabupaten,
        districtId: item.districtId,
        districtName: item.kecamatan,
        villageId: item.villageId,
        villageName: item.kelurahan,
      });
    }
  }

  if (rusunResult.status === "fulfilled") {
    for (const item of rusunResult.value) {
      registerLocation({
        regionId: item.regionId,
        regionName: item.kabupaten,
        districtId: item.districtId,
        districtName: item.kecamatan,
        villageId: item.villageId,
        villageName: item.kelurahan,
      });
    }
  }

  if (sosialisasiResult.status === "fulfilled") {
    for (const item of sosialisasiResult.value.locations) {
      registerLocation({
        regionId: item.regionId,
        regionName: item.kabupaten,
        districtId: item.districtId,
        districtName: item.kecamatan,
        villageId: item.villageId,
        villageName: item.kelurahan,
      });
    }
  }

  if (
    regionMap.size === 0 &&
    districtMap.size === 0 &&
    villageMap.size === 0
  ) {
    throw new Error("Sumber data wilayah fallback belum dapat dibaca.");
  }

  return {
    regions: sortByName([...regionMap.values()]),
    districts: sortByName([...districtMap.values()]),
    villages: sortByName([...villageMap.values()]),
  };
}

async function getFallbackLocationOptions() {
  if (!fallbackLocationOptionsPromise) {
    fallbackLocationOptionsPromise = buildFallbackLocationOptions().catch((error) => {
      fallbackLocationOptionsPromise = null;
      throw error;
    });
  }

  return fallbackLocationOptionsPromise;
}

function shouldUseFallback(error: unknown) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

function filterDistrictOptions(items: DistrictOption[], regionId?: string) {
  return !regionId
    ? items
    : items.filter((item) => item.regionId === regionId);
}

function filterVillageOptions(items: VillageOption[], districtId?: string) {
  return !districtId
    ? items
    : items.filter((item) => item.districtId === districtId);
}

export async function fetchRegionOptions(): Promise<RegionOption[]> {
  try {
    return sortByName(
      await fetchApiList<RegionApi, RegionOption>("/regions", {
        transform: (item) => ({
          id: item.id,
          name: item.name,
        }),
        errorMessage: "Gagal mengambil data kabupaten/kota.",
        requestOptions: {
          suppressErrorLog: true,
        },
      })
    );
  } catch (error) {
    if (!shouldUseFallback(error)) {
      throw error;
    }

    const fallback = await getFallbackLocationOptions();
    return fallback.regions;
  }
}

export async function fetchDistrictOptions(regionId?: string): Promise<DistrictOption[]> {
  try {
    return sortByName(
      filterDistrictOptions(
        await fetchApiList<DistrictApi, DistrictOption>("/districts", {
          query: { region_id: regionId },
          transform: (item) => ({
            id: item.id,
            name: item.name,
            regionId: item.region_id,
          }),
          errorMessage: "Gagal mengambil data kecamatan.",
          requestOptions: {
            suppressErrorLog: true,
          },
        }),
        regionId
      )
    );
  } catch (error) {
    if (!shouldUseFallback(error)) {
      throw error;
    }

    const fallback = await getFallbackLocationOptions();
    return sortByName(filterDistrictOptions(fallback.districts, regionId));
  }
}

export async function fetchVillageOptions(districtId?: string): Promise<VillageOption[]> {
  try {
    return sortByName(
      filterVillageOptions(
        await fetchApiList<VillageApi, VillageOption>("/villages", {
          query: { district_id: districtId },
          transform: (item) => ({
            id: item.id,
            name: item.name,
            districtId: item.district_id,
          }),
          errorMessage: "Gagal mengambil data desa/kelurahan.",
          requestOptions: {
            suppressErrorLog: true,
          },
        }),
        districtId
      )
    );
  } catch (error) {
    if (!shouldUseFallback(error)) {
      throw error;
    }

    const fallback = await getFallbackLocationOptions();
    return sortByName(filterVillageOptions(fallback.villages, districtId));
  }
}
