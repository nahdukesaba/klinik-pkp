/**
 * SebaranRusunPage
 * Container UI untuk halaman Sebaran Rusun.
 */

"use client";

import { Navbar } from "@/components/layout";
import {
  RusunHeader,
  RusunSidebar,
  RusunMapContainer,
} from "@/components/sebaran-rusun";
import { MapSkeleton } from "@/components/ui/skeleton";
import { useSebaranRusunPage } from "@/hooks/sebaran-rusun/use-sebaran-rusun-page";

export default function SebaranRusunPage() {
  const {
    handleBack,
    filters,
    selectedRusun,
    sidebarOpen,
    regionData,
    regionOptions,
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
    handleRusunClick,
    mapRef,
    mapLazy,
  } = useSebaranRusunPage();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20">
        <RusunHeader
          regionName={regionData.name}
          searchQuery={filters.searchQuery}
          regionFilter={filters.regionFilter}
          regionOptions={regionOptions}
          totalRusun={stats.totalRusun}
          totalUnits={stats.totalUnits}
          onBack={handleBack}
          onSearchChange={setSearchQuery}
          onRegionChange={setRegionFilter}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex relative overflow-hidden">
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

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
            onRusunClick={handleRusunClick}
            onKabupatenChange={setKabupatenFilter}
            onKecamatanChange={setKecamatanFilter}
            onKelurahanChange={setKelurahanFilter}
            onResetFilters={resetFilters}
            onToggleSidebar={() => setSidebarOpen(true)}
            onCloseSidebar={() => setSidebarOpen(false)}
          />

          <div ref={mapLazy.ref} className="flex-1 relative">
            {mapLazy.isMounted ? (
              <RusunMapContainer mapRef={mapRef} />
            ) : (
              <MapSkeleton className="w-full h-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
