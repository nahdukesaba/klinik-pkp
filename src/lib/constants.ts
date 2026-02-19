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
 * Base URL untuk API eksternal.
 * Gunakan NEXT_PUBLIC_API_URL untuk override (misalnya untuk ngrok).
 * Default: gunakan API route internal Next.js (/api)
 *
 * Contoh penggunaan dengan ngrok:
 * 1. Jalankan ngrok: ngrok http 3000
 * 2. Copy URL ngrok (misal: https://abc123.ngrok.io)
 * 3. Set di .env.local: NEXT_PUBLIC_API_URL=https://abc123.ngrok.io/api
 * 4. Atau set saat development: NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "/api");

/**
 * Helper function untuk membuat full API URL
 */
export function getApiUrl(endpoint: string): string {
  // Hapus leading slash jika ada
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  // Hapus trailing slash dari base URL jika ada
  const cleanBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
}

// ============================================
// Date & Time Constants
// ============================================

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
