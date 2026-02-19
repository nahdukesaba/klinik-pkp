/**
 * Hook: useCascadingFilter
 * Generic hook untuk mengelola filter cascading (kabupaten → kecamatan → kelurahan)
 */

"use client";

import { useMemo, useState, useCallback } from "react";

const ALL_FILTER = "all";

export interface LocationItem {
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
}

export interface CascadingFilterState {
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
}

export interface CascadingFilterActions {
  setKabupatenFilter: (value: string) => void;
  setKecamatanFilter: (value: string) => void;
  setKelurahanFilter: (value: string) => void;
  resetFilters: () => void;
}

export interface CascadingFilterLists {
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
}

export interface UseCascadingFilterReturn<T extends LocationItem> {
  filterState: CascadingFilterState;
  filterActions: CascadingFilterActions;
  filterLists: CascadingFilterLists;
  filteredItems: T[];
}

/**
 * Hook untuk mengelola filter cascading lokasi
 * @param items - Array item yang memiliki properti lokasi
 * @param searchQuery - Optional query pencarian
 * @param searchFn - Optional fungsi untuk filter berdasarkan search
 */
export function useCascadingFilter<T extends LocationItem>(
  items: T[],
  searchQuery?: string,
  searchFn?: (item: T, query: string) => boolean
): UseCascadingFilterReturn<T> {
  const [kabupatenFilter, setKabupatenFilter] = useState(ALL_FILTER);
  const [kecamatanFilter, setKecamatanFilter] = useState(ALL_FILTER);
  const [kelurahanFilter, setKelurahanFilter] = useState(ALL_FILTER);

  // Reset child filters when parent changes
  const handleKabupatenChange = useCallback((value: string) => {
    setKabupatenFilter(value);
    setKecamatanFilter(ALL_FILTER);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  const handleKecamatanChange = useCallback((value: string) => {
    setKecamatanFilter(value);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  const resetFilters = useCallback(() => {
    setKabupatenFilter(ALL_FILTER);
    setKecamatanFilter(ALL_FILTER);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  // Compute filter lists (cascading)
  const filterLists = useMemo(() => {
    const kabupatenList = [...new Set(items.map((item) => item.kabupaten))].sort();

    const filteredByKabupaten =
      kabupatenFilter === ALL_FILTER
        ? items
        : items.filter((item) => item.kabupaten === kabupatenFilter);

    const kecamatanList = [
      ...new Set(
        filteredByKabupaten
          .map((item) => item.kecamatan)
          .filter((k): k is string => !!k)
      ),
    ].sort();

    const filteredByKecamatan =
      kecamatanFilter === ALL_FILTER
        ? filteredByKabupaten
        : filteredByKabupaten.filter((item) => item.kecamatan === kecamatanFilter);

    const kelurahanList = [
      ...new Set(
        filteredByKecamatan
          .map((item) => item.kelurahan)
          .filter((k): k is string => !!k)
      ),
    ].sort();

    return { kabupatenList, kecamatanList, kelurahanList };
  }, [items, kabupatenFilter, kecamatanFilter]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (searchQuery && searchFn && !searchFn(item, searchQuery.toLowerCase())) {
        return false;
      }

      // Location filters
      if (kabupatenFilter !== ALL_FILTER && item.kabupaten !== kabupatenFilter) {
        return false;
      }
      if (kecamatanFilter !== ALL_FILTER && item.kecamatan !== kecamatanFilter) {
        return false;
      }
      if (kelurahanFilter !== ALL_FILTER && item.kelurahan !== kelurahanFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, searchFn, kabupatenFilter, kecamatanFilter, kelurahanFilter]);

  return {
    filterState: {
      kabupatenFilter,
      kecamatanFilter,
      kelurahanFilter,
    },
    filterActions: {
      setKabupatenFilter: handleKabupatenChange,
      setKecamatanFilter: handleKecamatanChange,
      setKelurahanFilter,
      resetFilters,
    },
    filterLists,
    filteredItems,
  };
}
