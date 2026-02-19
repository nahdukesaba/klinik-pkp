"use client";

import { RefObject, useMemo } from "react";

import { MapPin } from "lucide-react";

import { MapFilterBar } from "@/components/shared/MapFilterBar";

interface PKPMapSectionProps {
  mapRef: RefObject<HTMLDivElement | null>;
  filteredLocations: Array<{
    id: number;
    name: string;
    kabupaten: string;
    kecamatan?: string;
    kelurahan?: string;
    coordinates: [number, number];
    status: string;
  }>;
  kabupatenFilter: string;
  setKabupatenFilter: (value: string) => void;
  kecamatanFilter: string;
  setKecamatanFilter: (value: string) => void;
  kelurahanFilter: string;
  setKelurahanFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  kabupatenList: string[];
  kecamatanList: string[];
  kelurahanList: string[];
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  compact?: boolean;
}

export function PKPMapSection({
  mapRef,
  filteredLocations,
  kabupatenFilter,
  setKabupatenFilter,
  kecamatanFilter,
  setKecamatanFilter,
  kelurahanFilter,
  setKelurahanFilter,
  statusFilter,
  setStatusFilter,
  kabupatenList,
  kecamatanList,
  kelurahanList,
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
  compact = false,
}: PKPMapSectionProps) {
  // Map is now initialized automatically in the hook

  // Check if any filter is active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (kabupatenFilter !== "all") count++;
    if (kecamatanFilter !== "all") count++;
    if (kelurahanFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter]);

  // Reset filters
  const resetFilters = () => {
    setKabupatenFilter("all");
    setKecamatanFilter("all");
    setKelurahanFilter("all");
    setStatusFilter("all");
  };

  // Status options for filter
  const statusOptions = useMemo(() => [
    { value: "selesai", label: "Selesai" },
    { value: "mendatang", label: "Mendatang" }
  ], []);

  // Count by status
  const statusCounts = useMemo(() => {
    const selesai = filteredLocations.filter(loc => loc.status === "selesai").length;
    const mendatang = filteredLocations.filter(loc => loc.status === "mendatang").length;
    return { selesai, mendatang, total: filteredLocations.length };
  }, [filteredLocations]);

  // Map height classes based on compact mode
  const mapHeightClass = compact
    ? "h-[400px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[750px] min-h-[400px]"
    : "h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] min-h-[320px]";

  return (
    <section id="peta-section" className={`${compact ? 'mb-0' : 'mb-12'} scroll-mt-24`}>
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-lg overflow-hidden h-full">
        {/* Header - More Compact */}
        <div className={`${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} border-b border-border bg-gradient-to-r from-primary/5 to-accent/5`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'} font-bold text-foreground flex items-center gap-2`}>
                <MapPin className={`${compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-primary flex-shrink-0`} />
                <span>Peta Lokasi Sosialisasi</span>
              </h2>
              {!compact && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Temukan lokasi kegiatan sosialisasi Klinik PKP
                </p>
              )}
            </div>

            {/* Stats Badges - More Compact */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 rounded-lg flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">{statusCounts.total} Lokasi</span>
              </div>
              <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">{statusCounts.selesai} Selesai</span>
              </div>
              <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-400">{statusCounts.mendatang} Mendatang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar (left) & Filter Toggle (right) */}
        <div className="p-3 sm:p-4 border-b border-border bg-secondary/30">
          <MapFilterBar
            showSearch={true}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={compact ? "Cari lokasi..." : "Cari nama lokasi, kabupaten, atau kecamatan..."}
            kabupatenFilter={kabupatenFilter}
            onKabupatenChange={setKabupatenFilter}
            kabupatenList={kabupatenList.filter(k => k !== "all")}
            kecamatanFilter={kecamatanFilter}
            onKecamatanChange={setKecamatanFilter}
            kecamatanList={kecamatanList.filter(k => k !== "all")}
            kelurahanFilter={kelurahanFilter}
            onKelurahanChange={setKelurahanFilter}
            kelurahanList={kelurahanList.filter(k => k !== "all")}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFilterCount={activeFilterCount}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Map Container - Adaptive Height */}
        <div className={`relative w-full ${mapHeightClass} bg-gray-100`}>
          <div
            id="peta-sosialisasi"
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: "400px" }}
          />
        </div>

        {/* Footer with click instruction - More Compact */}
        <div className="p-2 sm:p-3 border-t border-border bg-secondary/20">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Klik marker untuk melihat detail lokasi
          </p>
        </div>
      </div>
    </section>
  );
}
