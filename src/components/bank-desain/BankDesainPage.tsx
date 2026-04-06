/**
 * BankDesainPage
 * Container UI untuk halaman Bank Desain.
 * 
 * CATATAN UNTUK DEVELOPER:
 * Komponen ini menggunakan data dari hook useBankDesainPage.
 * Mudah diintegrasikan dengan API backend (Golang) untuk data dinamis.
 * 
 * @features
 * - Filter berdasarkan tipe rumah, jumlah kamar, dan fitur teras
 * - Preview gambar desain dengan zoom (react-zoom-pan-pinch)
 * - Link unduh RAB PDF dan desain (buka tab baru)
 * - Responsive grid layout dengan pagination
 */

"use client";

import { memo } from "react";

import Image from "next/image";

import {
  Bath,
  BedDouble,
  Download,
  Eye,
  FileText,
  Home,
  Maximize2,
  Palette,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
// Note: X used in search clear button, SlidersHorizontal used in filter row

import { DesignPreviewDialog } from "@/components/bank-desain/DesignPreviewDialog";
import { Footer, Navbar } from "@/components/layout";
import { ApiErrorState } from "@/components/shared";
import { GridPagination } from "@/components/shared/GridPagination";
import { useBankDesainPage } from "@/hooks/bank-desain/use-bank-desain-page";
import type { BankDesainData } from "@/hooks/bank-desain/use-bank-desain-query";
// --- Design Card Component ---

interface DesignCardProps {
  design: BankDesainData;
  index: number;
  onPreview: (design: BankDesainData) => void;
  getDownloadUrl: (design: BankDesainData) => string;
}

const DesignCard = memo(function DesignCard({ 
  design, 
  index, 
  onPreview,
  getDownloadUrl,
}: DesignCardProps) {
  const hasPreviewImages = design.previewImages.length > 0;

  return (
    <div
      className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all shadow-md hover:shadow-xl group opacity-0 animate-fade-in"
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "forwards",
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        <Image
          src={design.thumbnail}
          alt={design.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-foreground text-lg mb-1">
          {design.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Kode: {design.code}
        </p>

        {/* Specs Grid */}
        <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SpecItem icon={BedDouble} label={`${design.bedrooms} Kamar Tidur`} />
          <SpecItem icon={Bath} label={`${design.bathrooms} Kamar Mandi`} />
          <SpecItem icon={Maximize2} label={`${design.area} m²`} />
          <SpecItem 
            icon={Home} 
            label={design.terasFeature === "dengan-teras" ? "Ada Teras" : "Tanpa Teras"} 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onPreview(design)}
            disabled={!hasPreviewImages}
            className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            Lihat Preview
          </button>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={getDownloadUrl(design)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-3 bg-accent text-accent-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Unduh Desain
            </a>
            <a
              href={design.rabPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh RAB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Spec Item Component ---

interface SpecItemProps {
  icon: React.ElementType;
  label: string;
}

function SpecItem({ icon: Icon, label }: SpecItemProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="break-words">{label}</span>
    </div>
  );
}

// --- Empty State Component ---

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 bg-card rounded-2xl border border-border">
      <Palette className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Tidak Ada Desain Ditemukan
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-4">
        Coba ubah filter atau kata kunci pencarian Anda.
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Filter
      </button>
    </div>
  );
}

// --- Pagination Component ---

// --- Filter Chip (inline — no separate component needed) ---

function FilterChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[36px] rounded-full border px-3 py-2 text-center text-xs font-medium leading-snug transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// --- Main Component ---

export default function BankDesainPage() {
  const {
    ref,
    isLoading,
    isError,
    error,
    refetch,
    typeFilter,
    bedroomFilter,
    terasFilter,
    searchQuery,
    setTypeFilter,
    setBedroomFilter,
    setTerasFilter,
    setSearchQuery,
    typeCategories,
    bedroomCategories,
    terasCategories,
    paginatedDesigns,
    totalDesigns,
    totalFilteredDesigns,
    resetFilters,
    currentPage,
    totalPages,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    previewDesign,
    isPreviewOpen,
    handleOpenPreview,
    handleClosePreview,
    getDesignDownloadUrl,
  } = useBankDesainPage();

  // Error state tetap full-page (tidak ada data sama sekali)
  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Palette className="w-4 h-4" />
              <span>Bank Desain</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Koleksi Desain Rumah
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Temukan berbagai desain rumah yang dapat menjadi inspirasi untuk pembangunan hunian Anda.
            </p>
          </div>

          {/* Search + Filter Section - Modern Design */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm animate-on-scroll">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari desain berdasarkan nama, kode, atau tipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* All filter chips in one row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground mr-1">|</span>
              {typeCategories.map((cat) => (
                <FilterChip key={`type-${cat.id}`} label={cat.label} isActive={typeFilter === cat.id} onClick={() => setTypeFilter(cat.id)} />
              ))}
              <span className="text-xs text-muted-foreground mx-0.5">|</span>
              {bedroomCategories.map((cat) => (
                <FilterChip key={`bed-${cat.id}`} label={cat.label} isActive={bedroomFilter === cat.id} onClick={() => setBedroomFilter(cat.id)} />
              ))}
              <span className="text-xs text-muted-foreground mx-0.5">|</span>
              {terasCategories.map((cat) => (
                <FilterChip key={`teras-${cat.id}`} label={cat.label} isActive={terasFilter === cat.id} onClick={() => setTerasFilter(cat.id)} />
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">{totalFilteredDesigns}</span>
              {" "}dari{" "}
              <span className="font-semibold text-foreground">{totalDesigns}</span>
              {" "}desain
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
            )}
          </div>

          {/* Design Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Memuat data desain rumah...</p>
            </div>
          ) : paginatedDesigns.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {paginatedDesigns.map((design, index) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    index={index}
                    onPreview={handleOpenPreview}
                    getDownloadUrl={getDesignDownloadUrl}
                  />
                ))}
              </div>
              <GridPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
              />
            </>
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </div>
      </main>
      <Footer />

      {/* Preview Dialog */}
      <DesignPreviewDialog
        design={previewDesign}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
