/**
 * Service API untuk Sosialisasi Klinik PKP.
 *
 * Satu endpoint menghasilkan tiga turunan data:
 * - lokasi publik untuk map
 * - jadwal mendatang
 * - berita kegiatan selesai yang sudah punya dokumentasi
 *
 * Workflow status:
 * - `mendatang`: kegiatan belum selesai
 * - `pending`: kegiatan selesai, tetapi dokumentasi belum diunggah
 * - `selesai`: kegiatan selesai dan dokumentasi sudah tersedia
 */

import {
  fetchApiList,
  fetchApiListWithMeta,
  extractDistrictName,
  extractRegionName,
  extractVillageName,
  type ApiPaginationMeta,
  type CoordinateApi,
  type DistrictApi,
  type RegionApi,
  type VillageApi,
} from "@/lib/api-client";
import { buildImageUrl } from "@/lib/constants";
import {
  formatDateId,
  formatTimeRangeId,
  getDateKey,
  getMonthKey,
} from "@/lib/date";
import {
  ADMIN_RESOURCE_NAMES,
  createAdminResource,
  deleteAdminResource,
  updateAdminResource,
} from "@/services/admin-resource.service";
import type { ApiListQueryControls } from "@/types/api";

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
  scheduled_at_end: string; // RFC 3339
  village?: VillageApi;
  district?: DistrictApi;
  region?: RegionApi;
}

// --- Tipe Frontend ---

export type SosialisasiStatus = "selesai" | "mendatang" | "pending";

/** Data lokasi sosialisasi untuk peta dan jadwal */
export interface SosialisasiLocation {
  id: string;
  villageId: string;
  districtId: string;
  regionId: string;
  name: string;
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
  coordinates: [number, number];
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm - HH:mm"
  peserta: number;
  alamat: string;
  description: string;
  images: string[];
  status: SosialisasiStatus;
  scheduledAtStart: string;
  scheduledAtEnd: string;
}

/** Data berita sosialisasi (hanya item selesai + punya deskripsi + gambar) */
export interface BeritaSosialisasi {
  id: string;
  title: string;
  image: string;
  date: string; // format tampilan Indonesia
  rawDate: string; // "YYYY-MM-DD" (untuk sorting & filter)
  month: string; // "YYYY-MM" (untuk filter bulan)
  description: string;
  kabupaten: string;
  coordinates: [number, number];
  /** Gambar tambahan selain cover utama */
  images?: string[];
}

// --- Utilitas ---

function hasSosialisasiImages(imageUrls: string[] | null | undefined) {
  return Array.isArray(imageUrls) && imageUrls.length > 0;
}

export function resolveSosialisasiStatus(
  scheduledAtEnd: string,
  hasImages: boolean,
  nowTimestamp: number = Date.now()
): SosialisasiStatus {
  const eventEndTimestamp = new Date(scheduledAtEnd).getTime();

  if (!Number.isFinite(eventEndTimestamp) || eventEndTimestamp > nowTimestamp) {
    return "mendatang";
  }

  return hasImages ? "selesai" : "pending";
}

/** Bangun URL gambar, bypass jika sudah absolut */
function buildSosialisasiImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return buildImageUrl(path);
}

// --- Transformasi ---

/** Transform API item -> SosialisasiLocation (admin/public map/jadwal) */
export function transformToLocation(item: SosialisasiApiItem): SosialisasiLocation {
  const kabupaten = extractRegionName(item.region);
  const kecamatan = extractDistrictName(item.district) || undefined;
  const kelurahan = extractVillageName(item.village) || undefined;
  const images = (item.image_urls ?? []).map(buildSosialisasiImageUrl);
  const status = resolveSosialisasiStatus(
    item.scheduled_at_end,
    hasSosialisasiImages(item.image_urls)
  );

  return {
    id: item.id,
    villageId: item.village_id,
    districtId: item.district_id,
    regionId: item.region_id,
    name: item.title,
    kabupaten,
    kecamatan,
    kelurahan,
    coordinates: [
      item.coordinate?.latitude ?? 0,
      item.coordinate?.longitude ?? 0,
    ],
    date: getDateKey(item.scheduled_at_start),
    time: formatTimeRangeId(item.scheduled_at_start, item.scheduled_at_end),
    peserta: 0, // Tidak tersedia di API, default 0
    alamat: item.location,
    description: item.description,
    images,
    status,
    scheduledAtStart: item.scheduled_at_start,
    scheduledAtEnd: item.scheduled_at_end,
  };
}

/** Transform API item -> BeritaSosialisasi (hanya item siap tayang) */
export function transformToBerita(item: SosialisasiApiItem): BeritaSosialisasi {
  const kabupaten = extractRegionName(item.region);
  const images = (item.image_urls ?? []).map(buildSosialisasiImageUrl);

  return {
    id: item.id,
    title: item.title,
    image: images[0] ?? "",
    date: formatDateId(item.scheduled_at_start),
    rawDate: getDateKey(item.scheduled_at_start),
    month: getMonthKey(item.scheduled_at_start),
    description: item.description,
    kabupaten,
    coordinates: [
      item.coordinate?.latitude ?? 0,
      item.coordinate?.longitude ?? 0,
    ],
    images: images.length > 1 ? images.slice(1) : undefined,
  };
}

