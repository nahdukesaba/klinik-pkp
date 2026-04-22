/**
 * RusunComponents
 * Sub-komponen untuk halaman Sebaran Rusun:
 * Header, MapContainer, Card, dan Sidebar.
 */

"use client";

import { memo } from "react";
import type { RefObject } from "react";

import { ArrowLeft, Building2, Layers, MapPin, Search, Users, X } from "lucide-react";

import { SearchableFilterSelect, SidebarPagination } from "@/components/shared";
import { type RusunData } from "@/services/rusun.service";

// =============================================================================
// RusunHeader
// =============================================================================

interface RusunHeaderProps {
  searchQuery: string;
  totalRusun: number;
  totalUnits: number;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onToggleSidebar: () => void;
}

export function RusunHeader({
  searchQuery,
  totalRusun,
  totalUnits,
  onBack,
  onSearchChange,
  onToggleSidebar,
}: RusunHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Kiri: Tombol kembali & Judul */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground">Sebaran Rusun</p>
            <h1 className="text-lg font-bold text-foreground">Sumatera Utara</h1>
          </div>
        </div>

        {/* Kanan: Pencarian, Filter, Statistik */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Input Pencarian */}
          <div className="relative w-full max-w-md flex-1 min-w-0 sm:w-auto sm:min-w-[200px] md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari rusun..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            />
          </div>

          {/* Badge Statistik */}
          <div className="stat-badge">
            <Building2 className="w-4 h-4" />
            <span className="hidden xs:inline">{totalRusun}</span>
            <span className="xs:hidden">{totalRusun}</span>
            <span className="hidden sm:inline ml-1">Rusun</span>
          </div>
          <div className="stat-badge hidden md:flex">
            <Users className="w-4 h-4" />
            <span>{totalUnits} Unit</span>
          </div>

          {/* Toggle Sidebar Mobile */}
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
  );
}

// =============================================================================
// RusunMapContainer
// =============================================================================

interface RusunMapContainerProps {
  mapRef: RefObject<HTMLDivElement | null>;
}

export function RusunMapContainer({ mapRef }: RusunMapContainerProps) {
  return (
    <div className="absolute inset-0 z-10 bg-[#e5e7eb]">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// =============================================================================
// RusunCard
// =============================================================================

interface RusunCardProps {
  rusun: RusunData;
  isSelected: boolean;
  onClick: () => void;
}

export const RusunCard = memo(function RusunCard({ rusun, isSelected, onClick }: RusunCardProps) {
  return (
    <div
      onClick={onClick}
      className={`clinic-card cursor-pointer overflow-hidden ${isSelected ? "clinic-card-active" : ""}`}
    >
      <h3 className="text-sm font-semibold leading-snug text-foreground break-words">
        {rusun.name}
      </h3>
      <p className="mt-1 text-xs leading-snug text-muted-foreground break-words">
        <MapPin className="w-3 h-3 inline mr-1" />
        {rusun.kelurahan}, {rusun.kecamatan}
      </p>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{rusun.units} Unit</span>
        <span>{rusun.floors} Lantai</span>
      </div>
    </div>
  );
});

// =============================================================================
// RusunSidebar
// =============================================================================

interface RusunSidebarProps {
  isOpen: boolean;
  paginatedRusun: RusunData[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  selectedRusun: RusunData | null;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
  onRusunClick: (rusun: RusunData) => void;
  onKabupatenChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  onKelurahanChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleSidebar: () => void;
  onCloseSidebar?: () => void;
  onPageChange: (page: number) => void;
}

export function RusunSidebar({
  isOpen,
  paginatedRusun,
  totalItems,
  currentPage,
  totalPages,
  selectedRusun,
  kabupatenFilter,
  kecamatanFilter,
  kelurahanFilter,
  kabupatenList,
  kecamatanList,
  kelurahanList,
  onRusunClick,
  onKabupatenChange,
  onKecamatanChange,
  onKelurahanChange,
  onResetFilters,
  onToggleSidebar,
  onCloseSidebar,
  onPageChange,
}: RusunSidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } fixed lg:relative z-40 lg:z-20 h-[calc(100vh-4rem)] lg:h-full top-16 lg:top-0 left-0 w-[min(92vw,24rem)] sm:w-80 lg:w-96 bg-card border-r border-border transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none`}
      >
        {/* Header Mobile dengan Tombol Tutup */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-secondary/50">
          <span className="font-semibold text-foreground text-sm">Filter & Daftar Rusun</span>
          <button
            onClick={onCloseSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bagian Filter */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SearchableFilterSelect
              value={kabupatenFilter}
              onValueChange={onKabupatenChange}
              placeholder="Kab/Kota"
              searchPlaceholder="Cari kabupaten..."
              allLabel="Semua Kab/Kota"
              options={kabupatenList}
            />

            <SearchableFilterSelect
              value={kecamatanFilter}
              onValueChange={onKecamatanChange}
              placeholder="Kecamatan"
              searchPlaceholder="Cari kecamatan..."
              allLabel="Semua Kecamatan"
              options={kecamatanList}
              disabled={kabupatenFilter === "all"}
            />

            <SearchableFilterSelect
              value={kelurahanFilter}
              onValueChange={onKelurahanChange}
              placeholder="Kelurahan"
              searchPlaceholder="Cari kelurahan..."
              allLabel="Semua Kelurahan"
              options={kelurahanList}
              disabled={kecamatanFilter === "all"}
            />

            <button
              onClick={onResetFilters}
              className="flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border border-primary/30 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Daftar Rusun */}
        <div className="flex-1 min-h-0 overflow-y-scroll p-3 sm:p-4 space-y-2 sm:space-y-3">
          {paginatedRusun.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Tidak ada rusun ditemukan</p>
            </div>
          ) : (
            paginatedRusun.map((rusun) => (
              <RusunCard
                key={rusun.id}
                rusun={rusun}
                isSelected={selectedRusun?.id === rusun.id}
                onClick={() => onRusunClick(rusun)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <SidebarPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          itemLabel="rusun"
        />
      </div>

      {/* Tombol Toggle Mobile (saat sidebar tertutup) - Posisi kanan */}
      {!isOpen && (
        <button
          onClick={onToggleSidebar}
          className="lg:hidden absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000] hover:bg-secondary transition-colors"
          aria-label="Buka filter"
        >
          <Layers className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}
