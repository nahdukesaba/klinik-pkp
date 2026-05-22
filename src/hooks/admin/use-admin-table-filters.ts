"use client";

import { useCallback, useMemo, useState } from "react";

export type AdminTableFilterValue = string | number | boolean | undefined;
export type AdminTableFiltersState = Record<string, AdminTableFilterValue>;

export interface UseAdminTableFiltersOptions<
  TFilters extends AdminTableFiltersState,
> {
  defaultFilters?: TFilters;
  onFiltersChange?: () => void;
}

function normalizeFilterValue(value: AdminTableFilterValue) {
  return value === "" || value === "all" ? undefined : value;
}

function isActiveFilterValue(value: AdminTableFilterValue) {
  return value !== undefined && value !== "" && value !== "all";
}

export function useAdminTableFilters<
  TFilters extends AdminTableFiltersState = AdminTableFiltersState,
>(options: UseAdminTableFiltersOptions<TFilters> = {}) {
  const { defaultFilters: providedDefaultFilters, onFiltersChange } = options;
  const [defaultFilters] = useState(
    () => (providedDefaultFilters ?? {}) as TFilters
  );
  const [filters, setFilters] = useState<TFilters>(defaultFilters);

  const notifyFiltersChange = useCallback(() => {
    onFiltersChange?.();
  }, [onFiltersChange]);

  const setFilter = useCallback(
    <TKey extends keyof TFilters>(
      key: TKey,
      value: TFilters[TKey] | "all" | ""
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: normalizeFilterValue(value) as TFilters[TKey],
      }));
      notifyFiltersChange();
    },
    [notifyFiltersChange]
  );

  const setRegionFilter = useCallback(
    (value: string) => {
      setFilters((current) => ({
        ...current,
        regionId: normalizeFilterValue(value),
        districtId: undefined,
        villageId: undefined,
      }));
      notifyFiltersChange();
    },
    [notifyFiltersChange]
  );

  const setDistrictFilter = useCallback(
    (value: string) => {
      setFilters((current) => ({
        ...current,
        districtId: normalizeFilterValue(value),
        villageId: undefined,
      }));
      notifyFiltersChange();
    },
    [notifyFiltersChange]
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    notifyFiltersChange();
  }, [defaultFilters, notifyFiltersChange]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(isActiveFilterValue).length,
    [filters]
  );

  return {
    filters,
    setFilter,
    setRegionFilter,
    setDistrictFilter,
    resetFilters,
    activeFilterCount,
  };
}
