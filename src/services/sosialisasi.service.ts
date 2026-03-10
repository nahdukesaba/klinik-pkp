/**
 * Sosialisasi PKP API Service
 *
 * Modul ini menangani semua komunikasi dengan backend API untuk data
 * Sosialisasi Klinik PKP. Satu endpoint API menghasilkan dua tipe data:
 * - SosialisasiLocation: untuk peta dan jadwal
 * - BeritaSosialisasi: untuk section berita (hanya item yang sudah selesai + punya deskripsi)
 *
 * Status ("selesai" / "mendatang") dihitung otomatis berdasarkan
 * scheduled_at_start vs tanggal hari ini.
 *
 * @module services/sosialisasi
 */

import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CoordinateApi,
  DistrictApi,
  RegionApi,
  VillageApi,
} from "@/services/api-types";
import { extractDistrictName, extractRegionName, extractVillageName } from "@/services/api-types";
import { buildImageUrl } from "@/services/rusun.service";


// ============================================
// Tipe Data API (sesuai response backend Go)
// ============================================

/** Struktur data sosialisasi dari API (snake_case sesuai backend Go) */
export interface SosialisasiApiItem {
  id: string;
  village_id: string;
  district_id: string;
  region_id: string;
  title: string;
  location: string;
  description: string;
  image_urls: string[];
  coordinate: CoordinateApi;
  scheduled_at_start: string; // RFC 3339
  scheduled_at_end: string;   // RFC 3339
  village?: VillageApi;
  district?: DistrictApi;
  region?: RegionApi;
}

// ============================================
// Tipe Data Frontend (camelCase untuk UI)
// ============================================

/**
 * Data lokasi sosialisasi — digunakan untuk peta dan jadwal.
 * Bentuk ini kompatibel dengan RawSosialisasiLocation + status
 * sehingga hook consumer tidak perlu refactor besar.
 */
export interface SosialisasiLocation {
  id: number;
  name: string;
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
  coordinates: [number, number];
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:mm - HH:mm"
  peserta: number;
  alamat: string;
  images: string[];
  status: "selesai" | "mendatang";
}

/**
 * Data berita sosialisasi — digunakan untuk section berita.
 * Hanya item yang sudah selesai (date < hari ini) dan
 * memiliki deskripsi + minimal 1 gambar.
 */
export interface BeritaSosialisasi {
  id: number;
  title: string;
  image: string;
  date: string;       // "DD NamaBulan YYYY" (format tampilan Indonesia)
  rawDate: string;    // "YYYY-MM-DD" (untuk sorting & filter)
  month: string;      // "YYYY-MM" (untuk filter bulan)
  description: string;
  kabupaten: string;
  coordinates: [number, number];
  images?: string[];
}

// ============================================
// Fungsi Utilitas
// ============================================

/**
 * Hitung status otomatis berdasarkan tanggal mulai kegiatan.
 * - Jika scheduled_at_start < hari ini → "selesai"
 * - Jika scheduled_at_start >= hari ini → "mendatang"
 */
function computeStatus(scheduledAtStart: string): "selesai" | "mendatang" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(scheduledAtStart);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate < today ? "selesai" : "mendatang";
}

/**
 * Ekstrak rentang waktu dari dua RFC 3339 timestamp.
 * Contoh: "2026-03-15T09:00:00Z" + "2026-03-15T12:00:00Z" → "09:00 - 12:00"
 */