export function transformLocationToBerita(
  item: SosialisasiLocation
): BeritaSosialisasi | null {
  if (
    item.status !== "selesai" ||
    item.images.length === 0 ||
    item.description.trim() === ""
  ) {
    return null;
  }

  return {
    id: item.id,
    title: item.name,
    image: item.images[0] ?? "",
    date: formatDateId(item.scheduledAtStart),
    rawDate: getDateKey(item.scheduledAtStart),
    month: getMonthKey(item.scheduledAtStart),
    description: item.description,
    kabupaten: item.kabupaten,
    coordinates: item.coordinates,
    images: item.images.length > 1 ? item.images.slice(1) : undefined,
  };
}

// --- Hasil transformasi ---

/** Hasil dari fetchSosialisasiList, siap dikonsumsi hook */
export interface SosialisasiResult {
  /** Semua lokasi untuk kebutuhan admin */
  locations: SosialisasiLocation[];
  /** Lokasi yang boleh tampil di peta publik (mendatang + selesai) */
  publicLocations: SosialisasiLocation[];
  /** Lokasi yang belum selesai */
  upcomingLocations: SosialisasiLocation[];
  /** Lokasi selesai dan sudah punya dokumentasi */
  completedLocations: SosialisasiLocation[];
  /** Lokasi selesai tetapi masih menunggu dokumentasi */
  pendingLocations: SosialisasiLocation[];
  /** Berita yang sudah siap tayang */
  berita: BeritaSosialisasi[];
  /** Daftar kabupaten unik untuk filter dropdown */
  kabupatenList: string[];
}

export interface SosialisasiPageResult extends SosialisasiResult {
  meta: ApiPaginationMeta;
}

export interface SosialisasiListParams extends ApiListQueryControls {
  regionId?: string;
  districtId?: string;
  villageId?: string;
}

export function buildSosialisasiResultFromLocations(
  baseLocations: SosialisasiLocation[],
  nowTimestamp: number = Date.now()
): SosialisasiResult {
  const locations: SosialisasiLocation[] = [];
  const publicLocations: SosialisasiLocation[] = [];
  const upcomingLocations: SosialisasiLocation[] = [];
  const completedLocations: SosialisasiLocation[] = [];
  const pendingLocations: SosialisasiLocation[] = [];
  const berita: BeritaSosialisasi[] = [];
  const kabupatenSet = new Set<string>();

  for (const item of baseLocations) {
    const location: SosialisasiLocation = {
      ...item,
      status: resolveSosialisasiStatus(
        item.scheduledAtEnd,
        item.images.length > 0,
        nowTimestamp
      ),
    };
    locations.push(location);

    if (location.status === "mendatang") {
      publicLocations.push(location);
      upcomingLocations.push(location);
    } else if (location.status === "selesai") {
      publicLocations.push(location);
      completedLocations.push(location);
    } else {
      pendingLocations.push(location);
    }

    const beritaItem = transformLocationToBerita(location);
    if (beritaItem) {
      berita.push(beritaItem);
    }

    if (location.kabupaten) {
      kabupatenSet.add(location.kabupaten);
    }
  }

  return {
    locations,
    publicLocations,
    upcomingLocations,
    completedLocations,
    pendingLocations,
    berita,
    kabupatenList: ["Semua Lokasi", ...Array.from(kabupatenSet).sort()],
  };
}

function buildSosialisasiResult(items: SosialisasiApiItem[]): SosialisasiResult {
  return buildSosialisasiResultFromLocations(items.map(transformToLocation));
}

// --- API ---

/** GET /api/ext/sosialisasi -> ambil semua data sosialisasi */
export async function fetchSosialisasiList(
  params: SosialisasiListParams = {}
): Promise<SosialisasiResult> {
  const limit = params.perPage ?? 1000;
  const items = await fetchApiList<SosialisasiApiItem>("/sosialisasi", {
    query: {
      page: params.page,
      limit,
      title: params.keyword,
      region_id: params.regionId,
      district_id: params.districtId,
      village_id: params.villageId,
    },
    errorMessage: "Gagal mengambil data sosialisasi dari server",
    collectAllPages: true,
  });

  return buildSosialisasiResult(items);
}

export async function fetchSosialisasiPage(
  params: SosialisasiListParams = {}
): Promise<SosialisasiPageResult> {
  const pageResult = await fetchApiListWithMeta<SosialisasiApiItem>(
    "/sosialisasi",
    {
      query: {
        page: params.page,
        limit: params.perPage,
        title: params.keyword,
        region_id: params.regionId,
        district_id: params.districtId,
        village_id: params.villageId,
      },
      errorMessage: "Gagal mengambil data sosialisasi dari server",
    }
  );

  return {
    ...buildSosialisasiResult(pageResult.items),
    meta: pageResult.meta,
  };
}

export async function createAdminSosialisasi(payload: FormData) {
  return createAdminResource(ADMIN_RESOURCE_NAMES.sosialisasi, payload);
}

export async function updateAdminSosialisasi(
  id: string | number,
  payload: FormData
) {
  return updateAdminResource(ADMIN_RESOURCE_NAMES.sosialisasi, id, payload);
}

export async function deleteAdminSosialisasi(id: string | number) {
  return deleteAdminResource(ADMIN_RESOURCE_NAMES.sosialisasi, id);
}
