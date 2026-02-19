"use client";

import { useMemo } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SearchableSelect, stringsToOptions } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================
// Types
// ============================================
interface FilterOption {
  value: string;
  label: string;
}

interface MapFilterBarProps {
  // Search
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  
  // Kabupaten Filter
  kabupatenFilter: string;
  onKabupatenChange: (value: string) => void;
  kabupatenList: string[];
  
  // Kecamatan Filter
  kecamatanFilter: string;
  onKecamatanChange: (value: string) => void;
  kecamatanList: string[];
  
  // Kelurahan Filter
  kelurahanFilter: string;
  onKelurahanChange: (value: string) => void;
  kelurahanList: string[];
  
  // Status Filter
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: FilterOption[];
  
  // Filter controls
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

// ============================================
// MapFilterBar Component
// Reusable filter bar for map pages with searchable dropdowns
// ============================================
export function MapFilterBar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Cari lokasi...",
  showSearch = true,
  kabupatenFilter,
  onKabupatenChange,
  kabupatenList,
  kecamatanFilter,
  onKecamatanChange,
  kecamatanList,
  kelurahanFilter,
  onKelurahanChange,
  kelurahanList,
  statusFilter,
  onStatusChange,
  statusOptions,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onResetFilters,
}: MapFilterBarProps) {
  // Convert lists to searchable options
  const kabupatenOptions = useMemo(() => stringsToOptions(kabupatenList), [kabupatenList]);
  const kecamatanOptions = useMemo(() => stringsToOptions(kecamatanList), [kecamatanList]);
  const kelurahanOptions = useMemo(() => stringsToOptions(kelurahanList), [kelurahanList]);

  // Handle kabupaten change with cascade reset
  const handleKabupatenChange = (value: string) => {
    onKabupatenChange(value);
    onKecamatanChange("all");
    onKelurahanChange("all");
  };

  // Handle kecamatan change with cascade reset
  const handleKecamatanChange = (value: string) => {
    onKecamatanChange(value);
    onKelurahanChange("all");
  };

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle - More Compact */}
      <div className="flex flex-col sm:flex-row gap-2">
        {showSearch && onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
            showFilters || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Filters with Searchable Selects */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-secondary/50 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
          {/* Kabupaten Filter - Searchable */}
          <SearchableSelect
            value={kabupatenFilter}
            onValueChange={handleKabupatenChange}
            options={kabupatenOptions}
            placeholder="Kab/Kota"
            searchPlaceholder="Cari kabupaten..."
            allOptionLabel="Semua Kab/Kota"
            emptyText="Kabupaten tidak ditemukan"
            className="bg-card"
          />

          {/* Kecamatan Filter - Searchable */}
          <SearchableSelect
            value={kecamatanFilter}
            onValueChange={handleKecamatanChange}
            options={kecamatanOptions}
            placeholder="Kecamatan"
            searchPlaceholder="Cari kecamatan..."
            allOptionLabel="Semua Kecamatan"
            emptyText="Kecamatan tidak ditemukan"
            className="bg-card"
            disabled={kabupatenFilter === "all" && kecamatanList.length === 0}
          />

          {/* Kelurahan Filter - Searchable */}
          <SearchableSelect
            value={kelurahanFilter}
            onValueChange={onKelurahanChange}
            options={kelurahanOptions}
            placeholder="Kel/Desa"
            searchPlaceholder="Cari kelurahan..."
            allOptionLabel="Semua Kel/Desa"
            emptyText="Kelurahan tidak ditemukan"
            className="bg-card"
            disabled={kecamatanFilter === "all" && kelurahanList.length === 0}
          />

          {/* Status Filter - Regular Select (fewer options) */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-card h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[9999]">
              <SelectItem value="all">Semua Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export default MapFilterBar;
