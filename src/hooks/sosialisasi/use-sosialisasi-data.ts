/**
 * Hook: useSosialisasiData
 *
 * Single Source of Truth untuk semua data sosialisasi PKP.
 * 1x load data mentah → hitung status otomatis → bagi ke 3 variabel.
 *
 * Pattern: Immutable Source + Derived State
 * - Variabel A = data mentah dengan status ter-compute (tidak pernah berubah)
 * - Variabel B = masing-masing hook (map/jadwal/berita) yang bisa difilter
 *
 * Relasi antar data:
 * - locations: semua lokasi sosialisasi (ditampilkan di peta)
 * - upcomingLocations: lokasi yang belum lewat tanggal hari ini (jadwal mendatang)
 * - completedLocations: lokasi yang sudah lewat (bisa jadi berita oleh admin)
 * - berita: berita yang sudah diisi admin (deskripsi + foto max 3)
 *
 * Status otomatis berdasarkan tanggal:
 * - Jika tanggal kegiatan < hari ini → status = "selesai"
 * - Jika tanggal kegiatan >= hari ini → status = "mendatang"
 */

"use client";

import { useMemo } from "react";

import {
  sosialisasiLocations,
  beritaSosialisasiList,
  kabupatenList,
  type RawSosialisasiLocation,
  type SosialisasiLocation,
  type BeritaSosialisasi,
} from "@/data/sosialisasi-klinik";

export interface SosialisasiRawData {
  /** Semua lokasi dengan status ter-compute berdasarkan tanggal */
  locations: SosialisasiLocation[];
  /** Lokasi yang belum lewat tanggal (untuk section jadwal) */
  upcomingLocations: SosialisasiLocation[];
  /** Lokasi yang sudah lewat tanggal (calon berita, menunggu admin isi) */
  completedLocations: SosialisasiLocation[];
  /** Berita yang sudah diisi admin (deskripsi + foto) */
  berita: BeritaSosialisasi[];
  /** Daftar kabupaten untuk filter dropdown */
  kabupatenList: string[];
}

/**
 * Hitung status otomatis berdasarkan tanggal hari ini.
 *
 * Contoh (hari ini 18 Feb 2026):
 * - date = "2026-02-17" → "selesai"   (kemarin, sudah lewat)
 * - date = "2026-02-18" → "mendatang" (hari ini, belum lewat)
 * - date = "2026-02-19" → "mendatang" (besok, belum lewat)
 *
 * Nanti jika pakai API, status dihitung di backend.
 * Function ini hanya untuk static data / fallback.
 */
function computeStatus(date: string): "selesai" | "mendatang" {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset ke awal hari

  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate < today ? "selesai" : "mendatang";
}

/**
 * Hook untuk menyediakan data mentah sosialisasi.
 *
 * Saat ini membaca dari static data file.
 * Untuk production, ganti isi hook ini dengan API call / React Query
 * tanpa mengubah hook consumer (map, jadwal, berita).
 *
 * @example
 * // Migrasi ke API cukup ubah di sini:
 * // const { data } = useQuery({ queryKey: ["sosialisasi"], queryFn: fetchSosialisasi });
 * // return { locations: data.locations, berita: data.berita, ... };
 */
export function useSosialisasiData(): SosialisasiRawData {
  // Variabel A: data mentah + status otomatis berdasarkan tanggal
  const locations: SosialisasiLocation[] = useMemo(
    () =>
      sosialisasiLocations.map((loc: RawSosialisasiLocation) => ({
        ...loc,
        status: computeStatus(loc.date),
      })),
    []
  );

  const berita = beritaSosialisasiList;

  // Derived: pisahkan berdasarkan status yang sudah dihitung
  const upcomingLocations = useMemo(
    () => locations.filter((loc) => loc.status === "mendatang"),
    [locations]
  );

  const completedLocations = useMemo(
    () => locations.filter((loc) => loc.status === "selesai"),
    [locations]
  );

  return {
    locations,
    upcomingLocations,
    completedLocations,
    berita,
    kabupatenList,
  };
}
