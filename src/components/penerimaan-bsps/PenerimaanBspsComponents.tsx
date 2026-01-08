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

import { useState } from "react";

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

import { ProgressIndicator, StepArrow } from "@/components/landing";
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

import type { LucideIcon } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari desa atau kelurahan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
            showFilters || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
          >
            Reset
          </button>
        )}
      </div>
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-secondary/50 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
      <Select value={kabupatenFilter} onValueChange={handleKabupatenChange}>
        <SelectTrigger className="bg-card h-9 text-sm">
          <SelectValue placeholder="Kabupaten/Kota" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[9999] max-h-60">
          <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
          {kabupatenList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={kecamatanFilter} onValueChange={handleKecamatanChange}>
        <SelectTrigger className="bg-card h-9 text-sm">
          <SelectValue placeholder="Kecamatan" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[9999] max-h-60">
          <SelectItem value="all">Semua Kecamatan</SelectItem>
          {kecamatanList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={kelurahanFilter} onValueChange={setKelurahanFilter}>
        <SelectTrigger className="bg-card h-9 text-sm">
          <SelectValue placeholder="Kelurahan/Desa" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[9999] max-h-60">
          <SelectItem value="all">Semua Kelurahan/Desa</SelectItem>
          {kelurahanList.map((k) => (
            <SelectItem key={k} value={k}>{k}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="bg-card h-9 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[9999]">
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
// BspsLegend Component - Responsive
// ============================================

export function BspsLegend() {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
      {Object.entries(penerimaanStatusLabels).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
            style={{ backgroundColor: penerimaanStatusColors[key].fill }}
          />
          <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
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
    <div className="mb-12 sm:mb-16 bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 shadow-lg animate-on-scroll">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
        <span>Peta Lokasi Penerima BSPS</span>
      </h2>

      {/* Filter Controls */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <BspsFilterBar filterState={filterState} filterActions={filterActions} />
        <BspsFilterDropdowns filterState={filterState} filterActions={filterActions} filterLists={filterLists} />
        <BspsActiveFilters filterState={filterState} filterActions={filterActions} />
      </div>

      {/* Legend - Responsive */}
      <BspsLegend />

      {/* Map Container - Responsive Height */}
      <div
        ref={mapRef}
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg sm:rounded-xl overflow-hidden border border-border"
      />
      <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
        Klik pada area lingkaran untuk melihat detail penerima bantuan
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
// BspsProcessSteps Component - With Interactive Steps like Landing Page
// ============================================

// Step icons mapping
const stepIcons: Record<number, LucideIcon> = {
  1: ClipboardList, // Pendaftaran
  2: Search, // Verifikasi  
  3: Users, // Seleksi
  4: Gift, // Pencairan
  5: FileCheck, // Pembangunan
  6: CheckCircle, // Serah Terima
};

interface ProcessStepCardProps {
  step: { step: number; title: string; description: string };
  isHovered: boolean;
  isAnyHovered: boolean;
}

function ProcessStepCard({ step, isHovered, isAnyHovered }: ProcessStepCardProps) {
  const IconComponent = stepIcons[step.step] || ClipboardList;
  const isLast = step.step === 6;
  const cardOpacity = isAnyHovered && !isHovered ? "opacity-50" : "opacity-100";
  const cardScale = isHovered ? "scale-[1.02]" : "scale-100";

  return (
    <div className={`h-full transition-all duration-300 ${cardOpacity} ${cardScale}`}>
      <div
        className={`flex flex-col h-full min-h-[160px] bg-card rounded-xl border p-4 shadow-md transition-all duration-300 ${
          isHovered ? "border-primary shadow-lg shadow-primary/20" : "border-border"
        } ${isLast && isHovered ? "ring-2 ring-green-500/50" : ""}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 flex-shrink-0 ${
              isLast
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-primary to-accent"
            } rounded-lg flex items-center justify-center text-primary-foreground shadow-md transition-transform duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className={`text-xs font-bold ${isLast ? "text-green-500" : "text-primary"}`}>
              Langkah {step.step}
            </span>
            <h3
              className={`text-sm font-semibold transition-colors duration-300 line-clamp-1 ${
                isHovered ? "text-primary" : "text-foreground"
              }`}
            >
              {step.title}
            </h3>
          </div>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed flex-grow line-clamp-3">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function BspsProcessSteps() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const steps = bspsProcessSteps;

  const firstRow = steps.slice(0, 3); // Steps 1, 2, 3
  const secondRow = steps.slice(3, 6); // Steps 4, 5, 6 (normal order)
  const secondRowReversed = [...secondRow].reverse(); // Steps 6, 5, 4 (for desktop display)

  return (
    <div id="prosedur" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Prosedur Pendaftaran
      </h2>
      
      <div className="max-w-5xl mx-auto">
        {/* ROW 1: Steps 1→2→3 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 md:gap-0 items-stretch">
          {firstRow.map((item, index) => (
            <div key={item.step} className="contents">
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard
                  step={item}
                  isHovered={hoveredStep === item.step}
                  isAnyHovered={hoveredStep !== null}
                />
              </div>
              {index < 2 && (
                <StepArrow
                  direction="right"
                  isActive={hoveredStep !== null && hoveredStep >= item.step + 1}
                  className="hidden md:flex items-center px-2"
                />
              )}
              {index < 2 && (
                <div className="md:hidden flex justify-center py-2">
                  <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Arrow from Step 3 to Step 4 (DOWN) */}
        <div className="hidden md:flex justify-end pr-[calc(16.67%-8px)] py-3">
          <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
        </div>
        <div className="md:hidden flex justify-center py-2">
          <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
        </div>

        {/* ROW 2 MOBILE: Steps 4→5→6 (normal order, vertical) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {secondRow.map((item, index) => (
            <div key={`mobile-${item.step}`}>
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard
                  step={item}
                  isHovered={hoveredStep === item.step}
                  isAnyHovered={hoveredStep !== null}
                />
              </div>
              {index < 2 && (
                <div className="flex justify-center py-2">
                  <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ROW 2 DESKTOP: Steps 6←5←4 (reversed order, horizontal left) */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-stretch">
          {secondRowReversed.map((item, index) => (
            <div key={`desktop-${item.step}`} className="contents">
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard
                  step={item}
                  isHovered={hoveredStep === item.step}
                  isAnyHovered={hoveredStep !== null}
                />
              </div>
              {index < 2 && (
                <StepArrow
                  direction="left"
                  isActive={hoveredStep !== null && hoveredStep >= item.step + 1}
                  className="flex items-center px-2"
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator totalSteps={steps.length} hoveredStep={hoveredStep} />
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
