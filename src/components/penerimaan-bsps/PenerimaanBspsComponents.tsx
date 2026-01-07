/**
 * Penerimaan BSPS UI Components
 * 
 * DESKRIPSI: Komponen-komponen UI untuk halaman Penerimaan BSPS
 * Dipisahkan untuk clean architecture dan reusability
 * 
 * KOMPONEN:
 * - BspsHeader: Header dengan badge dan title
 * - BspsFilterBar: Search dan filter controls
 * - BspsFilterDropdowns: Collapsible filter dropdowns
 * - BspsActiveFilters: Active filter pills
 * - BspsLegend: Legend status warna
 * - BspsMapSection: Container untuk peta
 * - BspsInfoCards: Cards navigasi (Persyaratan, Prosedur, Kriteria)
 * - BspsRequirements: Section persyaratan
 * - BspsProcessSteps: Section prosedur pendaftaran
 * - BspsKriteria: Section kriteria penerima
 * - BspsCta: Call to action section
 */

"use client";

import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  FileCheck,
  Filter,
  Gift,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bspsKriteriaUtama,
  bspsPrioritasPenerima,
  bspsProcessSteps,
  bspsRequirements,
  penerimaanStatusColors,
  penerimaanStatusLabels,
} from "@/data/penerimaan-bsps";

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
  showFilters: boolean;
}

interface FilterActions {
  setSearchQuery: (value: string) => void;
  handleKabupatenChange: (value: string) => void;
  handleKecamatanChange: (value: string) => void;
  setKelurahanFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setShowFilters: (value: boolean) => void;
  resetFilters: () => void;
}

interface FilterLists {
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
}

// ============================================
// BspsHeader Component
// ============================================

export function BspsHeader() {
  return (
    <div className="text-center mb-12 animate-on-scroll">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
        <Gift className="w-4 h-4" />
        <span>BSPS</span>
      </div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
        Penerimaan BSPS
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
        Bantuan Stimulan Perumahan Swadaya (BSPS) untuk masyarakat
        berpenghasilan rendah dalam memperbaiki atau membangun rumah.
      </p>
    </div>
  );
}

// ============================================
// BspsFilterBar Component
// ============================================

interface BspsFilterBarProps {
  filterState: Pick<FilterState, "searchQuery" | "activeFilterCount" | "showFilters">;
  filterActions: Pick<FilterActions, "setSearchQuery" | "setShowFilters" | "resetFilters">;
}

export function BspsFilterBar({ filterState, filterActions }: BspsFilterBarProps) {
  const { searchQuery, activeFilterCount, showFilters } = filterState;
  const { setSearchQuery, setShowFilters, resetFilters } = filterActions;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari desa atau kelurahan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          showFilters || activeFilterCount > 0
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border hover:border-primary/50"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </button>
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
        >
          Reset
        </button>
      )}
    </div>
  );
}

// ============================================
// BspsFilterDropdowns Component
// ============================================

interface BspsFilterDropdownsProps {
  filterState: Pick<FilterState, "kabupatenFilter" | "kecamatanFilter" | "kelurahanFilter" | "statusFilter" | "showFilters">;
  filterActions: Pick<FilterActions, "handleKabupatenChange" | "handleKecamatanChange" | "setKelurahanFilter" | "setStatusFilter">;
  filterLists: FilterLists;
}

