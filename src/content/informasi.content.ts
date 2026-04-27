/**
 * Informasi Data
 * Data terpusat untuk halaman informasi, aplikasi terkait, dan peraturan.
 */

import { HUBUNGI_KAMI_HREF } from "@/lib/constants";

export interface InformasiResourceItem {
  slug: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  detail: string;
  detailTitle?: string;
  ctaLabel: string;
  logo: ResourceLogo;
}

export interface InformasiResourcePageContent {
  badge: string;
  title: string;
  description: string;
  columns: 2 | 3;
  supportCallout?: {
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
}

export interface ResourceLogo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const relatedApplicationsPage: InformasiResourcePageContent = {
  badge: "Aplikasi Terkait",
  title: "Aplikasi Resmi yang Paling Sering Dibutuhkan",
  description:
    "Kami ringkas tiga aplikasi resmi yang paling relevan untuk pencarian rumah subsidi, pengajuan pembiayaan, dan penelusuran layanan perumahan.",
  columns: 3,
};

export const relatedApplications: InformasiResourceItem[] = [
  {
    slug: "sikumbang",
    title: "Sikumbang",
    description:
      "Portal pencarian rumah subsidi yang menampilkan lokasi, siteplan, ketersediaan unit, dan informasi pengembang secara lebih terbuka.",
    href: "https://sikumbang.tapera.go.id/",
    badge: "Rumah Subsidi",
    detail:
      "Cocok untuk masyarakat yang ingin membandingkan lokasi, harga, dan ketersediaan unit rumah subsidi sebelum melanjutkan ke proses pembiayaan.",
    ctaLabel: "Buka Sikumbang",
    logo: {
      src: "/logos/sikumbang.svg",
      alt: "Logo Sikumbang",
      width: 220,
      height: 64,
    },
  },
  {
    slug: "tapera",
    title: "Tapera Mobile",
    description:
      "Aplikasi resmi BP Tapera untuk layanan kepesertaan, pengajuan pembiayaan rumah, serta akses layanan lanjutan bagi peserta Tapera.",
    href: "https://www.tapera.go.id/panduan-migrasi/",
    badge: "Pembiayaan",
    detail:
      "BP Tapera mengumumkan pada 13 April 2026 bahwa layanan pengajuan sebelumnya telah bermigrasi ke Tapera Mobile. Untuk pengajuan baru, sebaiknya gunakan alur terbaru ini agar proses lebih konsisten.",
    ctaLabel: "Buka Tapera Mobile",
    logo: {
      src: "/logos/tapera.svg",
      alt: "Logo Tapera Mobile",
      width: 220,
      height: 64,
    },
  },
  {
    slug: "sibaru",
    title: "Sibaru",
    description:
      "Sistem Informasi Bantuan Perumahan untuk pengusulan bantuan, pemantauan pelaksanaan, dan penelusuran layanan perumahan resmi.",
    href: "https://sibaru.pkp.go.id/",
    badge: "Portal Layanan",
    detail:
      "Relevan bagi pengguna yang perlu menelusuri usulan bantuan, pemantauan pelaksanaan, dan alur layanan perumahan di lingkungan Kementerian PKP.",
    ctaLabel: "Buka Sibaru",
    logo: {
      src: "/logos/sibaru.svg",
      alt: "Logo Sibaru",
      width: 220,
      height: 64,
    },
  },
];

export const complaintChannelsPage: InformasiResourcePageContent = {
  badge: "Kanal Pengaduan",
  title: "Pilih Kanal Pengaduan yang Sesuai",
  description:
    "Gunakan kanal yang tepat sejak awal agar aduan publik, keluhan konsumen perumahan, dan tindak lanjut layanan masuk ke jalur yang sesuai.",
  columns: 2,
  supportCallout: {
    title: "Butuh bantuan umum atau konsultasi?",
    description:
      "Jika kebutuhan Anda bukan pengaduan, gunakan halaman Hubungi Kami agar tim kami dapat membantu mengarahkan Anda ke kanal yang paling tepat.",
    href: HUBUNGI_KAMI_HREF,
    ctaLabel: "Hubungi Kami",
  },
};

export const complaintChannels: InformasiResourceItem[] = [
  {
    slug: "sp4n-lapor",
    title: "SP4N LAPOR!",
    description:
      "Kanal nasional untuk menyampaikan pengaduan, aspirasi, dan permintaan informasi terkait pelayanan publik.",
    href: "https://www.lapor.go.id/",
    badge: "Pelayanan Publik",
    detail:
      "Gunakan kanal ini jika laporan Anda berkaitan dengan kualitas layanan publik, tindak lanjut layanan instansi, atau permintaan informasi resmi.",
    ctaLabel: "Buka SP4N LAPOR!",
    detailTitle: "Kapan digunakan",
    logo: {
      src: "/logos/sp4n-lapor.svg",
      alt: "Logo SP4N LAPOR!",
      width: 220,
      height: 64,
    },
  },
  {
    slug: "benar-pkp",
    title: "BENAR-PKP",
    description:
      "Kanal pengaduan konsumen perumahan terpadu Kementerian PKP melalui WhatsApp resmi 0812-88888-911.",
    href: "https://wa.me/6281288888911",
    badge: "Konsumen Perumahan",
    detail:
      "Gunakan kanal ini jika laporan Anda terkait permasalahan perumahan, kualitas bangunan, serah terima, transaksi, atau sengketa konsumen perumahan.",
    ctaLabel: "Chat BENAR-PKP",
    detailTitle: "Kapan digunakan",
    logo: {
      src: "/logos/benar-pkp.svg",
      alt: "Logo BENAR-PKP",
      width: 220,
      height: 64,
    },
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
    about:
      "Peraturan Pelaksanaan Undang-Undang Nomor 28 Tahun 2002 tentang Bangunan Gedung",
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
    title: "JDIH Kementerian PKP",
    description:
      "Portal Jaringan Dokumentasi dan Informasi Hukum Kementerian Perumahan dan Kawasan Permukiman.",
    url: "https://jdih.pkp.go.id/",
  },
  {
    title: "Peraturan.go.id",
    description: "Basis data peraturan perundang-undangan nasional Indonesia.",
    url: "https://peraturan.go.id/",
  },
  {
    title: "BPK RI",
    description: "Jaringan Dokumentasi dan Informasi Hukum Badan Pemeriksa Keuangan RI.",
    url: "https://peraturan.bpk.go.id/",
  },
];
