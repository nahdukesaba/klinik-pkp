"use client";

import { useState, useMemo, useCallback } from "react";

import { CURRENT_YEAR } from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
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
  // Default: tahun sekarang
  const [jadwalYear, setJadwalYear] = useState<string>(CURRENT_YEAR);
  const [jadwalMonth, setJadwalMonth] = useState<string>("all");
  const [jadwalStartDate, setJadwalStartDate] = useState<string>("");
  const [jadwalEndDate, setJadwalEndDate] = useState<string>("");
  const [jadwalSearch, setJadwalSearch] = useState<string>("");
  const [jadwalKabupatenFilter, setJadwalKabupatenFilter] = useState<string>("all");

  // Data sudah difilter "mendatang" oleh useSosialisasiData
  const jadwalKegiatan = upcomingLocations;

  const jadwalYears = useMemo(() => {
    const years = [
      ...new Set(jadwalKegiatan.map((j) => Number.parseInt(j.date.slice(0, 4), 10))),
    ].filter(Number.isFinite);
    return years.sort((a, b) => b - a);
  }, [jadwalKegiatan]);

  const filteredJadwal = useMemo(() => {
    let result = jadwalKegiatan;

    // Filter by date range if specified
    if (jadwalStartDate && jadwalEndDate) {
      result = result.filter((j) => {
        return j.date >= jadwalStartDate && j.date <= jadwalEndDate;
      });
    } else {
      // Filter by year
      if (jadwalYear !== "all") {
        result = result.filter((j) => j.date.slice(0, 4) === jadwalYear);
      }

      // Filter by month
      if (jadwalMonth !== "all") {
        result = result.filter((j) => j.date.slice(5, 7) === jadwalMonth);
      }
    }

    // Filter by kabupaten
    if (jadwalKabupatenFilter !== "all") {
      result = result.filter((j) => j.kabupaten === jadwalKabupatenFilter);
    }

    // Filter by search query
    if (jadwalSearch.trim()) {
      const query = sanitizeInput(jadwalSearch).toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(query) ||
          j.alamat.toLowerCase().includes(query) ||
          (j.kecamatan && j.kecamatan.toLowerCase().includes(query)) ||
          j.kabupaten.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
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
    setJadwalYear(CURRENT_YEAR);
    setJadwalMonth("all");
    setJadwalStartDate("");
    setJadwalEndDate("");
    setJadwalSearch("");
    setJadwalKabupatenFilter("all");
  }, []);

  const hasActiveFilters =
    jadwalYear !== CURRENT_YEAR ||
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
