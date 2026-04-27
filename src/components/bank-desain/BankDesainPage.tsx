"use client";

import { memo, type ElementType } from "react";

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

import { Footer, Navbar } from "@/components/layout";
import { ApiErrorState, ImageZoomDialog } from "@/components/shared";
import { GridPagination } from "@/components/shared/GridPagination";
import { useBankDesainPage } from "@/hooks/bank-desain/use-bank-desain-page";
import type { BankDesainData } from "@/services/bank-desain.service";

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
      className="group animate-fade-in overflow-hidden rounded-2xl border border-border bg-card opacity-0 shadow-md transition-all hover:border-primary/30 hover:shadow-xl"
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "forwards",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={design.thumbnail}
          alt={design.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>

      <div className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          {design.title}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Kode: {design.code}
        </p>

        <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SpecItem icon={BedDouble} label={`${design.bedrooms} Kamar Tidur`} />
          <SpecItem icon={Bath} label={`${design.bathrooms} Kamar Mandi`} />
          <SpecItem icon={Maximize2} label={`${design.area} m2`} />
          <SpecItem
            icon={Home}
            label={
              design.terasFeature === "dengan-teras"
                ? "Ada Teras"
                : "Tanpa Teras"
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onPreview(design)}
            disabled={!hasPreviewImages}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            Lihat Preview
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={getDownloadUrl(design)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-3 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/80"
            >
              <FileText className="h-4 w-4" />
              Unduh Desain
            </a>
            <a
              href={design.rabPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Unduh RAB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

interface SpecItemProps {
  icon: ElementType;
  label: string;
}

function SpecItem({ icon: Icon, label }: SpecItemProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
      <span className="break-words">{label}</span>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card py-16 text-center">
      <Palette className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Tidak Ada Desain Ditemukan
      </h3>
      <p className="mx-auto mb-4 max-w-md text-muted-foreground">
        Coba sesuaikan filter atau kata kunci pencarian untuk melihat desain
        lain yang tersedia.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Filter
      </button>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[36px] rounded-full border px-3 py-2 text-center text-xs font-medium leading-snug transition-all duration-200 ${
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function DesignPreviewDialog({
  design,
  isOpen,
  onClose,
}: {
  design: BankDesainData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!design) {
    return null;
  }

  return (
    <ImageZoomDialog
      images={design.previewImages}
      title={design.title}
      isOpen={isOpen}
      onClose={onClose}
      imageHeight="60vh"
    />
  );
}

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

  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pb-16 pt-24">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent-2/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mb-10 text-center animate-on-scroll">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Palette className="h-4 w-4" />
              <span>Bank Desain</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Referensi Desain Rumah dan Rusun
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Temukan referensi desain yang dapat membantu perencanaan hunian,
              mulai dari rumah tapak hingga rusun sederhana.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm animate-on-scroll">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari desain berdasarkan nama, kode, atau tipe bangunan..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-12 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 rounded-full p-1 transition-colors hover:bg-secondary"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="mr-1 text-xs text-muted-foreground">|</span>
              {typeCategories.map((category) => (
                <FilterChip
                  key={`type-${category.id}`}
                  label={category.label}
                  isActive={typeFilter === category.id}
                  onClick={() => setTypeFilter(category.id)}
                />
              ))}
              <span className="mx-0.5 text-xs text-muted-foreground">|</span>
              {bedroomCategories.map((category) => (
                <FilterChip
                  key={`bed-${category.id}`}
                  label={category.label}
                  isActive={bedroomFilter === category.id}
                  onClick={() => setBedroomFilter(category.id)}
                />
              ))}
              <span className="mx-0.5 text-xs text-muted-foreground">|</span>
              {terasCategories.map((category) => (
                <FilterChip
                  key={`teras-${category.id}`}
                  label={category.label}
                  isActive={terasFilter === category.id}
                  onClick={() => setTerasFilter(category.id)}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {totalFilteredDesigns}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {totalDesigns}
              </span>{" "}
              desain
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Memuat data desain rumah...
              </p>
            </div>
          ) : paginatedDesigns.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

      <DesignPreviewDialog
        design={previewDesign}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
