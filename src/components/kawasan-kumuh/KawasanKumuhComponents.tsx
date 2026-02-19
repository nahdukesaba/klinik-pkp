/**
 * Kawasan Kumuh UI Components
 * 
 * DESKRIPSI: Komponen-komponen UI untuk halaman Profil Kawasan Kumuh
 * Dipisahkan dari KawasanKumuhPage untuk clean architecture
 * 
 * KOMPONEN:
 * - KawasanKumuhHeader: Header dengan search, filter region & status
 * - KawasanKumuhSidebar: Sidebar dengan filter lokasi dan list kawasan
 * - KawasanKumuhLegend: Legend status warna kawasan
 * - KawasanCard: Card individual untuk setiap kawasan
 */

"use client";

import Link from "next/link";

import { ArrowLeft, Building2, Layers, MapPin, Search, Users, X } from "lucide-react";

import { SearchableFilterSelect } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type KawasanKumuh } from "@/data/peta-kawasan-kumuh";

// ============================================
// Types & Constants
// ============================================

interface FilterOption {
  value: string;
  label: string;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "berat", label: "Kumuh Berat" },
  { value: "sedang", label: "Kumuh Sedang" },
  { value: "ringan", label: "Kumuh Ringan" },
];

// ============================================
// KawasanCard Component
// ============================================

interface StatusColor {
  fill: string;
  label: string;
}

interface KawasanCardProps {
  kawasan: KawasanKumuh;
  isSelected: boolean;
  statusColor: StatusColor;
  onClick: () => void;
}

