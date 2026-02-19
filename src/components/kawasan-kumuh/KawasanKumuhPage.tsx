/**
 * KawasanKumuhPage
 * Container UI untuk halaman Kawasan Kumuh.
 */

"use client";

import type { RefObject } from "react";

import {
  KawasanKumuhHeader,
  KawasanKumuhSidebar,
  KawasanKumuhLegend,
  MobileSidebarToggle,
} from "@/components/kawasan-kumuh/KawasanKumuhComponents";
import { Navbar } from "@/components/layout";
import { MapSkeleton } from "@/components/ui/skeleton";
import { useKawasanKumuhPage } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh-page";

interface KawasanKumuhMapProps {
  mapRef: RefObject<HTMLDivElement | null>;
}

function KawasanKumuhMap({ mapRef }: KawasanKumuhMapProps) {
  return <div ref={mapRef} id="kawasan-kumuh-map" className="w-full h-full" style={{ minHeight: "400px" }} />;
}

export default function KawasanKumuhPage() {
  const {
    filteredKawasan,
    kabupatenList,
    kecamatanList,
    kelurahanList,
    searchQuery,
    regionFilter,
    regionName,
    regionOptions,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    totalPenduduk,
    statusColors,
    selectedKawasan,
    sidebarOpen,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter,
    setKecamatanFilter,
    setKelurahanFilter,
    setStatusFilter,
    handleKawasanClick,
    handleResetFilters,
    toggleSidebar,
    setSidebarOpen,
    mapRef,
    mapLazy,
  } = useKawasanKumuhPage();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20 overflow-hidden">
        <KawasanKumuhHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          regionFilter={regionFilter}
          regionName={regionName}
          regionOptions={regionOptions}
          onRegionChange={setRegionFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalKawasan={filteredKawasan.length}
          totalPenduduk={totalPenduduk}
          onToggleSidebar={toggleSidebar}
        />

        {/* Card wrapper for modern look */}
        <div className="flex-1 flex overflow-hidden relative mx-2 mb-2 rounded-xl border border-border shadow-sm bg-card/50">
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <KawasanKumuhSidebar
            isOpen={sidebarOpen}
            kabupatenFilter={kabupatenFilter}
            kecamatanFilter={kecamatanFilter}
            kelurahanFilter={kelurahanFilter}
            statusColors={statusColors}
            onKabupatenChange={setKabupatenFilter}
            onKecamatanChange={setKecamatanFilter}
            onKelurahanChange={setKelurahanFilter}
            onResetFilters={handleResetFilters}
            kabupatenList={kabupatenList}
            kecamatanList={kecamatanList}
            kelurahanList={kelurahanList}
            filteredKawasan={filteredKawasan}
            selectedKawasanId={selectedKawasan?.id ?? null}
            onKawasanClick={handleKawasanClick}
            onCloseSidebar={() => setSidebarOpen(false)}
          />

          <div className="flex-1 relative overflow-hidden">
            <div ref={mapLazy.ref} className="w-full h-full">
              {mapLazy.isMounted ? (
                <KawasanKumuhMap mapRef={mapRef} />
              ) : (
                <MapSkeleton className="w-full h-full" />
              )}
            </div>

            <KawasanKumuhLegend statusColors={statusColors} />

            <MobileSidebarToggle
              isVisible={!sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
