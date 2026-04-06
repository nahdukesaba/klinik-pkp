"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
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
    queryKey: ["admin-location-regions"],
    queryFn: fetchRegionOptions,
    enabled: shouldLoadRegions,
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });

  const districtsQuery = useQuery({
    queryKey: ["admin-location-districts", selectedRegionId ?? "none"],
    queryFn: () => fetchDistrictOptions(selectedRegionId),
    enabled: shouldLoadDistricts,
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
  });

  const villagesQuery = useQuery({
    queryKey: ["admin-location-villages", selectedDistrictId ?? "none"],
    queryFn: () => fetchVillageOptions(selectedDistrictId),
    enabled: shouldLoadVillages,
    staleTime: QUERY_CONFIG.staleTime,
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
