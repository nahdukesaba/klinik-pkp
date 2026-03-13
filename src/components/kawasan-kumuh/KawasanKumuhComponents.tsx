/**
 * KawasanKumuhComponents
 * Sub-komponen untuk halaman Kawasan Kumuh:
 * Header, Sidebar, Legend, dan MobileSidebarToggle.
 */

"use client";

import { memo } from "react";

import { Layers, MapPin, Search, Users, X } from "lucide-react";

import { SearchableFilterSelect, SidebarPagination, YearFilterSelect } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { KawasanKumuhData } from "@/services/kawasan-kumuh.service";

// =============================================================================
// KawasanKumuhHeader
// =============================================================================

interface KawasanKumuhHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  yearFilter: string;
  availableYears: number[];
  onYearChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  totalKawasan: number;
  totalPenduduk: number;
  onToggleSidebar: () => void;
}

export function KawasanKumuhHeader({
  searchQuery,
  onSearchChange,
  yearFilter,
  availableYears,
  onYearChange,
  statusFilter,
  onStatusChange,
  totalKawasan,
  totalPenduduk,
  onToggleSidebar,
}: KawasanKumuhHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Kiri: Judul */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Kawasan Kumuh</p>
            <h1 className="text-lg font-bold text-foreground">Sumatera Utara</h1>
          </div>
        </div>

        {/* Kanan: Pencarian, Filter, Statistik */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Input Pencarian */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] md:min-w-[300px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kawasan..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            />
          </div>

          {/* Filter Tahun — Reusable dropdown */}
          <YearFilterSelect
            years={availableYears}
            selectedYear={yearFilter}
            onYearChange={onYearChange}
          />

          {/* Filter Status */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[10rem]">
              <span>
                Status: {statusFilter === "all" ? "Semua" : statusFilter}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="berat">Kumuh Berat</SelectItem>
              <SelectItem value="sedang">Kumuh Sedang</SelectItem>
              <SelectItem value="ringan">Kumuh Ringan</SelectItem>
            </SelectContent>
          </Select>

          {/* Badge Statistik */}
          <div className="stat-badge">
            <MapPin className="w-4 h-4" />
            <span>{totalKawasan}</span>
            <span className="hidden sm:inline ml-1">Kawasan</span>
          </div>
          <div className="stat-badge hidden md:flex">
            <Users className="w-4 h-4" />
            <span>{totalPenduduk.toLocaleString("id-ID")}</span>
            <span className="hidden sm:inline ml-1">Penduduk</span>
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
// KawasanKumuhSidebar
// =============================================================================

interface KawasanKumuhSidebarProps {
  isOpen: boolean;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusColors: Record<string, { fill: string; label: string }>;
  onKabupatenChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  onKelurahanChange: (value: string) => void;
  onResetFilters: () => void;
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
  paginatedKawasan: KawasanKumuhData[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  selectedKawasanId: string | null;
  onKawasanClick: (kawasan: KawasanKumuhData) => void;
  onCloseSidebar: () => void;
  onPageChange: (page: number) => void;
}

const KawasanCard = memo(function KawasanCard({
  kawasan,
  isSelected,
  statusColors,
  onClick,
}: {
  kawasan: KawasanKumuhData;
  isSelected: boolean;
  statusColors: Record<string, { fill: string; label: string }>;
  onClick: () => void;
}) {
  const statusColor = statusColors[kawasan.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "bg-primary/10 border-primary shadow-sm"
          : "bg-card border-border hover:bg-secondary/50 hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{kawasan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {kawasan.kelurahan}, {kawasan.kecamatan}
          </p>
          <p className="text-xs text-muted-foreground truncate">{kawasan.kabupaten}</p>
        </div>
        {statusColor && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
            style={{ backgroundColor: statusColor.fill }}
          >
            {statusColor.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{kawasan.luas.toFixed(2)} Ha</span>
        <span>{kawasan.penduduk.toLocaleString("id-ID")} jiwa</span>
      </div>
    </button>
  );
});

export function KawasanKumuhSidebar({
  isOpen,
  kabupatenFilter,
  kecamatanFilter,
  kelurahanFilter,
  statusColors,
  onKabupatenChange,
  onKecamatanChange,
  onKelurahanChange,
  onResetFilters,
  kabupatenList,
  kecamatanList,
  kelurahanList,
  paginatedKawasan,
  totalItems,
  currentPage,
  totalPages,
  selectedKawasanId,
  onKawasanClick,
  onCloseSidebar,
  onPageChange,
}: KawasanKumuhSidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } fixed lg:relative z-40 lg:z-20 h-[calc(100vh-4rem)] lg:h-full top-16 lg:top-0 left-0 w-[85vw] sm:w-80 lg:w-96 bg-card border-r border-border transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none`}
    >
      {/* Header Mobile dengan Tombol Tutup */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-secondary/50">
        <span className="font-semibold text-foreground text-sm">Filter & Daftar Kawasan</span>
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
        <div className="grid grid-cols-2 gap-2">
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
            className="w-full h-9 text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30 flex items-center justify-center gap-1"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Daftar Kawasan */}
      <div className="flex-1 min-h-0 overflow-y-scroll p-3 sm:p-4 space-y-2 sm:space-y-3">
        {paginatedKawasan.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">Tidak ada kawasan ditemukan</p>
          </div>
        ) : (
          paginatedKawasan.map((kawasan) => (
            <KawasanCard
              key={kawasan.id}
              kawasan={kawasan}
              isSelected={selectedKawasanId === kawasan.id}
              statusColors={statusColors}
              onClick={() => onKawasanClick(kawasan)}
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
        itemLabel="kawasan"
      />
    </div>
  );
}

// =============================================================================
// KawasanKumuhLegend
// =============================================================================

interface KawasanKumuhLegendProps {
  statusColors: Record<string, { fill: string; label: string }>;
}

export function KawasanKumuhLegend({ statusColors }: KawasanKumuhLegendProps) {
  return (
    <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg z-[500]">
      <p className="text-xs font-semibold text-foreground mb-2">Legenda</p>
      <div className="space-y-1.5">
        {Object.entries(statusColors).map(([key, { fill, label }]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: fill }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MobileSidebarToggle
// =============================================================================

interface MobileSidebarToggleProps {
  isVisible: boolean;
  onClick: () => void;
}

export function MobileSidebarToggle({ isVisible, onClick }: MobileSidebarToggleProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="lg:hidden absolute top-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000] hover:bg-secondary transition-colors"
      aria-label="Buka filter"
    >
      <Layers className="w-5 h-5 text-foreground" />
    </button>
  );
}
