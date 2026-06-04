/**
 * BspsSidebar - Panel sidebar untuk halaman Penerimaan BSPS.
 *
 * Menampilkan cascading filter lokasi dan daftar desa penerima BSPS
 * yang dapat diklik untuk memfokuskan peta ke lokasi terkait.
 */

"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { MapPin, X } from "lucide-react";

import { SearchableFilterSelect } from "@/components/shared/SearchableFilterSelect";
import { SidebarPagination } from "@/components/shared/SidebarPagination";
import { cn } from "@/lib/utils";
import type { BspsData } from "@/services/bsps.service";

const ITEMS_PER_PAGE = 25;

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

const BspsLocationCard = memo(function BspsLocationCard({
  desa,
  statusColors,
  statusLabels,
  isActive,
  onClick,
}: {
  desa: BspsData;
  statusColors: StatusColors;
  statusLabels: StatusLabels;
  isActive: boolean;
  onClick: (desa: BspsData) => void;
}) {
  const statusColor = statusColors[desa.status];
  const statusLabel = statusLabels[desa.status];

  return (
    <button
      type="button"
      onClick={() => onClick(desa)}
      aria-pressed={isActive}
      className={cn(
        "clinic-card w-full text-left transition-all duration-200",
        isActive
          ? "border-primary/40 bg-primary/5 ring-2 ring-primary/20 shadow-md"
          : "hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-sm font-semibold leading-tight text-foreground">
          {desa.nama}
        </h3>
        {statusColor && statusLabel && (
          <span
            className="flex-shrink-0 rounded px-2 py-0.5 text-center text-xs leading-tight text-white"
            style={{ backgroundColor: statusColor.fill }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        <MapPin className="mr-1 inline h-3 w-3" />
        {desa.kelurahan}, {desa.kecamatan}
      </p>
      <p className="ml-[16px] text-xs text-muted-foreground">{desa.kabupaten}</p>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">{desa.alokasiUnit} Unit</span>
      </div>
    </button>
  );
});

export interface BspsSidebarProps {
  isOpen: boolean;
  filteredDesa: BspsData[];
  filterState: FilterState;
  filterActions: FilterActions;
  filterLists: FilterLists;
  statusLabels: StatusLabels;
  statusColors: StatusColors;
  selectedDesaId: string | null;
  onDesaClick: (desa: BspsData) => void;
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
  selectedDesaId,
  onDesaClick,
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
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDesa.length / ITEMS_PER_PAGE)
  );
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
      } fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-[min(92vw,24rem)] flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 sm:w-80 lg:relative lg:top-0 lg:z-10 lg:h-full lg:w-96 lg:shadow-none`}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-secondary/50 p-3 lg:hidden">
        <span className="text-sm font-semibold text-foreground">
          Filter & Daftar Lokasi
        </span>
        <button
          onClick={onCloseSidebar}
          className="rounded-lg p-2 transition-colors hover:bg-secondary"
          aria-label="Tutup sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-shrink-0 border-b border-border bg-card p-3">
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

      <div className="flex-1 min-h-0 space-y-2 overflow-y-scroll p-3 sm:space-y-3 sm:p-4">
        {filteredDesa.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada lokasi ditemukan
          </div>
        ) : (
          paginatedDesa.map((desa) => (
            <BspsLocationCard
              key={desa.id}
              desa={desa}
              statusColors={statusColors}
              statusLabels={statusLabels}
              isActive={selectedDesaId === desa.id}
              onClick={onDesaClick}
            />
          ))
        )}
      </div>

      <SidebarPagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={filteredDesa.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
