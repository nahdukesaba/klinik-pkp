/**
 * SebaranRusunPage
 * Container UI untuk halaman Sebaran Rusun.
 * Data diambil dari API — menampilkan loading/error state.
 */

"use client";

import { Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout";
import {
  RusunHeader,
  RusunMapContainer,
  RusunSidebar,
} from "@/components/sebaran-rusun/RusunComponents";
import { ApiErrorState } from "@/components/shared";
import { MapSkeleton } from "@/components/ui/skeleton";
import { useSebaranRusun } from "@/hooks/sebaran-rusun/use-sebaran-rusun";

export default function SebaranRusunPage() {
  const {
    handleBack,
    filters,
    selectedRusun,
    sidebarOpen,
    filterOptions,
    stats,
    setSearchQuery,
    setKabupatenFilter,
    setKecamatanFilter,
    setKelurahanFilter,
    setSidebarOpen,
    resetFilters,
    handleRusunClick,
    mapRef,
    mapLazy,
    pagination,
    isLoading,
    isError,
    error,
  } = useSebaranRusun();
  const mapLazyRef = mapLazy.ref;
  const isMapMounted = mapLazy.isMounted;

  // Status data (loading / error / ready)
  const dataReady = !isLoading && !isError;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20">
        {/* Header — tampilkan hanya jika data siap */}
        {dataReady && (
          <RusunHeader
            searchQuery={filters.searchQuery}
            totalRusun={stats.totalRusun}
            totalUnits={stats.totalUnits}
            onBack={handleBack}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        <div className="flex-1 flex relative overflow-hidden">
          {/* Sidebar — tampilkan hanya jika data siap */}
          {dataReady && (
            <>
              {sidebarOpen && (
                <div
                  data-ui-route-overlay="rusun-sidebar"
                  className="lg:hidden fixed inset-0 bg-black/50 z-30"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              <RusunSidebar
                isOpen={sidebarOpen}
                paginatedRusun={pagination.paginatedItems}
                totalItems={pagination.totalItems}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
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
                onPageChange={pagination.setCurrentPage}
              />
            </>
          )}

          {/* Area Peta — SELALU dirender agar ref lazy mount tetap di DOM */}
          {/* eslint-disable react-hooks/refs -- useLazyMount returns a callback ref plus a mounted flag */}
          <div ref={mapLazyRef} className="flex-1 relative">
            {/* Loading overlay — saat menunggu data API */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background">
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground text-sm">Memuat data rusun...</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {isError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background">
                <ApiErrorState
                  error={error}
                  onRetry={() => window.location.reload()}
                  fullPage={false}
                />
              </div>
            )}

            {/*
             * Peta / Skeleton — tiga state:
             * 1. isLoading → overlay di atas menutupi area ini (tidak render skeleton)
             * 2. Data siap tapi map belum dimount → MapSkeleton
             * 3. Data siap dan map dimount → RusunMapContainer
             */}
            {!isLoading && isMapMounted && dataReady ? (
              <RusunMapContainer mapRef={mapRef} />
            ) : !isLoading ? (
              <MapSkeleton className="w-full h-full" />
            ) : null}
          </div>
          {/* eslint-enable react-hooks/refs */}
        </div>
      </div>
    </div>
  );
}
