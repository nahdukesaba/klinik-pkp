/**
 * Service API untuk Sosialisasi Klinik PKP.
 * Satu endpoint menghasilkan dua tipe: SosialisasiLocation (peta/jadwal) + BeritaSosialisasi (berita).
 * Status dihitung otomatis: scheduled_at_start < hari ini → "selesai", else "mendatang".
 */

import { apiClient } from "@/lib/api-client";
import { formatDateId } from "@/lib/date";
import { buildImageUrl } from "@/services/rusun.service";
import type {
  ApiResponse,
  CoordinateApi,
  DistrictApi,
  RegionApi,
  VillageApi,
} from "@/types/api";
import { extractDistrictName, extractRegionName, extractVillageName } from "@/types/api";

// --- Tipe API ---

/** Struktur data sosialisasi dari API (snake_case) */
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

// --- Tipe Frontend ---

/** Data lokasi sosialisasi untuk peta dan jadwal */
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

/** Data berita sosialisasi (hanya item selesai + punya deskripsi + gambar) */
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

// --- Utilitas ---

/** Status otomatis: scheduled_at_start < hari ini → "selesai", else "mendatang" */
function computeStatus(scheduledAtStart: string): "selesai" | "mendatang" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(scheduledAtStart);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate < today ? "selesai" : "mendatang";
}

/** Ekstrak rentang waktu: "09:00 - 12:00" dari dua timestamp RFC 3339 */
function extractTimeRange(start: string, end: string): string {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/** Ekstrak "YYYY-MM-DD" dari RFC 3339 */
function extractDateString(iso: string): string {
  return iso.slice(0, 10);
}

/** Ekstrak "YYYY-MM" dari "YYYY-MM-DD" */
function extractMonthString(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** Bangun URL gambar, bypass jika sudah absolut */
function buildSosialisasiImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return buildImageUrl(path);
}

// --- Transformasi ---

/** Transform API item → SosialisasiLocation (peta & jadwal) */
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

/** Transform API item → BeritaSosialisasi (hanya untuk item yang memenuhi syarat) */
export function transformToBerita(item: SosialisasiApiItem): BeritaSosialisasi {
  const kabupaten = extractRegionName(item.region);
  const dateStr = extractDateString(item.scheduled_at_start);
  const images = (item.image_urls ?? []).map(buildSosialisasiImageUrl);

  return {
    id: Number(item.id),
    title: item.title,
    image: images[0] ?? "",
    date: formatDateId(item.scheduled_at_start),
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

// --- Hasil transformasi ---

/** Hasil dari fetchSosialisasiList, siap dikonsumsi hook */
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

// --- API ---

/** GET /api/ext/sosialisasi — ambil semua data sosialisasi */
export async function fetchSosialisasiList(): Promise<SosialisasiResult> {
  const res = await apiClient.get<ApiResponse<SosialisasiApiItem[]>>("/sosialisasi");

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error(res.message ?? "Gagal mengambil data sosialisasi dari server");
  }

  const items = res.data;

  // Single-pass: transformasi + klasifikasi sekaligus
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