function extractTimeRange(start: string, end: string): string {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format tanggal ke format Indonesia: "15 Januari 2026"
 */
function formatDateIndonesian(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Ekstrak "YYYY-MM-DD" dari RFC 3339 timestamp.
 */
function extractDateString(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Ekstrak "YYYY-MM" dari date string "YYYY-MM-DD".
 */
function extractMonthString(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * Bangun URL gambar dari path relatif API.
 * Jika path sudah merupakan URL absolut, kembalikan apa adanya.
 */
function buildSosialisasiImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return buildImageUrl(path);
}

// ============================================
// Fungsi Transformasi Data
// ============================================

/**
 * Transformasi data API ke SosialisasiLocation untuk peta dan jadwal.
 */
export function transformToLocation(item: SosialisasiApiItem): SosialisasiLocation {
  const kabupaten = extractRegionName(item.region);
  const kecamatan = extractDistrictName(item.district) || undefined;
  const kelurahan = extractVillageName(item.village) || undefined;

  const dateStr = extractDateString(item.scheduled_at_start);
  const timeRange = extractTimeRange(item.scheduled_at_start, item.scheduled_at_end);

  const images = (item.image_urls ?? []).map(buildSosialisasiImageUrl);

  return {
    id: Number(item.id),
    name: item.title,
    kabupaten,
    kecamatan,
    kelurahan,
    coordinates: [
      item.coordinate?.latitude ?? 0,
      item.coordinate?.longitude ?? 0,
    ],
    date: dateStr,
    time: timeRange,
    peserta: 0, // Tidak tersedia di API, default 0
    alamat: item.location,
    images,
    status: computeStatus(item.scheduled_at_start),
  };
}

/**
 * Transformasi data API ke BeritaSosialisasi untuk section berita.
 * Hanya dipanggil untuk item yang memenuhi syarat (selesai + ada deskripsi).
 */
export function transformToBerita(item: SosialisasiApiItem): BeritaSosialisasi {
  const kabupaten = extractRegionName(item.region);
  const dateStr = extractDateString(item.scheduled_at_start);
  const images = (item.image_urls ?? []).map(buildSosialisasiImageUrl);

  return {
    id: Number(item.id),
    title: item.title,
    image: images[0] ?? "",
    date: formatDateIndonesian(item.scheduled_at_start),
    rawDate: dateStr,
    month: extractMonthString(dateStr),
    description: item.description,
    kabupaten,
    coordinates: [
      item.coordinate?.latitude ?? 0,
      item.coordinate?.longitude ?? 0,
    ],
    images: images.length > 1 ? images : undefined,
  };
}

// ============================================
// Hasil Transformasi
// ============================================

/** Hasil lengkap dari fetchSosialisasiList, siap dikonsumsi oleh hook */
export interface SosialisasiResult {
  /** Semua lokasi dengan status ter-compute */
  locations: SosialisasiLocation[];
  /** Lokasi yang belum lewat tanggal (jadwal mendatang) */
  upcomingLocations: SosialisasiLocation[];
  /** Lokasi yang sudah lewat tanggal */
  completedLocations: SosialisasiLocation[];
  /** Berita yang sudah selesai dan memiliki deskripsi */
  berita: BeritaSosialisasi[];
  /** Daftar kabupaten unik untuk filter dropdown */
  kabupatenList: string[];
}

// ============================================
// Fungsi API (pemanggilan backend)
// ============================================

/**
 * Ambil semua data sosialisasi dari API backend.
 * Data ditransformasi menjadi SosialisasiResult yang berisi
 * locations, upcomingLocations, completedLocations, berita, dan kabupatenList.
 *
 * Endpoint: GET /api/ext/sosialisasi → backend GET /api/v1/sosialisasi
 * @throws Error jika API mengembalikan response tidak valid
 */
export async function fetchSosialisasiList(): Promise<SosialisasiResult> {
  const res = await apiClient.get<ApiResponse<SosialisasiApiItem[]>>("/sosialisasi");

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data sosialisasi dari server");
  }

  const items = res.data;

  // Single-pass: transformasi + klasifikasi sekaligus.
  // Menghindari 3x iterasi terpisah (map + 2x filter).
  // Ref: vercel-react-best-practices/js-combine-iterations
  const locations: SosialisasiLocation[] = [];
  const upcomingLocations: SosialisasiLocation[] = [];
  const completedLocations: SosialisasiLocation[] = [];
  const berita: BeritaSosialisasi[] = [];
  const kabupatenSet = new Set<string>();

  for (const item of items) {
    const location = transformToLocation(item);
    locations.push(location);

    if (location.status === "mendatang") {
      upcomingLocations.push(location);
    } else {
      completedLocations.push(location);
    }

    // Transformasi ke berita jika selesai + punya deskripsi
    if (
      location.status === "selesai" &&
      item.description &&
      item.description.trim() !== ""
    ) {
      berita.push(transformToBerita(item));
    }

    if (location.kabupaten) {
      kabupatenSet.add(location.kabupaten);
    }
  }

  // Bangun daftar kabupaten unik (diawali "Semua Lokasi")
  const kabupatenList = ["Semua Lokasi", ...Array.from(kabupatenSet).sort()];

  return {
    locations,
    upcomingLocations,
    completedLocations,
    berita,
    kabupatenList,
  };
}
