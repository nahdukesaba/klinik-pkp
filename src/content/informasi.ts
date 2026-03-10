/**
 * Informasi Data
 * Data untuk halaman-halaman Informasi (Bahan Bangunan, FAQ, KRS, Peraturan, Perizinan)
 */

// ==================== BAHAN BANGUNAN ====================
export interface MaterialItem {
  name: string;
  specification: string;
  standard: string;
}

export interface MaterialCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
  items: MaterialItem[];
}

export const materialCategories: MaterialCategory[] = [
  {
    id: "pondasi",
    title: "Bahan Pondasi",
    iconName: "Layers",
    description: "Material untuk konstruksi pondasi rumah yang kokoh",
    items: [
      {
        name: "Batu Kali",
        specification: "Ukuran 15-25 cm, tidak retak, tidak berpori",
        standard: "SNI 03-6820-2002",
      },
      {
        name: "Pasir Urug",
        specification: "Pasir bersih, kadar lumpur < 5%",
        standard: "SNI 03-2816-1992",
      },
      {
        name: "Batu Kosong (Aanstamping)",
        specification: "Diameter 5-7 cm, bersih dari tanah",
        standard: "SNI 03-6820-2002",
      },
      {
        name: "Semen Portland",
        specification: "Tipe I, kemasan 40 kg/sak",
        standard: "SNI 15-2049-2004",
      },
    ],
  },
  {
    id: "struktur",
    title: "Bahan Struktur",
    iconName: "Ruler",
    description: "Material untuk elemen struktural bangunan",
    items: [
      {
        name: "Besi Tulangan Utama",
        specification: "Diameter Ø10 mm, jenis ulir",
        standard: "SNI 07-2052-2002",
      },
      {
        name: "Besi Begel",
        specification: "Diameter Ø8 mm, jarak 15 cm",
        standard: "SNI 07-2052-2002",
      },
      {
        name: "Beton Ready Mix",
        specification: "Mutu K-225 (fc' 18.7 MPa)",
        standard: "SNI 03-2847-2002",
      },
      {
        name: "Agregat Kasar",
        specification: "Kerikil ukuran maks 20 mm",
        standard: "SNI 03-2461-2002",
      },
    ],
  },
  {
    id: "dinding",
    title: "Bahan Dinding",
    iconName: "ShieldCheck",
    description: "Material untuk konstruksi dinding bangunan",
    items: [
      {
        name: "Bata Merah",
        specification: "Ukuran standar, kuat tekan min 50 kg/cm²",
        standard: "SNI 15-2094-2000",
      },
      {
        name: "Batako",
        specification: "Ukuran 40x20x10 cm, mutu B",
        standard: "SNI 03-0349-1989",
      },
      {
        name: "Angkur Dinding",
        specification: "Besi Ø10 mm setiap 6 lapis bata",
        standard: "SNI 03-2847-2002",
      },
      {
        name: "Adukan Spesi",
        specification: "Campuran 1 semen : 4 pasir",
        standard: "SNI 03-6882-2002",
      },
    ],
  },
  {
    id: "atap",
    title: "Bahan Atap",
    iconName: "Hammer",
    description: "Material untuk struktur dan penutup atap",
    items: [
      {
        name: "Kayu Kuda-Kuda",
        specification: "Kayu kelas II, ukuran 8/12 cm",
        standard: "SNI 03-3527-1994",
      },
      {
        name: "Kayu Gording",
        specification: "Kayu kelas II, ukuran 5/7 cm",
        standard: "SNI 03-3527-1994",
      },
      {
        name: "Genteng Keramik",
        specification: "Kuat tekan min 110 kg, kedap air",
        standard: "SNI 03-2095-1998",
      },
      {
        name: "Seng Gelombang",
        specification: "Ketebalan min 0.3 mm, galvanis",
        standard: "SNI 07-0064-1987",
      },
    ],
  },
];

export const materialTips: string[] = [
  "Pastikan semua material memiliki sertifikat SNI",
  "Simpan semen di tempat kering dan tidak langsung di lantai",
  "Periksa kondisi besi tulangan, hindari yang berkarat parah",
  "Gunakan pasir yang bersih dari lumpur dan material organik",
  "Pilih kayu yang sudah dikeringkan (moisture content < 20%)",
];

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

// ==================== PERIZINAN ====================
export interface PermitStep {
  step: number;
  title: string;
  description: string;
  duration: string;
  documents: string[];
}

export interface PermitType {
  title: string;
  description: string;
  iconName: string;
}

export const permitSteps: PermitStep[] = [
  {
    step: 1,
    title: "Persiapan Dokumen",
    description:
      "Siapkan seluruh dokumen persyaratan yang diperlukan untuk pengajuan IMB/PBG",
    duration: "1-2 hari",
    documents: [
      "Fotokopi KTP Pemohon",
      "Fotokopi Sertifikat Tanah / Bukti Kepemilikan",
      "Surat Pernyataan Kepemilikan Tanah",
      "Gambar Rencana Bangunan",
    ],
  },
  {
    step: 2,
    title: "Pengajuan Permohonan",
    description:
      "Ajukan permohonan ke Dinas PUPR atau melalui sistem OSS (Online Single Submission)",
    duration: "1 hari",
    documents: [
      "Formulir Permohonan",
      "Dokumen Persyaratan Lengkap",
      "Bukti Pembayaran Retribusi",
    ],
  },
  {
    step: 3,
    title: "Verifikasi & Survey",
    description:
      "Tim teknis akan melakukan verifikasi dokumen dan survey lapangan",
    duration: "7-14 hari",
    documents: [
      "Surat Keterangan dari RT/RW",
      "Surat Keterangan dari Kelurahan",
    ],
  },
  {
    step: 4,
    title: "Penerbitan Izin",
    description:
      "Setelah semua proses selesai, PBG akan diterbitkan secara elektronik",
    duration: "3-7 hari",
    documents: ["Tanda Terima Berkas", "Bukti Pembayaran Retribusi"],
  },
];

export const permitTypes: PermitType[] = [
  {
    title: "PBG (Persetujuan Bangunan Gedung)",
    description:
      "Pengganti IMB berdasarkan PP No. 16 Tahun 2021. Wajib untuk semua bangunan gedung.",
    iconName: "Building2",
  },
  {
    title: "SLF (Sertifikat Laik Fungsi)",
    description:
      "Sertifikat yang menyatakan bangunan gedung telah selesai dibangun sesuai PBG dan layak fungsi.",
    iconName: "FileCheck",
  },
  {
    title: "SBKBG (Sertifikat Bangunan Keluarga Berpenghasilan Rendah Gedung)",
    description:
      "Sertifikat khusus untuk rumah yang dibangun dengan bantuan pemerintah seperti BSPS.",
    iconName: "FileText",
  },
];

export const importantNotes: string[] = [
  "Bangunan tanpa izin dapat dikenakan sanksi administratif",
  "Proses perizinan dapat dilakukan secara online melalui sistem OSS",
  "Untuk rumah BSPS, proses perizinan difasilitasi oleh pemerintah",
  "Konsultasikan dengan Dinas PUPR setempat untuk persyaratan spesifik daerah",
];
