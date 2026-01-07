"use client";

import { useState, useMemo } from "react";

import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";

export interface BeritaItem {
  id: number;
  title: string;
  description: string;
  kabupaten: string;
  image: string;
  images?: string[];
  rawDate: string;
  coordinates: [number, number];
}

export function useSosialisasiPKPBerita() {
  const [beritaYear, setBeritaYear] = useState<string>("all");
  const [beritaMonth, setBeritaMonth] = useState<string>("all");
  const [beritaStartDate, setBeritaStartDate] = useState<string>("");
  const [beritaEndDate, setBeritaEndDate] = useState<string>("");
  const [beritaSearch, setBeritaSearch] = useState<string>("");

  const beritaYears = useMemo(() => {
    const years = [...new Set(beritaSosialisasiList.map(b => new Date(b.rawDate).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, []);

  const filteredBerita = useMemo(() => {
    let result = beritaSosialisasiList;

    // Filter by date range if specified
    if (beritaStartDate && beritaEndDate) {
      const startDate = new Date(beritaStartDate);
      const endDate = new Date(beritaEndDate);
      result = result.filter((b) => {
        const eventDate = new Date(b.rawDate);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } else {
      // Filter by year
      if (beritaYear !== "all") {
        result = result.filter((b) => {
          const year = new Date(b.rawDate).getFullYear().toString();
          return year === beritaYear;
        });
      }

      // Filter by month
      if (beritaMonth !== "all") {
        result = result.filter((b) => {
          const month = (new Date(b.rawDate).getMonth() + 1).toString().padStart(2, '0');
          return month === beritaMonth;
        });
      }
    }

    // Filter by search query
    if (beritaSearch.trim()) {
      const query = beritaSearch.toLowerCase().trim();
      result = result.filter((b) =>
        b.title.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.kabupaten.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  }, [beritaYear, beritaMonth, beritaStartDate, beritaEndDate, beritaSearch]);

  const resetFilters = () => {
    setBeritaYear("all");
    setBeritaMonth("all");
    setBeritaStartDate("");
    setBeritaEndDate("");
    setBeritaSearch("");
  };

  const hasActiveFilters =
    beritaYear !== "all" ||
    beritaMonth !== "all" ||
    beritaStartDate !== "" ||
    beritaEndDate !== "" ||
    beritaSearch.trim() !== "";

  return {
    beritaYear,
    setBeritaYear,
    beritaMonth,
    setBeritaMonth,
    beritaStartDate,
    setBeritaStartDate,
    beritaEndDate,
    setBeritaEndDate,
    beritaSearch,
    setBeritaSearch,
    beritaYears,
    filteredBerita,
    resetFilters,
    hasActiveFilters,
  };
}
