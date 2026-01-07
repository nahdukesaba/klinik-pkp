"use client";

import { useState, useMemo, useEffect } from "react";

import { sosialisasiLocations, kabupatenList } from "@/data/sosialisasi-klinik";

export interface JadwalItem {
  id: number;
  name: string;
  kabupaten: string;
  kecamatan?: string;
  alamat: string;
  coordinates: [number, number];
  date: string;
  time: string;
  status: "selesai" | "mendatang";
  peserta?: number;
  images: string[];
}

export function useSosialisasiPKPJadwal() {
  const [jadwalYear, setJadwalYear] = useState<string>("all");
  const [jadwalMonth, setJadwalMonth] = useState<string>("all");
  const [jadwalStartDate, setJadwalStartDate] = useState<string>("");
  const [jadwalEndDate, setJadwalEndDate] = useState<string>("");
  const [jadwalSearch, setJadwalSearch] = useState<string>("");
  const [jadwalKabupatenFilter, setJadwalKabupatenFilter] = useState<string>("all");
  const [jadwalPage, setJadwalPage] = useState<number>(1);
  const JADWAL_PER_PAGE = 9;

  const jadwalKegiatan = useMemo(() => 
    sosialisasiLocations.filter((e) => e.status === "mendatang"),
    []
  );

  const jadwalYears = useMemo(() => {
    const years = [...new Set(jadwalKegiatan.map(j => new Date(j.date).getFullYear()))];
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
          const month = (new Date(j.date).getMonth() + 1).toString().padStart(2, '0');
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
      result = result.filter((j) =>
        j.name.toLowerCase().includes(query) ||
        j.alamat.toLowerCase().includes(query) ||
        (j.kecamatan && j.kecamatan.toLowerCase().includes(query)) ||
        j.kabupaten.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [jadwalKegiatan, jadwalYear, jadwalMonth, jadwalStartDate, jadwalEndDate, jadwalKabupatenFilter, jadwalSearch]);

  const totalJadwalPages = Math.ceil(filteredJadwal.length / JADWAL_PER_PAGE);
  const paginatedJadwal = useMemo(() => {
    const startIndex = (jadwalPage - 1) * JADWAL_PER_PAGE;
    return filteredJadwal.slice(startIndex, startIndex + JADWAL_PER_PAGE);
  }, [filteredJadwal, jadwalPage]);

  // Reset page when filters change
  useEffect(() => {
    setJadwalPage(1);
  }, [jadwalMonth, jadwalYear, jadwalStartDate, jadwalEndDate, jadwalKabupatenFilter, jadwalSearch]);

  const resetFilters = () => {
    setJadwalYear("all");
    setJadwalMonth("all");
    setJadwalStartDate("");
    setJadwalEndDate("");
    setJadwalSearch("");
    setJadwalKabupatenFilter("all");
  };

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
    jadwalPage,
    setJadwalPage,
    jadwalYears,
    filteredJadwal,
    paginatedJadwal,
    totalJadwalPages,
    JADWAL_PER_PAGE,
    kabupatenList,
    resetFilters,
    hasActiveFilters,
  };
}
