/**
 * Hook: useBankDesain
 * Mengelola filter dan data desain untuk halaman Bank Desain.
 *
 * Data diambil dari API backend via useBankDesainQuery (React Query).
 * Filter categories dibuat dinamis berdasarkan data yang tersedia.
 */

"use client";

import { useMemo, useState, useCallback } from "react";

import { useBankDesainQuery, type BankDesainData } from "@/hooks/bank-desain/use-bank-desain-query";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";

// ============================================
// Konstanta
// ============================================
const DEFAULT_FILTER = "all";

/**
 * Generate URL unduhan untuk desain.
 * Mengembalikan URL file desain utama atau thumbnail.
 */
function getDesignDownloadUrl(design: BankDesainData): string {
  return design.designFileUrl || design.previewImages[0] || design.thumbnail;
}

// ============================================
// Implementasi Hook
// ============================================
export function useBankDesain() {
  // Sumber data dari API (React Query)
  const { data: designs, categories, isLoading, isError, error, refetch } = useBankDesainQuery();

  // State filter
  const [typeFilter, setTypeFilter] = useState(DEFAULT_FILTER);
  const [bedroomFilter, setBedroomFilter] = useState(DEFAULT_FILTER);
  const [terasFilter, setTerasFilter] = useState(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search untuk performa
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Cek apakah ada filter yang aktif
  const hasActiveFilters = useMemo(() => {
    return (
      typeFilter !== DEFAULT_FILTER ||
      bedroomFilter !== DEFAULT_FILTER ||
      terasFilter !== DEFAULT_FILTER ||
      debouncedSearch.trim() !== ""
    );
  }, [typeFilter, bedroomFilter, terasFilter, debouncedSearch]);

  // Reset semua filter
  const resetFilters = useCallback(() => {
    setTypeFilter(DEFAULT_FILTER);
    setBedroomFilter(DEFAULT_FILTER);
    setTerasFilter(DEFAULT_FILTER);
    setSearchQuery("");
  }, []);

  // Filter desain berdasarkan semua kriteria
  const filteredDesigns = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim();

    return designs.filter((design) => {
      const matchesType = typeFilter === DEFAULT_FILTER || design.type === typeFilter;
      const matchesBedroom = bedroomFilter === DEFAULT_FILTER || 
        design.bedrooms.toString() === bedroomFilter;
      const matchesTeras = terasFilter === DEFAULT_FILTER || 
        design.terasFeature === terasFilter;
      const matchesSearch = !searchLower || 
        design.title.toLowerCase().includes(searchLower) ||
        design.code.toLowerCase().includes(searchLower) ||
        design.type.toLowerCase().includes(searchLower) ||
        (design.description?.toLowerCase().includes(searchLower) ?? false);

      return matchesType && matchesBedroom && matchesTeras && matchesSearch;
    });
  }, [designs, typeFilter, bedroomFilter, terasFilter, debouncedSearch]);

  // Pagination menggunakan reusable hook
  const pagination = usePagination(filteredDesigns);

  return {
    // State API
    isLoading,
    isError,
    error,
    refetch,
    // State filter
    typeFilter,
    bedroomFilter,
    terasFilter,
    searchQuery,
    // Setter filter
    setTypeFilter,
    setBedroomFilter,
    setTerasFilter,
    setSearchQuery,
    // Daftar kategori (dinamis dari data API)
    typeCategories: categories.type,
    bedroomCategories: categories.bedroom,
    terasCategories: categories.teras,
    // Nilai turunan
    filteredDesigns,
    paginatedDesigns: pagination.paginatedItems,
    totalDesigns: designs.length,
    totalFilteredDesigns: filteredDesigns.length,
    hasActiveFilters,
    // Pagination
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    setCurrentPage: pagination.setCurrentPage,
    goToNextPage: pagination.goToNextPage,
    goToPrevPage: pagination.goToPrevPage,
    // Aksi
    resetFilters,
    getDesignDownloadUrl,
  };
}
