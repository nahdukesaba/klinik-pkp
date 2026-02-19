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
  ChevronLeft,
  ChevronRight,
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
import type { Design } from "@/data/bank-desain";
import { useBankDesainPage } from "@/hooks/bank-desain/use-bank-desain-page";

// ============================================
// Design Card Component
// ============================================

interface DesignCardProps {
  design: Design;
  index: number;
  onPreview: (design: Design) => void;
  getDownloadUrl: (design: Design) => string;
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
        <div className="grid grid-cols-2 gap-2.5 mb-4">
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
            className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            Lihat Preview
          </button>
          
          <div className="flex gap-2">
            <a
              href={getDownloadUrl(design)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Unduh Desain
            </a>
            <a
              href={design.rabPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
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

// ============================================
// Spec Item Component
// ============================================

interface SpecItemProps {
  icon: React.ElementType;
  label: string;
}

function SpecItem({ icon: Icon, label }: SpecItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

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

// ============================================
// Pagination Component
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisible = 5;
  
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) pages.push("...");
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) pages.push("...");
  
  pages.push(totalPages);

  return pages;
}

function Pagination({ currentPage, totalPages, onPageChange, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => (
          typeof page === "number" ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">...</span>
          )
        ))}
      </div>
      
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============================================
// Filter Chip (inline — no separate component needed)
// ============================================

function FilterChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap ${
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export default function BankDesainPage() {
  const {
    ref,
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
          {paginatedDesigns.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Pagination
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
