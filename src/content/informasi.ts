/**
 * Informasi Data
 * Data untuk halaman-halaman informasi yang masih aktif.
 */

// ==================== FAQ ====================
export interface FaqCategory {
  id: string;
  label: string;
  iconName: string;
}

export interface Faq {
  category: string;
  q: string;
  a: string;
}

export const faqCategories: FaqCategory[] = [
  { id: "bsps", label: "BSPS", iconName: "Home" },
  { id: "rusun", label: "Rusunawa", iconName: "FileCheck" },
  { id: "kumuh", label: "Kawasan Kumuh", iconName: "Users" },
  { id: "umum", label: "Umum", iconName: "Wallet" },
];

export const faqList: Faq[] = [
  {
    category: "bsps",
    q: "Apa itu BSPS?",
    a: "BSPS (Bantuan Stimulan Perumahan Swadaya) adalah program bantuan pemerintah untuk membantu masyarakat berpenghasilan rendah dalam membangun atau memperbaiki rumah agar layak huni. Bantuan ini bersifat stimulan dan tidak perlu dikembalikan.",
  },
  {
    category: "bsps",
    q: "Bagaimana cara mendaftar BSPS?",
    a: "Pendaftaran dilakukan melalui kantor desa atau kelurahan setempat. Calon penerima mengisi formulir, menyerahkan dokumen persyaratan, lalu menunggu proses verifikasi dan seleksi oleh tim.",
  },
  {
    category: "bsps",
    q: "Apa saja syarat untuk mendapatkan bantuan BSPS?",
    a: "Syarat utama: WNI, sudah berkeluarga/berusia 21 tahun, berpenghasilan rendah, memiliki tanah dengan bukti kepemilikan, belum pernah menerima bantuan perumahan pemerintah, dan rumah tidak layak huni atau belum memiliki rumah.",
  },
  {
    category: "bsps",
    q: "Berapa nilai bantuan BSPS yang diberikan?",
    a: "Nilai bantuan bervariasi: Peningkatan Kualitas Rp 17,5 juta, Pembangunan Baru Rp 40 juta. Bantuan disalurkan secara bertahap sesuai progres pembangunan.",
  },
  {
    category: "rusun",
    q: "Apa itu Rusunawa?",
    a: "Rusunawa (Rumah Susun Sederhana Sewa) adalah hunian vertikal yang disediakan pemerintah untuk masyarakat berpenghasilan rendah dengan sistem sewa bulanan yang terjangkau.",
  },
  {
    category: "rusun",
    q: "Bagaimana cara mengajukan sewa unit Rusunawa?",
    a: "Pengajuan dilakukan ke pengelola rusun setempat (biasanya UPT Dinas Perumahan) dengan menyerahkan dokumen KTP, KK, surat keterangan tidak mampu, dan dokumen pendukung lainnya.",
  },
  {
    category: "kumuh",
    q: "Apa yang dimaksud dengan kawasan kumuh?",
    a: "Kawasan kumuh adalah permukiman yang tidak layak huni karena ketidakteraturan bangunan, kepadatan tinggi, serta kualitas bangunan dan sarana prasarana yang tidak memenuhi syarat.",
  },
  {
    category: "kumuh",
    q: "Program apa saja untuk penanganan kawasan kumuh?",
    a: "Program meliputi KOTAKU (Kota Tanpa Kumuh), peningkatan kualitas infrastruktur (jalan, drainase, sanitasi), pembangunan MCK komunal, dan penyediaan air bersih.",
  },
  {
    category: "umum",
    q: "Dimana lokasi Klinik PKP BP3KP Sumatera II?",
    a: "Klinik PKP berlokasi di Jl. Suluh No.99, Sidorejo Hilir, Kec. Medan Tembung, Kota Medan, Sumatera Utara 20222. Buka Senin-Jumat pukul 07:30-16:00 WIB (Jumat sampai 16:30).",
  },
  {
    category: "umum",
    q: "Layanan apa saja yang tersedia di Klinik PKP?",
    a: "Layanan meliputi konsultasi teknis pembangunan rumah, informasi program BSPS, bank desain rumah, informasi rusunawa, penanganan kawasan kumuh, dan sosialisasi program perumahan.",
  },
  {
    category: "umum",
    q: "Apakah layanan Klinik PKP berbayar?",
    a: "Tidak, semua layanan konsultasi dan informasi di Klinik PKP diberikan secara GRATIS untuk masyarakat.",
  },
];

// ==================== PERATURAN ====================
export interface Regulation {
  title: string;
  number: string;
  year: number;
  about: string;
  category: string;
  link?: string;
}

export interface RegulationCategory {
  name: string;
  iconName: string;
  description: string;
  count: number;
}

export interface RelatedLink {
  title: string;
  description: string;
  url: string;
}

export const regulations: Regulation[] = [
  {
    title: "Undang-Undang Republik Indonesia",
    number: "No. 1 Tahun 2011",
    year: 2011,
    about: "Perumahan dan Kawasan Permukiman",
    category: "Undang-Undang",
    link: "#",
  },
  {
    title: "Undang-Undang Republik Indonesia",
    number: "No. 28 Tahun 2002",
    year: 2002,
    about: "Bangunan Gedung",
    category: "Undang-Undang",
    link: "#",
  },
  {
    title: "Peraturan Pemerintah",
    number: "No. 16 Tahun 2021",
    year: 2021,
    about: "Peraturan Pelaksanaan Undang-Undang Nomor 28 Tahun 2002 tentang Bangunan Gedung",
    category: "Peraturan Pemerintah",
    link: "#",
  },
  {
    title: "Peraturan Pemerintah",
    number: "No. 14 Tahun 2016",
    year: 2016,
    about: "Penyelenggaraan Perumahan dan Kawasan Permukiman",
    category: "Peraturan Pemerintah",
    link: "#",
  },
  {
    title: "Peraturan Menteri PUPR",
    number: "No. 7 Tahun 2023",
    year: 2023,
    about: "Bantuan Stimulan Perumahan Swadaya",
    category: "Peraturan Menteri",
    link: "#",
  },
  {
    title: "Peraturan Menteri PUPR",
    number: "No. 21 Tahun 2021",
    year: 2021,
    about: "Pedoman Teknis Penilaian Kinerja Bangunan Gedung Hijau",
    category: "Peraturan Menteri",
    link: "#",
  },
];

export const regulationCategories: RegulationCategory[] = [
  {
    name: "Perumahan",
    iconName: "Building",
    description: "Regulasi tentang perumahan dan permukiman",
    count: 4,
  },
  {
    name: "BSPS",
    iconName: "Users",
    description: "Aturan bantuan stimulan perumahan swadaya",
    count: 2,
  },
  {
    name: "Bangunan Gedung",
    iconName: "Shield",
    description: "Standar dan persyaratan bangunan gedung",
    count: 3,
  },
];

export const relatedLinks: RelatedLink[] = [
  {
    title: "JDIH Kementerian PUPR",
    description: "Portal Jaringan Dokumentasi dan Informasi Hukum Kementerian PUPR",
    url: "https://jdih.pu.go.id/",
  },
  {
    title: "Peraturan.go.id",
    description: "Database Peraturan Perundang-undangan Indonesia",
    url: "https://peraturan.go.id/",
  },
  {
    title: "BPK RI",
    description: "Jaringan Dokumentasi dan Informasi Hukum BPK RI",
    url: "https://peraturan.bpk.go.id/",
  },
];
