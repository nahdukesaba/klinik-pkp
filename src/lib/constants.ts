// Shared constants used across the application

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
] as const;

export const SERVICES = [
  {
    image: "/service-rusun.jpg",
    title: "Sebaran Rusun",
    description: "Informasi lengkap lokasi rusun yang dibangun oleh BP3KP di berbagai wilayah Sumatera.",
    href: "/peta/sebaran-rusun",
  },
  {
    image: "/service-kumuh.jpg",
    title: "Kawasan Kumuh",
    description: "Profil dan data kawasan kumuh beserta program penanganannya di wilayah kerja.",
    href: "/peta/kawasan-kumuh",
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
