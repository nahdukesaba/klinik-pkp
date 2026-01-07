/**
 * useKawasanKumuh Hook
 * 
 * Hook untuk mengelola data dan state untuk halaman Kawasan Kumuh.
 * Saat ini menggunakan data mock, nanti bisa diganti dengan API calls.
 */

import { useState, useMemo } from "react";

import {
  kawasanKumuhData,
  type KawasanKumuh,
} from "@/data/peta-kawasan-kumuh";

export interface KawasanKumuhFilters {
  searchQuery: string;
  regionFilter: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
  statusFilter: string;
}

export function useKawasanKumuh() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("sumatera-utara");
  const [kabupatenFilter, setKabupatenFilter] = useState("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("all");
  const [kelurahanFilter, setKelurahanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique kabupaten list
  const kabupatenList = useMemo(() => {
    const uniqueKabupaten = Array.from(
      new Set(kawasanKumuhData.map((k: KawasanKumuh) => k.kabupaten))
    );
    return uniqueKabupaten.sort();
  }, []);

  // Get kecamatan list based on selected kabupaten
  const kecamatanList = useMemo(() => {
    const filtered =
      kabupatenFilter === "all"
        ? kawasanKumuhData
        : kawasanKumuhData.filter((k) => k.kabupaten === kabupatenFilter);
    return [...new Set(filtered.map((k) => k.kecamatan))].sort();
  }, [kabupatenFilter]);

  // Get kelurahan list based on selected kabupaten and kecamatan
  const kelurahanList = useMemo(() => {
    let filtered = kawasanKumuhData;
    if (kabupatenFilter !== "all") {
      filtered = filtered.filter((k) => k.kabupaten === kabupatenFilter);
    }
    if (kecamatanFilter !== "all") {
      filtered = filtered.filter((k) => k.kecamatan === kecamatanFilter);
    }
    return [...new Set(filtered.map((k) => k.kelurahan))].sort();
  }, [kabupatenFilter, kecamatanFilter]);

  // Filter kawasan based on all filters
  const filteredKawasan = useMemo(() => {
    const result = kawasanKumuhData.filter((kawasan: KawasanKumuh) => {
      // Region filter: when 'sumatera-utara' is selected, show ALL locations
      // When 'medan' is selected, only show Medan locations
      const matchesRegion =
        regionFilter === "sumatera-utara" || // Show all for sumatera-utara
        (regionFilter === "medan" && kawasan.kabupaten === "Medan");

      const matchesSearch =
        !searchQuery ||
        kawasan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kawasan.kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kawasan.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kawasan.kabupaten.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKabupaten =
        kabupatenFilter === "all" || kawasan.kabupaten === kabupatenFilter;

      const matchesKecamatan =
        kecamatanFilter === "all" || kawasan.kecamatan === kecamatanFilter;

      const matchesKelurahan =
        kelurahanFilter === "all" || kawasan.kelurahan === kelurahanFilter;

      const matchesStatus =
        statusFilter === "all" || kawasan.status === statusFilter;

      return matchesRegion && matchesSearch && matchesKabupaten && matchesKecamatan && matchesKelurahan && matchesStatus;
    });

    return result;
  }, [searchQuery, regionFilter, kabupatenFilter, kecamatanFilter, kelurahanFilter, statusFilter]);

  // Handlers that reset dependent filters
  const handleKabupatenChange = (value: string) => {
    setKabupatenFilter(value);
    setKecamatanFilter("all");
    setKelurahanFilter("all");
  };

  const handleKecamatanChange = (value: string) => {
    setKecamatanFilter(value);
    setKelurahanFilter("all");
  };

  return {
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
    setKabupatenFilter: handleKabupatenChange,
    setKecamatanFilter: handleKecamatanChange,
    setKelurahanFilter,
    setStatusFilter,
  };
}

