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

import { memo, useMemo, useRef, useState } from "react";

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
            className="text-xs px-2 py-0.5 rounded text-white whitespace-nowrap flex-shrink-0"
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
  const [currentPage, setCurrentPage] = useState(1);

  // Derive-state-during-render: reset halaman tanpa extra re-render.
  // Ref: vercel-react-best-practices/rerender-derived-state-no-effect
  const filterKey = `${filterState.kabupatenFilter}-${filterState.kecamatanFilter}-${filterState.kelurahanFilter}-${filterState.statusFilter}-${filterState.searchQuery}`;
  const prevFilterKey = useRef(filterKey);
  if (prevFilterKey.current !== filterKey) {
    prevFilterKey.current = filterKey;
    if (currentPage !== 1) setCurrentPage(1);
  }

  const totalPages = Math.ceil(filteredDesa.length / ITEMS_PER_PAGE);
  const paginatedDesa = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDesa.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDesa, currentPage]);

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } fixed lg:relative z-40 lg:z-10 h-[calc(100vh-4rem)] lg:h-full top-16 lg:top-0 left-0 w-[85vw] sm:w-80 lg:w-96 bg-card border-r border-border transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none`}
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
        <div className="grid grid-cols-2 gap-2">
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
            className="w-full h-9 text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30 flex items-center justify-center gap-1"
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
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredDesa.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
