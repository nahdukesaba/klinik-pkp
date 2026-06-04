"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getSortedUniqueYears } from "@/lib/date";
import { sanitizeInput } from "@/lib/security";
import { type BeritaSosialisasi } from "@/services/sosialisasi.service";

const BERITA_BATCH_SIZE = 10;

export function useSosialisasiPKPBerita(rawBerita: BeritaSosialisasi[]) {
  const [beritaYear, setBeritaYear] = useState<string>("");
  const [beritaMonth, setBeritaMonth] = useState<string>("all");
  const [beritaStartDate, setBeritaStartDate] = useState<string>("");
  const [beritaEndDate, setBeritaEndDate] = useState<string>("");
  const [beritaSearch, setBeritaSearch] = useState<string>("");
  const [visibleState, setVisibleState] = useState({
    key: "",
    count: BERITA_BATCH_SIZE,
  });
  const observerRef = useRef<IntersectionObserver | null>(null);

  const beritaYears = useMemo(() => {
    return getSortedUniqueYears(
      rawBerita.map((berita) => berita.rawDate.slice(0, 4))
    );
  }, [rawBerita]);
  const defaultBeritaYear =
    beritaYears[0] == null ? "" : String(beritaYears[0]);
  const selectedBeritaYear = beritaYear || defaultBeritaYear;

  const filteredBerita = useMemo(() => {
    let result: BeritaSosialisasi[] = rawBerita;

    if (beritaStartDate && beritaEndDate) {
      result = result.filter(
        (berita) =>
          berita.rawDate >= beritaStartDate && berita.rawDate <= beritaEndDate
      );
    } else {
      if (selectedBeritaYear && selectedBeritaYear !== "all") {
        result = result.filter(
          (berita) => berita.rawDate.slice(0, 4) === selectedBeritaYear
        );
      }

      if (beritaMonth !== "all") {
        result = result.filter(
          (berita) => berita.rawDate.slice(5, 7) === beritaMonth
        );
      }
    }

    if (beritaSearch.trim()) {
      const query = sanitizeInput(beritaSearch).toLowerCase().trim();
      result = result.filter(
        (berita) =>
          berita.title.toLowerCase().includes(query) ||
          berita.description.toLowerCase().includes(query) ||
          berita.kabupaten.toLowerCase().includes(query)
      );
    }

    return [...result].sort((left, right) =>
      right.rawDate.localeCompare(left.rawDate)
    );
  }, [
    rawBerita,
    selectedBeritaYear,
    beritaMonth,
    beritaStartDate,
    beritaEndDate,
    beritaSearch,
  ]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const filteredBeritaKey = useMemo(
    () => filteredBerita.map((berita) => berita.id).join("|"),
    [filteredBerita]
  );
  const visibleCount =
    visibleState.key === filteredBeritaKey
      ? visibleState.count
      : BERITA_BATCH_SIZE;
  const visibleBerita = useMemo(
    () => filteredBerita.slice(0, visibleCount),
    [filteredBerita, visibleCount]
  );
  const hasMoreBerita = visibleCount < filteredBerita.length;

  const loadMoreBerita = useCallback(() => {
    setVisibleState((currentState) => {
      const currentCount =
        currentState.key === filteredBeritaKey
          ? currentState.count
          : BERITA_BATCH_SIZE;

      return {
        key: filteredBeritaKey,
        count: Math.min(currentCount + BERITA_BATCH_SIZE, filteredBerita.length),
      };
    });
  }, [filteredBerita.length, filteredBeritaKey]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();

      if (!node || !hasMoreBerita) {
        return;
      }

      if (typeof IntersectionObserver === "undefined") {
        loadMoreBerita();
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            loadMoreBerita();
          }
        },
        { rootMargin: "400px 0px" }
      );
      observerRef.current.observe(node);
    },
    [hasMoreBerita, loadMoreBerita]
  );

  const resetFilters = useCallback(() => {
    setBeritaYear("");
    setBeritaMonth("all");
    setBeritaStartDate("");
    setBeritaEndDate("");
    setBeritaSearch("");
  }, []);

  const hasActiveFilters =
    selectedBeritaYear !== defaultBeritaYear ||
    beritaMonth !== "all" ||
    beritaStartDate !== "" ||
    beritaEndDate !== "" ||
    beritaSearch.trim() !== "";

  return {
    beritaYear: selectedBeritaYear,
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
    visibleBerita,
    hasMoreBerita,
    loadMoreRef,
    resetFilters,
    hasActiveFilters,
  };
}
