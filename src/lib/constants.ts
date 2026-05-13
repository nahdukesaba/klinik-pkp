/** Shared constants — bulan, navigasi, API config, dll. */

// --- API Configuration ---

function getErrorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : undefined;
}

function shouldRetryQuery(failureCount: number, error: unknown) {
  const status = getErrorStatus(error);

  if (status && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < 2;
}

/** Default React Query config. Data selalu dianggap fresh dari backend. */
export const QUERY_CONFIG = {
  staleTime: 0,
  gcTime: 0,
  retry: shouldRetryQuery,
  refetchOnWindowFocus: false,
} as const;

export const LONG_LIVED_QUERY_STALE_TIME_MS = 5 * 60 * 1000;
export const DEFAULT_DEBOUNCE_DELAY_MS = 400;
export const ADMIN_TABLE_PAGE_SIZE = 10;

export const QUERY_KEYS = {
  adminUsers: "admin-users",
  adminAudit: "admin-audit",
  adminBankDesain: "admin-bank-desain",
  adminKawasanKumuh: "admin-kawasan-kumuh",
  adminKawasanKumuhStats: "admin-kawasan-kumuh-stats",
  adminRusun: "admin-rusun",
  adminBsps: "admin-bsps",
  adminBspsStats: "admin-bsps-stats",
  adminSosialisasi: "admin-sosialisasi",
  adminFaq: "admin-faq",
  publicFaq: "faq-public",
  adminLocationRegions: "admin-location-regions",
  adminLocationDistricts: "admin-location-districts",
  adminLocationVillages: "admin-location-villages",
  publicSosialisasi: "sosialisasi",
  publicRusun: "rusun",
  publicBsps: "bsps",
  publicBspsYears: "bsps-years",
  publicKawasanKumuh: "kawasan-kumuh",
  publicKawasanKumuhYears: "kawasan-kumuh-years",
  publicBankDesain: "bank-desain",
} as const;

export const QUERY_KEY_PARTS = {
  all: "all",
  none: "none",
  users: "users",
} as const;

export const UPLOAD_CONSTRAINTS = {
  designImages: {
    accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpeg,.jpg,.png,.gif,.webp",
    maxFiles: 4,
    maxSizeMb: 2,
    maxTotalSizeMb: 2,
  },
  singleImage: {
    accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpeg,.jpg,.png,.gif,.webp",
    maxFiles: 1,
    maxSizeMb: 2,
  },
  sosialisasiImages: {
    accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpeg,.jpg,.png,.gif,.webp",
    maxFiles: 4,
    maxSizeMb: 2,
    maxTotalSizeMb: 4,
  },
  rabPdf: {
    accept: ".pdf,application/pdf",
    maxFiles: 1,
    maxSizeMb: 2,
  },
} as const;

/**
 * Base URL untuk API request dari client-side.
 * Request melewati route handler /api/ext -> backend (same-origin, no CORS).
 * Konfigurasi backend URL: set API_URL di .env.local
 */
export const API_BASE_URL = "/api/ext";

/** Helper: getApiUrl("rusun") → "/api/ext/rusun" */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Bangun URL gambar dari path relatif API.
 * "rusun/1/file.jpg" → /api/ext/uploads/rusun/1/file.jpg
 */
export function buildImageUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const withUploads = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `${API_BASE_URL}/${withUploads}`;
}

// --- Date & Time Constants ---

/** Tahun sekarang sebagai number — dipakai untuk fallback tahun di filter */
export const CURRENT_YEAR_NUM = new Date().getFullYear();

/** Tahun sekarang sebagai string — dipakai sebagai default filter di semua halaman */
export const CURRENT_YEAR = CURRENT_YEAR_NUM.toString();

/** Daftar bulan dalam Bahasa Indonesia untuk filter tanggal */
export const MONTHS_LIST = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
] as const;

export const HUBUNGI_KAMI_HREF = "/hubungi-kami";
export const KONSULTASI_HREF = "/konsultasi";
export const INFORMASI_DEFAULT_HREF = "/informasi/rumah-layak-huni";
export const FAQ_HREF = "/faq";

export const QUICK_LINKS = [
  { label: "Bank Desain", href: "/bank-desain" },
  { label: "Sosialisasi", href: "/sosialisasi-klinik-pkp" },
  { label: "Penerimaan BSPS", href: "/penerimaan-bsps" },
  { label: "Lokasi Klinik", href: "/lokasi-klinik" },
] as const;

export const INFO_LINKS = [
  { label: "Rumah Layak Huni", href: "/informasi/rumah-layak-huni" },
  { label: "Tahapan", href: "/informasi/tahapan" },
  { label: "Tentang", href: "/informasi/about" },
  { label: "FAQ", href: FAQ_HREF },
  { label: "Aplikasi Terkait", href: "/informasi/aplikasi-terkait" },
  { label: "Kanal Pengaduan", href: "/informasi/kanal-pengaduan" },
  { label: "Peraturan", href: "/informasi/peraturan" },
] as const;

export const SERVICES = [
  {
    image: "/service-rusun.jpg",
    title: "Sebaran Rusun",
    description:
      "Peta sebaran rumah susun beserta informasi lokasi, kapasitas, dan kondisi bangunan di wilayah layanan.",
    href: "/sebaran-rusun",
  },
  {
    image: "/service-kumuh.jpg",
    title: "Kawasan Kumuh",
    description:
      "Data kawasan kumuh beserta profil wilayah dan informasi penanganan yang sedang berjalan.",
    href: "/kawasan-kumuh",
  },
  {
    image: "/service-bsps.jpg",
    title: "Penerimaan BSPS",
    description:
      "Informasi persyaratan, tahapan, dan sebaran penerima program Bantuan Stimulan Perumahan Swadaya.",
    href: "/penerimaan-bsps",
  },
  {
    image: "/service-bank-desain.jpg",
    title: "Bank Desain",
    description:
      "Koleksi desain rumah Tipe 36 yang dapat dijadikan referensi perencanaan pembangunan hunian.",
    href: "/bank-desain",
  },
  {
    image: "/service-sosialisasi.jpg",
    title: "Sosialisasi",
    description:
      "Jadwal kegiatan, materi edukasi, dan rangkaian berita sosialisasi bidang perumahan dan permukiman.",
    href: "/sosialisasi-klinik-pkp",
  },
  {
    image: "/service-konsultasi.jpg",
    title: "Konsultasi",
    description:
      "Layanan konsultasi untuk pertanyaan umum, kebutuhan teknis, dan arahan layanan perumahan yang sesuai.",
    href: KONSULTASI_HREF,
  },
] as const;
