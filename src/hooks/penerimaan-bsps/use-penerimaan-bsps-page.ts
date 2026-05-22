/**
 * Hook: usePenerimaanBspsPage
 * Orkestrasi logic halaman Penerimaan BSPS untuk dikonsumsi UI.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { usePenerimaanBsps } from "@/hooks/penerimaan-bsps/use-penerimaan-bsps";
import { usePenerimaanMap } from "@/hooks/penerimaan-bsps/use-penerimaan-map";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import {
  bspsKriteriaUtama,
  bspsProcessSteps,
  bspsPrioritasPenerima,
  bspsRequirements,
  bspsStatusColors,
  bspsStatusLabels,
  type BspsData,
} from "@/services/bsps.service";

const STEPS = bspsProcessSteps;
const FIRST_ROW = STEPS.slice(0, 3);
const SECOND_ROW = STEPS.slice(3, 6);
const SECOND_ROW_REVERSED = [...SECOND_ROW].reverse();

export function usePenerimaanBspsPage() {
  const ref = useScrollAnimation();
  const mapLazy = useLazyMount({ initiallyMounted: true });
  const filterLogic = usePenerimaanBsps();
  const { mapRef, isMapReady, selectedDesaId, focusDesa } = usePenerimaanMap(
    filterLogic.filteredDesa,
    mapLazy.isMounted
  );

  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleDesaCardClick = useCallback((desa: BspsData) => {
    focusDesa(desa);
  }, [focusDesa]);

  const filterState = useMemo(() => ({
    searchQuery: filterLogic.searchQuery,
    kabupatenFilter: filterLogic.kabupatenFilter,
    kecamatanFilter: filterLogic.kecamatanFilter,
    kelurahanFilter: filterLogic.kelurahanFilter,
    statusFilter: filterLogic.statusFilter,
    activeFilterCount: filterLogic.activeFilterCount,
    yearFilter: filterLogic.yearFilter,
    availableYears: filterLogic.availableYears,
  }), [
    filterLogic.searchQuery,
    filterLogic.kabupatenFilter,
    filterLogic.kecamatanFilter,
    filterLogic.kelurahanFilter,
    filterLogic.statusFilter,
    filterLogic.activeFilterCount,
    filterLogic.yearFilter,
    filterLogic.availableYears,
  ]);

  const filterActions = useMemo(() => ({
    setSearchQuery: filterLogic.setSearchQuery,
    handleKabupatenChange: filterLogic.setKabupatenFilter,
    handleKecamatanChange: filterLogic.setKecamatanFilter,
    setKelurahanFilter: filterLogic.setKelurahanFilter,
    setStatusFilter: filterLogic.setStatusFilter,
    setYearFilter: filterLogic.setYearFilter,
    resetFilters: filterLogic.resetFilters,
  }), [
    filterLogic.setSearchQuery,
    filterLogic.setKabupatenFilter,
    filterLogic.setKecamatanFilter,
    filterLogic.setKelurahanFilter,
    filterLogic.setStatusFilter,
    filterLogic.setYearFilter,
    filterLogic.resetFilters,
  ]);

  const filterLists = useMemo(() => ({
    kabupatenList: filterLogic.kabupatenList,
    kecamatanList: filterLogic.kecamatanList,
    kelurahanList: filterLogic.kelurahanList,
  }), [
    filterLogic.kabupatenList,
    filterLogic.kecamatanList,
    filterLogic.kelurahanList,
  ]);

  return {
    ref,
    mapLazy,
    isLoading: filterLogic.isLoading,
    isError: filterLogic.isError,
    error: filterLogic.error,
    refetch: filterLogic.refetch,
    filteredDesa: filterLogic.filteredDesa,
    filterState,
    filterActions,
    filterLists,
    mapRef,
    isMapReady,
    selectedDesaId,
    handleDesaCardClick,
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
    statusColors: bspsStatusColors,
    statusLabels: bspsStatusLabels,
  };
}
