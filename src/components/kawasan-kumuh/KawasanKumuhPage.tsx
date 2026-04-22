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
import { ApiLoadingState, ApiErrorState } from "@/components/shared";
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
    yearFilter,
    availableYears,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    totalPenduduk,
    statusColors,
    selectedKawasan,
    sidebarOpen,
    setSearchQuery,
    setYearFilter,
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
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useKawasanKumuhPage();
  const mapLazyRef = mapLazy.ref;
  const isMapMounted = mapLazy.isMounted;

  // Tampilkan loading state saat data sedang dimuat dari API
  if (isLoading) {
    return <ApiLoadingState message="Memuat data kawasan kumuh..." />;
  }

  // Tampilkan error state jika gagal mengambil data
  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20 overflow-hidden">
        <KawasanKumuhHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          yearFilter={yearFilter}
          availableYears={availableYears}
          onYearChange={setYearFilter}
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
              data-ui-route-overlay="kawasan-kumuh-sidebar"
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
            paginatedKawasan={pagination.paginatedItems}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            selectedKawasanId={selectedKawasan?.id ?? null}
            onKawasanClick={handleKawasanClick}
            onCloseSidebar={() => setSidebarOpen(false)}
            onPageChange={pagination.setCurrentPage}
          />

          <div className="flex-1 relative overflow-hidden">
            {/* eslint-disable react-hooks/refs -- useLazyMount returns a callback ref plus a mounted flag */}
            <div ref={mapLazyRef} className="w-full h-full">
              {isMapMounted ? (
                <KawasanKumuhMap mapRef={mapRef} />
              ) : (
                <MapSkeleton className="w-full h-full" />
              )}
            </div>
            {/* eslint-enable react-hooks/refs */}

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
