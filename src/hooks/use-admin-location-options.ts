"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  LONG_LIVED_QUERY_STALE_TIME_MS,
  QUERY_CONFIG,
  QUERY_KEY_PARTS,
  QUERY_KEYS,
} from "@/lib/constants";
import {
  fetchDistrictOptions,
  fetchRegionOptions,
  fetchVillageOptions,
} from "@/services/location.service";

export function useAdminLocationOptions(
  selectedRegionId?: string,
  selectedDistrictId?: string,
  enabled = true
) {
  const shouldLoadRegions = enabled;
  const shouldLoadDistricts = enabled && Boolean(selectedRegionId);
  const shouldLoadVillages = enabled && Boolean(selectedDistrictId);

  const regionsQuery = useQuery({
    queryKey: [QUERY_KEYS.adminLocationRegions],
    queryFn: fetchRegionOptions,
    enabled: shouldLoadRegions,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: QUERY_CONFIG.gcTime,
  });

  const districtsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminLocationDistricts,
      selectedRegionId ?? QUERY_KEY_PARTS.none,
    ],
    queryFn: () => fetchDistrictOptions(selectedRegionId),
    enabled: shouldLoadDistricts,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: QUERY_CONFIG.gcTime,
  });

  const villagesQuery = useQuery({
    queryKey: [
      QUERY_KEYS.adminLocationVillages,
      selectedDistrictId ?? QUERY_KEY_PARTS.none,
    ],
    queryFn: () => fetchVillageOptions(selectedDistrictId),
    enabled: shouldLoadVillages,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: QUERY_CONFIG.gcTime,
  });

  const regionOptions = useMemo(
    () =>
      (regionsQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [regionsQuery.data]
  );

  const districtOptions = useMemo(
    () =>
      (districtsQuery.data ?? [])
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    [districtsQuery.data]
  );

  const villageOptions = useMemo(
    () =>
      (villagesQuery.data ?? [])
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    [villagesQuery.data]
  );

  return {
    regionOptions,
    districtOptions,
    villageOptions,
    isLoading:
      regionsQuery.isLoading ||
      (shouldLoadDistricts && districtsQuery.isLoading) ||
      (shouldLoadVillages && villagesQuery.isLoading),
    error:
      regionsQuery.error ??
      (shouldLoadDistricts ? districtsQuery.error : null) ??
      (shouldLoadVillages ? villagesQuery.error : null) ??
      null,
  };
}
