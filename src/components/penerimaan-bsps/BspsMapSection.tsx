/**
 * BspsMapSection - Section peta full-screen untuk halaman Penerimaan BSPS.
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
import { YearFilterSelect } from "@/components/shared/YearFilterSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BspsData } from "@/services/bsps.service";

import { BspsSidebar } from "./BspsSidebar";

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
  selectedDesaId: number | null;
  sidebarOpen: boolean;
  onDesaClick: (desa: BspsData) => void;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

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
    <div className="relative flex-shrink-0 border-b border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-2 transition-colors hover:bg-secondary"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Penerimaan BSPS</p>
              <h1 className="text-lg font-bold text-foreground">Lokasi Penerima</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-md min-w-0 flex-1 sm:w-auto sm:min-w-[200px] md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari desa/kelurahan..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="min-h-10 w-full text-sm sm:w-auto sm:min-w-[10rem]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-popover">
                  <SelectItem value="all">Semua Status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableYears.length > 0 && (
              <YearFilterSelect
                years={availableYears}
                selectedYear={yearFilter}
                onYearChange={onYearChange}
              />
            )}

            <div className="stat-badge">
              <Building2 className="h-4 w-4" />
              <span>{totalKawasan}</span>
              <span className="ml-1 hidden sm:inline">Kawasan</span>
            </div>
            <div className="stat-badge hidden md:flex">
              <Home className="h-4 w-4" />
              <span>{totalAlokasiUnit} Unit</span>
            </div>

            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 hover:bg-secondary lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Layers className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

function BspsMapSection({
  filterState,
  filterActions,
  filterLists,
  statusLabels,
  statusColors,
  mapRef,
  isMapReady,
  filteredDesa,
  selectedDesaId,
  sidebarOpen,
  onDesaClick,
  onToggleSidebar,
  onCloseSidebar,
}: BspsMapSectionProps) {
  const totalKawasan = filteredDesa.length;
  const totalAlokasiUnit = filteredDesa.reduce(
    (accumulator, desa) => accumulator + desa.alokasiUnit,
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

      <div className="relative mx-2 mb-2 flex flex-1 overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm">
        {sidebarOpen && (
          <div
            data-ui-route-overlay="bsps-sidebar"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
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
          selectedDesaId={selectedDesaId}
          onDesaClick={onDesaClick}
          onCloseSidebar={onCloseSidebar}
        />

        <div className="relative flex-1 overflow-hidden">
          {!isMapReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted animate-pulse">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm font-medium text-muted-foreground">
                  Memuat Peta...
                </span>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            id="penerimaan-bsps-map"
            className="h-full w-full"
            style={{ minHeight: "400px" }}
          />

          <MapLegend
            title="Status Penerimaan"
            labels={statusLabels}
            colors={statusColors}
          />

          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="absolute right-4 top-4 z-20 rounded-lg border border-border bg-card p-3 shadow-lg transition-colors hover:bg-secondary lg:hidden"
              aria-label="Buka filter"
            >
              <MapPin className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export { BspsMapSection };