export function KawasanCard({ kawasan, isSelected, statusColor, onClick }: KawasanCardProps) {
  return (
    <div
      onClick={onClick}
      className={`clinic-card cursor-pointer transition-all ${
        isSelected ? "clinic-card-active" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">
          {kawasan.name}
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded text-white whitespace-nowrap flex-shrink-0"
          style={{ backgroundColor: statusColor.fill }}
        >
          {statusColor.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        <MapPin className="w-3 h-3 inline mr-1" />
        {kawasan.kelurahan}, {kawasan.kecamatan}
      </p>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{kawasan.luas} Ha</span>
        <span>{kawasan.penduduk.toLocaleString("id-ID")} Penduduk</span>
      </div>
    </div>
  );
}

// ============================================
// KawasanKumuhHeader Component
// ============================================

interface KawasanKumuhHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  regionFilter: string;
  regionName: string;
  regionOptions: { id: string; name: string }[];
  onRegionChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  totalKawasan: number;
  totalPenduduk: number;
  onToggleSidebar: () => void;
}

export function KawasanKumuhHeader({
  searchQuery,
  onSearchChange,
  regionFilter,
  regionName,
  regionOptions,
  onRegionChange,
  statusFilter,
  onStatusChange,
  totalKawasan,
  totalPenduduk,
  onToggleSidebar,
}: KawasanKumuhHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0 relative z-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Kawasan Kumuh</p>
              <h1 className="text-lg font-bold text-foreground">{regionName}</h1>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
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

            {/* Region Filter */}
            <Select value={regionFilter} onValueChange={onRegionChange}>
              <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
                <SelectValue placeholder="Pilih Region" />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter (Desktop) */}
            <div className="hidden sm:block">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-40 h-10 text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats Badges */}
            <div className="stat-badge">
              <Building2 className="w-4 h-4" />
              <span className="hidden xs:inline">{totalKawasan}</span>
              <span className="xs:hidden">{totalKawasan}</span>
              <span className="hidden sm:inline ml-1">Kawasan</span>
            </div>
            <div className="stat-badge hidden md:flex">
              <Users className="w-4 h-4" />
              <span>{totalPenduduk.toLocaleString("id-ID")} Penduduk</span>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button onClick={onToggleSidebar} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// KawasanKumuhSidebar Component
// ============================================

interface KawasanKumuhSidebarProps {
  isOpen: boolean;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusColors: Record<string, StatusColor>;
  onKabupatenChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  onKelurahanChange: (value: string) => void;
  onResetFilters: () => void;
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
  filteredKawasan: KawasanKumuh[];
  selectedKawasanId: string | null;
  onKawasanClick: (kawasan: KawasanKumuh) => void;
  onCloseSidebar?: () => void;
}

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
  filteredKawasan,
  selectedKawasanId,
  onKawasanClick,
  onCloseSidebar,
}: KawasanKumuhSidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } fixed lg:relative z-40 lg:z-10 h-[calc(100vh-4rem)] lg:h-full top-16 lg:top-0 left-0 w-[85vw] sm:w-80 lg:w-96 bg-card border-r border-border transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none`}
    >
      {/* Mobile Header with Close Button */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-secondary/50 flex-shrink-0">
        <span className="font-semibold text-foreground text-sm">Filter & Daftar Kawasan</span>
        <button
          onClick={onCloseSidebar}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Section - Fixed */}
      <div className="flex-shrink-0 p-3 border-b border-border bg-card">
        <div className="grid grid-cols-2 gap-2">
          <SearchableFilterSelect
            value={kabupatenFilter}
            onValueChange={onKabupatenChange}
            placeholder="Kab/Kota"
            searchPlaceholder="Cari kabupaten..."
            options={kabupatenList}
            allLabel="Semua Kab/Kota"
          />
          <SearchableFilterSelect
            value={kecamatanFilter}
            onValueChange={onKecamatanChange}
            placeholder="Kecamatan"
            searchPlaceholder="Cari kecamatan..."
            options={kecamatanList}
            allLabel="Semua Kecamatan"
            disabled={kabupatenFilter === "all" && kecamatanList.length === 0}
          />
          <SearchableFilterSelect
            value={kelurahanFilter}
            onValueChange={onKelurahanChange}
            placeholder="Kelurahan"
            searchPlaceholder="Cari kelurahan..."
            options={kelurahanList}
            allLabel="Semua Kelurahan"
            disabled={kecamatanFilter === "all" && kelurahanList.length === 0}
          />
          <button
            onClick={onResetFilters}
            className="w-full h-9 text-xs px-2 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30 flex items-center justify-center gap-1"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Kawasan List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-scroll p-3 sm:p-4 space-y-2 sm:space-y-3">
        {filteredKawasan.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada kawasan ditemukan
          </div>
        ) : (
          filteredKawasan.map((kawasan) => (
            <KawasanCard
              key={kawasan.id}
              kawasan={kawasan}
              isSelected={selectedKawasanId === kawasan.id}
              statusColor={statusColors[kawasan.status]}
              onClick={() => onKawasanClick(kawasan)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// KawasanKumuhLegend Component
// ============================================

interface KawasanKumuhLegendProps {
  statusColors: Record<string, StatusColor>;
}

export function KawasanKumuhLegend({ statusColors }: KawasanKumuhLegendProps) {
  return (
    <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-3 sm:p-4 z-[500] max-w-[180px] sm:max-w-[200px] pointer-events-auto">
      <span className="text-xs font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full" />
        Status Kawasan
      </span>
      <div className="space-y-1.5 sm:space-y-2">
        {Object.entries(statusColors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-white/50 shadow-sm flex-shrink-0"
              style={{ backgroundColor: value.fill }}
            />
            <span className="text-foreground font-medium">{value.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MobileSidebarToggle Component
// ============================================

interface MobileSidebarToggleProps {
  isVisible: boolean;
  onClick: () => void;
}

export function MobileSidebarToggle({ isVisible, onClick }: MobileSidebarToggleProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="lg:hidden absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000] hover:bg-secondary transition-colors"
      aria-label="Buka filter"
    >
      <Layers className="w-5 h-5 text-foreground" />
    </button>
  );
}
