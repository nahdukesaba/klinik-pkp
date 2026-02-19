/**
 * Hook: useBeritaList
 * Menyediakan daftar berita terurut untuk halaman Berita.
 */

import { useMemo } from "react";

import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";

export function useBeritaList() {
  const sortedBerita = useMemo(() => {
    return [...beritaSosialisasiList].sort(
      (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
    );
  }, []);

  return {
    items: sortedBerita,
  };
}
