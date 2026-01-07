/**
 * usePenerimaanBsps Hook
 * 
 * DESKRIPSI: Hook untuk mengelola state filter dan data penerimaan BSPS
 * Memisahkan logic filtering dari UI component
 * 
 * SAAT PAKAI API BACKEND:
 * - Ganti desaPenerimaanData dengan useSWR/useQuery
 * - Contoh: const { data } = useSWR('/api/penerimaan-bsps')
 */

import { useState, useMemo, useCallback } from "react";

import {
  desaPenerimaanData,
  type DesaPenerimaan,
} from "@/data/penerimaan-bsps";

// ============================================
// Types
// ============================================

export interface PenerimaanBspsFilters {
  searchQuery: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusFilter: string;
}

export interface UsePenerimaanBspsReturn {
  // Data
  filteredDesa: DesaPenerimaan[];
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
  
  // Filter States
  searchQuery: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusFilter: string;
  activeFilterCount: number;
  showFilters: boolean;
  
  // Setters
  setSearchQuery: (value: string) => void;
  setKabupatenFilter: (value: string) => void;
  setKecamatanFilter: (value: string) => void;
  setKelurahanFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setShowFilters: (value: boolean) => void;
  
  // Actions
  resetFilters: () => void;
  handleKabupatenChange: (value: string) => void;
  handleKecamatanChange: (value: string) => void;
}

// ============================================
// Hook Implementation
// ============================================

export function usePenerimaanBsps(): UsePenerimaanBspsReturn {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [kabupatenFilter, setKabupatenFilter] = useState("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("all");
  const [kelurahanFilter, setKelurahanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  // ============================================
  // Computed Lists (Cascading Filters)
  // ============================================

  const kabupatenList = useMemo(
    () => [...new Set(desaPenerimaanData.map((p) => p.kabupaten))].sort(),
    []
  );

  const kecamatanList = useMemo(() => {
    const filtered =
      kabupatenFilter === "all"
        ? desaPenerimaanData
        : desaPenerimaanData.filter((p) => p.kabupaten === kabupatenFilter);
    return [...new Set(filtered.map((p) => p.kecamatan))].sort();
  }, [kabupatenFilter]);

  const kelurahanList = useMemo(() => {
    let filtered: DesaPenerimaan[] = desaPenerimaanData;
    if (kabupatenFilter !== "all") {
      filtered = filtered.filter((p) => p.kabupaten === kabupatenFilter);
    }
    if (kecamatanFilter !== "all") {
      filtered = filtered.filter((p) => p.kecamatan === kecamatanFilter);
    }
    return [...new Set(filtered.map((p) => p.nama))].sort();
  }, [kabupatenFilter, kecamatanFilter]);

  // ============================================
  // Filtered Data
  // ============================================

  const filteredDesa = useMemo(() => {
    return desaPenerimaanData.filter((p) => {
      const matchesSearch =
        !searchQuery || p.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesKabupaten =
        kabupatenFilter === "all" || p.kabupaten === kabupatenFilter;
      const matchesKecamatan =
        kecamatanFilter === "all" || p.kecamatan === kecamatanFilter;
      const matchesKelurahan =
        kelurahanFilter === "all" || p.nama === kelurahanFilter;
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;
      
      return matchesSearch && matchesKabupaten && matchesKecamatan && matchesKelurahan && matchesStatus;
    });
  }, [searchQuery, kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter]);

  // ============================================
  // Active Filter Count
  // ============================================

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (kabupatenFilter !== "all") count++;
    if (kecamatanFilter !== "all") count++;
    if (kelurahanFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter]);

  // ============================================
  // Actions
  // ============================================

  const resetFilters = useCallback(() => {
    setKabupatenFilter("all");
    setKecamatanFilter("all");
    setKelurahanFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  }, []);

  // Cascading filter handlers
  const handleKabupatenChange = useCallback((value: string) => {
    setKabupatenFilter(value);
    setKecamatanFilter("all");
    setKelurahanFilter("all");
  }, []);

  const handleKecamatanChange = useCallback((value: string) => {
    setKecamatanFilter(value);
    setKelurahanFilter("all");
  }, []);

  return {
    // Data
    filteredDesa,
    kabupatenList,
    kecamatanList,
    kelurahanList,
    
    // Filter States
    searchQuery,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    activeFilterCount,
    showFilters,
    
    // Setters
    setSearchQuery,
    setKabupatenFilter,
    setKecamatanFilter,
    setKelurahanFilter,
    setStatusFilter,
    setShowFilters,
    
    // Actions
    resetFilters,
    handleKabupatenChange,
    handleKecamatanChange,
  };
}
