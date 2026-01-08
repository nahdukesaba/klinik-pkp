"use client";

import { useEffect, RefObject, useMemo } from "react";

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
  initializeMap: (onImageClick?: (images: string[], index: number, title: string) => void) => void;
  cleanupMap: () => void;
  updateMarkers: (onImageClick?: (images: string[], index: number, title: string) => void) => void;
  mapReady: boolean;
  onImageClick?: (images: string[], index: number, title: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
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
  initializeMap,
  cleanupMap,
  updateMarkers,
  mapReady,
  onImageClick,
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
}: PKPMapSectionProps) {
  // Initialize map on mount - hanya sekali
  useEffect(() => {
    initializeMap(onImageClick);
    return () => cleanupMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when filtered locations change
  useEffect(() => {
    if (mapReady) {
      updateMarkers(onImageClick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, filteredLocations]);

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

  return (
    <section id="peta-section" className="mb-12 animate-on-scroll scroll-mt-24">
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-lg overflow-hidden">
        {/* Header - More Compact */}
        <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span>Peta Lokasi Sosialisasi</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Temukan lokasi kegiatan sosialisasi Klinik PKP
              </p>
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
            searchPlaceholder="Cari nama lokasi, kabupaten, atau kecamatan..."
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

        {/* Map Container - More Compact Height */}
        <div className="relative w-full h-[300px] sm:h-[350px] md:h-[450px] min-h-[280px] bg-gray-100">
          <div
            id="peta-sosialisasi"
            ref={mapRef}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Footer with click instruction - More Compact */}
        <div className="p-3 border-t border-border bg-secondary/20">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Klik marker untuk melihat detail lokasi • Geser dan zoom map
          </p>
        </div>
      </div>
    </section>
  );
}
