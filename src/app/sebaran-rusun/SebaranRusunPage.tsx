"use client";

import { useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout";
import {
  RusunHeader,
  RusunSidebar,
  RusunMapContainer,
  RusunLoadingSkeleton,
} from "@/components/sebaran-rusun";
import type { RusunData } from "@/data/peta-sebaran-rusun";
import { useSebaranRusun, useRusunMap } from "@/hooks";

// ============================================
// Sebaran Rusun Page - Refactored
// ============================================
export default function SebaranRusunPage() {
  const router = useRouter();

  // Data & filter logic from custom hook
  const {
    filters,
    selectedRusun,
    sidebarOpen,
    regionData,
    filteredRusun,
    filterOptions,
    stats,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter,
    setKecamatanFilter,
    setKelurahanFilter,
    setSidebarOpen,
    resetFilters,
    handleRusunSelect,
  } = useSebaranRusun();

  // Handle rusun click - fly to location and close sidebar on mobile
  const handleRusunClick = useCallback(
    (rusun: RusunData) => {
      handleRusunSelect(rusun);
      setSidebarOpen(false); // Close sidebar on mobile
      flyToLocation(rusun.lat, rusun.lng, 14);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Map logic from custom hook
  const { mapRef, mapReady, isClient, flyToLocation, flyToRegion } = useRusunMap(
    filteredRusun,
    handleRusunClick
  );

  // Fly to region when filter changes
  useEffect(() => {
    if (mapReady) {
      flyToRegion(regionData.lat, regionData.lng, regionData.zoom);
    }
  }, [regionData, mapReady, flyToRegion]);

  // Loading state
  if (!isClient) {
    return <RusunLoadingSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20">
        {/* Header with Search & Region Filter */}
        <RusunHeader
          regionName={regionData.name}
          searchQuery={filters.searchQuery}
          regionFilter={filters.regionFilter}
          totalRusun={stats.totalRusun}
          totalUnits={stats.totalUnits}
          onBack={() => router.push("/")}
          onSearchChange={setSearchQuery}
          onRegionChange={setRegionFilter}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content: Sidebar + Map */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Mobile Overlay when sidebar open */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar with Filters & List */}
          <RusunSidebar
            isOpen={sidebarOpen}
            filteredRusun={filteredRusun}
            selectedRusun={selectedRusun}
            kabupatenFilter={filters.kabupatenFilter}
            kecamatanFilter={filters.kecamatanFilter}
            kelurahanFilter={filters.kelurahanFilter}
            kabupatenList={filterOptions.kabupatenList}
            kecamatanList={filterOptions.kecamatanList}
            kelurahanList={filterOptions.kelurahanList}
            onRusunClick={(rusun) => {
              handleRusunSelect(rusun);
              setSidebarOpen(false); // Close sidebar on mobile
              flyToLocation(rusun.lat, rusun.lng, 14);
            }}
            onKabupatenChange={setKabupatenFilter}
            onKecamatanChange={setKecamatanFilter}
            onKelurahanChange={setKelurahanFilter}
            onResetFilters={resetFilters}
            onToggleSidebar={() => setSidebarOpen(true)}
            onCloseSidebar={() => setSidebarOpen(false)}
          />

          {/* Map Container */}
          <RusunMapContainer mapRef={mapRef} />
        </div>
      </div>
    </div>
  );
}
