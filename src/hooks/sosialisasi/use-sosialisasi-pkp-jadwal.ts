"use client";

import { useState, useMemo, useCallback } from "react";

import { type SosialisasiLocation } from "@/services/sosialisasi.service";

/**
 * Hook untuk mengelola filtering & pagination jadwal kegiatan.
 *
 * Menerima data mentah dari useSosialisasiData (Variabel A)
 * dan menghasilkan data terfilter (Variabel B).
 *
 * @param upcomingLocations - Data jadwal mendatang dari useSosialisasiData
 * @param kabupatenOptions - Daftar kabupaten untuk filter
 */
export function useSosialisasiPKPJadwal(
  upcomingLocations: SosialisasiLocation[],
  kabupatenOptions: string[]
) {
  // Default: semua tahun agar jadwal langsung terlihat saat halaman dimuat
  const [jadwalYear, setJadwalYear] = useState<string>("all");
  const [jadwalMonth, setJadwalMonth] = useState<string>("all");
  const [jadwalStartDate, setJadwalStartDate] = useState<string>("");
  const [jadwalEndDate, setJadwalEndDate] = useState<string>("");
  const [jadwalSearch, setJadwalSearch] = useState<string>("");
  const [jadwalKabupatenFilter, setJadwalKabupatenFilter] = useState<string>("all");

  // Data sudah difilter "mendatang" oleh useSosialisasiData
  const jadwalKegiatan = upcomingLocations;

  const jadwalYears = useMemo(() => {
    const years = [...new Set(jadwalKegiatan.map((j) => new Date(j.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [jadwalKegiatan]);

  const filteredJadwal = useMemo(() => {
    let result = jadwalKegiatan;

    // Filter by date range if specified
    if (jadwalStartDate && jadwalEndDate) {
      const startDate = new Date(jadwalStartDate);
      const endDate = new Date(jadwalEndDate);
      result = result.filter((j) => {
        const eventDate = new Date(j.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } else {
      // Filter by year
      if (jadwalYear !== "all") {
        result = result.filter((j) => {
          const year = new Date(j.date).getFullYear().toString();
          return year === jadwalYear;
        });
      }

      // Filter by month
      if (jadwalMonth !== "all") {
        result = result.filter((j) => {
          const month = (new Date(j.date).getMonth() + 1).toString().padStart(2, "0");
          return month === jadwalMonth;
        });
      }
    }

    // Filter by kabupaten
    if (jadwalKabupatenFilter !== "all") {
      result = result.filter((j) => j.kabupaten === jadwalKabupatenFilter);
    }

    // Filter by search query
    if (jadwalSearch.trim()) {
      const query = jadwalSearch.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(query) ||
          j.alamat.toLowerCase().includes(query) ||
          (j.kecamatan && j.kecamatan.toLowerCase().includes(query)) ||
          j.kabupaten.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [
    jadwalKegiatan,
    jadwalYear,
    jadwalMonth,
    jadwalStartDate,
    jadwalEndDate,
    jadwalKabupatenFilter,
    jadwalSearch,
  ]);

  // Wrap resetFilters in useCallback for stable reference.
  // Ref: vercel-react-best-practices/rerender-functional-setstate
  const resetFilters = useCallback(() => {
    setJadwalYear("all");
    setJadwalMonth("all");
    setJadwalStartDate("");
    setJadwalEndDate("");
    setJadwalSearch("");
    setJadwalKabupatenFilter("all");
  }, []);

  const hasActiveFilters =
    jadwalYear !== "all" ||
    jadwalMonth !== "all" ||
    jadwalStartDate !== "" ||
    jadwalEndDate !== "" ||
    jadwalSearch !== "" ||
    jadwalKabupatenFilter !== "all";

  return {
    jadwalYear,
    setJadwalYear,
    jadwalMonth,
    setJadwalMonth,
    jadwalStartDate,
    setJadwalStartDate,
    jadwalEndDate,
    setJadwalEndDate,
    jadwalSearch,
    setJadwalSearch,
    jadwalKabupatenFilter,
    setJadwalKabupatenFilter,
    jadwalYears,
    filteredJadwal,
    kabupatenList: kabupatenOptions,
    resetFilters,
    hasActiveFilters,
  };
}
