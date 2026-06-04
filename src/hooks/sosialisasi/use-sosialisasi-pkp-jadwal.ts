"use client";

import { useCallback, useMemo, useState } from "react";

import { getSortedUniqueYears } from "@/lib/date";
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
  const [jadwalYear, setJadwalYear] = useState<string>("");
  const [jadwalMonth, setJadwalMonth] = useState<string>("all");
  const [jadwalStartDate, setJadwalStartDate] = useState<string>("");
  const [jadwalEndDate, setJadwalEndDate] = useState<string>("");
  const [jadwalSearch, setJadwalSearch] = useState<string>("");
  const [jadwalKabupatenFilter, setJadwalKabupatenFilter] = useState<string>("all");

  const jadwalKegiatan = upcomingLocations;

  const jadwalYears = useMemo(() => {
    return getSortedUniqueYears(
      jadwalKegiatan.map((jadwal) => jadwal.date.slice(0, 4))
    );
  }, [jadwalKegiatan]);
  const selectedJadwalYear =
    jadwalYear || (jadwalYears[0] == null ? "" : String(jadwalYears[0]));

  const filteredJadwal = useMemo(() => {
    let result = jadwalKegiatan;

    // Filter by date range if specified
    if (jadwalStartDate && jadwalEndDate) {
      result = result.filter((j) => {
        return j.date >= jadwalStartDate && j.date <= jadwalEndDate;
      });
    } else {
      // Filter by year
      if (selectedJadwalYear && selectedJadwalYear !== "all") {
        result = result.filter((j) => j.date.slice(0, 4) === selectedJadwalYear);
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
    selectedJadwalYear,
    jadwalMonth,
    jadwalStartDate,
    jadwalEndDate,
    jadwalKabupatenFilter,
    jadwalSearch,
  ]);

  // Wrap resetFilters in useCallback for stable reference.
  // Ref: vercel-react-best-practices/rerender-functional-setstate
  const resetFilters = useCallback(() => {
    setJadwalYear("");
    setJadwalMonth("all");
    setJadwalStartDate("");
    setJadwalEndDate("");
    setJadwalSearch("");
    setJadwalKabupatenFilter("all");
  }, []);

  const hasActiveFilters =
    selectedJadwalYear !== (jadwalYears[0] == null ? "" : String(jadwalYears[0])) ||
    jadwalMonth !== "all" ||
    jadwalStartDate !== "" ||
    jadwalEndDate !== "" ||
    jadwalSearch !== "" ||
    jadwalKabupatenFilter !== "all";

  return {
    jadwalYear: selectedJadwalYear,
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
