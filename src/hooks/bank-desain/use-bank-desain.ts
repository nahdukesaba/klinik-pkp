/**
 * Hook: useBankDesain
 * Mengelola filter dan data desain untuk halaman Bank Desain.
 *
 * Saat API siap, ganti isi `designs` dan `categories` dengan response API
 * (misalnya via React Query) tanpa mengubah return type.
 */

"use client";

import { useMemo, useState, useCallback, useEffect } from "react";

import {
  defaultFilterCategories,
  designsList,
  getDesignDownloadUrl,
} from "@/data/bank-desain";
import { useDebounce } from "@/hooks/use-debounce";

// ============================================
// Constants
// ============================================
const DEFAULT_FILTER = "all";
const ITEMS_PER_PAGE = 9;

// ============================================
// Hook Implementation
// ============================================
export function useBankDesain() {
  // Data source (ganti dengan API call saat siap)
  const designs = designsList;
  const categories = defaultFilterCategories;

  // Filter states
  const [typeFilter, setTypeFilter] = useState(DEFAULT_FILTER);
  const [bedroomFilter, setBedroomFilter] = useState(DEFAULT_FILTER);
  const [terasFilter, setTerasFilter] = useState(DEFAULT_FILTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search untuk performa
  const debouncedSearch = useDebounce(searchQuery, 300);
  const itemsPerPage = ITEMS_PER_PAGE;

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      typeFilter !== DEFAULT_FILTER ||
      bedroomFilter !== DEFAULT_FILTER ||
      terasFilter !== DEFAULT_FILTER ||
      debouncedSearch.trim() !== ""
    );
  }, [typeFilter, bedroomFilter, terasFilter, debouncedSearch]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setTypeFilter(DEFAULT_FILTER);
    setBedroomFilter(DEFAULT_FILTER);
    setTerasFilter(DEFAULT_FILTER);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  // Filter designs based on all criteria
  const filteredDesigns = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim();

    return designs.filter((design) => {
      // Filter by type
      const matchesType = typeFilter === DEFAULT_FILTER || design.type === typeFilter;
      
      // Filter by bedroom count
      const matchesBedroom = bedroomFilter === DEFAULT_FILTER || 
        design.bedrooms.toString() === bedroomFilter;
      
      // Filter by teras feature
      const matchesTeras = terasFilter === DEFAULT_FILTER || 
        design.terasFeature === terasFilter;
      
      // Filter by search query
      const matchesSearch = !searchLower || 
        design.title.toLowerCase().includes(searchLower) ||
        design.code.toLowerCase().includes(searchLower) ||
        design.type.toLowerCase().includes(searchLower) ||
        (design.description?.toLowerCase().includes(searchLower) ?? false);

      return matchesType && matchesBedroom && matchesTeras && matchesSearch;
    });
  }, [designs, typeFilter, bedroomFilter, terasFilter, debouncedSearch]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredDesigns.length / itemsPerPage));

  // Get paginated designs
  const paginatedDesigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDesigns.slice(startIndex, endIndex);
  }, [filteredDesigns, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, bedroomFilter, terasFilter, debouncedSearch]);

  // Pagination navigation
  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    // Filter states
    typeFilter,
    bedroomFilter,
    terasFilter,
    searchQuery,
    // Filter setters
    setTypeFilter,
    setBedroomFilter,
    setTerasFilter,
    setSearchQuery,
    // Category lists (dinamis — API-ready)
    typeCategories: categories.type,
    bedroomCategories: categories.bedroom,
    terasCategories: categories.teras,
    // Computed values
    filteredDesigns,
    paginatedDesigns,
    totalDesigns: designs.length,
    totalFilteredDesigns: filteredDesigns.length,
    hasActiveFilters,
    // Pagination
    currentPage,
    totalPages,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    // Actions
    resetFilters,
    getDesignDownloadUrl,
  };
}
