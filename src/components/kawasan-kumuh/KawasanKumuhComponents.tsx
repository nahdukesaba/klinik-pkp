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
 * - FilterSelect: Reusable dropdown filter
 */

"use client";

import Link from "next/link";

import { ArrowLeft, Building2, Layers, MapPin, Search, Users } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kawasanRegionCenters, kawasanStatusColors, type KawasanKumuh } from "@/data/peta-kawasan-kumuh";

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
// FilterSelect Component (Reusable)
// ============================================

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
  allLabel?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  allLabel = "Semua",
  className = "w-full h-9 text-xs",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ============================================
// KawasanCard Component
// ============================================

interface KawasanCardProps {
  kawasan: KawasanKumuh;
  isSelected: boolean;
  onClick: () => void;
}

export function KawasanCard({ kawasan, isSelected, onClick }: KawasanCardProps) {
  const statusColor = kawasanStatusColors[kawasan.status];

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
        <span>{kawasan.kk} KK</span>
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
  onRegionChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  totalKawasan: number;
  totalKK: number;
  onToggleSidebar: () => void;
}

export function KawasanKumuhHeader({
  searchQuery,
  onSearchChange,
  regionFilter,
  onRegionChange,
  statusFilter,
  onStatusChange,
  totalKawasan,
  totalKK,
  onToggleSidebar,
}: KawasanKumuhHeaderProps) {
  const regionData = kawasanRegionCenters[regionFilter] || kawasanRegionCenters["sumatera-utara"];

  return (
    <div className="bg-card border-b border-border px-4 py-3 flex-shrink-0 relative z-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <Link href="/peta" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Kawasan Kumuh</p>
              <h1 className="text-lg font-bold text-foreground">{regionData.name}</h1>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[350px] max-w-md">
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
              <SelectTrigger className="w-40 h-10 text-sm">
                <SelectValue placeholder="Pilih Region" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(kawasanRegionCenters).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
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
              <span>{totalKawasan} Kawasan</span>
            </div>
            <div className="stat-badge hidden sm:flex">
              <Users className="w-4 h-4" />
              <span>{totalKK} KK</span>
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
}

export function KawasanKumuhSidebar({
  isOpen,
  kabupatenFilter,
  kecamatanFilter,
  kelurahanFilter,
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
}: KawasanKumuhSidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } absolute lg:relative z-10 h-full w-80 lg:w-80 bg-card border-r border-border transition-transform duration-300 flex flex-col overflow-hidden`}
    >
      {/* Filter Section - Fixed */}
      <div className="flex-shrink-0 p-3 border-b border-border bg-card">
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect
            value={kabupatenFilter}
            onValueChange={onKabupatenChange}
            placeholder="Semua Kab/Kota"
            options={kabupatenList}
            allLabel="Semua Kab/Kota"
          />
          <FilterSelect
            value={kecamatanFilter}
            onValueChange={onKecamatanChange}
            placeholder="Semua Kec"
            options={kecamatanList}
            allLabel="Semua Kec"
          />
          <FilterSelect
            value={kelurahanFilter}
            onValueChange={onKelurahanChange}
            placeholder="Semua Kelurahan"
            options={kelurahanList}
            allLabel="Semua Kelurahan"
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

export function KawasanKumuhLegend() {
  return (
    <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-4 z-[1000] max-w-[200px]">
      <span className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full" />
        Status Kawasan
      </span>
      <div className="space-y-2">
        {Object.entries(kawasanStatusColors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded border border-white/50 shadow-sm flex-shrink-0"
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
      className="lg:hidden absolute top-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000]"
    >
      <Layers className="w-5 h-5" />
    </button>
  );
}
