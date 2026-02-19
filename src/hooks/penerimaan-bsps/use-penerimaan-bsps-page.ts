/**
 * Hook: usePenerimaanBspsPage
 * Orkestrasi logic halaman Penerimaan BSPS untuk dikonsumsi UI.
 */

"use client";

import { useState } from "react";

import {
  bspsKriteriaUtama,
  bspsProcessSteps,
  bspsPrioritasPenerima,
  bspsRequirements,
  penerimaanStatusColors,
  penerimaanStatusLabels,
} from "@/data/penerimaan-bsps";
import { usePenerimaanBsps } from "@/hooks/penerimaan-bsps/use-penerimaan-bsps";
import { usePenerimaanMap } from "@/hooks/penerimaan-bsps/use-penerimaan-map";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// Region data — module-level constant (API-ready: replace with API response)
const REGION_CENTERS: Record<string, { name: string }> = {
  "sumatera-utara": { name: "Sumatera Utara" },
  "medan": { name: "Kota Medan" },
};

// Pre-computed static values
const REGION_OPTIONS = Object.entries(REGION_CENTERS).map(([key, value]) => ({
  id: key,
  name: value.name,
}));

const STEPS = bspsProcessSteps;
const FIRST_ROW = STEPS.slice(0, 3);
const SECOND_ROW = STEPS.slice(3, 6);
const SECOND_ROW_REVERSED = [...SECOND_ROW].reverse();

export function usePenerimaanBspsPage() {
  const ref = useScrollAnimation();
  const mapLazy = useLazyMount();
  const filterLogic = usePenerimaanBsps();

  const { mapRef, isMapReady } = usePenerimaanMap(filterLogic.filteredDesa, mapLazy.isMounted);

  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Derive region name from current filter
  const regionName = REGION_CENTERS[filterLogic.regionFilter]?.name ?? "Sumatera Utara";

  // Build filter state/actions/lists — pass through directly (no broken useMemo)
  const filterState = {
    searchQuery: filterLogic.searchQuery,
    regionFilter: filterLogic.regionFilter,
    kabupatenFilter: filterLogic.kabupatenFilter,
    kecamatanFilter: filterLogic.kecamatanFilter,
    kelurahanFilter: filterLogic.kelurahanFilter,
    statusFilter: filterLogic.statusFilter,
    activeFilterCount: filterLogic.activeFilterCount,
  };

  const filterActions = {
    setSearchQuery: filterLogic.setSearchQuery,
    setRegionFilter: filterLogic.setRegionFilter,
    handleKabupatenChange: filterLogic.setKabupatenFilter,
    handleKecamatanChange: filterLogic.setKecamatanFilter,
    setKelurahanFilter: filterLogic.setKelurahanFilter,
    setStatusFilter: filterLogic.setStatusFilter,
    resetFilters: filterLogic.resetFilters,
  };

  const filterLists = {
    kabupatenList: filterLogic.kabupatenList,
    kecamatanList: filterLogic.kecamatanList,
    kelurahanList: filterLogic.kelurahanList,
  };

  return {
    ref,
    mapLazy,
    filteredDesa: filterLogic.filteredDesa,
    filterState,
    filterActions,
    filterLists,
    mapRef,
    isMapReady,
    regionName,
    regionOptions: REGION_OPTIONS,
    processSteps: {
      steps: STEPS,
      hoveredStep,
      setHoveredStep,
      firstRow: FIRST_ROW,
      secondRow: SECOND_ROW,
      secondRowReversed: SECOND_ROW_REVERSED,
    },
    requirements: bspsRequirements,
    kriteriaUtama: bspsKriteriaUtama,
    prioritasPenerima: bspsPrioritasPenerima,
    statusColors: penerimaanStatusColors,
    statusLabels: penerimaanStatusLabels,
  };
}
