/**
 * Shared Constants
 *
 * Konstanta yang digunakan di seluruh aplikasi.
 * Berisi daftar bulan, navigasi link, API configuration, dan konfigurasi lainnya.
 *
 * @module constants
 */

// ============================================
// API Configuration
// ============================================

/**
 * Konfigurasi default React Query untuk semua data hooks.
 * Digunakan sebagai spread di useQuery() agar konsisten.
 */
export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,       // Data fresh selama 5 menit
  gcTime: 10 * 60 * 1000,         // Cache disimpan 10 menit
  retry: 2,                       // Retry 2x jika gagal
  refetchOnWindowFocus: false,     // Jangan refetch saat tab aktif
} as const;

/**
 * Base URL untuk API request dari client-side.
 *
 * Semua request API dari browser melewati Next.js rewrites di /api/ext
 * agar tetap same-origin dan menghindari CORS.
 * Konfigurasi rewrite ada di next.config.mjs.
 *
 * Alur request:
 *   Browser → /api/ext/rusun → Next.js Rewrite → Backend API/rusun
 *
 * Konfigurasi backend URL (set di .env.local):
 *   API_URL=http://localhost:8000/api/v1
 *
 * PENTING: Jangan gunakan NEXT_PUBLIC_ prefix untuk URL backend!
 * Prefix tersebut akan mengexpose URL ke client-side JavaScript.
 */
export const API_BASE_URL = "/api/ext";

/**
 * Helper function untuk membuat full API URL (melalui rewrite).
 * Contoh: getApiUrl("rusun") → "/api/ext/rusun"
 */
export function getApiUrl(endpoint: string): string {
  // Hapus leading slash jika ada
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

// ============================================
// React Query Configuration
// ============================================

// ============================================
// Date & Time Constants
// ============================================

/** Tahun sekarang sebagai string — dipakai sebagai default filter di semua halaman */
export const CURRENT_YEAR = new Date().getFullYear().toString();

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

export const QUICK_LINKS = [
  { label: "Bank Desain", href: "/bank-desain" },
  { label: "Sosialisasi", href: "/sosialisasi-klinik-pkp" },
  { label: "Penerimaan BSPS", href: "/penerimaan-bsps" },
  { label: "Lokasi Klinik", href: "/lokasi-klinik" },
] as const;

export const INFO_LINKS = [
  { label: "Tentang Kami", href: "/informasi/tentang" },
  { label: "Kontak", href: "/informasi/kontak" },
  { label: "FAQ", href: "/informasi/faq" },
  { label: "Peraturan", href: "/informasi/peraturan" },
  { label: "Buku Saku FLPP", href: "https://djvend02-ops.github.io/buku-saku-flpp/" },
] as const;

export const SERVICES = [
  {
    image: "/service-rusun.jpg",
    title: "Sebaran Rusun",
    description: "Informasi lengkap lokasi rusun yang dibangun oleh BP3KP di berbagai wilayah Sumatera.",
    href: "/sebaran-rusun",
  },
  {
    image: "/service-kumuh.jpg",
    title: "Kawasan Kumuh",
    description: "Profil dan data kawasan kumuh beserta program penanganannya di wilayah kerja.",
    href: "/kawasan-kumuh",
  },
  {
    image: "/service-bsps.jpg",
    title: "Penerimaan BSPS",
    description: "Informasi persyaratan dan prosedur pendaftaran program BSPS.",
    href: "/penerimaan-bsps",
  },
  {
    image: "/service-bank-desain.jpg",
    title: "Bank Desain",
    description: "Koleksi desain rumah dan rusun untuk referensi pembangunan hunian.",
    href: "/bank-desain",
  },
  {
    image: "/service-sosialisasi.jpg",
    title: "Sosialisasi",
    description: "Kegiatan sosialisasi dan edukasi terkait perumahan dan permukiman.",
    href: "/sosialisasi-klinik-pkp",
  },
  {
    image: "/service-konsultasi.jpg",
    title: "Konsultasi",
    description: "Layanan konsultasi gratis seputar perumahan dan permukiman.",
    href: "/informasi/kontak",
  },
] as const;
