/**
 * BspsSidebar — Panel sidebar untuk halaman Penerimaan BSPS.
 *
 * Menampilkan cascading filter (kabupaten → kecamatan → kelurahan)
 * dan daftar lokasi desa penerima BSPS dengan pagination.
 *
 * @features
 * - Cascading dropdown filter lokasi
 * - Pagination (20 item/halaman)
 * - Reset page otomatis saat filter berubah
 * - Responsive slide-in di mobile
 */

"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { MapPin, X } from "lucide-react";

import { SearchableFilterSelect } from "@/components/shared/SearchableFilterSelect";
import { SidebarPagination } from "@/components/shared/SidebarPagination";
import type { BspsData } from "@/services/bsps.service";

// --- Constants ---

/** Jumlah item per halaman sidebar */
const ITEMS_PER_PAGE = 20;

// --- Types (filter state dari parent) ---

interface FilterState {
  searchQuery: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusFilter: string;
  activeFilterCount: number;
}

interface FilterActions {
  setSearchQuery: (value: string) => void;
  handleKabupatenChange: (value: string) => void;
  handleKecamatanChange: (value: string) => void;
  setKelurahanFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  resetFilters: () => void;
}

interface FilterLists {
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
}

interface StatusColors {
  [key: string]: { fill: string; stroke?: string };
}

interface StatusLabels {
  [key: string]: string;
}

// --- Location Card — kartu info satu desa penerima ---

const BspsLocationCard = memo(function BspsLocationCard({
  desa,
  statusColors,
  statusLabels,
}: {
  desa: BspsData;
  statusColors: StatusColors;
  statusLabels: StatusLabels;
}) {
  const statusColor = statusColors[desa.status];
  const statusLabel = statusLabels[desa.status];

  return (
    <div className="clinic-card cursor-default">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight flex-1">
          {desa.nama}
        </h3>
        {statusColor && statusLabel && (
          <span
            className="rounded px-2 py-0.5 text-center text-xs leading-tight text-white flex-shrink-0"
            style={{ backgroundColor: statusColor.fill }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        <MapPin className="w-3 h-3 inline mr-1" />
        {desa.kelurahan}, {desa.kecamatan}
      </p>
      <p className="text-xs text-muted-foreground ml-[16px]">
        {desa.kabupaten}
      </p>

      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">
          {desa.alokasiUnit} Unit
        </span>
      </div>
    </div>
  );
});

// --- Sidebar Component ---

export interface BspsSidebarProps {
  isOpen: boolean;
  filteredDesa: BspsData[];
  filterState: FilterState;
  filterActions: FilterActions;
  filterLists: FilterLists;
  statusLabels: StatusLabels;
  statusColors: StatusColors;
  onCloseSidebar: () => void;
}

export function BspsSidebar({
  isOpen,
  filteredDesa,
  filterState,
  filterActions,
  filterLists,
  statusLabels,
  statusColors,
  onCloseSidebar,
}: BspsSidebarProps) {
  const filterKey = `${filterState.kabupatenFilter}-${filterState.kecamatanFilter}-${filterState.kelurahanFilter}-${filterState.statusFilter}-${filterState.searchQuery}`;
  const [paginationState, setPaginationState] = useState(() => ({
    currentPage: 1,
    filterKey,
  }));
  const currentPage =
    paginationState.filterKey === filterKey
      ? paginationState.currentPage
      : 1;
  const totalPages = Math.max(1, Math.ceil(filteredDesa.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedDesa = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredDesa.slice(start, start + ITEMS_PER_PAGE);
  }, [activePage, filteredDesa]);

  const handlePageChange = useCallback(
    (page: number) => {
      setPaginationState({
        filterKey,
        currentPage: Math.min(Math.max(page, 1), totalPages),
      });
    },
    [filterKey, totalPages]
  );

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } fixed lg:relative z-40 lg:z-10 h-[calc(100vh-4rem)] lg:h-full top-16 lg:top-0 left-0 w-[min(92vw,24rem)] sm:w-80 lg:w-96 bg-card border-r border-border transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none`}
    >
      {/* Mobile: close button */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-secondary/50 flex-shrink-0">
        <span className="font-semibold text-foreground text-sm">
          Filter & Daftar Lokasi
        </span>
        <button
          onClick={onCloseSidebar}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex-shrink-0 p-3 border-b border-border bg-card">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SearchableFilterSelect
            value={filterState.kabupatenFilter}
            onValueChange={filterActions.handleKabupatenChange}
            placeholder="Kab/Kota"
            searchPlaceholder="Cari kabupaten..."
            allLabel="Semua Kab/Kota"
            options={filterLists.kabupatenList}
          />
          <SearchableFilterSelect
            value={filterState.kecamatanFilter}
            onValueChange={filterActions.handleKecamatanChange}
            placeholder="Kecamatan"
            searchPlaceholder="Cari kecamatan..."
            allLabel="Semua Kecamatan"
            options={filterLists.kecamatanList}
            disabled={filterState.kabupatenFilter === "all"}
          />
          <SearchableFilterSelect
            value={filterState.kelurahanFilter}
            onValueChange={filterActions.setKelurahanFilter}
            placeholder="Kelurahan"
            searchPlaceholder="Cari kelurahan..."
            allLabel="Semua Kelurahan"
            options={filterLists.kelurahanList}
            disabled={filterState.kecamatanFilter === "all"}
          />
          <button
            onClick={filterActions.resetFilters}
            className="flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border border-primary/30 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Location List */}
      <div className="flex-1 min-h-0 overflow-y-scroll p-3 sm:p-4 space-y-2 sm:space-y-3">
        {filteredDesa.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada lokasi ditemukan
          </div>
        ) : (
          paginatedDesa.map((desa) => (
            <BspsLocationCard
              key={desa.id}
              desa={desa}
              statusColors={statusColors}
              statusLabels={statusLabels}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <SidebarPagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={filteredDesa.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
