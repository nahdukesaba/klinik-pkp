/**
 * KawasanKumuhContent Component
 * 
 * DESKRIPSI: Halaman utama Profil Kawasan Kumuh
 * Menggabungkan hook (logic) dan components (UI)
 * 
 * STRUKTUR:
 * - Logic: useKawasanKumuh hook untuk state management & filtering
 * - UI: KawasanKumuhComponents untuk render komponen
 * - Map: KawasanKumuhMap untuk visualisasi peta
 * 
 * SAAT PAKAI API BACKEND:
 * - Modifikasi useKawasanKumuh untuk fetch dari API
 * - Contoh: const { data } = useSWR('/api/kawasan-kumuh')
 */

"use client";

import { useState, useRef, useCallback, useMemo } from "react";

import { KawasanKumuhMap, type KawasanKumuhMapRef } from "@/components/kawasan-kumuh";
import {
  KawasanKumuhHeader,
  KawasanKumuhSidebar,
  KawasanKumuhLegend,
  MobileSidebarToggle,
} from "@/components/kawasan-kumuh/KawasanKumuhComponents";
import { Navbar } from "@/components/layout";
import type { KawasanKumuh } from "@/data/peta-kawasan-kumuh";
import { useKawasanKumuh } from "@/hooks/use-kawasan-kumuh";

export default function KawasanKumuhContent() {
  // ============================================
  // Local State
  // ============================================
  const [selectedKawasan, setSelectedKawasan] = useState<KawasanKumuh | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const mapRef = useRef<KawasanKumuhMapRef>(null);

  // ============================================
  // Hook: Filter & Data Management
  // ============================================
  const {
    filteredKawasan,
    kabupatenList,
    kecamatanList,
    kelurahanList,
    searchQuery,
    regionFilter,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter,
    setKecamatanFilter,
    setKelurahanFilter,
    setStatusFilter,
  } = useKawasanKumuh();

  // ============================================
  // Computed Values
  // ============================================
  const totalKK = useMemo(
    () => filteredKawasan.reduce((acc, k) => acc + k.kk, 0),
    [filteredKawasan]
  );

  // ============================================
  // Event Handlers
  // ============================================
  const handleKawasanClick = useCallback((kawasan: KawasanKumuh) => {
    setSelectedKawasan(kawasan);
    setSidebarOpen(false); // Close sidebar on mobile when item clicked
    mapRef.current?.flyTo(kawasan.lat, kawasan.lng, 15);
  }, []);

  const handleResetFilters = useCallback(() => {
    setKabupatenFilter("all");
    setKecamatanFilter("all");
    setKelurahanFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  }, [setKabupatenFilter, setKecamatanFilter, setKelurahanFilter, setStatusFilter, setSearchQuery]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // ============================================
  // Render
  // ============================================
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 lg:pt-20 overflow-hidden">
        {/* Header Section */}
        <KawasanKumuhHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          regionFilter={regionFilter}
          onRegionChange={setRegionFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          totalKawasan={filteredKawasan.length}
          totalKK={totalKK}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Overlay when sidebar open */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <KawasanKumuhSidebar
            isOpen={sidebarOpen}
            kabupatenFilter={kabupatenFilter}
            kecamatanFilter={kecamatanFilter}
            kelurahanFilter={kelurahanFilter}
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

          {/* Map Section */}
          <div className="flex-1 relative overflow-hidden">
            <div className="w-full h-full">
              <KawasanKumuhMap
                ref={mapRef}
                filteredKawasan={filteredKawasan}
                regionFilter={regionFilter}
                onKawasanSelect={setSelectedKawasan}
              />
            </div>

            {/* Legend - Always visible on all devices */}
            <KawasanKumuhLegend />

            {/* Mobile Toggle */}
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