export function BspsFilterDropdowns({ filterState, filterActions, filterLists }: BspsFilterDropdownsProps) {
  if (!filterState.showFilters) return null;

  const { kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter } = filterState;
  const { handleKabupatenChange, handleKecamatanChange, setKelurahanFilter, setStatusFilter } = filterActions;
  const { kabupatenList, kecamatanList, kelurahanList } = filterLists;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-secondary/50 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
      <Select value={kabupatenFilter} onValueChange={handleKabupatenChange}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Kabupaten/Kota" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50 max-h-60">
          <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
          {kabupatenList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={kecamatanFilter} onValueChange={handleKecamatanChange}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Kecamatan" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50 max-h-60">
          <SelectItem value="all">Semua Kecamatan</SelectItem>
          {kecamatanList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={kelurahanFilter} onValueChange={setKelurahanFilter}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Kelurahan/Desa" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50 max-h-60">
          <SelectItem value="all">Semua Kelurahan/Desa</SelectItem>
          {kelurahanList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="all">Semua Status</SelectItem>
          {Object.entries(penerimaanStatusLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================
// BspsActiveFilters Component
// ============================================

interface BspsActiveFiltersProps {
  filterState: Pick<FilterState, "kabupatenFilter" | "kecamatanFilter" | "kelurahanFilter" | "statusFilter" | "showFilters" | "activeFilterCount">;
  filterActions: Pick<FilterActions, "handleKabupatenChange" | "handleKecamatanChange" | "setKelurahanFilter" | "setStatusFilter">;
}

export function BspsActiveFilters({ filterState, filterActions }: BspsActiveFiltersProps) {
  const { kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter, showFilters, activeFilterCount } = filterState;
  
  if (activeFilterCount === 0 || showFilters) return null;

  const FilterPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {kabupatenFilter !== "all" && (
        <FilterPill
          label={kabupatenFilter}
          onRemove={() => filterActions.handleKabupatenChange("all")}
        />
      )}
      {kecamatanFilter !== "all" && (
        <FilterPill
          label={kecamatanFilter}
          onRemove={() => filterActions.handleKecamatanChange("all")}
        />
      )}
      {kelurahanFilter !== "all" && (
        <FilterPill
          label={kelurahanFilter}
          onRemove={() => filterActions.setKelurahanFilter("all")}
        />
      )}
      {statusFilter !== "all" && (
        <FilterPill
          label={penerimaanStatusLabels[statusFilter]}
          onRemove={() => filterActions.setStatusFilter("all")}
        />
      )}
    </div>
  );
}

// ============================================
// BspsLegend Component
// ============================================

export function BspsLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {Object.entries(penerimaanStatusLabels).map(([key, label]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: penerimaanStatusColors[key].fill }}
          />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// BspsMapSection Component
// ============================================

interface BspsMapSectionProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  filterState: FilterState;
  filterActions: FilterActions;
  filterLists: FilterLists;
}

export function BspsMapSection({ mapRef, filterState, filterActions, filterLists }: BspsMapSectionProps) {
  return (
    <div className="mb-16 bg-card rounded-2xl border border-border p-6 shadow-lg animate-on-scroll">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary" />
        Peta Lokasi Penerima BSPS
      </h2>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        <BspsFilterBar filterState={filterState} filterActions={filterActions} />
        <BspsFilterDropdowns filterState={filterState} filterActions={filterActions} filterLists={filterLists} />
        <BspsActiveFilters filterState={filterState} filterActions={filterActions} />
      </div>

      {/* Legend */}
      <BspsLegend />

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-border"
      />
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Klik pada area lingkaran untuk melihat detail penerima bantuan di desa tersebut
      </p>
    </div>
  );
}

// ============================================
// BspsInfoCards Component
// ============================================

interface InfoCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

function InfoCard({ id, icon, title, description, delay }: InfoCardProps) {
  const scrollTo = () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollTo}
      className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all shadow-lg hover:shadow-xl animate-on-scroll group text-left"
      style={{ transitionDelay: delay }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </button>
  );
}

export function BspsInfoCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16">
      <InfoCard
        id="persyaratan"
        icon={<ClipboardList className="w-7 h-7" />}
        title="Persyaratan"
        description="Informasi lengkap persyaratan untuk mendaftar program BSPS."
      />
      <InfoCard
        id="prosedur"
        icon={<FileCheck className="w-7 h-7" />}
        title="Prosedur Pendaftaran"
        description="Langkah-langkah untuk mengajukan bantuan BSPS."
        delay="0.1s"
      />
      <InfoCard
        id="kriteria"
        icon={<Users className="w-7 h-7" />}
        title="Kriteria Penerima"
        description="Kriteria masyarakat yang berhak menerima BSPS."
        delay="0.2s"
      />
    </div>
  );
}

// ============================================
// BspsRequirements Component
// ============================================

export function BspsRequirements() {
  return (
    <div id="persyaratan" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Persyaratan Penerima
      </h2>
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {bspsRequirements.map((req, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border animate-on-scroll"
            style={{ transitionDelay: `${index * 0.05}s` }}
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-foreground">{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// BspsProcessSteps Component
// ============================================

export function BspsProcessSteps() {
  return (
    <div id="prosedur" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Prosedur Pendaftaran
      </h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {bspsProcessSteps.map((step, index) => (
          <div
            key={step.step}
            className="relative p-6 bg-card rounded-2xl border border-border text-center animate-on-scroll hover:border-primary/30 transition-colors"
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
              {step.step}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// BspsKriteria Component
// ============================================

export function BspsKriteria() {
  return (
    <div id="kriteria" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Kriteria Penerima
      </h2>
      <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Kriteria Utama
            </h3>
            <ul className="space-y-3">
              {bspsKriteriaUtama.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Prioritas Penerima
            </h3>
            <ul className="space-y-3">
              {bspsPrioritasPenerima.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BspsCta Component
// ============================================

export function BspsCta() {
  return (
    <div className="p-8 bg-card rounded-2xl border border-border animate-on-scroll text-center">
      <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-bold text-foreground mb-2">Butuh Bantuan?</h3>
      <p className="text-muted-foreground mb-6">
        Hubungi kami untuk informasi lebih lanjut tentang program BSPS
      </p>
      <Link
        href="/informasi/kontak"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary-hover transition-colors"
      >
        Hubungi Kami
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ============================================
// Background Pattern Component
// ============================================

export function BspsBackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
    </div>
  );
}
