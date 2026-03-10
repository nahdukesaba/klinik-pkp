/**
 * Bank Desain API Service
 *
 * Modul ini menangani semua komunikasi dengan backend API untuk data Bank Desain.
 * Mengikuti pola yang sama dengan rusun.service.ts:
 * - Tipe API (snake_case) → Tipe Frontend (camelCase)
 * - Transform function untuk konversi data
 * - Fetch function untuk pemanggilan API
 *
 * @module services/bank-desain
 */

import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/services/api-types";
import { buildImageUrl } from "@/services/rusun.service";

// ============================================
// Tipe Data API (sesuai response backend Go)
// ============================================

/** Struktur data bank desain dari API (snake_case sesuai backend Go) */
export interface BankDesainApiItem {
  id: string;
  name: string;
  type: "Tipe 36" | "Tipe 45" | "Tipe 54" | "Rusun";
  bedroom_count: number;
  bathroom_count: number;
  total_area: number;
  has_garage: boolean;
  image_urls: string[] | null;
  file_urls: string[] | null;
}

// ============================================
// Tipe Data Frontend (camelCase untuk UI)
// ============================================

/** Data bank desain yang sudah ditransformasi untuk UI */
export interface BankDesainData {
  id: number;
  /** Kode desain (dari ID API) */
  code: string;
  title: string;
  /** Tipe rumah untuk filter: "T36", "T45", "T54", "Rusun" */
  type: string;
  /** Filter teras/garasi: "dengan-teras" | "tanpa-teras" */
  terasFeature: string;
  /** URL thumbnail (gambar pertama) */
  thumbnail: string;
  bedrooms: number;
  bathrooms: number;
  /** Luas bangunan dalam m² */
  area: number;
  /** Gambar-gambar untuk preview */
  previewImages: string[];
  /** URL file RAB/PDF pertama */
  rabPdfUrl: string;
  /** URL file desain untuk diunduh */
  designFileUrl?: string;
  /** Deskripsi singkat desain */
  description?: string;
}

/** Kategori filter individual */
export interface FilterCategory {
  id: string;
  label: string;
}

/** Semua kategori filter untuk UI */
export interface FilterCategories {
  type: FilterCategory[];
  bedroom: FilterCategory[];
  teras: FilterCategory[];
}

// ============================================
// Mapping Tipe API → Tipe Filter Frontend
// ============================================

/** Mapping tipe rumah dari API ke kode filter frontend */
const TYPE_MAP: Record<string, string> = {
  "Tipe 36": "T36",
  "Tipe 45": "T45",
  "Tipe 54": "T54",
  "Rusun": "Rusun",
};

/** Label tipe rumah untuk tampilan filter */
const TYPE_LABELS: Record<string, string> = {
  "T36": "Tipe 36 (36 m²)",
  "T45": "Tipe 45 (45 m²)",
  "T54": "Tipe 54 (54 m²)",
  "Rusun": "Rusun",
};

// ============================================
// Fungsi Transformasi Data
// ============================================

/**
 * Transformasi data API (snake_case) ke format frontend (camelCase).
 * Memetakan field API ke struktur yang dibutuhkan komponen UI.
 */
export function transformBankDesainItem(item: BankDesainApiItem): BankDesainData {
  const imageUrls = item.image_urls?.map(buildImageUrl) ?? [];
  const fileUrls = item.file_urls?.map(buildImageUrl) ?? [];

  return {
    id: parseInt(item.id, 10) || 0,
    code: item.id.padStart(3, "0"),
    title: item.name,
    type: TYPE_MAP[item.type] ?? item.type,
    terasFeature: item.has_garage ? "dengan-teras" : "tanpa-teras",
    thumbnail: imageUrls[0] ?? "",
    bedrooms: item.bedroom_count,
    bathrooms: item.bathroom_count,
    area: item.total_area,
    previewImages: imageUrls,
    rabPdfUrl: fileUrls[0] ?? "",
    designFileUrl: fileUrls[0],
    description: "",
  };
}

/**
 * Bangun kategori filter dinamis dari data API.
 * Membuat daftar filter berdasarkan tipe, jumlah kamar, dan fitur teras
 * yang tersedia dalam data.
 */
export function deriveFilterCategories(items: BankDesainData[]): FilterCategories {
  // Kumpulkan tipe unik
  const uniqueTypes = [...new Set(items.map((d) => d.type))].sort();
  const typeCategories: FilterCategory[] = [
    { id: "all", label: "Semua Tipe" },
    ...uniqueTypes.map((t) => ({
      id: t,
      label: TYPE_LABELS[t] ?? t,
    })),
  ];

  // Kumpulkan jumlah kamar unik
  const uniqueBedrooms = [...new Set(items.map((d) => d.bedrooms))].sort((a, b) => a - b);
  const bedroomCategories: FilterCategory[] = [
    { id: "all", label: "Semua Kamar" },
    ...uniqueBedrooms.map((b) => ({
      id: b.toString(),
      label: `${b} Kamar Tidur`,
    })),
  ];

  // Kategori teras (selalu sama)
  const terasCategories: FilterCategory[] = [
    { id: "all", label: "Semua" },
    { id: "dengan-teras", label: "Dengan Teras" },
    { id: "tanpa-teras", label: "Tanpa Teras" },
  ];

  return {
    type: typeCategories,
    bedroom: bedroomCategories,
    teras: terasCategories,
  };
}

// ============================================
// Fungsi API (pemanggilan backend)
// ============================================

/**
 * Ambil semua data bank desain dari API backend.
 * Data di-cache oleh React Query di hook pemanggil.
 *
 * Endpoint: GET /api/ext/bank-desain → backend GET /api/v1/bank-desain
 * @throws Error jika API mengembalikan response tidak valid
 */
export async function fetchBankDesainList(): Promise<BankDesainData[]> {
  const res = await apiClient.get<ApiResponse<BankDesainApiItem[]>>("/bank-desain");

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data bank desain dari server");
  }

  return res.data.map(transformBankDesainItem);
}
