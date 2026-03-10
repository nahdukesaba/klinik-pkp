/**
 * BspsMapSection — Section peta full-screen untuk halaman Penerimaan BSPS.
 *
 * Layout (seperti Kawasan Kumuh):
 * - Header (back, title, search, status filter, stats)
 * - Sidebar (cascading filters + paginated location cards) | Map + Legend
 *
 * Komponen ini mengorkestrasikan sub-komponen:
 * - BspsHeader: navigasi, search, filter, stat badges
 * - BspsSidebar: panel filter lokasi + daftar desa (dari file terpisah)
 * - MapLegend: legenda status penerimaan (shared component)
 *
 * @see BspsSidebar — sidebar filter & daftar lokasi
 * @see MapLegend — legenda peta (shared)
 */

"use client";

import { memo } from "react";
import type { RefObject } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Home,
  Layers,
  MapPin,
  Search,
} from "lucide-react";

import { MapLegend } from "@/components/shared/MapLegend";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BspsData } from "@/services/bsps.service";

import { BspsSidebar } from "./BspsSidebar";

// ============================================
// Types
// ============================================

interface FilterState {
  searchQuery: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusFilter: string;
  activeFilterCount: number;
  yearFilter: string;
  availableYears: number[];
}

interface StatusColors {
  [key: string]: { fill: string; stroke?: string };
}

interface StatusLabels {
  [key: string]: string;
}

interface FilterActions {
  setSearchQuery: (value: string) => void;
  handleKabupatenChange: (value: string) => void;
  handleKecamatanChange: (value: string) => void;
  setKelurahanFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setYearFilter: (value: string) => void;
  resetFilters: () => void;
}

interface FilterLists {
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
}

interface BspsMapSectionProps {
  filterState: FilterState;
  filterActions: FilterActions;
  filterLists: FilterLists;
  statusLabels: StatusLabels;
  statusColors: StatusColors;
  mapRef: RefObject<HTMLDivElement | null>;
  isMapReady: boolean;
  filteredDesa: BspsData[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

// ============================================
// BspsHeader — top bar dengan navigasi, search, dan statistik
// ============================================

const BspsHeader = memo(function BspsHeader({
  totalKawasan,
  totalAlokasiUnit,
  searchQuery,
  statusFilter,
  statusLabels,
  yearFilter,
  availableYears,
  onSearchChange,
  onStatusChange,
  onYearChange,
  onToggleSidebar,
}: {
  totalKawasan: number;
  totalAlokasiUnit: number;
  searchQuery: string;
  statusFilter: string;
  statusLabels: StatusLabels;
  yearFilter: string;
  availableYears: number[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onToggleSidebar: () => void;
}) {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0 relative">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Penerimaan BSPS</p>
              <h1 className="text-lg font-bold text-foreground">Lokasi Penerima</h1>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:min-w-[200px] md:min-w-[300px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari desa/kelurahan..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              />
            </div>

            {/* Status (desktop only) */}
            <div className="hidden sm:block">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-40 h-10 text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[9999]">
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            {availableYears.length > 0 && (
              <Select value={yearFilter} onValueChange={onYearChange}>
                <SelectTrigger className="w-36 h-10 text-sm">
                  <span className="truncate">
                    Tahun: {yearFilter === "all" ? "Semua" : yearFilter}
                  </span>
                </SelectTrigger>
                <SelectContent className="bg-popover z-[9999]">
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Stat Badges */}
            <div className="stat-badge">
              <Building2 className="w-4 h-4" />
              <span>{totalKawasan}</span>
              <span className="hidden sm:inline ml-1">Kawasan</span>
            </div>
            <div className="stat-badge hidden md:flex">
              <Home className="w-4 h-4" />
              <span>{totalAlokasiUnit} Unit</span>
            </div>

            {/* Mobile sidebar toggle */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
              aria-label="Toggle sidebar"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================
// Main BspsMapSection
// ============================================

function BspsMapSection({
  filterState,
  filterActions,
  filterLists,
  statusLabels,
  statusColors,
  mapRef,
  isMapReady,
  filteredDesa,
  sidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
}: BspsMapSectionProps) {
  /** Total kawasan (desa) setelah filter */
  const totalKawasan = filteredDesa.length;

  /** Total alokasi unit dari semua desa ter-filter */
  const totalAlokasiUnit = filteredDesa.reduce(
    (acc, d) => acc + d.alokasiUnit,
    0
  );

  return (
    <>
      <BspsHeader
        totalKawasan={totalKawasan}
        totalAlokasiUnit={totalAlokasiUnit}
        searchQuery={filterState.searchQuery}
        statusFilter={filterState.statusFilter}
        statusLabels={statusLabels}
        yearFilter={filterState.yearFilter}
        availableYears={filterState.availableYears}
        onSearchChange={filterActions.setSearchQuery}
        onStatusChange={filterActions.setStatusFilter}
        onYearChange={filterActions.setYearFilter}
        onToggleSidebar={onToggleSidebar}
      />

      {/* Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden relative mx-2 mb-2 rounded-xl border border-border shadow-sm bg-card/50">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={onCloseSidebar}
          />
        )}

        <BspsSidebar
          isOpen={sidebarOpen}
          filteredDesa={filteredDesa}
          filterState={filterState}
          filterActions={filterActions}
          filterLists={filterLists}
          statusLabels={statusLabels}
          statusColors={statusColors}
          onCloseSidebar={onCloseSidebar}
        />

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden">
          {!isMapReady && (
            <div className="absolute inset-0 z-20 bg-muted animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground font-medium">Memuat Peta...</span>
              </div>
            </div>
          )}

          <div ref={mapRef} id="penerimaan-bsps-map" className="w-full h-full" style={{ minHeight: "400px" }} />

          {/* Legenda peta */}
          <MapLegend
            title="Status Penerimaan"
            labels={statusLabels}
            colors={statusColors}
          />

          {/* Mobile: tombol buka filter */}
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-20 hover:bg-secondary transition-colors"
              aria-label="Buka filter"
            >
              <MapPin className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export { BspsMapSection };
